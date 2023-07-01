"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XioamiHelper = void 0;
const ble_scanner_1 = require("./ble-scanner");
class XioamiHelper {
    static startBLEScanner() {
        const scanner = ble_scanner_1.BleScanner.get();
        scanner.startScanning();
    }
    static stopBLEScanner() {
        const scanner = ble_scanner_1.BleScanner.get();
        scanner.stopScanning();
    }
}
exports.XioamiHelper = XioamiHelper;
XioamiHelper.seenDevices = [];
