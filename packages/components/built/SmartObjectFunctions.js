import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { SmartObjectFunction } from './SmartObjectFunction';
export var SmartObjectFunctions = function (_a) {
    var smartObject = _a.smartObject, functionsExist = _a.functionsExist, options = _a.options, setFunctionResult = _a.setFunctionResult, setShow = _a.setShow, setModalTitle = _a.setModalTitle;
    if (!functionsExist)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
            .filter(function (key) {
            return key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function';
        })
            .map(function (key, fnIndex) {
            return (_jsx("div", { children: _jsx(SmartObjectFunction, { funcName: key, smartObject: smartObject, functionsExist: functionsExist, options: options, setFunctionResult: setFunctionResult, setShow: setShow, setModalTitle: setModalTitle }) }, fnIndex));
        }) }));
};
