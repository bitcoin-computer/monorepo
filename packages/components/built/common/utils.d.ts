type Json = JBasic | JObject | JArray;
type JBasic = undefined | null | boolean | number | string | symbol | bigint;
type JArray = Json[];
type JObject = {
    [x: string]: Json;
};
export declare const jsonMap: (g: (el: Json) => Json) => (json: Json) => Json;
export declare const strip: (value: Json) => Json;
export declare const toObject: (obj: any) => string;
export declare const capitalizeFirstLetter: (string: string) => string;
export declare function isValidRevString(outId: string): boolean;
export declare function isValidRev(value: string | number | bigint | boolean | symbol | null | undefined): boolean;
export declare const sleep: (ms: number) => Promise<void>;
/** True when bitcoind rejected the tx because inputs were already spent (typical of calling a method on an old revision). */
export declare function isMissingOrSpentError(error: unknown): boolean;
export declare const getErrorMessage: (error: any) => string;
export declare function getEnv(name: string): any;
/** BIP32 path accepted by the login form and by nakamotojs. */
export declare const BIP32_PATH_PATTERN: RegExp;
/** Reject null, empty, and the string "undefined"/"null" that localStorage.setItem produces. */
export declare function asNonEmpty(value: unknown): string | undefined;
export declare function validPath(value: unknown): string | undefined;
export declare function validChain(value: unknown): string | undefined;
export declare function validNetwork(value: unknown): string | undefined;
export declare function validUrl(value: unknown): string | undefined;
export declare function validModuleStorageType(value: unknown): string | undefined;
export declare function compactUndefined<T extends Record<string, unknown>>(obj: T): Partial<T>;
export declare function bigIntToStr(a: bigint): string;
export declare function strToBigInt(a: string): bigint;
export {};
