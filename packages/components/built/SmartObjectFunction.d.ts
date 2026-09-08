import { getErrorMessage } from './common/utils';
export { getErrorMessage };
export declare const getParameterNames: (fn: ((...args: any[]) => any) | string) => string[];
export declare const SmartObjectFunction: ({ smartObject, functionsExist, options, funcName, embedded, latestRev, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    funcName: string;
    /** When true, render as the call column (header, form, and effect stacked) */
    embedded?: boolean;
    /** Latest known object revision, if the parent already loaded it */
    latestRev?: string;
}) => import("react").JSX.Element;
