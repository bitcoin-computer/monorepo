import React from 'react';
interface ActionButtonProps {
    text: string;
    onClick: (...args: any[]) => Promise<void> | void;
    disabled?: boolean;
    className?: string;
}
export declare const PrimaryActionButton: ({ text, onClick, disabled, className, }: ActionButtonProps) => React.JSX.Element;
export declare const SecondaryActionButton: ({ text, onClick, disabled, className, }: ActionButtonProps) => React.JSX.Element;
export {};
