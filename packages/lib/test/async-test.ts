// @ts-nocheck

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../chai.d.ts"/>
import chai, { expect } from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer, Contract } from '@bitcoin-computer/lib'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const ownersAmountPattern = {
  _owners: _.isArray,
  _amount: _.isNumber,
}

const LocationPattern = {
  _rev: _.isString,
  _root: _.isString,
  _id: _.isString,
}

const fail = () => {
  expect(true).to.eq(false)
}

const location = {
  _id: _.isString,
  _rev: _.isString,
  _root: _.isString,
}

const isLocation = (string: string): boolean => {
  const [txId, num] = string.split(':')
  const float = parseFloat(num)
  return [64, 65].includes(txId.length) && !Number.isNaN(float) && Number.isFinite(float)
}

const opts = {
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
}

describe('Computer', () => {
  describe('Should instantiate a computer object', () => {
    it('Should default to LTC testnet if no arguments are provided', async () => {
      const computer = new Computer()
      expect(computer.getUrl()).eq('https://node.bitcoincomputer.io')
      expect(computer.getNetwork()).eq('testnet')
      expect(computer.getChain()).eq('LTC')
    })
    it('Should instantiate a computer object with the provided arguments', async () => {
      const computer = new Computer(opts)
      expect(computer.getUrl()).eq(opts.url)
      expect(computer.getNetwork()).eq(opts.network)
      expect(computer.getChain()).eq(opts.chain)
    })
  })
})

