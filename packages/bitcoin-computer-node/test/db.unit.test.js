"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-expressions */
const chai_1 = require("chai");
const db_1 = __importDefault(require("../src/db"));
describe('db', () => {
    describe('getConnection', () => {
        it('Should establish a database connection', async () => {
            (0, chai_1.expect)(db_1.default).to.not.be.undefined;
        });
    });
    describe('getConnection', () => {
        it('Should establish a database connection', async () => {
            const sql = 'SELECT "rev" FROM "NonStandard" LIMIT 1';
            const result = await db_1.default.any(sql);
            (0, chai_1.expect)(result).to.not.be.undefined;
        });
    });
});
