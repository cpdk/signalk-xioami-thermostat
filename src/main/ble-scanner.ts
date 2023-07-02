import {Peripheral} from '@abandonware/noble';
import {Log} from './log/log-manager';
import { BLEDeviceRegister } from './ble/ble-device-register';
import { DiscoveredDevice } from './ble/discovered-device';
import { ServiceUUID } from './ble/ble-service-uuids';
import { StringUtils } from './util/string-utils';

let noble: any;

export class BleScanner {

    private static _instance: BleScanner;

    private static btReady = false;
    private static btError?: string = undefined;
    private static btScanningActive = false;
    private static atcOnly = true;
    private static lastState = 'Unknown';
    
    private listeners: Array<(d: DiscoveredDevice) => void> = [];
    private deviceRegister: BLEDeviceRegister;

    public static get() {
        if (!BleScanner._instance) {
            BleScanner._instance = new BleScanner();
        }
        return BleScanner._instance;
    }

    private constructor() {
        this.ensureBLELoaded();
        this.registerListeners();
        this.deviceRegister = new BLEDeviceRegister();
    }

    private ensureBLELoaded() {
        try {
            Log.info('BLE library load started');
            noble = require('@abandonware/noble');
            Log.info('BLE library loaded');
        } catch (err) {
            Log.info('Unable to start Bluetooth: ' + err);
            BleScanner.btReady = false;
            BleScanner.btError = '' + err;
        }
    }

    public registerListener(l: (d: DiscoveredDevice) => void) {
        this.listeners.push(l);
    }

    private registerListeners() {
        noble.on('scanStart', () => {
            Log.info('Scanning Started');
            BleScanner.btScanningActive = true;
            BleScanner.lastState = 'Scanning Started';
            // this.notifyState();
        });
        noble.on('scanStop', () => {
            Log.info('Scanning Stopped');
            BleScanner.btScanningActive = false;
            BleScanner.lastState = 'Scanning Stopped';
            // this.notifyState();
        });

        noble.on('stateChange', (state: string) => {
            Log.info('bt state changed to ' + state);
            BleScanner.lastState = state;
            if (state == 'poweredOn') {
                BleScanner.btReady = true;
            } else {
                BleScanner.btReady = false;
            }
            // this.notifyState();
        });

        noble.on('discover', (peripheral: Peripheral) => {
          //dismiss not a dialoq device
          if (!peripheral.advertisement || !peripheral.advertisement.localName?.includes('ATC')) {
            Log.info('Ignoring device: ' + peripheral.advertisement?.localName);
            return;
          }
          //Dismiss where scan on address is ongoing
          if (this.deviceRegister.getByAddress(peripheral.address)?.scanningOngoing) {
            return;
          }
          //Dismiss but update UI on devices that have been discovered but is not scanned
          if (this.deviceRegister.getByAddress(peripheral.address)?.discoveredDevice) {
            this.updateUI(peripheral, this.deviceRegister.getByAddress(peripheral.address)?.discoveredDevice)
            return;
          }
          if (peripheral.state !== 'disconnected') {
            return;
          }
          const discoveredDevice = this.deviceRegister.createDiscoveredDevice(peripheral);

          discoveredDevice.lastTemperature = 12;
          discoveredDevice.lastHumidity = 34;

          for (const l of this.listeners) {
            l(discoveredDevice);
          }

        });

        const me = this;
        Log.info('All listeners added');
    }

  private updateUI(peripheral: Peripheral, device: DiscoveredDevice|undefined) {
    if (!device) return;
    device.localName = peripheral.advertisement.localName;
    device.lastSeen = Date.now();
    device.rssi = peripheral.rssi;
    device.state = peripheral.state;
    // this.win.webContents.send('ble-device-found', device);
  }

    public startScanning() {
        if (BleScanner.btReady) {
            if (BleScanner.atcOnly) {
                noble.startScanning([StringUtils.toNobleFormat(ServiceUUID.EnvironmentDataService)], true);
            } else {
                noble.startScanning();
            }
        } else {
            BleScanner.btError = 'Bluetooth not ready';
        }
    }

    public stopScanning() {
        noble.stopScanning();
    }
}
