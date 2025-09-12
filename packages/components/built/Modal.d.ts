import { Modal as ModalClass } from 'flowbite';
export declare const getModal: (id: string) => ModalClass;
export declare const showModal: (id: string) => void;
export declare const hideModal: (id: string, onClickClose?: () => void) => void;
export declare const toggleModal: (id: string) => void;
export declare const ShowModalButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
export declare const HideModalButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
export declare const ToggleModalButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
export declare const ModalComponent: ({ title, content, contentData, id, onClickClose, hideClose, }: {
    title: string;
    content: any;
    id: string;
    contentData?: any;
    onClickClose?: () => void;
    hideClose?: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export declare const Modal: {
    get: (id: string) => ModalClass;
    showModal: (id: string) => void;
    hideModal: (id: string, onClickClose?: () => void) => void;
    toggleModal: (id: string) => void;
    ShowButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    HideButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    ToggleButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    Component: ({ title, content, contentData, id, onClickClose, hideClose, }: {
        title: string;
        content: any;
        id: string;
        contentData?: any;
        onClickClose?: () => void;
        hideClose?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
};
