---
order: -36
icon: zap
---

# Optimizations

The Bitcoin Computer has built in optimizations that lead to _100x_ lower latency, _50x_ faster initial load time, and _100,000,000x_ faster subsequent load times. The following sections explain how they work.

## Server-Sent Events

The [`computer.subscribe`](./Lib/Computer/subscribe.md) function enables real-time updates via Server-Sent Events (SSEs). The function takes an on-chain ID and a callback function as arguments. The callback is triggered whenever a method is called on the on-chain object with the specified ID. By using this function, both load and latency can be significantly reduced.

```js
await computer.subscribe(chat._id, ({ rev, hex }) => {
  console.log(`Chat updated to revision ${rev} by tx ${hex}`)
})
```

Without SSEs, a chat application might query the server every 10 seconds. In the worst case, this would result in a message being delivered with a latency of up to 10 seconds. With SSEs, this latency is reduced to just 100ms, representing a _100x_ decrease.

{.compact}
| **Memory Level** | **Access Time** | **Size** |
| ---------------- | --------------- | --------- |
| **RAM** | ~ 100 ns | ~ 10 GB |
| **SSD** | ~ 100 µs | ~ 100 GB |
| **Network** | ~ 100 ms | Unbounded |

## Client-Side Caching

On-chain objects are cached in memory whenever they are computed. This means they can be retrieved from memory instead of being recomputed when loaded for the second time and beyond.

The cache automatically manages memory consumption and removes elements when necessary. To measure memory usage for the entire app (not just the cache), we use `process.memoryUsage` in Node.js and `performance.measureUserAgentSpecificMemory` in the browser. For browsers that do not support this API (less than 25% of the user base), we currently disable the cache. In the future, we plan to allow application developers to configure and manage the cache manually, ensuring support for all browsers.

The performance impact of in-memory caching is hard to overstate. For example, consider a chat with 100 messages. Without caching, 100 transactions would need to be downloaded in separate network requests, and 100 JavaScript expressions would need to be evaluated. The network latency alone could take around 10 seconds. With the cache, the latest state of the chat can be accessed in just 100 nanoseconds—_100 million times faster_. The savings are even greater when factoring in the time spent evaluating the JavaScript expressions.

_Notably, the time for accessing an element in the cache is independent of the size of its history and the complexity of the computations needed. Additionally, there’s a guarantee that each transaction is downloaded and each JavaScript expression is evaluated only once, even if the application isn’t optimized carefully._

Have a look [here](./development.md) for how to configure applications to make use of client side caching.

## Network Request Batching

While client-side caching optimizes time for the second (and subsequent) load(s), network request batching optimizes the first load.

Without batching, each transaction in the history of an on-chain object was downloaded in a separate network request. With batching, we download the IDs of all relevant transactions in a single request. Then, we remove the IDs of transactions whose objects are already in the cache. A second network request downloads the minimal set of transactions required to compute the desired on-chain object. The client then extracts the JavaScript expressions from the transaction hexes, computes the value of the object, and stores it in the cache.

What’s remarkable is that _the node can determine the relevant transaction IDs for computing a value without having to evaluate the JavaScript expressions_. The fact that the server does _not_ have to evaluate the smart contracts is one of the main reasons why the Bitcoin Computer is so cost-effective, so preserving this property was crucial.

To illustrate the impact of this optimization, consider again a decentralized chat with 100 messages. Without batching, this requires 100 network requests, taking approximately 10 seconds. With batching, the client first downloads the IDs of the transactions that contain messages for this chat in one network request. It then uses the client-side cache to determine which transactions are new since the chat was last loaded and cached. Only the "new" transactions are downloaded in a second network request. This reduces the access time to approximately 200 ms, even on the first load—an improvement of _50x_.

_With only minor exceptions, the value of an on-chain object can now be computed with two network requests, even if it depends on a large number of transactions. Additionally, every transaction is only downloaded once._
