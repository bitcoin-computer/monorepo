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
export declare function isValidRev(value: string | number | boolean | null | undefined): boolean;
export declare const sleep: (ms: number) => Promise<void>;
export declare function getEnv(name: string): any;
export declare function bigIntToStr(a: bigint): string;
export declare function strToBigInt(a: string): bigint;
export {};
