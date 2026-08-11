export declare const getErrorMessage: (error: any) => string;
export declare const getParameterNames: (fn: ((...args: any[]) => any) | string) => string[];
export declare const SmartObjectFunction: ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, funcName, embedded, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    setFunctionResult: React.Dispatch<any>;
    setShow: any;
    setModalTitle: React.Dispatch<React.SetStateAction<string>>;
    funcName: string;
    /** When true, omit outer title (parent panel already shows it) */
    embedded?: boolean;
}) => import("react").JSX.Element;
