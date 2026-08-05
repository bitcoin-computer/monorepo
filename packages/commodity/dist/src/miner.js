import * as crypto from 'crypto';
import { Pow } from './pow.js';
import { config } from './config.js'; // NEW: import config
export class PowTokenMiner {
    constructor(computer, mod) {
        this.cachedPrev = '';
        this.cachedDifficulty = config.getInitialDifficulty(); // Use config
        this.computer = computer;
        this.mod = mod;
    }
    async getBestTip() {
        const revs = await this.computer.getOUTXOs({ mod: this.mod });
        if (revs.length === 0)
            return '';
        const graph = new Map();
        for (const rev of revs) {
            const obj = await this.computer.sync(rev);
            if (!Pow.isValidPow(obj.nonce, obj.prevMintedId, obj.difficulty))
                continue;
            graph.set(rev, { prev: obj.prevMintedId || '', diff: obj.difficulty });
        }
        const allPrev = new Set(Array.from(graph.values())
            .map((v) => v.prev)
            .filter(Boolean));
        const tips = Array.from(graph.keys()).filter((r) => !allPrev.has(r));
        if (tips.length === 0)
            return '';
        let bestTip = tips[0];
        let maxWork = this.getCumulativeWork(bestTip, graph);
        for (const tip of tips) {
            const work = this.getCumulativeWork(tip, graph);
            if (work > maxWork ||
                (work === maxWork && this.getChainLength(tip, graph) > this.getChainLength(bestTip, graph))) {
                maxWork = work;
                bestTip = tip;
            }
        }
        this.cachedPrev = bestTip;
        return bestTip;
    }
    getCumulativeWork(rev, graph) {
        let total = 0n;
        let current = rev;
        while (current) {
            total += 1n << BigInt(graph.get(current).diff);
            current = graph.get(current).prev;
        }
        return total;
    }
    getChainLength(rev, graph) {
        let len = 0;
        let current = rev;
        while (current) {
            len++;
            current = graph.get(current).prev;
        }
        return len;
    }
    async computeDifficulty() {
        const prev = await this.getBestTip();
        if (!prev)
            return config.getInitialDifficulty(); // NEW: chain-aware
        const revs = await this.computer.getOUTXOs({ mod: this.mod });
        const graph = new Map();
        let maxLength = 0;
        for (const rev of revs) {
            const obj = await this.computer.sync(rev);
            if (!Pow.isValidPow(obj.nonce, obj.prevMintedId, obj.difficulty))
                continue;
            graph.set(rev, obj.prevMintedId);
            let len = 0;
            let current = rev;
            while (current) {
                len++;
                current = graph.get(current) || '';
            }
            if (len > maxLength)
                maxLength = len;
        }
        const initial = config.getInitialDifficulty();
        const interval = config.getAdjustmentInterval(); // NEW: from config, chain-specific
        return initial + Math.floor((maxLength - 1) / interval);
    }
    async computePow(prevMintedId, difficulty) {
        let nonce = 0;
        const start = Date.now();
        while (true) {
            const puzzle = prevMintedId + nonce.toString() + difficulty.toString();
            const hashHex = crypto.createHash('sha256').update(puzzle).digest('hex');
            if (hashHex.startsWith('0'.repeat(Math.floor(difficulty / 4)))) {
                console.log(`SUCCESS: PoW solved in ${Date.now() - start}ms (diff=${difficulty}, nonce=${nonce})`);
                return { nonce: nonce.toString(), amount: 1n };
            }
            nonce++;
            if (nonce % 100000 === 0)
                await new Promise((r) => setTimeout(r, 0));
        }
    }
    async refreshCache() {
        this.cachedPrev = await this.getBestTip();
        this.cachedDifficulty = await this.computeDifficulty();
    }
}
//# sourceMappingURL=miner.js.map