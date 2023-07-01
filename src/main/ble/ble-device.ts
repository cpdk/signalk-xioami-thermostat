import {Peripheral} from "noble";
import { DiscoveredDevice } from "./discovered-device";

export class BLEDevice {
  public tokens: string[] = [];
  public scanningOngoing: boolean;
  public lastSeen: number;
  public address: string;
  public peripheral: Peripheral;
  public discoveredDevice: DiscoveredDevice|undefined;
}
