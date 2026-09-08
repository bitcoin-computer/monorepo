import type { ReactNode } from 'react';
export type AlertVariant = 'error' | 'warning' | 'info' | 'success';
export declare function InlineAlert({ variant, title, children, className, onDismiss, }: {
    variant?: AlertVariant;
    title?: string;
    children: ReactNode;
    className?: string;
    onDismiss?: () => void;
}): import("react").JSX.Element;
export declare function FieldError({ children, id }: {
    children: ReactNode;
    id?: string;
}): import("react").JSX.Element | null;
