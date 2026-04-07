import type { OwnerOutputData, Rev } from './types.js';
export type UpdateOwnerData = OwnerOutputData & {
    oldRev?: Rev;
};
