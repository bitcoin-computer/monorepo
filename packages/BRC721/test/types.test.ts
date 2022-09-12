// Goal: we need a type for the computer.new and computer.sync functions.
// Consider examples

class Counter {
  n: number

  constructor(n: number) {
    this.n = n
  }
}
const counter: Counter = new Counter(2)

// But how do we type computer.new? We need a type operator Smart so that
// const smartCounter: Smart<Counter> = await computer.new(Counter, [2])

// Not generic

type SmartCouter = {
  _id: string
  _rev: string
  _root: string
  n: number
}

const x: SmartCouter = {
  _id: '',
  _rev: '',
  _root: '',
  n: 1,
}

// Non Recursive

type NonRecursiveSmart<T> = T & {
  _id: string
  _rev: string
  _root: string
}

const a: NonRecursiveSmart<{ n: number }> = {
  _id: '',
  _rev: '',
  _root: '',
  n: 1,
}

// Recursive

// Problem: this does not type check:
// const b: NonRecursiveSmart<{ n: { m: number} }> = {
//   _id: '',
//   _rev: '',
//   _root: '',
//   n: {
//     m: 1,
//     _id: '',
//     _rev: '',
//     _root: '',
//   },
// }

// Todo: we need to define a variant of NonRecursiveSmart
// called Smart that works for nested objects.
// type Smart = ???

// This check should pass
// const c: Smart<{ n: { m: number } }> = {
//   _id: '',
//   _rev: '',
//   _root: '',
//   n: {
//     m: 1,
//     _id: '',
//     _rev: '',
//     _root: '',
//   },
// }

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

const data: Json = {
  caption: 'Test',
  location: { x: 10, y: 20 },
  values: [0, 10, 20],
}

// type Smart<Type> = string | number | boolean | null | Smart<any>[] | { [Property in keyof Type]: Type[Property] };

type Smart<Type> =
  | string
  | number
  | boolean
  | null
  | Smart<Type>[]
  | {
      [Property in keyof Type]: Type[Property] extends object
        ? Type[Property] & { _id: string }
        : Type[Property]
    }

// const counter2: Smart<Counter> = {
//   n: 5
//   _id: 4
// }
