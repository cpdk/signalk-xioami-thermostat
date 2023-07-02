import { XioamiHelper } from "./dist/main/xioami-helper";

module.exports = function (app) {
  const plugin = {};

  plugin.id = 'signalk-xioami-thermostat';
  plugin.name = 'Xioami BLE Thermostats';
  plugin.description = 'Use BLE to read values from Xioami BLE Thermostats';

  plugin.start = function (options, restartPlugin) {
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

  plugin.schema = function () {
    return {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["address", "name", "dataName","inside", "enabled"],
            "properties": {
              "address": {
                "type": "string",
                "title" : "BLE Address"
              },
              "name": {
                "type": "string",
                "title": "BLE Name"
              },
              "dataName": {
                "type": "string",
                "title": "The XXX to use after environment.INSIDE|OUTSIDE.XXX.temperature|humidity"
              },
              "inside": {
                "type": "boolean",
                "title": "Report as inside?"
              },
              "enabled": {
                "type": "boolean",
                "title": "Enable data capture for this device?"
              },
              "firstSeen": {
                "type": "string",
                "format": "date-time",
                "title": "First time this device was seen"
              },
              "lastSeen": {
                "type": "string",
                "format": "date-time",
                "title": "Last time this device was seen"
              },
              "lastTemperature": {
                "type": "number",
                "title": "Last measured temperature"
              },
              "lasthumidity": {
                "type": "number",
                "title": "Last measured humidity"
              }
            }
        }
    };
}
;

  return plugin;
};