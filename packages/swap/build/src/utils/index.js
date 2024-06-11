export const getMockedRev = () => `mock:${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`;
export const RLTC = {
    network: 'regtest',
    chain: 'LTC',
    url: 'http://localhost:1031'
};
const isString = (x) => typeof x === 'string';
const isNumber = (x) => typeof x === 'number';
const isArray = (x) => Array.isArray(x);
export const meta = {
    _id: isString,
    _rev: isString,
    _root: isString,
    _owners: isArray,
    _amount: isNumber
};
