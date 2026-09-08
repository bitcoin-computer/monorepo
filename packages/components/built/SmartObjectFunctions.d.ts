/**
 * Collect callable methods from the object's prototype chain.
 */
export declare function methodNamesFrom(smartObject: unknown): string[];
export declare const SmartObjectFunctions: ({ smartObject, functionsExist, options, latestRev, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    latestRev?: string;
}) => import("react").JSX.Element;
