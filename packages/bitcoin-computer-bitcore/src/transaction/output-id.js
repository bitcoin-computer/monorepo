const TXID_REGEX = /[0-9A-Fa-f]{64}/

/**
 * Output identifier for a Bitcoin transaction
 */
class OutputId {
  /**
      Creates an output id from a transaction id and output index
     * @param {string} txId Transaction id in hex format
     * @param {number} outputIndex Output index
     */
  constructor(txId, outputIndex) {
    if (!TXID_REGEX.test(txId)) throw new Error(`txId not in a valid hex format: ${txId}`)

    if (outputIndex < 0 || outputIndex > 4294967295 || Number.isNaN(outputIndex))
      throw new Error(`outputIndex out of range: ${outputIndex}`)

    this.txId = txId
    this.outputIndex = outputIndex
  }

  /**
   * Serializes the output id into a compressed string form
   */
  toString() {
    return `${this.txId}:${this.outputIndex}`
  }

  /**
   * Parses the output id form its compressed string form
   * @param {string} s String to parse
   */
  static fromString(s) {
    const parts = s.split(':')

    if (parts.length !== 2) throw new Error('Invalid string format')

    return new OutputId(parts[0], parseInt(parts[1], 10))
  }

  /**
   * Get the transaction id in hex format
   */
  get txid() {
    return this.txId
  }

  /**
   * Get the output index
   */
  get vout() {
    return this.outputIndex
  }

  /**
   * Returns whether two OutputIds refer to the same output
   * @param {OutputId} other Other object to compare
   * @returns {bool} True if the objects refer to the same output, false if not
   */
  equals(other) {
    return (
      this.outputIndex === other.outputIndex && this.txId.toLowerCase() === other.txId.toLowerCase()
    )
  }
}

export default OutputId
