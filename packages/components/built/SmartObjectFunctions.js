import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { SmartObjectFunction } from './SmartObjectFunction';
export const SmartObjectFunctions = ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, }) => {
    if (!functionsExist)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
            .filter((key) => key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function')
            .map((key, fnIndex) => (_jsx("div", { children: _jsx(SmartObjectFunction, { funcName: key, smartObject: smartObject, functionsExist: functionsExist, options: options, setFunctionResult: setFunctionResult, setShow: setShow, setModalTitle: setModalTitle }) }, fnIndex))) }));
};
