import { BLEDevice } from "./ble-device";
import { BleScanner } from "./ble-scanner";


export class XioamiHelper {

    public static readonly seenDevices: BLEDevice[] = [];

    public static startBLEScanner(): void {
        const scanner = BleScanner.get();
        scanner.startScanning();
    }
   
    public static stopBLEScanner(): void {
        const scanner = BleScanner.get();
        scanner.stopScanning();
    }

}