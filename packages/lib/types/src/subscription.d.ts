import { Stream } from './types.js';
export declare class Subscription {
    private eventSource;
    private baseUrl;
    private chain;
    private network;
    private restClient;
    private idCallbacks;
    private idOnErrors;
    private streamCallbacks;
    private streamOnErrors;
    private mempoolCallback;
    private mempoolOnError;
    constructor(baseUrl: string, chain: string, network: string, restClient: any);
    private buildFilterKey;
    private hasSubscriptions;
    private rebuildEventSource;
    private handleMessage;
    private handleError;
    addIdSubscription(id: string, onMessage: ({ rev, hex }: {
        rev: string;
        hex: string;
    }) => void, onError?: (error: Event) => void): Promise<() => void>;
    addStreamSubscription(filter: Partial<Stream>, onMessage: ({ rev, hex }: {
        rev: string;
        hex: string;
    }) => void, onError?: (error: Event) => void): Promise<() => void>;
    addMempoolSubscription(onMessage: (event: {
        revs: string[];
    }) => void, onError?: (error: Event) => void): Promise<() => void>;
}
