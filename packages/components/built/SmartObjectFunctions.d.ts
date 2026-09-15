/**
 * Collect callable methods from the object's prototype chain.
 */
export declare function methodNamesFrom(smartObject: unknown): string[];
export declare const SmartObjectFunctions: ({ smartObject, functionsExist, options, latestRev, compact, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    latestRev?: string;
    /** Stack every method form instead of the explorer three-column panel. */
    compact?: boolean;
}) => import("react").JSX.Element;
