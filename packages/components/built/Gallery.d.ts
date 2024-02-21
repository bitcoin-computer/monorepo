export type Class = new (...args: any) => any;
export type UserQuery<T extends Class> = Partial<{
    mod: string;
    publicKey: string;
    limit: number;
    offset: number;
    order: 'ASC' | 'DESC';
    ids: string[];
    contract: {
        class: T;
        args?: ConstructorParameters<T>;
    };
}>;
declare function FromRevs({ revs, computer }: {
    revs: string[];
    computer: any;
}): import("react/jsx-runtime").JSX.Element;
export default function WithPagination<T extends Class>(q: UserQuery<T>): import("react/jsx-runtime").JSX.Element;
export declare const Gallery: {
    FromRevs: typeof FromRevs;
    WithPagination: typeof WithPagination;
};
export {};
