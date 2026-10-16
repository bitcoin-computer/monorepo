export declare function withRootLineage<T>(fn: () => Promise<T>): Promise<T>
export declare function callWithLineage<T>(receiver: object, invoke: () => T): T
export declare function rememberInstanceLineage(raw: object, ...proxies: object[]): void
export declare function rememberNodeLineage(node: object, source: object): void
export declare function carryNodeLineage(from: object, to: object): void
export declare function stampCapturedRoot(obj: object, root: string): void
export declare function capturedLineageRoot(obj: object): string | undefined
export declare function waitsForLineage(node: object): boolean
export declare function lineageRootForNode(
  node: object,
  idOf: (node: object) => string | undefined,
): string | undefined
