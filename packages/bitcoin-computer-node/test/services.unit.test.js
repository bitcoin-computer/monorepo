"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-expressions */
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const standard_dao_1 = __importDefault(require("../src/models/standard.dao"));
chai_1.default.use(sinon_chai_1.default);
const { expect } = chai_1.default;
describe('services', () => {
    describe('standardUtxo.service', () => {
        it('Should return the balance of an address', async () => {
            const balance = 100;
            const address = '1C9UbB9P8Jba21mLiEXio14eRg8cBn9wyx';
            const getBalanceStub = sinon_1.default.stub(standard_dao_1.default, 'getBalance').resolves(balance);
            const result = await standard_dao_1.default.getBalance(address);
            expect(getBalanceStub.calledWith(address)).to.be.true;
            expect(result).eq(balance);
            getBalanceStub.restore();
        });
    });
});
