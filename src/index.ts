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

import { BLEDevice } from './main/ble-device'
import { XioamiHelper } from './main/xioami-helper'

export default function (app: any) {
  const error = app.error
  const debug = app.debug
  let props: ConfigData
  let onStop: any = []
  let foundDevices: any = {}
  let knownDevices: BLEDevice[] = []

  const plugin: Plugin = {
    start: function (properties: ConfigData) {
      app.debug('Xioami BLE Plugin starting');
      props = properties

      if (!props?.devices) {
        props.devices = []
      }

      const handleDevice = (d: BLEDevice) => {
        foundDevices[d.address] = d

        const reportData = () => {
          app.handleMessage(plugin.id, {
            updates: [
              {
                values: [
                  {
                    path: `environment.${d.inside ? 'inside' : 'outside'}.${
                      d.dataName
                    }.temperature`,
                    value: d.lastTemperature,
                    context: app.getSelfPath('uuid'),
                    source: {
                      label: plugin.id,
                      type: 'NMEA2000',
                      pgn: 130312
                    },
                    timestamp: d.lastSeen
                  },
                  {
                    path: `environment.${d.inside ? 'inside' : 'outside'}.${
                      d.dataName
                    }.humidity`,
                    value: d.lastHumidity,
                    context: app.getSelfPath('uuid'),
                    source: {
                      label: plugin.id,
                      type: 'NMEA2000',
                      pgn: 130313
                    },
                    timestamp: d.lastSeen
                  },
                  {
                    path: `environment.${d.inside ? 'inside' : 'outside'}.${
                      d.dataName
                    }.battery`,
                    value: d.lastBattery
                  },
                  {
                    path: `environment.${d.inside ? 'inside' : 'outside'}.${
                      d.dataName
                    }.voltage`,
                    value: d.lastVoltage
                  },
                  {
                    path: `environment.${d.inside ? 'inside' : 'outside'}.${
                      d.dataName
                    }.lastSeen`,
                    value: d.lastSeen
                  }
                ]
              }
            ]
          })
        }

        if (d.enabled) {
          // start timer for device
          const interval = setInterval(() => {
            const last = new Date(d.lastSeen).getTime()
            const now = Date.now()
            // console.log('Reporting for: ' + d.address);
            if (now - last < 10 * 1000 * d.reportRate) {
              reportData()
            }
          }, d.reportRate * 1000)
          onStop.push(() => clearInterval(interval))
          reportData()
        }
      }

      app.debug('Xioami BLE Scanner starting');
      XioamiHelper.startBLEScanner();
      XioamiHelper.registerListener((d: BLEDevice) => {
        // check against known devices
        let device: BLEDevice | undefined = undefined
        for (const de of knownDevices) {
          if (de.address == d.address) {
            device = de
            // app.debug('Device is known in registry: ' + de.dataName);
            break
          }
        }
        if (!device) {
          app.debug('Creating new device in registry')
          device = {
            address: d.address,
            enabled: props.enabled,
            dataName: d.address,
            lastSeen: new Date().toISOString(),
            firstSeen: new Date().toISOString(),
            reportRate: 60,
            inside: true,
            lastHumidity: d.lastHumidity,
            lastTemperature: d.lastTemperature,
            lastBattery: d.lastBattery,
            lastVoltage: d.lastVoltage
          }
          handleDevice(device)
          knownDevices.push(device)
        }

        device.lastHumidity = d.lastHumidity
        device.lastTemperature = d.lastTemperature
        device.lastBattery = d.lastBattery
        device.lastVoltage = d.lastVoltage
        device.lastSeen = d.lastSeen

        // console.log(new Date().toISOString() + ': Latest values for ' + d.address + ': ' + d.lastTemperature + 'C, ' + d.lastHumidity + '%, ' + d.lastVoltage + 'mV, ' + d.lastBattery + '%');
      });
    },

    stop: function () {
      XioamiHelper.stopBLEScanner();
      onStop.forEach((f: any) => f())
      onStop = [];
      app.debug('Xioami BLE Plugin stopped');
    },

    id: 'signalk-xioami-thermostat',
    name: 'Xioami BLE Thermostats',
    description: 'Use BLE to read values from Xioami BLE Thermostats',

    schema: () => {
      return {
        //title: plugin.name,
        type: 'object',
        properties: {
          enabled: {
            type: 'boolean',
            title: 'Enable data capture for all discovered devices?'
          },
          devices: {
            title: 'Devices',
            type: 'array',
            minItems: 0,
            description: knownDevices.length + ' BLE Devices found',
            items: {
              type: 'object',
              required: ['address', 'dataName', 'rate'],
              properties: {
                address: {
                  type: 'string',
                  title: 'BLE Address',
                  enum: (knownDevices && knownDevices.length > 0) ? knownDevices.map(d => d.address) : undefined
                },
                dataName: {
                  type: 'string',
                  title:
                    'The XXX to use after environment.INSIDE|OUTSIDE.XXX.temperature|humidity'
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
  devices: BLEDevice[],
  enabled: boolean
}
