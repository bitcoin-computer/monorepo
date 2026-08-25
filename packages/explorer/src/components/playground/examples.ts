export type ExampleId = 'nft' | 'token' | 'counter' | 'chat'
export type PlaygroundMode = 'create' | 'execute' | 'deploy'

export type ExampleVar = { name: string; type: string; value: string }

export type ExampleMeta = {
  id: ExampleId
  label: string
  description: string
}

export const EXAMPLE_CARDS: ExampleMeta[] = [
  {
    id: 'nft',
    label: 'NFT',
    description: 'Simple non-fungible token with send',
  },
  {
    id: 'token',
    label: 'Token',
    description: 'Fungible token balance pattern',
  },
  {
    id: 'counter',
    label: 'Counter',
    description: 'Minimal state + method call',
  },
  {
    id: 'chat',
    label: 'Chat',
    description: 'Multi-party style contract sketch',
  },
]

type ExampleCtx = { publicKey: string }

type ExampleDef = {
  classSource: string
  instantiate: (ctx: ExampleCtx) => string
  vars: (ctx: ExampleCtx) => ExampleVar[]
}

const nftClass = `class NFT extends Contract {
  constructor(data) {
    super({
      data,
    })
  }
  send(to) {
    this._owners = [to]
  }
}`

const tokenClass = `class Token extends Contract {
  constructor(supply, to) {
    super({
      tokens: supply,
      _owners: [to],
    })
  }
  send(amount, to) {
    if (this.tokens < amount) throw new Error()
    this.tokens -= amount
    return new Token(amount, to)
  }
}`

const chatClass = `class Chat extends Contract {
  constructor() {
    super({ messages: [] })
  }
  invite(pubKey) {
    this._owners.push(pubKey)
  }
  post(message) {
    this.messages.push(message)
  }
}`

const counterClass = `class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }
  inc() {
    this.n += 1
  }
  dec() {
    this.n -= 1
  }
  getVal() {
    return this.n
  }
}`

const EXAMPLES: Record<ExampleId, ExampleDef> = {
  nft: {
    classSource: nftClass,
    instantiate: () => 'new NFT("some data")',
    vars: () => [{ name: 'data', type: 'string', value: 'some data' }],
  },
  token: {
    classSource: tokenClass,
    instantiate: ({ publicKey }) => `new Token(100, "${publicKey}")`,
    vars: ({ publicKey }) => [
      { name: 'supply', type: 'number', value: '100' },
      { name: 'to', type: 'string', value: publicKey },
    ],
  },
  chat: {
    classSource: chatClass,
    instantiate: () => 'new Chat()',
    vars: () => [],
  },
  counter: {
    classSource: counterClass,
    instantiate: () => 'new Counter()',
    vars: () => [],
  },
}

function asModule(classSource: string): string {
  return classSource.replace(/^class /, 'export class ')
}

function asExpression(classSource: string, instantiate: string): string {
  return `${classSource}\n${instantiate}`
}

export type ExampleBundle = {
  code: string
  expression: string
  module: string
  vars: ExampleVar[]
}

export function getExampleBundle(id: ExampleId, ctx: ExampleCtx): ExampleBundle {
  const ex = EXAMPLES[id]
  return {
    code: ex.classSource,
    expression: asExpression(ex.classSource, ex.instantiate(ctx)),
    module: asModule(ex.classSource),
    vars: ex.vars(ctx),
  }
}
