
export interface BLEDevice {

    firstSeen: string;
    lastSeen: string;
    address: string;
    dataName: string;
    lastTemperature: number;
    lastHumidity: number;
    lastBattery: number;
    lastVoltage: number;
    enabled: boolean;
    inside: boolean;
    reportRate: number;

} 
