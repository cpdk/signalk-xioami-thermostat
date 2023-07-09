
const fakeApp = {

    debug: (s) => {
        console.log('DEBUG: ' + s);
    },
    handleMessage: (id, data) => {
        console.log('MSG ' + DateUtils.get() +': <' + id + '>: ' + JSON.stringify(data, null, 2));
    },
    getSelfPath: (id) => {
        return 'vessels.urn:mrn:signalk:uuid:a9d2c3b1-1111-2222-3333-0b89d014ed60';
    }


};

const pluginCreator = require('./index');
const { DateUtils } = require('./src/main/util/date-utils');

const plugin = pluginCreator(fakeApp);
const config = {};

plugin.start(config);