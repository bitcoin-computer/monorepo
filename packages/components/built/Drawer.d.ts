declare function ShowDrawer({ text, id }: {
    text: string;
    id: string;
}): import("react/jsx-runtime").JSX.Element;
declare function Component({ Content, id, }: {
    Content: (props: {
        isOpen: boolean;
    }) => JSX.Element;
    id: string;
}): import("react/jsx-runtime").JSX.Element;
export declare const Drawer: {
    Component: typeof Component;
    ShowDrawer: typeof ShowDrawer;
};
export {};
