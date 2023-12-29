type Json = JBasic | JObject | JArray;
type JBasic = undefined | null | boolean | number | string | symbol | bigint;
type JArray = Json[];
type JObject = {
    [x: string]: Json;
};
export declare const jsonMap: (g: (el: Json) => Json) => (json: Json) => Json;
export declare const strip: (value: Json) => Json;
export declare const toObject: (obj: any) => string;
export {};
