import { Contract } from '@bitcoin-computer/lib'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T

export class Sha256 {
  static hash(ascii: string) {
    function rightRotate(value: number, amount: number) {
      return (value >>> amount) | (value << (32 - amount))
    }

    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
      0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
      0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
      0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
      0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
      0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
      0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
      0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
      0xc67178f2,
    ]

    // Initial hash values H0..H7 - identical to SHA256_Init in OpenSSL
    const h = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
      0x5be0cd19,
    ]

    // === Padding (exactly as in SHA256_Update + SHA256_Final) ===
    let l = ascii.length * 8 // original message length in bits
    ascii += '\x80' // append the 1-bit
    while (ascii.length % 64 !== 56) ascii += '\x00' // pad to 448 bits mod 512

    // Append 64-bit big-endian length (HOST_l2c in OpenSSL)
    const lengthBytes = []
    for (let i = 7; i >= 0; i--) {
      lengthBytes[i] = l & 255
      l >>>= 8
    }
    ascii += String.fromCharCode.apply(null, lengthBytes)

    // === Process every 64-byte block (sha256_block_data_order) ===
    const words = []
    for (let i = 0; i < ascii.length; i += 4) {
      words[i / 4] =
        (ascii.charCodeAt(i) << 24) |
        (ascii.charCodeAt(i + 1) << 16) |
        (ascii.charCodeAt(i + 2) << 8) |
        ascii.charCodeAt(i + 3)
    }

    for (let chunk = 0; chunk < words.length; chunk += 16) {
      const w = words.slice(chunk, chunk + 16)
      while (w.length < 64) w.push(0)

      // === Message schedule expansion (ROUND_16_63 macro in OpenSSL) ===
      for (let i = 16; i < 64; i++) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3)
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10)
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0 // 32-bit wrap
      }

      // Working variables (exactly as in sha256_block_data_order)
      let a = h[0]
      let b = h[1]
      let c = h[2]
      let d = h[3]
      let e = h[4]
      let f = h[5]
      let g = h[6]
      let hh = h[7]

      // === 64 compression rounds (ROUND_00_15 + ROUND_16_63) ===
      for (let i = 0; i < 64; i++) {
        const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
        const ch = (e & f) ^ (~e & g)
        const temp1 = (hh + S1 + ch + K[i] + w[i]) | 0

        const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
        const maj = (a & b) ^ (a & c) ^ (b & c)
        const temp2 = (S0 + maj) | 0

        // Rotate variables (same order as OpenSSL)
        hh = g
        g = f
        f = e
        e = (d + temp1) | 0
        d = c
        c = b
        b = a
        a = (temp1 + temp2) | 0
      }

      // Add compressed chunk back to state (final step in OpenSSL)
      h[0] = (h[0] + a) | 0
      h[1] = (h[1] + b) | 0
      h[2] = (h[2] + c) | 0
      h[3] = (h[3] + d) | 0
      h[4] = (h[4] + e) | 0
      h[5] = (h[5] + f) | 0
      h[6] = (h[6] + g) | 0
      h[7] = (h[7] + hh) | 0
    }

    // Produce 64-char lowercase hex (HASH_MAKE_STRING in OpenSSL)
    let result = ''
    for (let i = 0; i < 8; i++) {
      for (let j = 3; j >= 0; j--) {
        const b = (h[i] >> (j * 8)) & 255
        result += (b < 16 ? '0' : '') + b.toString(16)
      }
    }
    return result
  }
}

export class Pow extends Contract {
  amount!: bigint
  name!: string
  nonce!: string
  prevMintedId!: string // _rev of the previous mint in the chain ('' for genesis)
  difficulty!: number // The difficulty value that was used/claimed for this mint

  constructor(to: string, amount: bigint, nonce: string, prevMintedId: string, difficulty: number) {
    if (!Pow.isValidPow(nonce, prevMintedId, difficulty)) throw new Error('Invalid proof of work')

    const _owners = [to]
    const name = 'TBC-alpha'

    super({ _owners, amount, name, nonce, prevMintedId, difficulty })
  }

  /**
   * Fast, synchronous PoW validation (used in constructor + mining loop) Anyone
   * who passes a wrong (too easy) difficulty will be rejected by the app-level
   * longest-chain rule in the miner. The difficulty is bound into the hash to
   * prevent cheating by reusing a nonce from a lower difficulty.
   */
  static isValidPow(nonce: string, prevMintedId: string, difficulty: number): boolean {
    if (!nonce) return true // dummy object created by transfer() split

    const puzzle = prevMintedId + nonce + difficulty.toString() // bind difficulty to prevent cheating
    const hash = Sha256.hash(puzzle)
    const targetZeros = Math.floor(difficulty / 4) // ~ leading zero hex chars
    return hash.startsWith('0'.repeat(targetZeros))
  }

  // convenience for apps
  async isValid(): Promise<boolean> {
    const root = this._root === this._rev ? this : await computer.sync<typeof Pow>(this._root)
    return Pow.isValidPow(root.nonce, root.prevMintedId, root.difficulty)
  }

  transfer(to: string, amount?: bigint): Pow | undefined {
    if (typeof amount === 'undefined') {
      this._owners = [to]
      return undefined
    }
    if (this.amount >= amount) {
      this.amount -= amount
      const Ctor = this.constructor as Constructor<this>
      return new Ctor(to, amount, '', '', 0)
    }
    throw new Error('Insufficient funds')
  }

  burn() {
    this.amount = 0n
  }

  merge(tokens: Pow[]) {
    let total = 0n
    tokens.forEach((token) => {
      total += token.amount
      token.burn()
    })
    this.amount += total
  }
}
