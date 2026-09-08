import { Computer } from '@bitcoin-computer/lib';
export type Class = new (...args: any) => any;
export type UserQuery<T extends Class> = Partial<{
    mod: string;
    publicKey: string;
    limit: number;
    offset: number;
    order: 'ASC' | 'DESC';
    ids: string[];
    address: string;
    isObject: boolean;
    contract: {
        class: T;
        args?: ConstructorParameters<T>;
    };
}>;
/** Normalize URL search params into a getOUTXOs-compatible query. */
export declare function queryFromSearchParams(search: string): Record<string, string | boolean>;
export declare function GalleryWithPagination<T extends Class>(q?: UserQuery<T>): import("react").JSX.Element;
/** @deprecated Prefer metadata-first Gallery.WithPagination; kept for apps that pass raw revs. */
declare function FromRevs({ revs, computer }: {
    revs: string[];
    computer: Computer;
}): import("react").JSX.Element;
export declare const Gallery: {
    FromRevs: typeof FromRevs;
    WithPagination: typeof GalleryWithPagination;
};
export {};
