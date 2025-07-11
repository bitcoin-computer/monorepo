---
order: -36
icon: zap
---

# Optimizations

The Bitcoin Computer uses caching and network request batching to quickly load on-chain objects. Server-Sent Events can be used to receive a notification when an on-chain object is updated.

## Server-Sent Events

The [`computer.subscribe`](./Lib/Computer/subscribe.md) function enables real-time updates via Server-Sent Events (SSEs). The function takes the id of an on-chain object and a callback function as arguments. The callback is called whenever a method on the on-chain object is called. By using this function, both load and latency can be significantly reduced compared to polling.

```js
await computer.subscribe(chat._id, ({ rev, hex }) => {
  console.log(`Chat updated to revision ${rev} by tx ${hex}`)
})
```

Without SSEs, a chat application might poll the server every 10 seconds. In the worst case, this would result in a message being delivered with a latency of up to 10 seconds. With SSEs, this latency is reduced to just 100ms, a 100x decrease.

{.compact}
| **Memory Level** | **Access Time** | **Size** |
| ---------------- | --------------- | --------- |
| **RAM** | ~ 100 ns | ~ 10 GB |
| **SSD** | ~ 100 µs | ~ 100 GB |
| **Network** | ~ 100 ms | Unbounded |

## Client-Side Caching

On-chain objects are cached in memory when they are computed for the first time and read from memory on every subsequent load.

In the browser, objects are additionally persisted on disk using IndexedDB. When a browser tab is closed and later re-opened, the state of the last visit is still cached on disk. When an object is not found in cache, it is recomputed from the blockchain. We rely on the efficient eviction algorithms built into browsers to evict under storage pressure.

| Browser | Storage Limit                   | Eviction Policy                    |
| ------- | ------------------------------- | ---------------------------------- |
| Chrome  | Up to 60% of disk (shared pool) | LRU under storage pressure         |
| Safari  | Up to 60% of disk per origin    | LRU if total >80% or unused 7 days |
| Firefox | Smaller of 10% disk or 10 GB    | LRU under storage pressure         |

We do not track the size of the in-memory cache as measuring memory consumption is slow. We recommend that applications that use a lot of data (GB+) measure their memory consumption every now and then using `process.memoryUsage()` in node.js and `performance.measureUserAgentSpecificMemory()` in Chrome. If the memory consumption becomes too high, the `computer` object containing the large in memory cache can be replaced by a new `computer` object. The new object has an empty in-memory cache but can quickly access cached objects from disk.

Unlike other caching solutions for web application we do not just cache json data but entire Javascript objects, including their methods. When an object is read from the disk, we leverage the smart contracts to re-create these methods securely using endo's secure sandbox ses. In order to make this process efficient we forbid updating functional parameters in on-chain objects.

The performance impact of caching is hard to overstate. For example, consider a chat with 100 messages. A naive implementation without caching would download 100 transactions in separate network requests and would evaluate 100 JavaScript expressions. The network latency alone could take around 10 seconds. If the chat is cached in memory it can be accessed in 100 nanoseconds—100 million times faster from memory. If it is cached on disk the speedup 100 thousand x. The speedup are even greater when considering the time for evaluating the JavaScript expressions.

The time for accessing an element in the cache is independent of the size of its history and the complexity of the computations needed. Additionally, there’s a guarantee that each transaction is downloaded only once and each JavaScript expression is evaluated only once, even across reloads and if the application is not carefully optimized.

## Network Request Batching

While client-side caching optimizes time for the second (and subsequent) load(s), network request batching optimizes the first load.

Without batching, each transaction in the history of an on-chain object was downloaded in a separate network request. With batching, we download the IDs of all relevant transactions in a single request. Then, we remove the IDs of transactions whose objects are already in the cache. A second network request downloads the minimal set of transactions required to compute the desired on-chain object. The client then extracts the JavaScript expressions from the transaction hexes, computes the value of the object, and stores it in the cache.

What’s remarkable is that _the node can determine the relevant transaction IDs for computing a value without having to evaluate the JavaScript expressions_. The fact that the server does _not_ have to evaluate the smart contracts is one of the main reasons why the Bitcoin Computer is so cost-effective, so preserving this property was crucial.

To illustrate the impact of this optimization, consider again a decentralized chat with 100 messages. Without batching, this requires 100 network requests, taking approximately 10 seconds. With batching, the client first downloads the IDs of the transactions that contain messages for this chat in one network request. It then uses the client-side cache to determine which transactions are new since the chat was last loaded and cached. Only the "new" transactions are downloaded in a second network request. This reduces the access time to approximately 200 ms, even on the first load—an improvement of _50x_.

_With only minor exceptions, the value of an on-chain object can now be computed with two network requests, even if it depends on a large number of transactions. Additionally, every transaction is only downloaded once._
