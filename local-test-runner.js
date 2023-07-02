
const fakeApp = {

    debug: (s) => {
        console.log('DEBUG: ' + s);
    },
    handleMessage: (id, data) => {
        console.log('MSG ' + new Date().toISOString() +': <' + id + '>: ' + JSON.stringify(data, null, 2));
    }


};

const pluginCreator = require('./index');

const plugin = pluginCreator(fakeApp);
const config = {};

plugin.start(config);