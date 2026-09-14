import type { Computer, TXORecord } from '@bitcoin-computer/lib';
export type ObjectCardProps = {
    record: TXORecord;
    computer: Computer;
    progressiveSync?: boolean;
};
export declare function ObjectCard({ record, computer, progressiveSync }: ObjectCardProps): import("react").JSX.Element;
export declare function ObjectCardSkeleton(): import("react").JSX.Element;
