/// <reference types="vite/client" />
import 'dotenv/config';
let VITE_API_BASE_URL;
// Vite environment
if (import.meta.env && import.meta.env.MODE) {
    VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // Node.js environment
}
else if (typeof process === 'object' && process.versions && process.versions.node) {
    VITE_API_BASE_URL = process.env.VITE_API_BASE_URL;
}
else {
    throw new Error('Unsupported execution environment.');
}
const vars = [VITE_API_BASE_URL];
if (vars.some((el) => el === undefined))
    throw new Error(`Please create a .env file ${vars}`);
export { VITE_API_BASE_URL };
