import { getErrorMessage } from './common/utils';
export { getErrorMessage };
export declare const getParameterNames: (fn: ((...args: any[]) => any) | string) => string[];
export declare const SmartObjectFunction: ({ smartObject, functionsExist, options, funcName, embedded, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    funcName: string;
    /** When true, omit outer title (parent panel already shows it) */
    embedded?: boolean;
}) => import("react").JSX.Element;
