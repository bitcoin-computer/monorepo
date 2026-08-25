/**
 * Collect callable methods from the object's prototype chain.
 */
export declare function methodNamesFrom(smartObject: unknown): string[];
export declare const SmartObjectFunctions: ({ smartObject, functionsExist, options, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
}) => import("react").JSX.Element;
