declare function FromRevs({ revs, computer }: {
    revs: string[];
    computer: any;
}): import("react/jsx-runtime").JSX.Element;
export default function WithPagination({ publicKey }: {
    publicKey?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare const Gallery: {
    FromRevs: typeof FromRevs;
    WithPagination: typeof WithPagination;
};
export {};