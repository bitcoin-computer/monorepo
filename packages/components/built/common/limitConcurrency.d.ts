/**
 * Caps how many async tasks run at once. Used by the gallery when progressively
 * calling `computer.sync` so a page of cards does not flood a public node.
 *
 * Object evaluation caching lives in `@bitcoin-computer/lib` (`Db` + `Cache`);
 * this helper only schedules work.
 */
/**
 * Runs `fn` when a concurrency slot is free (default max 3 in flight).
 */
export declare function limitConcurrency<T>(fn: () => Promise<T>, concurrency?: number): Promise<T>;
