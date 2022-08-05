"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const types_1 = require("../src/types");
describe('types', () => {
    describe('validateOutId', () => {
        it('should not throw an error for a valid outId', async () => {
            const outId = '08bdb4a8f35b1862d38375f6226f863dc6a2d95d82c3227b189fbeb9bdc1d9e8/0';
            (0, chai_1.expect)((0, types_1.isValidRev)(outId)).eq(true);
        });
        it('should throw an error for an invalid outId', async () => {
            const outId = '08bdb4a8f35b1862d38375f6226f863dc6a2d95d82c3227b189fbeb9bdc1d9e8:0';
            (0, chai_1.expect)((0, types_1.isValidRev)(outId)).eq(false);
        });
    });
});
