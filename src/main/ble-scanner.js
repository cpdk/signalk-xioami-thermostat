"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BleScanner = void 0;
const log_manager_1 = require("./log/log-manager");
const ble_device_register_1 = require("./ble/ble-device-register");
const ble_service_uuids_1 = require("./ble/ble-service-uuids");
const string_utils_1 = require("./util/string-utils");
let noble;
class BleScanner {
    constructor() {
        this.ensureBLELoaded();
        this.registerListeners();
        this.deviceRegister = new ble_device_register_1.BLEDeviceRegister();
    }
    static get() {
        if (!BleScanner._instance) {
            BleScanner._instance = new BleScanner();
        }
        return BleScanner._instance;
    }
    ensureBLELoaded() {
        try {
            log_manager_1.Log.info('BLE library load started');
            noble = require('noble');
            log_manager_1.Log.info('BLE library loaded');
        }
        catch (err) {
            log_manager_1.Log.info('Unable to start Bluetooth: ' + err);
            BleScanner.btReady = false;
            BleScanner.btError = '' + err;
        }
    }
    registerListeners() {
        noble.on('scanStart', () => {
            log_manager_1.Log.info('Scanning Started');
            BleScanner.btScanningActive = true;
            BleScanner.lastState = 'Scanning Started';
            // this.notifyState();
        });
        noble.on('scanStop', () => {
            log_manager_1.Log.info('Scanning Stopped');
            BleScanner.btScanningActive = false;
            BleScanner.lastState = 'Scanning Stopped';
            // this.notifyState();
        });
        noble.on('stateChange', (state) => {
            log_manager_1.Log.info('bt state changed to ' + state);
            BleScanner.lastState = state;
            if (state == 'poweredOn') {
                BleScanner.btReady = true;
            }
            else {
                BleScanner.btReady = false;
            }
            // this.notifyState();
        });
        noble.on('discover', (peripheral) => {
            var _a, _b, _c, _d, _e, _f;
            //dismiss not a dialoq device
            if (!peripheral.advertisement || !((_a = peripheral.advertisement.localName) === null || _a === void 0 ? void 0 : _a.includes('ATC'))) {
                log_manager_1.Log.info('Ignoring device: ' + ((_b = peripheral.advertisement) === null || _b === void 0 ? void 0 : _b.localName));
                return;
            }
            //Dismiss where scan on address is ongoing
            if ((_c = this.deviceRegister.getByAddress(peripheral.address)) === null || _c === void 0 ? void 0 : _c.scanningOngoing) {
                return;
            }
            //Dismiss but update UI on devices that have been discovered but is not scanned
            if ((_d = this.deviceRegister.getByAddress(peripheral.address)) === null || _d === void 0 ? void 0 : _d.discoveredDevice) {
                this.updateUI(peripheral, (_e = this.deviceRegister.getByAddress(peripheral.address)) === null || _e === void 0 ? void 0 : _e.discoveredDevice);
                return;
            }
            if (peripheral.state !== 'disconnected') {
                return;
            }
            const discoveredDevice = this.deviceRegister.createDiscoveredDevice(peripheral);
            //   this.createUIListenerForDeviceConnect(discoveredDevice.token, me);
            this.updateUI(peripheral, (_f = this.deviceRegister.getByAddress(peripheral.address)) === null || _f === void 0 ? void 0 : _f.discoveredDevice);
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
        log_manager_1.Log.info('All listeners added');
    }
    updateUI(peripheral, device) {
        if (!device)
            return;
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
    startScanning() {
        if (BleScanner.btReady) {
            if (BleScanner.atcOnly) {
                noble.startScanning([string_utils_1.StringUtils.toNobleFormat(ble_service_uuids_1.ServiceUUID.EnvironmentDataService)], true);
            }
            else {
                noble.startScanning();
            }
        }
        else {
            BleScanner.btError = 'Bluetooth not ready';
        }
    }
    stopScanning() {
        noble.stopScanning();
    }
}
exports.BleScanner = BleScanner;
BleScanner.btReady = false;
BleScanner.btError = undefined;
BleScanner.btScanningActive = false;
BleScanner.atcOnly = true;
BleScanner.lastState = 'Unknown';
