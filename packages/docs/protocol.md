---
order: -40
---

# Protocol

The Bitcoin Computer protocol records the execution of Javascript programs in Bitcoin transactions that contain meta data. The objects created by these programs can be associated with the outputs of Bitcoin transactions. Spent outputs represent historical states and unspent outputs (UTXOs) represent the current state. Both the current and all historical states of a smart object can be computed from the metadata on the blockchain.

Just like you can use a programming language without knowing in detail how it is evaluated, you can use the Bitcoin Computer without understanding it's protocol. However if you are interested in how smart contracts work on Bitcoin, you can find more information below.

## The Global Shared Memory

![](/static/legend@1x.png)-

The Global Shared Memory is a low level abstraction that makes smart contracts possible on Bitcoin. It is comparable to the ordinals protocol in that is assigns names to outputs, thereby connecting outputs with the same name.

Allocation and de-allocation in the global shared memory can be encoded as follows:

The *n*-th output of a transaction with *m* inputs is called
* a memory update if *n <= m*
* a memory allocation if *m < n*

A *memory de-allocation* is an input at index *n* in a transaction with *m < n* outputs

![](/static/memory@1x.png)-

We can assign two names, "revisions" and "ids", to all outputs: The *revision* of an output is the concatenation of its transaction id and output number. The *id* of an output is it's revision if the output is a memory allocation. If an output *o* is a memory update then the transaction contains an input *i* with the same index of *o*. In this case *o*'s revision is the revision of the output being spent by *i*.

## Smart Contracts


Smart contracts can be build on top of the shared global memory using the Bitcoin Computer protocol.
A *Bitcoin Computer Transaction* is a Bitcoin transaction that contains the following metadata:
1. A Javascript expression, such as ``new Counter()`` or ``counter.inc()``, which may contain free variables like ``counter``.
2. A *blockchain environment* object that associates the free variables in the expression with the inputs of the transaction.
3. An optional *module specifier*, which identifies a transaction output storing a module.

The ``computer.sync`` function computes an Javascript object for each output of a Bitcoin Computer transaction. The object is annotated with the id and revision of the cell in global memory that stores the object. Such an object is called a *smart object*.

## Keyword Properties

In addition to the properties defined in the class that a smart object is created from, it has the following properties:

* ``_id``: Refers to the transaction output that allocated the memory cell that stores the smart object. This id remains constant, even if the object is updated.
* ``_rev``: Refers to the last transaction output that updated the smart object. It is updated every time the object is updated.
* ``_root``: For an object created using ``computer.new``, the _root is equal to its _id. If an object is created within a function call, the _root of the new object is the _root of the object on which the function was called.
* ``_amount``: Indicates the amount of cryptocurrency (in satoshi) stored in the smart object.
* ``_owners``: An array of string-encoded public keys representing the owners of the object. Only the owners can update a smart object by calling one of its functions.

## Calling Constructors

To allocate a memory cell and to store a new smart object in it, a transaction that contains a Javascript expression <code>e<sub>1</sub>; e<sub>2</sub> ... e<sub>n</sub></code> where <code>e<sub>n</sub></code> is of the form ``new C(...)`` must be broadcast. The class ``C`` can be defined in the expression or it can be passed in from a module.

![](/static/nft-create@1x.png)

The function ``computer.sync`` computes Javascript objects from outputs as shown in the figure. Note that ``_id``, ``_rev``, and ``_root`` are all set to the same output.

## Calling Functions

To update a smart object stored in the shared global memory, a Bitcoin transaction must be broadcast that includes a Javascript expression of the form of ``x.f(...)``. To determine which memory cell the free variable ``x`` is stored in, the blockchain environment must associate ``x`` with an input. In the example this input is shown as ``nft``.

![](/static/nft-update@1x.png)

The transaction will create corresponding outputs to these inputs, which represent the updated state of the memory cells. These outputs are called the *revisions* of a smart object, and the most recent revision is stored in the ``_rev`` property of the smart object.

The ``computer.sync`` function can be called with each revision of a smart object. This provides access to all historical states of a smart object.

## Returning Objects

When a function call on a smart object returns a value of type object, a new memory cell is allocated to store the returned value.

The figure below illustrates the minting and sending of 100 fungible tokens. The blue user, with public key 03a1d..., mints the tokens in the first transaction, producing one output that represents the 100 newly minted tokens. The second transaction represents the distribution of tokens after the blue user sends 3 tokens to the green user, with public key 03f0b....

![](/static/ft-create@1x.png)

The blue output of the second transaction represents the 97 tokens that the blue user still holds, while the green output represents the three tokens now owned by the green user. The _root property of both outputs in the second transaction is linked to the output of the first transaction, as the memory cell for the three tokens was allocated within a function call.

This setup prevents forgery, as any two tokens with the same root can be traced back to the same mint. To mint a second token with the same root, one would have to broadcast a transaction with the transaction id of the first transaction, which is impossible.

<!-- ## Passing Objects as Arguments

Swap

## Creating Sub Objects

Game -->
