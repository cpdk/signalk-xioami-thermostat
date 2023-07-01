import { LogLevel } from './log-level';

export class Log {


    public static Level = 0;
    private static listener: (level: LogLevel, s: string) => void;


    public static getFormatedDate(): string {
        return new Date().toISOString()
    }

    public static info(s: string) {
        if (Log.Level <= 1) {
            const logline = `${Log.getFormatedDate()}    <info>: ${s}`;
            console.log(logline);
            if (this.listener) {
                this.listener(LogLevel.INFO, s);
            }
        }
    }

    public static debug(s: string) {
        if (Log.Level <= 0) {
            const logline = `${Log.getFormatedDate()}   <debug>: ${s}`;
            console.log(logline);
            if (this.listener) {
                this.listener(LogLevel.DEBUG, s);
            }
        }
    }

    public static warn(s: string) {
        if (Log.Level <= 2) {
            const logline = `${Log.getFormatedDate()} <warning>: ${s}`;
            console.log(logline);
            if (this.listener) {
                this.listener(LogLevel.WARN, s);
            }
        }
    }

    public static error(s: string, err?: any, noRemote: boolean = false) {
        if (Log.Level <= 3) {
            let logline = `${Log.getFormatedDate()}   <error>: ${s}`;
            if (err) {
                logline += ' caused by ' + err;
            }
            console.log(logline);

            if (this.listener) {
                this.listener(LogLevel.ERROR, s);

            }
        }
    }

    public static setListener(list: (level: LogLevel, s: string) => void): void {
        this.listener = list;
    }

}
