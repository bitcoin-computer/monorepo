var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as turf from '@turf/turf';
import usStatesJson from '../geodata/us-states.json' assert { type: 'json' };
var usStates = usStatesJson;
function getStatesContainingPoint(point, geojsonData) {
    var matchingStates = [];
    geojsonData.features.forEach(function (state) {
        if (turf.booleanPointInPolygon(point, state.geometry)) {
            var stateName = state.properties.name;
            matchingStates.push(stateName);
        }
    });
    return matchingStates;
}
export var checkGeoLocation = function () { return __awaiter(void 0, void 0, void 0, function () {
    var isEnabled, blockedStates;
    var _a;
    return __generator(this, function (_b) {
        isEnabled = import.meta.env.VITE_ENABLE_GEOLOCATION === 'true';
        blockedStates = ((_a = import.meta.env.VITE_BLOCKED_STATES) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
        if (!isEnabled)
            return [2 /*return*/, true]; // Skip geolocation checks if not enabled
        return [2 /*return*/, new Promise(function (resolve, reject) {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported by your browser.'));
                    return;
                }
                navigator.geolocation.getCurrentPosition(function (position) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, latitude, longitude, point, statesContainingPoint;
                    return __generator(this, function (_b) {
                        try {
                            _a = position.coords, latitude = _a.latitude, longitude = _a.longitude;
                            point = turf.point([longitude, latitude]);
                            statesContainingPoint = getStatesContainingPoint(point.geometry, usStates);
                            if (statesContainingPoint.length > 1) {
                                // The getStatesContainingPoint returned multiple points this is not expected
                                resolve(false);
                            }
                            else if (statesContainingPoint[0] && blockedStates.includes(statesContainingPoint[0])) {
                                // The user is accessing from one of the blocked US states
                                resolve(false);
                            }
                            else {
                                resolve(true);
                            }
                        }
                        catch (error) {
                            reject(new Error('Failed to determine your location. Please try again.'));
                        }
                        return [2 /*return*/];
                    });
                }); }, function () {
                    reject(new Error('You denied location access. Location is mandatory for legal reasons.'));
                });
            })];
    });
}); };
