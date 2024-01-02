var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var isJUndefined = function (a) { return typeof a === "undefined"; };
var isJNull = function (a) { return a === null; };
var isJBoolean = function (a) { return typeof a === "boolean"; };
var isJNumber = function (a) { return typeof a === "number"; };
var isJString = function (a) { return typeof a === "string"; };
var isJSymbol = function (a) { return typeof a === "symbol"; };
var isJBigInt = function (a) { return typeof a === "bigint"; };
var isJBasic = function (a) {
    return isJNull(a) ||
        isJUndefined(a) ||
        isJNumber(a) ||
        isJString(a) ||
        isJBoolean(a) ||
        isJSymbol(a) ||
        isJBigInt(a);
};
var isJObject = function (a) { return !isJBasic(a) && !Array.isArray(a); };
var isJArray = function (a) { return !isJBasic(a) && Array.isArray(a); };
var objectEntryMap = function (g) {
    return function (object) {
        return Object.fromEntries(Object.entries(object).map(g));
    };
};
var objectMap = function (f) {
    return function (object) {
        return objectEntryMap(function (_a) {
            var key = _a[0], value = _a[1];
            return [key, f(value)];
        })(object);
    };
};
export var jsonMap = function (g) {
    return function (json) {
        if (isJBasic(json))
            return g(json);
        if (isJArray(json))
            return g(json.map(jsonMap(g)));
        if (isJObject(json))
            return g(objectMap(jsonMap(g))(json));
        throw new Error("Unsupported type");
    };
};
export var strip = function (value) {
    if (isJBasic(value))
        return value;
    if (isJArray(value))
        return value.map(strip);
    var _id = value._id, _root = value._root, _rev = value._rev, _amount = value._amount, _owners = value._owners, rest = __rest(value, ["_id", "_root", "_rev", "_amount", "_owners"]);
    return rest;
};
// https://github.com/GoogleChromeLabs/jsbi/issues/30
export var toObject = function (obj) {
    return JSON.stringify(obj, function (key, value) { return typeof value === 'bigint' ? value.toString() : value; }, 2);
};
export var capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
export function isValidRevString(outId) {
    return /^[0-9A-Fa-f]{64}:\d+$/.test(outId);
}
export function isValidRev(value) {
    return typeof value === "string" && isValidRevString(value);
}
export var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