describe('App', () => {
  describe('Should work for a chat', () => {
    class Chat extends Contract {
      messages: string[]
      _owners: string[]

      constructor(publicKey) {
        super({
          messages: [],
          _owners: [publicKey],
        })
      }

      post(message) {
        this.messages.push(message)
      }

      invite(publicKey) {
        this._owners.push(publicKey)
      }
    }

    const chatPattern = {
      ...location,
      ...ownersAmountPattern,
      messages: _.isArray,
    }
    let computer

    let chat: any = null
    before('Before', async () => {
      computer = new Computer(opts)
      await computer.faucet(1e8)
      const publicKey = computer.wallet.publicKey.toString('hex')
      chat = await computer.new(Chat, [publicKey])
    })

    it('Should set the location', async () => {
      expect(isLocation(chat._id)).eq(true)
      expect(isLocation(chat._rev)).eq(true)
      expect(isLocation(chat._root)).eq(true)
    })

    it('Should set a message in messages array and invite a friend', async () => {
      await chat.post('Hello')
      expect(chat).to.matchPattern({
        ...chatPattern,
        _owners: [_.isString],
        messages: ['Hello'],
      })

      await chat.invite('028df471f7539662dacb98bc409785ebee1c7e1147c6529d1175a2a5c3674699e8')
      expect(chat).to.matchPattern({
        ...chatPattern,
        _owners: [_.isString, _.isString],
        _amount: _.isNumber,
        messages: ['Hello'],
      })

      await chat.post('Hello mate')
      expect(chat).to.matchPattern(chatPattern)
      expect(chat.messages).deep.eq(['Hello', 'Hello mate'])

      const message = 'Yo'
      await chat.post(message)
      expect(chat).to.matchPattern({
        ...chatPattern,
        _amount: _.isNumber,
      })
      expect(chat.messages).deep.eq(['Hello', 'Hello mate', 'Yo'])

      for (let i = 0; i < 10; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await chat.post(`message ${i}`)
      }

      expect(await computer.sync(chat._rev)).deep.eq(chat)
    })

    it('Should keep the messages if the chat is updated from a wallet with no balance', async () => {
      const computer2 = new Computer(opts)
      const publicKey2 = computer2.wallet.publicKey.toString('hex')
      await chat.post('Hello from wallet 1')
      await chat.invite(publicKey2)

      expect(chat).to.matchPattern({
        ...chatPattern,
        _amount: _.isNumber,
      })

      const chat2 = (await computer2.sync(chat._rev)) as Chat
      try {
        await chat2.post('Hello from wallet 2')
      } catch (error: any) {
        expect(error.message).not.to.be.undefined
      }
      const chat3 = (await computer2.sync(chat._rev)) as Chat
      expect(chat3.messages.length).eq(chat.messages.length)
    })
  })

  describe('Should work for an NFT', () => {
    class NFT extends Contract {
      _owners: string[]
      name: string

      constructor(publicKey, name) {
        super({
          _owners: [publicKey],
          name,
        })
      }

      send(to: string, name: string) {
        this._owners = [to]
        this.name = name
      }
    }

    let nft: any = null
    before('Before', async () => {
      const computer = new Computer(opts)
      await computer.faucet(1e8)
      const publicKey = computer.wallet.publicKey.toString('hex')
      nft = await computer.new(NFT, [publicKey, 'NFT'])
    })

    it('Should set the location', async () => {
      expect(isLocation(nft._id)).eq(true)
      expect(isLocation(nft._rev)).eq(true)
      expect(isLocation(nft._root)).eq(true)
    })

    it('Should set the name', async () => {
      expect(nft).to.matchPattern({
        ...location,
        ...ownersAmountPattern,
        name: 'NFT',
      })
    })

    it('Should send the NFT', async () => {
      await nft.send('028df471f7539662dacb98bc409785ebee1c7e1147c6529d1175a2a5c3674699e8', 'NFT2')
      expect(nft).to.matchPattern({
        ...location,
        ...ownersAmountPattern,
        name: 'NFT2',
      })
    })
  })

  describe('Should work for a token', () => {
    class Token extends Contract {
      coins: number
      _owners: string[]
      name: string

      constructor(to: string, supply: number, name: string) {
        super({
          coins: supply,
          _owners: [to],
          name,
        })
      }

      send(amount: number, to: string, name: string) {
        if (this.coins < amount) throw new Error()
        this.coins -= amount
        return new Token(to, amount, name)
      }
    }

    let token: any = null
    let firstSentToken: any = null
    let secondSentToken: any = null
    let computer: InstanceType<typeof Computer>

    before('Before Computer', async () => {
      computer = new Computer(opts)
      await computer.faucet(1e8)
      const publicKey = computer.wallet.publicKey.toString('hex')
      token = await computer.new(Token, [publicKey, 10, 'T'])
      const publicKeyString = '028df471f7539662dacb98bc409785ebee1c7e1147c6529d1175a2a5c3674699e8'
      firstSentToken = await token.send(2, publicKeyString, token.name)
      secondSentToken = await token.send(4, publicKeyString, token.name)
    })

    it('Should set the number of coins', async () => {
      const pattern = {
        ...LocationPattern,
        name: _.isString,
        coins: _.isNumber,
        _owners: _.isArray,
      }

      expect(token).to.matchPattern({
        ...pattern,
        coins: 4,
        _owners: [_.isString],
        _amount: _.isNumber,
      })

      expect(firstSentToken).to.matchPattern({
        ...pattern,
        coins: 2,
        _owners: [_.isString],
        _amount: _.isNumber,
      })

      expect(secondSentToken).to.matchPattern({
        ...pattern,
        coins: 4,
        _owners: [_.isString],
        _amount: _.isNumber,
      })
    })

    it('should set the location', async () => {
      expect(isLocation(token._id)).eq(true)
      expect(isLocation(token._rev)).eq(true)
      expect(isLocation(token._root)).eq(true)

      expect(isLocation(firstSentToken._id)).eq(true)
      expect(isLocation(firstSentToken._rev)).eq(true)
      expect(isLocation(firstSentToken._root)).eq(true)

      expect(token._id).not.eq(token._rev)
      expect(token._id).eq(token._root)

      expect(firstSentToken._id).eq(firstSentToken._rev)
      expect(firstSentToken._id).not.eq(firstSentToken._root)
      expect(firstSentToken._root).eq(token._root)

      expect(secondSentToken._id).eq(secondSentToken._rev)
      expect(secondSentToken._id).not.eq(secondSentToken._root)
      expect(secondSentToken._root).eq(token._root)
    })

    it('Should query by public key', async () => {
      const publicKey = computer.getPublicKey()
      const tokens = await computer.query({
        contract: { class: Token, args: [publicKey, 10, 'T'] },
      })
      expect(tokens.length).eq(1)
    })
  })

  describe('Should work for an AMM', () => {
    /**
     * A prototypical implementation of an automatic market maker exchange (AMM).
     * Very much a work in progress, known issues include:
     *  * It uses the "curve" x+y=k so it assumes that the price of the assets is always 1:1
     *  * withdrawLiquidity is not implemented yet
     *  * The buyer is currently the same user as the pool operator
     *  * The swap functions will swap all coins in a token
     *
     * On the bright side all issues are fixable with more work
     */
    class Token extends Contract {
      coins: number
      _owners: string[]

      constructor(to: string, supply: number) {
        super({
          coins: supply,
          _owners: [to],
        })
      }

      send(to: string, amount: number) {
        if (this.coins < amount) throw new Error()
        this.coins -= amount
        return new Token(to, amount)
      }
    }

    class AMM extends Contract {
      xRoot: string
      yRoot: string
      x: Token[]
      y: Token[]
      _owners: string[]

      constructor(xRoot: string, yRoot: string) {
        super({ xRoot, yRoot, x: [], y: [] })
      }

      addLiquidity(token: Token) {
        if (![this.xRoot, this.yRoot].includes(token._root)) throw new Error('Token root mismatch')
        if (token._root === this.xRoot) this.x.push(token)
        if (token._root === this.yRoot) this.y.push(token)
      }

      // @ts-ignore
      // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
      withdrawLiquidity(amount: number, token: string) {
        // todo
      }

      swap(token: Token) {
        if (token._root === this.xRoot) return this.swapXY(token)
        if (token._root === this.yRoot) return this.swapYX(token)
        throw new Error('Token root mismatch')
      }

      getAmountX() {
        return this.x.reduce((prev, curr) => prev + curr.coins, 0)
      }

      getAmountY() {
        return this.y.reduce((prev, curr) => prev + curr.coins, 0)
      }

      private swapXY(xToken: Token): Token[] {
        if (xToken.coins >= this.getAmountY()) throw new Error('Pool has insufficient liquidity')

        let amount = xToken.coins
        const xOwner = xToken._owners[0]

        // Add xToken to pool
        xToken.send(this._owners[0], amount)
        this.x.push(xToken)

        // Send yTokens to user
        const res: Token[] = []
        while (amount > 0) {
          const yToken = this.y.shift()
          if (!yToken) throw new Error('Inconsistent state')

          const amountToSend = Math.min(yToken.coins, amount)
          amount -= amountToSend
          const resultToken = yToken.send(xOwner, amountToSend)
          if (yToken.coins > 0) this.y.push(yToken)
          res.push(resultToken)
        }
        return res
      }

      private swapYX(yToken: Token) {
        if (yToken.coins >= this.getAmountY()) throw new Error('Pool has insufficient liquidity')

        let amount = yToken.coins
        const xOwner = yToken._owners[0]

        // Add xToken to pool
        yToken.send(this._owners[0], amount)
        this.x.push(yToken)

        // Send yTokens to user
        const res: Token[] = []
        while (amount > 0) {
          const xToken = this.y.shift()
          if (!xToken) throw new Error('Inconsistent state')

          const amountToSend = Math.min(xToken.coins, amount)
          amount -= amountToSend
          const resultToken = xToken.send(xOwner, amountToSend)
          if (xToken.coins > 0) this.y.push(xToken)
          res.push(resultToken)
        }
        return res
      }
    }

    let operator: InstanceType<typeof Computer>
    let buyer: InstanceType<typeof Computer>
    let hacker: InstanceType<typeof Computer>

    let tokenX: Token
    let tokenY: Token
    let fakeToken: Token
    let buyersTokenX: Token
    let amm: AMM

    before('Fund the computer objects', async () => {
      operator = new Computer(opts)
      await operator.faucet(1e8)

      buyer = new Computer(opts)
      await buyer.faucet(1e8)

      hacker = new Computer(opts)
      await hacker.faucet(1e8)
    })

    it('Should create tokens', async () => {
      tokenX = await operator.new(Token, [operator.getPublicKey(), 110])
      tokenY = await operator.new(Token, [operator.getPublicKey(), 100])
      fakeToken = await hacker.new(Token, [hacker.getPublicKey(), 100])

      expect(tokenX.coins).eq(110)
      expect(tokenX._owners).deep.eq([operator.getPublicKey()])
      expect(typeof tokenX._root).eq('string')
    })

    it('Should be possible to send a token to another user', async () => {
      buyersTokenX = await tokenX.send(operator.getPublicKey(), 10) // this should be buyer's public key

      expect(buyersTokenX.coins).eq(10)
      expect(buyersTokenX._owners).deep.eq([operator.getPublicKey()]) // this should be buyer's public key

      expect(tokenX.coins).eq(100)
      expect(tokenX._owners).deep.eq([operator.getPublicKey()])
    })

    it('Should create an AMM', async () => {
      amm = await operator.new(AMM, [tokenX._root, tokenY._root])
      expect(amm.xRoot).eq(tokenX._root)
      expect(amm.yRoot).eq(tokenY._root)
      expect(amm.x).deep.eq([])
      expect(amm.y).deep.eq([])
    })

    it('Should add liquidity', async () => {
      await amm.addLiquidity(tokenX)
      expect(amm.x).deep.eq([tokenX])
      expect(await amm.getAmountX()).eq(100)

      await amm.addLiquidity(tokenY)
      expect(amm.y).deep.eq([tokenY])
      expect(await amm.getAmountY()).eq(100)

      try {
        await amm.addLiquidity(fakeToken)
      } catch (err: any) {
        expect(err.message).eq('Token root mismatch')
      }
    })

    it('Should execute a swap', async () => {
      expect(await amm.getAmountX()).eq(100)
      expect(await amm.getAmountY()).eq(100)

      const res = await amm.swap(buyersTokenX)

      expect(res.length).eq(1)
      const [newTokenY] = res

      expect(await amm.getAmountX()).eq(100)
      expect(await amm.getAmountY()).eq(90)
      expect(newTokenY.coins).eq(10)
    })
  })

  describe('Should work for a swap', () => {
    const contract = `export class Payment extends Contract {
      constructor(to, amount) {
        super({
          _owners: [to],
          _amount: amount,
        });
      }

      transfer(to) {
        this._owners = to
      }
    }

    export class Royalty extends Payment {}

    export class NFT extends Contract {
      constructor(title, artist, url, creator, royalty) {
        super({ title, artist, url, creator, royalty });
      }

      transfer(owner) {
        this._owners = [owner];
      }

      sell(payment) {
        const { _owners: tokenOwners } = this;
        const { _owners: paymentOwners } = payment;
        this._owners = paymentOwners;
        payment.transfer(tokenOwners);

        // eslint-disable-next-line no-undef
        return new Royalty(this.creator, this.royalty * payment._amount);
      }
    }

    export class Offer extends Contract {
      constructor(tx, recipient) {
        super({
          tx,
          _owners: [recipient],
          _url: 'http://127.0.0.1:1031'
        })
      }
    }`

    let sellerComputer
    let buyerComputer
    let mod

    const makeNft = async (computer: any) => {
      const { tx: newNftTx } = await computer.encode({
        exp: `new NFT('title', 'artist', 'url', '${computer.getPublicKey()}', 0.1)`,
        mod,
      })
      const newNftTxId = await computer.broadcast(newNftTx)
      return computer.sync(`${newNftTxId}:0`)
    }

    const makePayment = async (computer: any, amount: number) => {
      const { tx: paymentTx } = await computer.encode({
        exp: `new Payment('${computer.getPublicKey()}', ${amount})`,
        mod,
      })
      const newPaymentTxId = await computer.broadcast(paymentTx)
      return computer.sync(`${newPaymentTxId}:0`)
    }

    before('Before Computer', async () => {
      const computer = new Computer(opts)
      await computer.faucet(1e8)

      sellerComputer = new Computer(opts)
      await sellerComputer.wallet.restClient.faucet(sellerComputer.wallet.address, 0.1e8)

      buyerComputer = new Computer(opts)
      await buyerComputer.wallet.restClient.faucet(buyerComputer.wallet.address, 0.1e8)

      mod = await computer.deploy(contract)
    })

    it('Should throw an error if computerB tries to swap unilaterally', async () => {
      const nft = await makeNft(sellerComputer)
      const payment = await makePayment(buyerComputer, 100000)

      return nft.sell(payment).then(fail, (err) => {
        expect(err.message).not.be.undefined
      })
    })

    it('Should swap the owners with shared transaction object', async () => {
      const nft = await makeNft(sellerComputer)
      const payment = await makePayment(buyerComputer, 100000)

      const { tx: txA } = await sellerComputer.encodeCall({
        target: nft,
        property: 'sell',
        args: [payment],
      })
      await buyerComputer.sign(txA)
      const txId2 = await buyerComputer.broadcast(txA)
      expect(txId2).to.be.a('string')

      const computer = new Computer(opts)
      const { res: royalty2, env } = (await computer.sync(txId2)) as any
      const { __bc__: nft2, __bc0__: payment2 } = env

      expect(nft2._owners).to.deep.eq([buyerComputer.wallet.publicKey.toString('hex')])
      expect(payment2._owners).to.deep.eq([sellerComputer.wallet.publicKey.toString('hex')])
      expect(royalty2._owners).to.deep.eq([sellerComputer.wallet.publicKey.toString('hex')])
    })
  })
})
