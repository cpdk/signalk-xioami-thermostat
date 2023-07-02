import {Peripheral} from '@abandonware/noble';
import {Log} from './log/log-manager';
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

    public static get() {
        if (!BleScanner._instance) {
            BleScanner._instance = new BleScanner();
        }
        return BleScanner._instance;
    }

    private constructor() {
        this.ensureBLELoaded();
        this.registerListeners();
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
         
          if (peripheral.state !== 'disconnected') {
            return;
          }
          const discoveredDevice = this.createDiscoveredDevice(peripheral);

          discoveredDevice.lastTemperature = 12;
          discoveredDevice.lastHumidity = 34;

          for (const l of this.listeners) {
            l(discoveredDevice);
          }

        });

        const me = this;
        Log.info('All listeners added');
    }

    private createDiscoveredDevice(peripheral: Peripheral): DiscoveredDevice {

        let discoveredDevice = {} as DiscoveredDevice;
        discoveredDevice.lastSeen = new Date().getTime();
        discoveredDevice.address = peripheral.address;
        discoveredDevice.localName = peripheral.advertisement.localName;
        peripheral = peripheral;
        Log.info('Create new discovered device:'+JSON.stringify(discoveredDevice))
        return discoveredDevice;
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
