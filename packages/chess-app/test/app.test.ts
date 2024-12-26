import { ChessContractHelper, ChessContract } from '../../chess-contracts/src/chess-contract'

describe("ChessContract", () => {
  it('Should be defined', () => {
    expect(ChessContract).toBeDefined()
    expect(typeof ChessContract).toEqual('function')
  })
})

describe('ChessContractHelper', () => {
  it('Should be defined', () => {
    expect(ChessContractHelper).toBeDefined()
    expect(typeof ChessContractHelper).toEqual('function')
  })
})
