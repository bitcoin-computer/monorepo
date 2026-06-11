const isJUndefined = (a) => typeof a === 'undefined';
const isJNull = (a) => a === null;
const isJBoolean = (a) => typeof a === 'boolean';
const isJNumber = (a) => typeof a === 'number';
const isJString = (a) => typeof a === 'string';
const isJSymbol = (a) => typeof a === 'symbol';
const isJBigInt = (a) => typeof a === 'bigint';
const isJBasic = (a) => isJNull(a) ||
    isJUndefined(a) ||
    isJNumber(a) ||
    isJString(a) ||
    isJBoolean(a) ||
    isJSymbol(a) ||
    isJBigInt(a);
const isJObject = (a) => !isJBasic(a) && !Array.isArray(a);
const isJArray = (a) => !isJBasic(a) && Array.isArray(a);
const objectEntryMap = (g) => (object) => Object.fromEntries(Object.entries(object).map(g));
const objectMap = (f) => (object) => objectEntryMap(([key, value]) => [key, f(value)])(object);
export const jsonMap = (g) => (json) => {
    if (isJBasic(json))
        return g(json);
    if (isJArray(json))
        return g(json.map(jsonMap(g)));
    if (isJObject(json))
        return g(objectMap(jsonMap(g))(json));
    throw new Error('Unsupported type');
};
export const strip = (value) => {
    if (isJBasic(value))
        return value;
    if (isJArray(value))
        return value.map(strip);
    const { _id, _root, _rev, _satoshis, _owners, ...rest } = value;
    return rest;
};
// https://github.com/GoogleChromeLabs/jsbi/issues/30
export const toObject = (obj) => JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2);
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
export function isValidRevString(outId) {
    return /^[0-9A-Fa-f]{64}:\d+$/.test(outId);
}
export function isValidRev(value) {
    return typeof value === 'string' && isValidRevString(value);
}
export const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
export function getEnv(name) {
    return ((typeof process !== 'undefined' && process.env[`REACT_APP_${name}`]) ||
        (import.meta.env && import.meta.env[`VITE_${name}`]));
}
export function bigIntToStr(a) {
    if (a < 0n)
        throw new Error('Balance must be a non-negative');
    const scale = BigInt(1e8);
    const integerPart = (a / scale).toString();
    const fractionalPart = (a % scale).toString().padStart(8, '0').replace(/0+$/, '');
    return `${integerPart}.${fractionalPart || '0'}`;
}
export function strToBigInt(a) {
    // Validate number contains at most one dot and is not empty
    if ((a.match(/\./g) || []).length > 1 || a === '.' || a === '') {
        throw new Error('Invalid number');
    }
    const [integerPart, fractionalPart = ''] = a.split('.');
    // Validate integer and fractional part contains only digits (or is empty)
    if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
        throw new Error('Invalid number');
    }
    const paddedFractionalPart = fractionalPart.padEnd(8, '0').slice(0, 8);
    const totalSatoshisStr = integerPart + paddedFractionalPart;
    return BigInt(totalSatoshisStr);
}
