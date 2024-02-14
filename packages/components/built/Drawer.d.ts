declare function ShowDrawer({ text, id }: {
    text: string;
    id: string;
}): import("react/jsx-runtime").JSX.Element;
declare function Component({ Content, id }: any): import("react/jsx-runtime").JSX.Element;
export declare const Drawer: {
    Component: typeof Component;
    ShowDrawer: typeof ShowDrawer;
};
export {};
