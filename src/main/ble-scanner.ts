import {Peripheral} from '@abandonware/noble';
import {Log} from './log/log-manager';
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
        });

        noble.on('discover', (peripheral: Peripheral) => {
         
          if (peripheral.state !== 'disconnected') {
            return;
          }
          const discoveredDevice = this.createDiscoveredDevice(peripheral);

          for (const l of this.listeners) {
            l(discoveredDevice);
          }

        });

        const me = this;
    }

    private createDiscoveredDevice(peripheral: Peripheral): BLEDevice {
        // Log.info('Reading data from: ' + peripheral.address + ' - ' + JSON.stringify(peripheral.advertisement));
        
        const data = peripheral.advertisement.serviceData[0].data;

        // const f = Buffer.from([data.readInt8(0), data.readInt8(1), data.readInt8(2)
        //                 , data.readInt8(3), data.readInt8(4), data.readInt8(5)]);
        // console.log('First ' + f.length + ' bytes as hex: ' + f.toString('hex'));

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
