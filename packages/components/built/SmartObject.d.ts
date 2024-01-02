export declare const getErrorMessage: (error: any) => string;
export declare const getFnParamNames: (fn: string) => string[];
export declare const getValueForType: (type: string, stringValue: string) => string | number | true | null | undefined;
export declare const TypeSelectionDropdown: ({ id, onSelectMethod, dropdownList, selectedType }: any) => import("react/jsx-runtime").JSX.Element;
declare function Component(): import("react/jsx-runtime").JSX.Element;
export declare const SmartObject: {
    Component: typeof Component;
};
export {};
