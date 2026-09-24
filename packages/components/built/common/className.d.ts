import type { Computer } from '@bitcoin-computer/lib';
export declare function isUsableClassName(name: unknown): name is string;
/** Skip the smart-object proxy trap on `.constructor`. */
export declare function protoConstructorName(smartObject: unknown): string | undefined;
export declare function classNameFromExp(exp: string): string | undefined;
export declare function classNameFromExports(smartObject: unknown, exports: Record<string, unknown>): string | undefined;
/** Upgrade a prototype name via module exports, then the create expression. */
export declare function refineObjectClassName(computer: Computer, smartObject: unknown, mod?: string): Promise<string | undefined>;
