/**
 * Index lookup for whether `rev` holds a smart object.
 * Returns `true` / `false` from the node, or `undefined` when the output is
 * not indexed yet or the request fails. Does not call `sync`.
 */
export async function lookupIsObject(computer, rev) {
    if (!rev)
        return undefined;
    try {
        const rows = await computer.getTXOs({ rev, verbosity: 1 });
        const flag = rows[0]?.isObject;
        return typeof flag === 'boolean' ? flag : undefined;
    }
    catch {
        return undefined;
    }
}
