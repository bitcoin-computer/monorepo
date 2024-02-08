declare type Json = JBasic | JObject | JArray;
declare type JBasic = undefined | null | boolean | number | string | symbol | bigint;
declare type JArray = Json[];
declare type JObject = {
    [x: string]: Json;
};
export declare const jsonMap: (g: (el: Json) => Json) => (json: Json) => Json;
export declare const strip: (value: Json) => Json;
export declare const toObject: (obj: any) => string;
export declare const capitalizeFirstLetter: (string: string) => string;
export declare function isValidRevString(outId: string): boolean;
export declare function isValidRev(value: any): boolean;
export declare const sleep: (ms: number) => Promise<unknown>;
export {};
