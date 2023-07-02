import {Peripheral} from '@abandonware/noble';
import {Log} from './log/log-manager';
import { DiscoveredDevice } from './ble/discovered-device';
import { ServiceUUID } from './ble/ble-service-uuids';
import { StringUtils } from './util/string-utils';
import { BLEDevice } from './ble-device';

let noble: any;

export class BleScanner {

    private static _instance: BleScanner;

    private static btReady = false;
    private static btError?: string = undefined;
    private static btScanningActive = false;
    private static atcOnly = true;
    private static lastState = 'Unknown';
    
    private listeners: Array<(d: BLEDevice) => void> = [];

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

    public registerListener(l: (d: BLEDevice) => void) {
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

    private createDiscoveredDevice(peripheral: Peripheral): BLEDevice {
        // Log.info('Reading device: ' + peripheral.address + ' - ' + JSON.stringify(peripheral.advertisement));
        
        // "data":[164,193,56,224,176,99,1,9,49,85,11,152,4]}}]}
        const data = peripheral.advertisement.serviceData[0].data;
        // console.log(data.toString('base64'));
        // console.log('Data has: ' + data.byteLength + ' bytes');
        // console.log('Temperature: ' + data.readInt16BE(6) / 10);
        // console.log('Humidity: ' + data.readInt8(8));
        // const b = data.readInt8(9);
        // console.log('Battery: ' + b);
        // const v = (data.readInt8(10) * 256 + data.readInt8(11)) / 1000;
        // console.log('Voltage: ' + v);

        let d = {} as BLEDevice;
        d.lastSeen = new Date().toISOString();
        d.address = peripheral.address;
        d.address = peripheral.advertisement.localName;
        d.lastTemperature = data.readInt16BE(6) / 10;
        d.lastHumidity = data.readInt8(8)
        d.lastBattery = data.readInt8(9);
        d.lastVoltage = (data.readInt8(10) * 256 + data.readInt8(11)) / 1000;

        // Log.info('Created device: ' + JSON.stringify(d));
        return d;
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
                Log.info('Starting scanning for: ' + ServiceUUID.EnvironmentDataService);
                noble.startScanning([StringUtils.toNobleFormat(ServiceUUID.EnvironmentDataService)], true);
            } else {
                Log.info('Starting scanning for all devices');
                noble.startScanning();
            }
        } else {
            Log.warn('Bluetooth not ready');
            BleScanner.btError = 'Bluetooth not ready';
        }
    }

    public stopScanning() {
        noble.stopScanning();
    }
}
