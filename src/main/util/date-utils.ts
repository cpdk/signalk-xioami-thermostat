

export class DateUtils {

    public static toLocalISOString(d: Date): string {
        var tzo = -d.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = (num: number) => {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return d.getFullYear() +
        '-' + pad(d.getMonth() + 1) +
        '-' + pad(d.getDate()) +
        'T' + pad(d.getHours()) +
        ':' + pad(d.getMinutes()) +
        ':' + pad(d.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
    }

    public static get(): string {
        return DateUtils.get();
    }

}