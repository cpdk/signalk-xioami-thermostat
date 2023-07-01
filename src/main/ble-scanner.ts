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


    public registerListeners() {
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
        //   this.createUIListenerForDeviceConnect(discoveredDevice.token, me);
          this.updateUI(peripheral, this.deviceRegister.getByAddress(peripheral.address)?.discoveredDevice)
        });



        const me = this;
        // ipcMain.on('ble-scanner-command', (event: any, command: string) => {
        //     Log.info('Received scanner command: ' + command);

        //     if (command == 'start-scanner') {
        //         me.deviceRegister.reset();
        //         me.startScanning();
        //     } else if (command == 'stop-scanner') {
        //         me.stopScanning();
        //     } else if (command == 'repeat-state') {
        //         this.notifyState();
        //     }
        // });
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

    // private createUIListenerForDeviceConnect(token: string, me:any) {
    //   if (ipcMain.listenerCount(token) >= 1) {
    //     Log.warn('Already got UI listener registered for token:'+token)
    //     return;
    //   }

    //   Log.info('Registering UI listener for token:'+token);
    //   const previousTokens = this.deviceRegister.cleanupTokens(token);
    //   Log.info('Cleaning up UI listeners for old tokens:'+JSON.stringify(previousTokens))
    //   previousTokens?.forEach(oldToken => ipcMain.removeAllListeners(oldToken));

    //   ipcMain.on(token, async (event, profile: SyncProfile) => {
    //     Log.info('From UI received scan request for token: '+ token + JSON.stringify(profile));

    //     if (this.deviceRegister.getByToken(token)!.scanningOngoing) {
    //       Log.warn('Already has ongoing scanning for token:'+token);
    //       return;
    //     }
    //     try {
    //       this.deviceRegister.getByToken(token)!.scanningOngoing = true;
    //       const bleDevice = this.deviceRegister.getByToken(token);
    //       await this.createExtractWorker(bleDevice!.peripheral, token).syncData(SyncProfile.from(profile));
    //     } catch (err) {
    //       Log.error('Error reading details from device: ' + err);
    //     } finally {
    //       ipcMain.removeAllListeners(token);
    //       this.deviceRegister.removeDeviceDiscoveredByToken(token);
    //     }
    //   });

    // }

    // public createExtractWorker(peripheral: Peripheral, token: string): AbstractDialoqExtractor {
    //     const logger:NotificationService = new NotificationService(token, this.win);
    //     if (ApplicationService.isAppProtocolEnabled) {
    //       return new DialoqExtractorApplication(peripheral, BleScanner.keyService, logger);
    //     } else if (ApplicationService.isAppNoRestrictionProtocolEnabled) {
    //       return new DialoqExtractorApplicationNoRestriction(peripheral, BleScanner.keyService, logger);
    //     } else {
    //       return new DialoqExtractorService(peripheral, BleScanner.keyService, logger);
    //     }
    // }

    // public notifyState() {
    //     this.win.webContents.send('ble-state-change', {
    //         state: BleScanner.lastState,
    //         scanning: BleScanner.btScanningActive,
    //         dialoqOnly: BleScanner.dialoqOnly,
    //         bleReady: BleScanner.btReady,
    //         bleError: BleScanner.btError
    //     });
    // }

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
