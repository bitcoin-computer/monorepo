export declare function nameModuleClasses(
  txId: string,
  namespace: Record<string, unknown>,
  contractPrototype: object,
): void
export declare function isModuleClass(cls: unknown): boolean
export declare function moduleClassName(cls: unknown): string
export declare function isModuleInstance(obj: unknown, cls: unknown): boolean
export declare function standIn(mock: object, cls: unknown): void
export declare function endStandIn(mock: object): void
export declare function checkClassArgument(isRevLocation: boolean, cls: unknown): void
export declare function refuseOtherClass(location: string, obj: unknown, cls: unknown): void
