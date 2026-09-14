/**
 * Caps how many async tasks run at once. Used by the gallery when progressively
 * calling `computer.sync` so a page of cards does not flood a public node.
 *
 * Object evaluation caching lives in `@bitcoin-computer/lib` (`Db` + `Cache`);
 * this helper only schedules work.
 */
let active = 0;
const waitQueue = [];
const DEFAULT_CONCURRENCY = 3;
function acquire(concurrency) {
    if (active < concurrency) {
        active += 1;
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        waitQueue.push(() => {
            active += 1;
            resolve();
        });
    });
}
function release() {
    active = Math.max(0, active - 1);
    const next = waitQueue.shift();
    if (next)
        next();
}
/**
 * Runs `fn` when a concurrency slot is free (default max 3 in flight).
 */
export async function limitConcurrency(fn, concurrency = DEFAULT_CONCURRENCY) {
    await acquire(concurrency);
    try {
        return await fn();
    }
    finally {
        release();
    }
}
