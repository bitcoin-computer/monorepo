declare namespace Chai {
  interface Assertion {
    failed(): Assertion
    matchPattern(pattern: any): Assertion
  }
}
