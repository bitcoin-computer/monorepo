export function isUsableClassName(name) {
    if (typeof name !== 'string' || !name)
        return false;
    if (name === 'Object' || name === 'Function' || name === 'Contract')
        return false;
    // Bundled / proxy-trap names are typically 1–2 chars (t, e, n, …)
    if (name.length <= 2)
        return false;
    return true;
}
/** Skip the smart-object proxy trap on `.constructor`. */
export function protoConstructorName(smartObject) {
    if (smartObject == null || typeof smartObject !== 'object')
        return undefined;
    try {
        const name = Object.getPrototypeOf(smartObject)?.constructor?.name;
        return isUsableClassName(name) ? name : undefined;
    }
    catch {
        return undefined;
    }
}
export function classNameFromExp(exp) {
    const match = exp.match(/\bnew\s+([A-Za-z_$][\w$]*)\s*\(/);
    return isUsableClassName(match?.[1]) ? match[1] : undefined;
}
export function classNameFromExports(smartObject, exports) {
    let proto = null;
    try {
        proto = Object.getPrototypeOf(smartObject);
    }
    catch {
        proto = null;
    }
    for (const name of Object.getOwnPropertyNames(exports)) {
        const value = exports[name];
        if (typeof value !== 'function')
            continue;
        try {
            if (proto && proto === value.prototype)
                return name;
            if (smartObject instanceof value)
                return name;
        }
        catch {
            // continue
        }
    }
    return undefined;
}
/** Upgrade a prototype name via module exports, then the create expression. */
export async function refineObjectClassName(computer, smartObject, mod) {
    if (mod) {
        try {
            const ns = (await computer.load(mod));
            const fromMod = classNameFromExports(smartObject, ns);
            if (fromMod)
                return fromMod;
        }
        catch {
            // keep prototype / expression fallbacks
        }
    }
    const id = smartObject != null && typeof smartObject === 'object'
        ? smartObject._id
        : undefined;
    if (typeof id === 'string' && id.includes(':')) {
        try {
            const decoded = await computer.decode(id.split(':')[0]);
            const fromExp = typeof decoded?.exp === 'string' ? classNameFromExp(decoded.exp) : undefined;
            if (fromExp)
                return fromExp;
        }
        catch {
            // ignore
        }
    }
    return undefined;
}
