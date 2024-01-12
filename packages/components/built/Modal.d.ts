import { Modal as ModalClass } from "flowbite";
export declare const Modal: {
    get: (id: string) => ModalClass;
    ShowButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    HideButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    ToggleButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    Component: ({ title, content, contentData, id }: any) => import("react/jsx-runtime").JSX.Element;
};
