import { ReconstructedObject, Transaction as CacheTransaction } from './cache.js';
export type VersionResult = CacheTransaction<ReconstructedObject>;
export declare class BitcoinComputerError extends Error {
    constructor(message: string);
}
export declare class StaleSidePredecessorError extends BitcoinComputerError {
    constructor(message?: string);
}
export declare class InvalidSmartObjectError extends BitcoinComputerError {
}
export declare class VersionConflictError extends BitcoinComputerError {
}
export declare class NodeNotFoundError extends BitcoinComputerError {
}
