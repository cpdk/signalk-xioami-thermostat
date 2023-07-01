"use strict";
const plugin = require('../main/index');
console.log('Starting local test scanner');
const dummyApp = {
    debug: (s) => {
        console.log(new Date().toISOString() + ': ' + s);
    }
};
plugin(dummyApp);
