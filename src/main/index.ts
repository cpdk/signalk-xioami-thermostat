import { XioamiHelper } from "./xioami-helper";

module.exports = function (app: any) {
  const plugin = {} as any;

  plugin.id = 'signalk-xioami-thermostat';
  plugin.name = 'Xioami BLE Thermostats';
  plugin.description = 'Use BLE to read values from Xioami BLE Thermostats';

  plugin.start = function (options: any, restartPlugin: any) {
    // Here we put our plugin logic
    app.debug('Xioami BLE Plugin starting');
    XioamiHelper.startBLEScanner();

    app.debug('Xioami BLE Plugin started');
  };

  plugin.stop = function () {
    // Here we put logic we need when the plugin stops
    app.debug('Xioami BLE Plugin stopping');

    XioamiHelper.stopBLEScanner();

    app.debug('Xioami BLE Plugin stopped');
  };

  plugin.schema = {
    // Loop on known and new devices
  };

  return plugin;
};