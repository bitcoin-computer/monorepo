import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TypeSelectionDropdown } from './common/TypeSelectionDropdown';
import { getErrorMessage, isMissingOrSpentError, isValidRev, toObject } from './common/utils';
import { UtilsContext } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
import { FieldError } from './InlineAlert';
export { getErrorMessage };
const PREVIEW_NOTE = 'Encoded without funding or signing. Nothing was broadcast.';
const previewBtnClassName = 'text-sm font-medium text-blue-700 border border-blue-600 rounded-lg px-3 py-1.5 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-950/40 disabled:opacity-40 disabled:cursor-not-allowed';
function safeStringify(value) {
    try {
        if (value !== null && typeof value === 'object') {
            return toObject(value);
        }
        return String(value);
    }
    catch {
        try {
            return JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
        }
        catch {
            return String(value);
        }
    }
}
function MethodEffectPanel({ data, onPreview, previewDisabled, onDismiss, previewId, }) {
    const isPreview = data?.kind === 'preview';
    const hasData = Boolean(data);
    return (_jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 min-w-0", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: hasData ? (isPreview ? 'Preview — new state' : 'Effect — new state') : 'Effect' }), hasData ? (_jsx("span", { className: `text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 ${isPreview
                                    ? 'bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200'
                                    : 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'}`, children: isPreview ? 'Dry-run' : 'On-chain' })) : (_jsx("span", { className: "text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300", children: "Not run" }))] }), _jsxs("div", { className: "flex flex-wrap items-center gap-1.5 justify-end", children: [_jsx("button", { id: previewId, type: "button", onClick: onPreview, disabled: previewDisabled, className: `${previewBtnClassName} whitespace-nowrap`, title: "Encode without broadcasting", children: "Preview effect" }), hasData && onDismiss ? (_jsx("button", { type: "button", onClick: onDismiss, className: "text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-1.5 py-1", children: "Dismiss" })) : null] })] }), _jsx("div", { className: "p-4", children: !hasData ? (_jsxs("p", { className: "text-xs leading-relaxed text-gray-500 dark:text-gray-400", children: ["Run", ' ', _jsx("strong", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Preview effect" }), ' ', "to encode without broadcasting. New state from", ' ', _jsx("code", { className: "text-[11px]", children: "effect.res" }), " appears here."] })) : (_jsx(EffectBody, { data: data })) })] }));
}
function EffectBody({ data }) {
    const isPreview = data.kind === 'preview';
    return (_jsxs(_Fragment, { children: [data.note ? (_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-2", children: data.note })) : null, _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1", children: "effect.res" }), _jsx("pre", { className: "text-xs font-mono p-2.5 rounded-md bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-x-auto max-h-56 whitespace-pre-wrap break-words", tabIndex: 0, children: safeStringify(data.res) })] }), data.env && Object.keys(data.env).length > 0 ? (_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1", children: "effect.env" }), _jsx("pre", { className: "text-xs font-mono p-2.5 rounded-md bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-x-auto max-h-40 whitespace-pre-wrap break-words", children: safeStringify(data.env) })] })) : null, data.txId ? (_jsxs("p", { className: "text-xs text-gray-600 dark:text-gray-400 font-mono break-all", children: ["txId ", data.txId] })) : null, data.txHexLength != null ? (_jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Encoded tx ~", data.txHexLength, " hex chars", isPreview ? ' (unsigned / unfunded if dry-run)' : ''] })) : null] })] }));
}
const getValueForType = (type, stringValue) => {
    switch (type) {
        case 'number':
            return Number(stringValue);
        case 'bigint':
            return BigInt(stringValue);
        case 'string':
            return stringValue;
        case 'boolean':
            return stringValue === 'true';
        case 'undefined':
            return undefined;
        case 'null':
            return null;
        case 'object':
            return stringValue;
        case 'symbol':
            return Symbol(stringValue);
        default:
            return Number(stringValue);
    }
};
function formatReturnValue(value) {
    if (value === undefined)
        return 'undefined';
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number' || typeof value === 'boolean' || value === null)
        return String(value);
    if (typeof value === 'bigint')
        return `${value.toString()}n`;
    if (typeof value === 'symbol' || typeof value === 'function')
        return String(value);
    try {
        return toObject(value);
    }
    catch {
        return String(value);
    }
}
export const getParameterNames = (fn) => {
    try {
        const match = fn.toString().match(/\(.*?\)/);
        return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : [];
    }
    catch {
        return [];
    }
};
const getParameters = (params, fnName, formState) => params.map((param) => {
    const key = `${fnName}-${param}`;
    const paramValue = getValueForType(formState[`${key}--types`], formState[key]);
    if (isValidRev(paramValue))
        return param;
    if (typeof paramValue === 'string')
        return `'${paramValue}'`;
    // BigInt.prototype.toString() drops the `n` suffix, which would otherwise turn this
    // back into a plain number literal once interpolated into the `exp` string below.
    if (typeof paramValue === 'bigint')
        return `${paramValue}n`;
    return paramValue;
});
function resolveMethodFn(smartObject, funcName) {
    try {
        let proto = Object.getPrototypeOf(smartObject);
        while (proto && proto !== Object.prototype) {
            try {
                const desc = Object.getOwnPropertyDescriptor(proto, funcName);
                if (desc && 'value' in desc && typeof desc.value === 'function')
                    return desc.value;
                const v = proto[funcName];
                if (typeof v === 'function')
                    return v;
            }
            catch {
                // continue
            }
            try {
                proto = Object.getPrototypeOf(proto);
            }
            catch {
                break;
            }
        }
    }
    catch {
        return null;
    }
    return null;
}
export const SmartObjectFunction = ({ smartObject, functionsExist, options, funcName, embedded = false, latestRev, }) => {
    const parameterList = useMemo(() => {
        try {
            const fn = resolveMethodFn(smartObject, funcName);
            if (!fn)
                return [];
            return getParameterNames(fn).filter((val) => Boolean(val));
        }
        catch {
            return [];
        }
    }, [smartObject, funcName]);
    const buildInitialForm = (params) => Object.fromEntries(params.flatMap((key) => [
        [`${funcName}-${key}`, ''],
        // Default type so the call button is not stuck disabled until user picks a type
        [`${funcName}-${key}--types`, 'string'],
    ]));
    const [formState, setFormState] = useState(() => buildInitialForm(parameterList));
    const [formError, setFormError] = useState(null);
    const [callResult, setCallResult] = useState(null);
    const [effectPreview, setEffectPreview] = useState(null);
    const { showLoader, toast } = UtilsContext.useUtilsComponents();
    const computer = useContext(ComputerContext);
    const navigate = useNavigate();
    // Keep form fields in sync if parameter list resolves after mount
    useEffect(() => {
        setFormState(buildInitialForm(parameterList));
        setFormError(null);
        setCallResult(null);
        setEffectPreview(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when method/params change
    }, [funcName, parameterList.join(',')]);
    const encodeMethod = (smartObj, fnName, params, opts = {}) => {
        const revMap = {};
        // Create Rev Map to pass smart objects as params
        params.forEach((param) => {
            const key = `${fnName}-${param}`;
            const paramValue = getValueForType(formState[`${key}--types`], formState[key]);
            if (isValidRev(paramValue)) {
                revMap[param] = paramValue;
            }
        });
        return computer.encode({
            exp: `smartObject.${fnName}(${getParameters(params, fnName, formState)})`,
            env: { smartObject: smartObj._rev, ...revMap },
            ...opts,
        });
    };
    const handlePreview = async () => {
        setFormError(null);
        showLoader(true);
        try {
            const { tx, effect } = await encodeMethod(smartObject, funcName, parameterList, {
                fund: false,
                sign: false,
            });
            setEffectPreview({
                kind: 'preview',
                res: effect?.res,
                env: effect?.env,
                txHexLength: tx ? (tx.toHex?.()?.length ?? undefined) : undefined,
                note: PREVIEW_NOTE,
            });
        }
        catch (error) {
            setEffectPreview(null);
            setFormError(getErrorMessage(error));
        }
        finally {
            showLoader(false);
        }
    };
    const handleMethodCall = async (event, smartObj, fnName, params) => {
        event.preventDefault();
        setFormError(null);
        setCallResult(null);
        showLoader(true);
        try {
            const { tx, effect } = await encodeMethod(smartObj, fnName, params);
            // Getters / pure methods do not create an on-chain update, so encode returns tx: null.
            if (!tx) {
                const returned = formatReturnValue(effect?.res);
                setCallResult(returned);
                setEffectPreview({
                    kind: 'preview',
                    res: effect?.res,
                    env: effect?.env,
                    note: 'This method does not create an on-chain update.',
                });
                toast.success(returned, {
                    title: `Returned from ${fnName}`,
                    durationMs: 8000,
                });
                return;
            }
            await computer.broadcast(tx);
            await computer.waitForIndexed(tx.txId);
            const rev = await computer.latest(smartObject._id);
            setEffectPreview({
                kind: 'broadcast',
                res: effect?.res,
                env: effect?.env,
                txId: tx.txId,
            });
            toast.success(`Method “${fnName}” executed. A new revision was created on chain.`, {
                title: 'Success',
                durationMs: 8000,
                action: {
                    label: 'View latest revision',
                    onClick: () => navigate(`/objects/${rev}`),
                },
            });
        }
        catch (error) {
            const spent = isMissingOrSpentError(error);
            const message = getErrorMessage(error);
            setFormError(message);
            let goTo = spent ? latestRev : undefined;
            if (spent && (!goTo || goTo === smartObject._rev)) {
                try {
                    goTo = await computer.latest(smartObject._id);
                }
                catch {
                    // keep whatever we have
                }
            }
            const targetRev = goTo;
            toast.error(message, {
                title: spent ? 'Old revision' : 'Method call failed',
                durationMs: spent ? 10000 : undefined,
                action: spent && targetRev && targetRev !== smartObject._rev
                    ? {
                        label: 'Go to latest revision',
                        onClick: () => navigate(`/objects/${targetRev}`),
                    }
                    : undefined,
            });
        }
        finally {
            showLoader(false);
        }
    };
    const updateForm = (e, key) => {
        e.preventDefault();
        const value = { ...formState };
        value[key] = e.target.value;
        setFormState(value);
        if (formError)
            setFormError(null);
    };
    const updateTypes = (option, key) => {
        const value = { ...formState };
        value[`${key}--types`] = option;
        setFormState(value);
        if (formError)
            setFormError(null);
    };
    const capitalizeFirstLetter = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const isDisabled = useMemo(() => Object.keys(formState).length > 0 && Object.values(formState).some((value) => value === ''), [formState]);
    if (!functionsExist) {
        return _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Methods are not available." });
    }
    const inputClass = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500';
    return (_jsxs("div", { className: embedded ? 'flex-1 min-w-[16rem] flex flex-col bg-white dark:bg-gray-900' : 'mt-6 mb-6', children: [_jsxs("div", { id: `function-${funcName}`, className: embedded ? 'min-w-0 p-4 sm:p-5 overflow-x-auto' : '', children: [embedded ? (_jsxs("div", { className: "mb-4 pb-3 border-b border-gray-100 dark:border-gray-800", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Call method" }), _jsx("h3", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white font-mono", children: capitalizeFirstLetter(funcName) }), _jsxs("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono break-all", children: [funcName, "(", parameterList.join(', '), ")"] })] })) : (_jsx("h3", { className: "my-1.5 text-base font-semibold dark:text-white", children: capitalizeFirstLetter(funcName) })), _jsxs("form", { className: "space-y-3", onSubmit: (e) => e.preventDefault(), children: [parameterList.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 px-3 py-2.5", children: "This method takes no parameters." })) : (parameterList.map((paramName, paramIndex) => (_jsxs("div", { children: [_jsx("label", { htmlFor: `${funcName}-${paramName}`, className: "block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300", children: paramName }), _jsxs("div", { className: "flex flex-row items-center gap-2", children: [_jsx("input", { type: "text", id: `${funcName}-${paramName}`, value: formState[`${funcName}-${paramName}`] ?? '', onChange: (e) => updateForm(e, `${funcName}-${paramName}`), className: `${inputClass} min-w-0 flex-1`, placeholder: `Value for ${paramName}`, required: true, autoComplete: "off" }), _jsx("div", { className: "shrink-0", children: _jsx(TypeSelectionDropdown, { id: `${funcName}${paramName}`, dropdownList: options, selectedType: formState[`${funcName}-${paramName}--types`] || 'string', onSelectMethod: (option) => updateTypes(option, `${funcName}-${paramName}`) }) })] })] }, `${funcName}-${paramName}-${paramIndex}`)))), formError ? _jsx(FieldError, { children: formError }) : null, callResult != null ? (_jsxs("div", { className: "rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 p-2.5 text-green-800 dark:text-green-300", role: "status", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide mb-1", children: "Return value" }), _jsx("pre", { className: "text-xs font-mono whitespace-pre-wrap break-words", children: callResult })] })) : null, _jsx("button", { id: `${funcName}-call-function-button`, type: "button", disabled: isDisabled, className: `w-full sm:w-auto text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none transition
            ${isDisabled
                                    ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600'
                                    : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'}
          `, onClick: (evt) => handleMethodCall(evt, smartObject, funcName, parameterList), children: "Call method" })] })] }), _jsx(MethodEffectPanel, { data: effectPreview, onPreview: handlePreview, previewDisabled: isDisabled, previewId: `${funcName}-preview-effect-button`, onDismiss: () => setEffectPreview(null) })] }));
};
