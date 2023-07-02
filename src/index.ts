/*
 * Copyright 2023 Christian Petersen <christian@ipeople.dk>
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BLEDevice } from "./main/ble-device"
import { DiscoveredDevice } from "./main/ble/discovered-device"
import { XioamiHelper } from "./main/xioami-helper"

export default function (app: any) {
  const error = app.error
  const debug = app.debug
  let props: ConfigData
  let onStop: any = []
  let foundDevices: any = {}
  let knownDevices: BLEDevice[] = [];

  const plugin: Plugin = {
    start: function (properties: ConfigData) {
      props = properties

      if ( !props?.devices ) {
        props.devices = [];
      }

      const handleDevice = (d: BLEDevice) => {
        foundDevices[d.address] = d;
        
        if (d.enabled) {
          // start timer for device
          const interval = setInterval(() => {
            const last = new Date(d.lastSeen).getTime();
            const now = Date.now();

            if (now - last < 10 * 1000 * d.reportRate) {
              app.handleMessage(plugin.id, {
                updates: [
                  {
                    values: [ {
                      path: `environment.${ (d.inside) ? 'inside' : 'outside'}.${d.dataName}.temperature`,
                      value: Number(d.lastTemperature)
                    }]
                  }
                ]
              });
            }
          }, d.reportRate * 1000);
          onStop.push(() => clearInterval(interval))
        }
      };

      app.debug('Xioami BLE Plugin starting');
      XioamiHelper.startBLEScanner();
      XioamiHelper.registerListener((d: DiscoveredDevice) => {
        app.debug('Discovered new device: ' + d.address + ' ' + d.localName);

        // check against known devices
        let device: BLEDevice | undefined = undefined;
        for (const de of knownDevices) {
          if (de.address == d.address) {
            device = de;
            app.debug('Device is known registry: ' + de.dataName);
            break;
          }
        }
        if (!device) {
          app.debug('Creating new device in registry');
          device = {
            address: d.address,
            enabled: false, 
            dataName: d.localName,
            lastSeen: new Date().toISOString(),
            firstSeen: new Date().toISOString(),
            reportRate: 60,
            inside: true,
            name: d.localName,
            lastHumidity: d.lastHumidity,
            lastTemperature: d.lastTemperature
          }
          knownDevices.push(device);
          handleDevice(device);
        }

      });
      
      
    },

    stop: function () {
      XioamiHelper.stopBLEScanner();
      onStop.forEach((f: any) => f())
      onStop = []
    },

    id: 'signalk-xioami-thermostat',
    name: 'Xioami BLE Thermostats',
    description: 'Use BLE to read values from Xioami BLE Thermostats',

    schema: () => {
      return {
        //title: plugin.name,
        type: 'object',
        properties: {
          devices: {
            title: 'Devices',
            type: 'array',
            description: 'BLE Devices found',
            items: {
              type: 'object',
              required: ['address', 'name', 'dataName', 'inside', 'enabled'],
              properties: {
                address: {
                  type: 'string',
                  title: 'BLE Address',
                  enum: knownDevices.map(d => d.address)
                },
                name: {
                  type: 'string',
                  title: 'BLE Name'
                },
                dataName: {
                  type: 'string',
                  title: 'The XXX to use after environment.INSIDE|OUTSIDE.XXX.temperature|humidity'
                },
                inside: {
                  type: 'boolean',
                  title: 'Report as inside?'
                },
                enabled: {
                  type: 'boolean',
                  title: 'Enable data capture for this device?'
                },
                rate: {
                  type: 'number',
                  title: 'Rate of data read/push in seconds?',
                  default: 60
                },
                firstSeen: {
                  type: 'string',
                  'format': 'date-time',
                  title: 'First time this device was seen'
                },
                lastSeen: {
                  type: 'string',
                  'format': 'date-time',
                  title: 'Last time this device was seen'
                },
                lastTemperature: {
                  type: 'number',
                  title: 'Last measured temperature'
                },
                lastHumidity: {
                  type: 'number',
                  title: 'Last measured humidity'
                }
              }
            }
          }
        }
      }
    }
  }
  
  // function makeBinaryStatusReport (bank: any) {
  //   const pgn: any = {
  //     pgn: 127501,
  //     'Switch Bank Instance': bank.instance,
  //     'Instance': bank.instance
  //   }
  //   bank.switches?.forEach((sw: any, index: number) => {
  //     const value = app.getSelfPath(sw)
  //     if (value && typeof value.value !== 'undefined') {
  //       pgn[`Indicator${index + 1}`] =
  //         value.value === 1 || value.value === true ? 'On' : 'Off'
  //     }
  //   })
  //   return pgn
  // }

  return plugin
}

interface Plugin {
  start: (app: any) => void
  stop: () => void
  id: string
  name: string
  description: string
  schema: any
}

interface ConfigData {

  devices: BLEDevice[];

}
