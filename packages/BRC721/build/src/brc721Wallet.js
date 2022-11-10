var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BRC721 } from './brc721';
export class BRC721Wallet {
    constructor(computer, contract = BRC721) {
        this.computer = computer;
        this.contract = contract;
    }
    balanceOf(publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const revs = yield this.computer.queryRevs({ publicKey, contract: this.contract });
            const nfts = yield Promise.all(revs.map((rev) => this.computer.sync(rev)));
            return this.contract.balanceOf(nfts);
        });
    }
    ownerOf(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rev] = yield this.computer.idsToRevs([tokenId]);
            const obj = yield this.computer.sync(rev);
            return obj._owners;
        });
    }
    transferTo(to, tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rev] = yield this.computer.getLatestRevs([tokenId]);
            const obj = yield this.computer.sync(rev);
            yield obj.transfer(to);
        });
    }
    mint(to, name, symbol, opts = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const nft = yield this.computer.new(this.contract, [to, name, symbol, ...opts]);
            return nft;
        });
    }
}
