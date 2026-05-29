import { expect } from 'chai'
import { Contract } from '@bitcoin-computer/lib'

describe('Contract', () => {
  it('Should Throw an Error When Updating Properties Outside of Methods', () => {
    class C extends Contract {
      n: number

      constructor() {
        super({ n: 0 })
      }

      set(n: number) {
        this.n = n
      }
    }

    const c = new C()
    c.set(1)

    expect(() => {
      c.n = 1
    }).to.throw("Cannot set property 'n' directly")
  })

  it('Should Throw an Error When Updating Provenance Properties', () => {
    class C extends Contract {
      _rev: string

      set(rev: string) {
        this._rev = rev
      }
    }

    const c = new C()

    expect(() => {
      c.set('rev')
    }).to.throw('Cannot set _rev')
  })

  it('Should be possible to use the initialization object', () => {
    class C extends Contract {
      n: number

      constructor() {
        super({ n: 0 })
      }
    }

    const c = new C()
    expect(c.n).eq(0)
  })

  it('Will throw an error if this is assigned in a constructor', () => {
    class C extends Contract {
      n: number

      constructor() {
        super()
        this.n = 1
      }
    }

    expect(() => {
      new C()
    }).to.throw("Cannot set property 'n' directly")
  })
})
