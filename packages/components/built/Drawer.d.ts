export declare function ShowDrawer({ text, id }: {
    text: string;
    id: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function DrawerComponent({ Content, id, }: {
    Content: (props: {
        isOpen: boolean;
    }) => JSX.Element;
    id: string;
}): import("react/jsx-runtime").JSX.Element;
export declare const Drawer: {
    Component: typeof DrawerComponent;
    ShowDrawer: typeof ShowDrawer;
};
