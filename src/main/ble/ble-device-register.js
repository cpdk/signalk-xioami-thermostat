"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLEDeviceRegister = void 0;
const log_manager_1 = require("../log/log-manager");
const ble_device_1 = require("./ble-device");
const discovered_device_1 = require("./discovered-device");
const crypto_1 = require("crypto");
class BLEDeviceRegister {
    constructor() {
        this.byAddress = new Map();
        this.byToken = new Map();
    }
    reset() {
        this.byToken.clear();
        this.byAddress.clear();
    }
    getByAddress(address) {
        return this.byAddress.get(address);
    }
    getByToken(address) {
        return this.byToken.get(address);
    }
    createDiscoveredDevice(peripheral) {
        let bleDevice = new ble_device_1.BLEDevice();
        const token = (0, crypto_1.randomUUID)();
        if (this.byAddress.get(peripheral.address)) {
            // @ts-ignore
            bleDevice = this.byAddress.get(peripheral.address);
        }
        bleDevice.discoveredDevice = new discovered_device_1.DiscoveredDevice();
        bleDevice.discoveredDevice.lastSeen = bleDevice.lastSeen;
        bleDevice.discoveredDevice.token = token;
        bleDevice.discoveredDevice.address = peripheral.address;
        bleDevice.discoveredDevice.localName = peripheral.advertisement.localName;
        bleDevice.address = peripheral.address;
        bleDevice.tokens.push(token);
        bleDevice.peripheral = peripheral;
        log_manager_1.Log.info('Create new discovered device:' + JSON.stringify(bleDevice.discoveredDevice));
        this.byAddress.set(bleDevice.address, bleDevice);
        this.byToken.set(token, bleDevice);
        return bleDevice.discoveredDevice;
    }
    removeDeviceDiscoveredByToken(token) {
        let bleDevice = this.byToken.get(token);
        if (!bleDevice)
            return;
        this.byToken.delete(token);
        bleDevice = this.byAddress.get(bleDevice.address);
        if (!bleDevice)
            return;
        bleDevice.lastSeen = bleDevice.discoveredDevice.lastSeen;
        bleDevice.discoveredDevice = undefined;
        bleDevice.scanningOngoing = false;
        log_manager_1.Log.info('Removed discovered device by token:' + token);
    }
    cleanupTokens(token) {
        let bleDevice = this.byToken.get(token);
        if (!bleDevice)
            return undefined;
        const currentToken = bleDevice.discoveredDevice.token;
        const tokens = bleDevice.tokens;
        return tokens.filter(obj => (obj !== currentToken));
    }
}
exports.BLEDeviceRegister = BLEDeviceRegister;
