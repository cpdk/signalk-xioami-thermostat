"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const log_level_1 = require("./log-level");
class Log {
    static getFormatedDate() {
        return new Date().toISOString();
    }
    static info(s) {
        if (Log.Level <= 1) {
            const logline = `${Log.getFormatedDate()}    <info>: ${s}`;
            console.log(logline);
            if (this.listener) {
                this.listener(log_level_1.LogLevel.INFO, s);
            }
        }
    }
    static debug(s) {
        if (Log.Level <= 0) {
            const logline = `${Log.getFormatedDate()}   <debug>: ${s}`;
            console.log(logline);
            if (this.listener) {
                this.listener(log_level_1.LogLevel.DEBUG, s);
            }
        }
    }
    static warn(s) {
        if (Log.Level <= 2) {
            const logline = `${Log.getFormatedDate()} <warning>: ${s}`;
            console.log(logline);
            if (this.listener) {
                this.listener(log_level_1.LogLevel.WARN, s);
            }
        }
    }
    static error(s, err, noRemote = false) {
        if (Log.Level <= 3) {
            let logline = `${Log.getFormatedDate()}   <error>: ${s}`;
            if (err) {
                logline += ' caused by ' + err;
            }
            console.log(logline);
            if (this.listener) {
                this.listener(log_level_1.LogLevel.ERROR, s);
            }
        }
    }
    static setListener(list) {
        this.listener = list;
    }
}
exports.Log = Log;
Log.Level = 0;
