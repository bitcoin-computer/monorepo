/** Minimal client for looking up an indexed output without evaluating it. */
export type TxoLookupClient = {
    getTXOs(q: {
        rev: string;
        verbosity: 1;
    }): Promise<Array<{
        isObject?: boolean;
    }>>;
};
/**
 * Index lookup for whether `rev` holds a smart object.
 * Returns `true` / `false` from the node, or `undefined` when the output is
 * not indexed yet or the request fails. Does not call `sync`.
 */
export declare function lookupIsObject(computer: TxoLookupClient, rev: string): Promise<boolean | undefined>;
