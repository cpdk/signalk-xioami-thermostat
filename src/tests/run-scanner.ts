import { DateUtils } from "../main/util/date-utils";

const plugin = require('../main/index');



async function main() {
    console.log('Starting local test scanner');
    
    const dummyApp = {
        debug: (s: string) => {
            console.log(DateUtils.get() + ': ' + s);
        }
    };
    const plg = plugin(dummyApp);
    plg.start();
    // This will prevent the process from exiting
    await new Promise(() => {});
  }
  
  main();

