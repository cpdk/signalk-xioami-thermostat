# SignalK BLE Temperature and Humidity Plugin

## Overview

This plugin is designed to add support for reading temperature and humidity from Xiaomi LYWSD03MMC Bluetooth BLE Thermometers. It works by scanning for compatible BLE devices and publishing the data on SignalK data paths. The plugin is designed to support multiple devices, allowing for numerous measurements to be made simultaneously.

## Prerequisites

- A platform with BLE support (the plugin is designed to run on a Raspberry Pi).
- One or more Xiaomi LYWSD03MMC Bluetooth BLE Thermometers with patched firmware.

## Firmware Patching

The firmware on the Xiaomi devices needs to be patched using the firmware from [this GitHub repository](https://github.com/atc1441/ATC_MiThermometer). The patching process can be done using the [web-based tool here](https://atc1441.github.io/TelinkFlasher.html). The steps are as follows:

1. Connect to the device.
2. Click "Do Activation".
3. Choose File => Downloaded firmware from the GitHub link above.
4. Start Flashing (takes ~30 seconds).
5. Reconnect to Device after it reboots.
6. Set advertising type to "Custom".

## Installation

The plugin can be found in the Hardware section of the SignalK AppStore and installed from there.

## Usage

Once the plugin is installed and the devices are set up, you can see the found devices in the Plugin Configuration where names can be specified. The plugin will not detect unpatched BLE devices.

## Contributing

The plugin is open-source with an Apache2 license in a public GitHub repository. Pull requests are more than welcome.

## Support and Issues

If you encounter any issues while using the plugin, please check to ensure that your BLE devices have been patched correctly as the plugin will not detect unpatched devices.

## Future Plans

There are currently no plans for future upgrades to the plugin.
