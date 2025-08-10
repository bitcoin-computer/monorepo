declare module Chai {
  interface Assertion {
    failed(): Assertion
    matchPattern(pattern: any): Assertion
  }
}
