interface ActionButtonProps {
    text: string;
    onClick: (...args: any[]) => Promise<void> | void;
    disabled?: boolean;
    className?: string;
}
export declare const PrimaryActionButton: ({ text, onClick, disabled, className, }: ActionButtonProps) => import("react/jsx-runtime").JSX.Element;
export declare const SecondaryActionButton: ({ text, onClick, disabled, className, }: ActionButtonProps) => import("react/jsx-runtime").JSX.Element;
export {};
