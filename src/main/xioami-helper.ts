import { BLEDevice } from "./ble-device";
import { BleScanner } from "./ble-scanner";
import { DiscoveredDevice } from "./ble/discovered-device";


export class XioamiHelper {
    
    public static readonly seenDevices: BLEDevice[] = [];
    
    public static startBLEScanner(): void {
        const scanner = BleScanner.get();
        scanner.startScanning();
    }
    
    public static registerListener(listener: (d: DiscoveredDevice) => void) {
        const scanner = BleScanner.get();
        scanner.registerListener(listener);
    }
   
    public static stopBLEScanner(): void {
        const scanner = BleScanner.get();
        scanner.stopScanning();
    }

}