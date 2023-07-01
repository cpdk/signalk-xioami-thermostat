"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xioami_helper_1 = require("./xioami-helper");
module.exports = function (app) {
    const plugin = {};
    plugin.id = 'signalk-xioami-thermostat';
    plugin.name = 'Xioami BLE Thermostats';
    plugin.description = 'Use BLE to read values from Xioami BLE Thermostats';
    plugin.start = function (options, restartPlugin) {
        // Here we put our plugin logic
        app.debug('Xioami BLE Plugin starting');
        xioami_helper_1.XioamiHelper.startBLEScanner();
        app.debug('Xioami BLE Plugin started');
    };
    plugin.stop = function () {
        // Here we put logic we need when the plugin stops
        app.debug('Xioami BLE Plugin stopping');
        xioami_helper_1.XioamiHelper.stopBLEScanner();
        app.debug('Xioami BLE Plugin stopped');
    };
    plugin.schema = {
    // Loop on known and new devices
    };
    return plugin;
};
