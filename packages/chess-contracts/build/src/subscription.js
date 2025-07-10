export class Subscription extends Contract {
    constructor(operatorPublicKey, userPublicKey, satoshis) {
        super({ userPublicKey, _owners: [operatorPublicKey], _amount: satoshis });
    }
}
//# sourceMappingURL=subscription.js.map