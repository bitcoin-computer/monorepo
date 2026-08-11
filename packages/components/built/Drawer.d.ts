export declare function ShowDrawer({ text, id }: {
    text: string;
    id: string;
}): import("react").JSX.Element;
export declare function DrawerComponent({ Content, id, title, }: {
    Content: (props: {
        isOpen: boolean;
    }) => JSX.Element;
    id: string;
    /** Accessible name; also used if Content does not render its own title */
    title?: string;
}): import("react").JSX.Element;
export declare const Drawer: {
    Component: typeof DrawerComponent;
    ShowDrawer: typeof ShowDrawer;
};
