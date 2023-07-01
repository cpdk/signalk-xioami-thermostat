"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
class StringUtils {
    static toNobleFormat(uuid) {
        return uuid.split('-').join('').toLowerCase();
    }
    static getBitPattern(r) {
        r = Number(r);
        const bits = (r.toString(2)).padStart(16, '0').replace(/\B(?=(.{8})+(?!.))/g, ' ');
        return bits;
    }
}
exports.StringUtils = StringUtils;
