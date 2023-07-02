
export interface BLEDevice {

    firstSeen: string;
    lastSeen: string;
    address: string;
    name: string;
    dataName: string;
    lastTemperature: number;
    lastHumidity: number;
    enabled: boolean;
    inside: boolean;
    reportRate: number;

} 
