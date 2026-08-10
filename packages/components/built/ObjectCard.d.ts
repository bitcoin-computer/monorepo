import type { Computer, TXORecord } from '@bitcoin-computer/lib';
export type ObjectCardProps = {
    record: TXORecord;
    computer: Computer;
    chain?: string;
    /** When true, evaluate object state once the card is near the viewport. Default true. */
    progressiveSync?: boolean;
};
export declare function ObjectCard({ record, computer, chain, progressiveSync, }: ObjectCardProps): import("react").JSX.Element;
export declare function ObjectCardSkeleton(): import("react").JSX.Element;
