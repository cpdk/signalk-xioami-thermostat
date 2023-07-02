export interface DiscoveredDevice {
  localName: string;
  rssi: number;
  address: string;
  token: string;
  lastSeen: number;
  state: string;

  lastTemperature: number;
  lastHumidity: number;
}
