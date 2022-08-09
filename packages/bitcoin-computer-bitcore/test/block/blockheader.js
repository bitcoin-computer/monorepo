/* eslint-disable no-new */

import chai from 'chai'
import fs from 'fs'
import { Bitcoin } from '../bitcoin'
import data from '../data/blk86756-testnet'

const should = chai.should()
const { BN } = Bitcoin.crypto
const { BufferReader } = Bitcoin.encoding
const { BufferWriter } = Bitcoin.encoding
const { BlockHeader } = Bitcoin

// https://test-insight.bitpaycrypto.com/block/000000000b99b16390660d79fcc138d2ad0c89a0d044c4201a02bdf1f61ffa11
const dataRawBlockBuffer = fs.readFileSync('test/data/blk86756-testnet.dat')
const dataRawBlockBinary = fs.readFileSync('test/data/blk86756-testnet.dat', 'binary')
const dataRawId = '000000000b99b16390660d79fcc138d2ad0c89a0d044c4201a02bdf1f61ffa11'

describe('BlockHeader', () => {
  const { version } = data
  const prevblockidbuf = Buffer.from(data.prevblockidhex, 'hex')
  const merklerootbuf = Buffer.from(data.merkleroothex, 'hex')
  const { time } = data
  const { bits } = data
  const { nonce } = data
  const bh = new BlockHeader({
    version,
    prevHash: prevblockidbuf,
    merkleRoot: merklerootbuf,
    time,
    bits,
    nonce,
  })
  const bhhex = data.blockheaderhex
  const bhbuf = Buffer.from(bhhex, 'hex')

  it('should make a new blockheader', () => {
    new BlockHeader(bhbuf).toBuffer().toString('hex').should.equal(bhhex)
  })

  it('should not make an empty block', () => {
    ;(function () {
      new BlockHeader()
    }.should.throw('Unrecognized argument for BlockHeader'))
  })

  describe('#constructor', () => {
    it('should set all the variables', () => {
      const blockHeader = new BlockHeader({
        version,
        prevHash: prevblockidbuf,
        merkleRoot: merklerootbuf,
        time,
        bits,
        nonce,
      })
      should.exist(blockHeader.version)
      should.exist(blockHeader.prevHash)
      should.exist(blockHeader.merkleRoot)
      should.exist(blockHeader.time)
      should.exist(blockHeader.bits)
      should.exist(blockHeader.nonce)
    })

    it("will throw an error if the argument object hash property doesn't match", () => {
      ;(function () {
        new BlockHeader({
          hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
          version,
          prevHash: prevblockidbuf,
          merkleRoot: merklerootbuf,
          time,
          bits,
          nonce,
        })
      }.should.throw())
    })
  })

  describe('version', () => {
    it('is interpreted as an int32le', () => {
      const hex =
        'ffffffff00000000000000000000000000000000000000000000000000000000000000004141414141414141414141414141414141414141414141414141414141414141010000000200000003000000'
      const header = BlockHeader.fromBuffer(Buffer.from(hex, 'hex'))
      header.version.should.equal(-1)
      header.timestamp.should.equal(1)
    })
  })

  describe('#fromObject', () => {
    it('should set all the variables', () => {
      const blockHeader = BlockHeader.fromObject({
        version,
        prevHash: prevblockidbuf.toString('hex'),
        merkleRoot: merklerootbuf.toString('hex'),
        time,
        bits,
        nonce,
      })
      should.exist(blockHeader.version)
      should.exist(blockHeader.prevHash)
      should.exist(blockHeader.merkleRoot)
      should.exist(blockHeader.time)
      should.exist(blockHeader.bits)
      should.exist(blockHeader.nonce)
    })
  })

  describe('#toJSON', () => {
    it('should set all the variables', () => {
      const json = bh.toJSON()
      should.exist(json.version)
      should.exist(json.prevHash)
      should.exist(json.merkleRoot)
      should.exist(json.time)
      should.exist(json.bits)
      should.exist(json.nonce)
    })
  })

  describe('#fromJSON', () => {
    it('should parse this known json string', () => {
      const jsonString = JSON.stringify({
        version,
        prevHash: prevblockidbuf,
        merkleRoot: merklerootbuf,
        time,
        bits,
        nonce,
      })

      const json = new BlockHeader(JSON.parse(jsonString))
      should.exist(json.version)
      should.exist(json.prevHash)
      should.exist(json.merkleRoot)
      should.exist(json.time)
      should.exist(json.bits)
      should.exist(json.nonce)
    })
  })

  describe('#fromString/#toString', () => {
    it('should output/input a block hex string', () => {
      const b = BlockHeader.fromString(bhhex)
      b.toString().should.equal(bhhex)
    })
  })

  describe('#fromBuffer', () => {
    it('should parse this known buffer', () => {
      BlockHeader.fromBuffer(bhbuf).toBuffer().toString('hex').should.equal(bhhex)
    })
  })

  describe('#fromBufferReader', () => {
    it('should parse this known buffer', () => {
      BlockHeader.fromBufferReader(BufferReader(bhbuf))
        .toBuffer()
        .toString('hex')
        .should.equal(bhhex)
    })
  })

  describe('#toBuffer', () => {
    it('should output this known buffer', () => {
      BlockHeader.fromBuffer(bhbuf).toBuffer().toString('hex').should.equal(bhhex)
    })
  })

  describe('#toBufferWriter', () => {
    it('should output this known buffer', () => {
      BlockHeader.fromBuffer(bhbuf).toBufferWriter().concat().toString('hex').should.equal(bhhex)
    })

    it("doesn't create a bufferWriter if one provided", () => {
      const writer = new BufferWriter()
      const blockHeader = BlockHeader.fromBuffer(bhbuf)
      blockHeader.toBufferWriter(writer).should.equal(writer)
    })
  })

  describe('#inspect', () => {
    it('should return the correct inspect of the genesis block', () => {
      const block = BlockHeader.fromRawBlock(dataRawBlockBinary)
      block.inspect().should.equal(`<BlockHeader ${dataRawId}>`)
    })
  })

  describe('#fromRawBlock', () => {
    it('should instantiate from a raw block binary', () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBinary)
      x.version.should.equal(2)
      new BN(x.bits).toString('hex').should.equal('1c3fffc0')
    })

    it('should instantiate from raw block buffer', () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer)
      x.version.should.equal(2)
      new BN(x.bits).toString('hex').should.equal('1c3fffc0')
    })
  })

  describe('#validTimestamp', () => {
    const x = BlockHeader.fromRawBlock(dataRawBlockBuffer)

    it('should validate timpstamp as true', () => {
      const valid = x.validTimestamp(x)
      valid.should.equal(true)
    })

    it('should validate timestamp as false', () => {
      x.time = Math.round(new Date().getTime() / 1000) + BlockHeader.Constants.MAX_TIME_OFFSET + 100
      const valid = x.validTimestamp(x)
      valid.should.equal(false)
    })
  })

  describe('#validProofOfWork', () => {
    it('should validate proof-of-work as true', () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer)
      const valid = x.validProofOfWork(x)
      valid.should.equal(true)
    })

    it('should validate proof of work as false because incorrect proof of work', () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer)
      const { nonce: n } = x
      x.nonce = 0
      const valid = x.validProofOfWork(x)
      valid.should.equal(false)
      x.nonce = n
    })
  })

  describe('#getDifficulty', () => {
    it('should get the correct difficulty for block 86756', () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer)
      x.bits.should.equal(0x1c3fffc0)
      x.getDifficulty().should.equal(4)
    })

    it('should get the correct difficulty for testnet block 552065', () => {
      const x = new BlockHeader({
        bits: 0x1b00c2a8,
      })
      x.getDifficulty().should.equal(86187.62562209)
    })

    it('should get the correct difficulty for livenet block 373043', () => {
      const x = new BlockHeader({
        bits: 0x18134dc1,
      })
      x.getDifficulty().should.equal(56957648455.01001)
    })

    it('should get the correct difficulty for livenet block 340000', () => {
      const x = new BlockHeader({
        bits: 0x1819012f,
      })
      x.getDifficulty().should.equal(43971662056.08958)
    })

    it('should use exponent notation if difficulty is larger than Javascript number', () => {
      const x = new BlockHeader({
        bits: 0x0900c2a8,
      })
      x.getDifficulty().should.equal(1.9220482782645836 * 1e48)
    })
  })

  it('coverage: caches the "_id" property', () => {
    const blockHeader = BlockHeader.fromRawBlock(dataRawBlockBuffer)
    blockHeader.id.should.equal(blockHeader.id)
  })
})
