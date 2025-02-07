export declare const getErrorMessage: (error: any) => string;
export declare const getFnParamNames: (fn: string) => string[];
export declare const SmartObjectFunction: ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, funcName, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    setFunctionResult: React.Dispatch<any>;
    setShow: any;
    setModalTitle: React.Dispatch<React.SetStateAction<string>>;
    funcName: string;
}) => import("react/jsx-runtime").JSX.Element;
