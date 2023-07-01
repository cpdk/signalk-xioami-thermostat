
export class StringUtils {

    public static toNobleFormat(uuid: string): string {
        return uuid.split('-').join('').toLowerCase();
    }

    public static getBitPattern(r: number): string {
        r = Number(r);
        const bits = (r.toString(2)).padStart(16, '0').replace(/\B(?=(.{8})+(?!.))/g, ' ');

        return bits;
    }

}
