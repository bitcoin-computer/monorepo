/**
 * Collect callable methods from the object's prototype chain.
 */
export declare function methodNamesFrom(smartObject: unknown): string[];
export declare const SmartObjectFunctions: ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    setFunctionResult: React.Dispatch<any>;
    setShow: any;
    setModalTitle: React.Dispatch<React.SetStateAction<string>>;
}) => import("react").JSX.Element;
