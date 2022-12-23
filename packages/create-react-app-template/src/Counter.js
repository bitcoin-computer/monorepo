import { useState } from "react";

function Counter({ computer }) {
  const [counter, setCounter] = useState(null);
  // eslint-disable-next-line no-undef
  class Counter extends Contract {
    constructor() {
      super();
      this.n = 0;
    }

    inc() {
      this.n += 1;
    }
  }

  const [count, setCount] = useState(0);

  const createSmart = async (evt) => {
    evt.preventDefault();
    const smartObj = await computer.new(Counter);
    setCounter(smartObj);
    alert("created");
  };

  const increment = async (evt) => {
    evt.preventDefault();
    if (!counter) {
      alert("create smart object");
      return;
    }
    await counter.inc();
    setCount(counter.n);
  };
  return (
    <div>
      <button onClick={createSmart}>Create Smart Object</button>
      <div>counter is {count}</div>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export default Counter;
