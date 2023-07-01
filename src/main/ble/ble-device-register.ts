import {Peripheral} from "noble";
import {Log} from "../log/log-manager";
import {BLEDevice} from "./ble-device";
import { DiscoveredDevice } from "./discovered-device";
import { randomUUID } from "crypto";

export class BLEDeviceRegister {

  private byAddress: Map<string, BLEDevice>;
  private byToken: Map<string, BLEDevice>;

  constructor() {
    this.byAddress = new Map<string, BLEDevice>();
    this.byToken = new Map<string, BLEDevice>();
  }
  public reset() {
    this.byToken.clear();
    this.byAddress.clear();
  }


  public getByAddress(address: string): BLEDevice|undefined {
    return this.byAddress.get(address);
  }

  public getByToken(address: string): BLEDevice|undefined {
    return this.byToken.get(address);
  }

  public createDiscoveredDevice(peripheral: Peripheral): DiscoveredDevice {
    let bleDevice = new BLEDevice();
    const token = randomUUID();
    if (this.byAddress.get(peripheral.address)) {
      // @ts-ignore
      bleDevice = this.byAddress.get(peripheral.address);
    }
    bleDevice.discoveredDevice = new DiscoveredDevice();
    bleDevice.discoveredDevice.lastSeen = bleDevice.lastSeen;
    bleDevice.discoveredDevice.token = token;
    bleDevice.discoveredDevice.address = peripheral.address;
    bleDevice.discoveredDevice.localName = peripheral.advertisement.localName;
    bleDevice.address = peripheral.address;
    bleDevice.tokens.push(token);
    bleDevice.peripheral = peripheral;
    Log.info('Create new discovered device:'+JSON.stringify(bleDevice.discoveredDevice))
    this.byAddress.set(bleDevice.address, bleDevice);
    this.byToken.set(token, bleDevice);
    return bleDevice.discoveredDevice;
  }

  public removeDeviceDiscoveredByToken(token: string) {
      let bleDevice = this.byToken.get(token);
      if (!bleDevice) return;
      this.byToken.delete(token);
      bleDevice = this.byAddress.get(bleDevice.address);
      if (!bleDevice) return;
      bleDevice.lastSeen = bleDevice.discoveredDevice!.lastSeen;
      bleDevice.discoveredDevice = undefined;
      bleDevice.scanningOngoing = false;
      Log.info('Removed discovered device by token:'+token);
  }

  public cleanupTokens(token: string): string[]|undefined {
    let bleDevice = this.byToken.get(token);
    if (!bleDevice) return undefined;
    const currentToken = bleDevice.discoveredDevice!.token;
    const tokens = bleDevice.tokens;

    return tokens.filter(obj => (obj !== currentToken));
  }
}
