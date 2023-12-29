declare type Json = JBasic | JObject | JArray;
declare type JBasic = undefined | null | boolean | number | string | symbol | bigint;
declare type JArray = Json[];
declare type JObject = {
    [x: string]: Json;
};
export declare const jsonMap: (g: (el: Json) => Json) => (json: Json) => Json;
export declare const strip: (value: Json) => Json;
export declare const toObject: (obj: any) => string;
export {};
