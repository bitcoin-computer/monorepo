/**
 * Pure-JavaScript SHA-256 implementation that produces the same digests as
 * Bitcoin Core / OpenSSL.  Used both for off-chain mining and for on-chain
 * verification of the nonce.
 */
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

    // Initial hash values H0..H7 (identical to SHA256_Init in OpenSSL)
    const h = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
      0x5be0cd19,
    ]

    // Padding exactly as performed by SHA256_Update + SHA256_Final
    let l = ascii.length * 8 // original message length in bits
    ascii += '\x80' // append the single 1-bit
    while (ascii.length % 64 !== 56) ascii += '\x00' // pad with zeros to 448 bits mod 512

    // Append 64-bit big-endian length (HOST_l2c in OpenSSL)
    const lengthBytes = []
    for (let i = 7; i >= 0; i--) {
      lengthBytes[i] = l & 255
      l >>>= 8
    }
    ascii += String.fromCharCode.apply(null, lengthBytes)

    // Convert to 32-bit big-endian words
    const words = []
    for (let i = 0; i < ascii.length; i += 4) {
      words[i / 4] =
        (ascii.charCodeAt(i) << 24) |
        (ascii.charCodeAt(i + 1) << 16) |
        (ascii.charCodeAt(i + 2) << 8) |
        ascii.charCodeAt(i + 3)
    }

    // Process each 512-bit chunk
    for (let chunk = 0; chunk < words.length; chunk += 16) {
      const w = words.slice(chunk, chunk + 16)
      while (w.length < 64) w.push(0)

      // Message schedule
      for (let i = 16; i < 64; i++) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3)
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10)
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0
      }

      let a = h[0],
        b = h[1],
        c = h[2],
        d = h[3],
        e = h[4],
        f = h[5],
        g = h[6],
        hh = h[7]

      // Compression function
      for (let i = 0; i < 64; i++) {
        const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
        const ch = (e & f) ^ (~e & g)
        const temp1 = (hh + S1 + ch + K[i] + w[i]) | 0
        const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
        const maj = (a & b) ^ (a & c) ^ (b & c)
        const temp2 = (S0 + maj) | 0

        hh = g
        g = f
        f = e
        e = (d + temp1) | 0
        d = c
        c = b
        b = a
        a = (temp1 + temp2) | 0
      }

      h[0] = (h[0] + a) | 0
      h[1] = (h[1] + b) | 0
      h[2] = (h[2] + c) | 0
      h[3] = (h[3] + d) | 0
      h[4] = (h[4] + e) | 0
      h[5] = (h[5] + f) | 0
      h[6] = (h[6] + g) | 0
      h[7] = (h[7] + hh) | 0
    }

    // Produce the final 256-bit hex digest
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
