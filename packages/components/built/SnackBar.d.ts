import type { ToastItem } from './toastTypes';
/** @deprecated Prefer Toast from UtilsContext.toast — kept for direct imports */
export declare function SnackBar(props: {
    message: string;
    success: boolean;
    hideSnackBar: () => void;
}): import("react").JSX.Element;
export declare function Toast({ item, onDismiss }: {
    item: ToastItem;
    onDismiss: (id: string) => void;
}): import("react").JSX.Element;
export declare function ToastHost({ items, onDismiss, }: {
    items: ToastItem[];
    onDismiss: (id: string) => void;
}): import("react").JSX.Element | null;
