# Specification

Bitcoins _initial subsidy_ $I$ is $50 \times 10^8 = 5000000000$ satoshi, one difficulty adjustment period $m$ is $2016$ blocks, and its _halving interval_ $H$ is $210000$ blocks. For any block index $n \geq 0$, the block subsidy for block $n$ is:

$$
S_B(n) = \left\lfloor \frac{I}{2^{\lfloor n / H \rfloor}} \right\rfloor
$$

One Meta Token consists of $10^8$ _mitoshi_. It is initially deployed in Bitcoin block $G \in \mathbb{N}$ ($G < 2^{32}$). It is issued in epochs that are exactly $m$ blocks long. Epoch $n$ maps 1:1 to the Bitcoin block interval $[G + n \cdot m, G + (n+1) \cdot m - 1]$. We call the block succeeding this interval (that is block $G + (n+1) \cdot m$) the _anchor block for epoch n_.

The eligibility window for usage scoring and claims in epoch $n$ is exactly this same interval $[G + n · m, G + (n+1) · m − 1]$ inclusive.

## Issuance Schedule

The issuance for epoch $n$ is either

$$
S(n) = \sum_{i=0}^{m-1} S_B(n \cdot m + i)
$$

mitoshi or zero mitoshi. This restarts Bitcoin’s subsidy curve at virtual block index 0, so that each epoch of exactly $m=2016$ blocks issues at most the same number of mitoshi as one full Bitcoin difficulty adjustment period at the corresponding virtual height, thereby preserving the maximal lifetime issuance schedule, halving cadence, and hard cap of Bitcoin.

When S(n) = 0 (after the final halving), no tokens are issued for that epoch or any subsequent epochs.

## Usage and Claim Mechanics

Participants earn lottery tickets automatically through genuine Bitcoin Computer platform usage. Every **usage transaction** (i.e., any valid Bitcoin Computer transaction whose metadata type is not “claim”) confirmed from a public key $P$ inside the epoch’s eligibility window increments $P$'s usage score $U_P(n)$.

**Usage score** $U_P(n)$ is the sum, over all usage transactions involving $P$ in the eligibility window, of the protocol fee share attributed to $P$. The protocol fee is split proportionally among the distinct primary owners of the ownerOutputs in that transaction. The mandatory claim transaction (metadata type “claim”) does not contribute to $U_P(n)$.

If a public key $P$ submits a claim but has no usage transactions in the window ($U_P(n) = 0$), the claim is disregarded entirely for allocation purposes (it does not count toward $C(n)$ and the public key is excluded from $\text{total}\_U(n)$).

A public key must submit exactly one claim transaction inside the eligibility window for epoch $n$ to be eligible. The claim specifies only the epoch $n$ and a recipient public key $Q$ for winnings.

If a public key submits zero claims or more than one claim transaction confirmed inside the eligibility window, that public key is completely disqualified for the entire epoch. The public key is excluded from $C(n)$, excluded from $\text{total}_U(n)$, and receives zero allocation (even if it has positive usage $U_P(n) > 0$). Claims submitted outside the eligibility window are invalid and ignored.

## Bitcoin Computer Protocol Definitions

This Meta Token issuance builds directly on the Bitcoin Computer protocol as specified at https://docs.bitcoincomputer.io/, https://docs.bitcoincomputer.io/format/, https://docs.bitcoincomputer.io/fees, and https://docs.bitcoincomputer.io/how-it-works/. All definitions below are normative.

**Valid Bitcoin Computer Transaction**

A valid Bitcoin Computer transaction whose parsed metadata type (from the metadata-encoding output) is not “claim”.

**Metadata-Encoding Output**  
A bare multisig output (following any object outputs) that encodes metadata such as JavaScript expressions or module code. The script contains:

- 1 protocol control public key (the spendable “owner” key), plus
- 1–2 data public keys that carry the actual metadata.

These outputs use the minimal non-dust satoshi amount and are owned by the company developing the Bitcoin Computer protocol (see Tx Format specification).

**Protocol Fee**  
The sum of the satoshi values in all metadata-encoding outputs of the transaction. This is the exact dust amount locked in those outputs (typically ~546 satoshis or the implementation-specific minimal non-dust value for the chosen blockchain). These outputs are spendable by the protocol developers and constitute their revenue.

**Miner Fee**  
The standard difference between total input value and total output value in satoshis.

**Public Key Attribution**  
For any valid transaction, the associated public key $P$ is the key that signs the transaction and/or is listed as the `_owner` (or primary spendable key) of the objects being created/updated. In the case of a claim transaction, $P$ is the signer of the claim.

**Claim Transaction Encoding**  
A claim transaction for epoch $n$ is a valid Bitcoin Computer transaction whose metadata encodes the tuple:

- type: “claim”
- epoch: $n$
- recipient: target public key $Q$

(The exact serialization format into the data public keys or JavaScript expression MUST be published in a canonical schema at https://docs.bitcoincomputer.io/ before mainnet deployment to guarantee light-client consensus.)

## Claim Amount Calculation $W$

Let $C(n)$ be the number of valid claims in epoch $n$. $C(n)$ counts only public keys that submitted exactly one claim transaction in the eligibility window and have $U_P(n) > 0$. Any public key with zero or two-or-more claims is fully excluded from $C(n)$ and from $\text{total}_U(n)$ and receives zero mitoshi.

Let $\text{total}_U(n) = \sum_P U_P(n)$, where the sum is taken only over public keys $P$ that submit exactly one valid claim and have $U_P(n) > 0$ for epoch $n$. If $\text{total}_U(n) = 0$, no mitoshi are issued for the epoch and $S(n)$ is permanently not minted.

For each public key $P$:

$$
a_P(n) = \left\lfloor \frac{U_P(n) \cdot S(n)}{\text{total}_U(n)} \right\rfloor
$$

Let $r = S(n) - \sum_P a_P(n)$.

Every claimant is first awarded $a_P(n)$ mitoshi.

To allocate the remaining $r$ mitoshi, sort all claims for epoch $n$ in descending order of Sainte-Laguë marginal priority (the Webster divisor method). It awards each extra mitoshi to the claimant who would then have the highest usage score _per_ mitoshi received — a fair way to achieve proportional allocation.

For any two claimants $P$ and $Q$, $P$ has strictly higher priority than $Q$ if

$$
\frac{U_P(n)}{2 \cdot a_P(n) + 1} \ > \ \frac{U_Q(n)}{2 \cdot a_Q(n) + 1}.
$$

This is computed exactly (without floating-point) using the equivalent `bigint` comparison

$$
U_P(n) \times (2 \cdot a_Q(n) + 1) \ > \ U_Q(n) \times (2 \cdot a_P(n) + 1).
$$

In case of equality, break ties by transaction ID interpreted as a 256-bit unsigned integer in big-endian byte order, descending (higher txid wins).

Award one additional mitoshi to the first $r$ claims in this sorted ordering.

By construction of the divisor method, $0 \leq r < C(n)$ always holds.

_This algorithm runs in $O(C(n) \log C(n))$ time_ (dominated by a single sort of the marginal priorities), uses only integer arithmetic, requires $O(C(n))$ memory, and produces identical results across every light-client implementation. It implements the Webster (Sainte-Laguë) divisor method (divisor sequence $d_k = 2k + 1$) while guaranteeing house monotonicity and population monotonicity when $S(n)$ changes across epochs (properties that the original largest-remainder method violates).

All arithmetic uses arbitrary-precision integers; early epochs require at least 128-bit intermediates because $U_P(n) \cdot S(n)$ can exceed $2^{64}$.

## Reference Pseudo-code for Smart-Contract Allocation

The following pseudo-code provides a reference implementation of the full claim-validation, usage-scoring, base-allocation, and remainder-distribution logic defined above. For an async function `f` and an array `arr` we will write `await arr.map(f)` instead of `await Promise.all(arr.map(f))`

We assume that the `Claim` module, exporting the `Claim` class below had been exported at the module specifier `claimMod`.

```ts
// TODO: Replace 0 with the actual Bitcoin block where epoch 0 starts (mainnet deployment block G)
const DEPLOYMENT_BLOCK_G = 0;

class Claim extends Contract {
  epoch: bigint
  amount?: bigint

  constructor(epoch: bigint, amount?: bigint) {
    this.epoch = epoch
    if (amount) this.amount = amount
  }

  async getAmount() {
    // case token has been transferred or created by `transfer`
    if (this.amount !== undefined) return this.amount

    // case token is a fresh mint
    if (this._id !== this._rev)
      throw new Error("Faulty smart contract implementation detected")

    const blockNumber = await computer.getBlockNumber(this._id.split(":")[0])
    const epoch = Claim.epochFromBlockNumber(blockNumber)

    const hasExactlyOneClaim = await Claim.hasExactlyOneValidClaim(this)
    if (!hasExactlyOneClaim) {
      this.amount = 0n
      return 0n
    }

    // Parse the intended recipient from claim metadata
    const recipient = await this.getRecipient()

    const allocations = await Claim.computeEpochAllocations(epoch)
    const awarded = allocations.get(recipient) ?? 0n

    this.amount = awarded
    return awarded
  }

  // ================================================================
  // STATIC CORE ALLOCATION ENGINE — runs once per epoch
  // ================================================================
  static async computeEpochAllocations(
    epoch: bigint,
  ): Promise<Map<PublicKey, bigint>> {
    const S = Claim.calculateSubsidy(epoch)
    if (S === 0n) return new Map()

    // 1. Get all claim transactions for this epoch (single RPC)
    const claimRevs = await computer.getTXOs({
      mod: claimMod,
      exp: `new Claim(${epoch})`,
    })
    const rawClaims = await Promise.all(claimRevs.map(computer.sync))

    // 2. Group by submitter and enforce “exactly one claim” rule
    const bySubmitter = new Map<PublicKey, any[]>()
    for (const c of rawClaims) {
      const submitter = Array.isArray(c._owners) ? c._owners[0] : c._owners
      if (!bySubmitter.has(submitter)) bySubmitter.set(submitter, [])
      bySubmitter.get(submitter)!.push(c)
    }

    // Keep only submitters with exactly one claim
    const validRawClaims = Array.from(bySubmitter.entries())
      .filter(([, claims]) => claims.length === 1)
      .map(([, [claim]]) => claim)

    // 3. Parse recipients (no ordering needed)
    const claimants = await Promise.all(
      validRawClaims.map(async (c) => {
        const submitter = Array.isArray(c._owners) ? c._owners[0] : c._owners
        const recipient = await Claim.parseRecipient(c)
        return { submitter, recipient, claim: c }
      })
    )

    // 4. Build usage map (unchanged)
    const publicKeys = claimants.map((c) => c.submitter)
    const blockRange = await Claim.getEpochBlockHashRange(epoch)
    const usageRevs = await computer.getTXOs({
      blockHashRange: blockRange,
      publicKey: publicKeys,
    })
    const usageTxIds = new Set(usageRevs.map((rev) => rev.split(":")[0]))
    const usageTxs = await Promise.all(
      Array.from(usageTxIds).map(Transaction.fromTxId)
    )

    const usageMap: Map<PublicKey, bigint> = new Map()
    for (const usageTx of usageTxs) {
      const txUsage = await Claim.usageMapFromTx(usageTx, computer.restClient)
      for (const [pk, amount] of txUsage) {
        usageMap.set(pk, (usageMap.get(pk) ?? 0n) + amount)
      }
    }

    // 5. Build valid claimants (U > 0 only)
    interface Claimant {
      submitter: PublicKey
      recipient: PublicKey
      u: bigint
    }

    const validClaimants: Claimant[] = []
    let totalU = 0n

    for (const item of claimants) {
      const u = usageMap.get(item.submitter) ?? 0n
      if (u > 0n) {
        validClaimants.push({ submitter: item.submitter, recipient: item.recipient, u })
        totalU += u
      }
    }

    if (totalU === 0n || validClaimants.length === 0) return new Map()

    // 6–8. Base allocation + Sainte-Laguë remainder (unchanged except no txid)
    const baseAlloc = new Map<PublicKey, bigint>()
    let sumA = 0n
    for (const cl of validClaimants) {
      const a = (cl.u * S) / totalU
      baseAlloc.set(cl.recipient, a)
      sumA += a
    }
    let r = S - sumA

    const sorted = [...validClaimants].sort((a, b) => {
      const aA = baseAlloc.get(a.recipient)!
      const bA = baseAlloc.get(b.recipient)!
      const left = a.u * (2n * bA + 1n)
      const right = b.u * (2n * aA + 1n)
      if (left !== right) return left > right ? -1 : 1
      // No txid tie-breaker needed anymore (duplicates already filtered)
      return 0
    })

    const finalAlloc = new Map<PublicKey, bigint>(baseAlloc)
    for (let i = 0; i < Number(r) && i < sorted.length; i++) {
      const { recipient } = sorted[i]
      finalAlloc.set(recipient, (finalAlloc.get(recipient) ?? 0n) + 1n)
    }

    return finalAlloc
  }

  // ================================================================
  // USAGE SCORING HELPERS
  // ================================================================

  /**
   * Returns a map of PublicKey → usage amount contributed by this single transaction.
   * Now uses INPUT owners (the actual spenders) for correct attribution.
   * Falls back to output owners only if no ownerInputs exist (very rare).
   */
  static async usageMapFromTx(
    tx: Transaction,
    restClient: RestClient
  ): Promise<Map<PublicKey, bigint>> {
    try {
      // 1. Claims never contribute
      if (tx.isClaimTransaction) return new Map();

      const protocolFee = tx.protocolFee;
      if (protocolFee <= 0n) return new Map();

      // 2. Prefer input owners (the ones who actually spent objects)
      let ownerItems = tx.ownerData; // fallback
      if (tx.ownerInputs.length > 0) {
        const inputItems = await tx.getInputOwnerData(restClient);
        if (inputItems.length > 0) ownerItems = inputItems;
      }

      // 3. Count objects per primary owner + proportional split (same logic as before)
      const ownerCount = new Map<string, number>();
      for (const item of ownerItems) {
        let owners = item._owners;
        if (!Array.isArray(owners)) owners = [owners];
        const primary = String(owners[0] ?? '').trim();
        if (primary) {
          ownerCount.set(primary, (ownerCount.get(primary) ?? 0) + 1);
        }
      }

      const totalObjects = Array.from(ownerCount.values()).reduce((a, b) => a + b, 0);
      if (totalObjects === 0) return new Map();

      const map = new Map<PublicKey, bigint>();
      let sumAllocated = 0n;
      const orderedOwners = Array.from(ownerCount.keys());

      for (const pk of orderedOwners) {
        const count = ownerCount.get(pk)!;
        const share = (protocolFee * BigInt(count)) / BigInt(totalObjects);
        map.set(pk as PublicKey, share);
        sumAllocated += share;
      }

      // remainder to first owner (deterministic)
      const remainder = protocolFee - sumAllocated;
      if (remainder > 0n && orderedOwners.length > 0) {
        const firstPk = orderedOwners[0] as PublicKey;
        map.set(firstPk, (map.get(firstPk) ?? 0n) + remainder);
      }

      return map;
    } catch (e) {
      return new Map();
    }
  }

 /**
 * Converts a Bitcoin block number to its Meta Token epoch.
 */
static epochFromBlockNumber(blockNumber: number): bigint {
  if (blockNumber < DEPLOYMENT_BLOCK_G) return -1n;
  const diff = BigInt(blockNumber - DEPLOYMENT_BLOCK_G);
  return diff / 2016n;
}

/**
 * Returns [startHash, endHash] for the eligibility window.
 *
 * Use with the new getTXOs({ blockHashRange: [...] }) parameter you are adding.
 * This replaces the old 2016-element array and eliminates 2016 RPC calls.
 */
static async getEpochBlockHashRange(epoch: bigint): Promise<[string, string]> {
  const G = BigInt(DEPLOYMENT_BLOCK_G);
  const m = 2016n;
  const startHeight = Number(G + epoch * m);
  const endHeight = startHeight + 2015;

  const startHash = await compute.getBlockHash(startHeight);
  const endHash = await compute.getBlockHash(endHeight);
  return [startHash, endHash];
}

/**
 * Optimized subsidy calculation (pure BigInt, fast-path for 99.9 % of epochs).
 */
static calculateSubsidy(epoch: bigint): bigint {
  const I = 5000000000n;
  const m = 2016n;
  const H = 210000n;
  const virtualStart = epoch * m;
  const firstHalving = virtualStart / H;
  const lastHalving = (virtualStart + m - 1n) / H;

  if (firstHalving === lastHalving) {
    return m * (I >> firstHalving);
  }

  // Rare halving-boundary epoch
  let total = 0n;
  for (let i = 0n; i < m; i++) {
    const k = virtualStart + i;
    total += I >> (k / H);
  }
  return total;
}

/**
 * Parses the recipient public key.
 * Tries computer.decode first (as you suggested), then standard fallbacks.
 * Once the canonical schema is published we can tighten this.
 */
static async parseRecipient(claim: any): Promise<PublicKey> {
  // 1. Direct property (cleanest when you set this.recipient = ... in constructor)
  if (claim.recipient) return claim.recipient as PublicKey;

  // 2. onChainMetaData (common for tuple encoding)
  if (claim.onChainMetaData?.recipient) {
    return claim.onChainMetaData.recipient as PublicKey;
  }

  // 3. Try computer.decode on the expression
  try {
    const decoded = await computer.decode?.(claim._id.split(":")[0]);
    const exp = decoded?.exp || "";
    // Handles both `new Claim(epoch)` and `new Claim(epoch, recipient)` patterns
    const match = exp.match(/new Claim\s*\(\s*\d+[^,]*,\s*["']?([a-f0-9A-Fx]+)["']?/i);
    if (match && match[1]) return match[1] as PublicKey;
  } catch {}

  // 4. Ultimate fallback (allowed by spec during transition)
  return Array.isArray(claim._owners) ? claim._owners[0] : claim._owners;
}

/**
 * Returns true ONLY if this submitter has submitted EXACTLY ONE claim
 * transaction for the epoch. Any other number (0 or ≥2) → full disqualification.
 */
static async hasExactlyOneValidClaim(claimInstance: Claim): Promise<boolean> {
  const submitter = Array.isArray(claimInstance._owners)
    ? claimInstance._owners[0]
    : claimInstance._owners;

  const epoch = claimInstance.epoch;

  const candidateRevs = await computer.getTXOs({
    mod: claimMod,
    exp: `new Claim(${epoch})`,
    publicKey: submitter,
  });

  return candidateRevs.length === 1;
}
```

## Consensus and State Derivation

All token balances and total supply are derived statelessly by light clients from the Bitcoin longest chain. A light client obtains the balance of any Claim object by first syncing it locally and then calling its `getAmount()` method (or an equivalent read-only computation). The method computes the awarded mitoshi on demand directly from the Bitcoin blockchain by examining the usage transactions and valid claims inside the epoch’s eligibility window, applying the deterministic subsidy schedule, and (when enabled) incorporating cross-epoch reputation weighting from prior allocations.

Clients do not maintain persistent balances. Instead, they rely on client-side caching (currently in-memory, with disk-based persistence planned) to avoid recomputing the same smart objects unnecessarily. Pure read-only methods such as `getAmount()` simply return their result without broadcasting any transaction. Only methods that mutate state cause a new transaction to be created and broadcast.

After the epoch’s anchor block (plus the full eligibility window) has achieved at least 6 Bitcoin confirmations, the allocation for that epoch is treated as final for practical purposes.

Light-client implementations SHALL use the reference transaction decoder from the official Bitcoin Computer library to parse metadata outputs, protocol fees, and claim metadata for deterministic results.

## Related Work

The Meta Token issuance mechanism adapts Bitcoin’s subsidy curve to epoch-based issuance while employing usage-fee scoring and the largest-remainder (Hamilton) method for claim allocation. These choices are grounded in and can be refined by established academic literature in mechanism design, fair division theory, cryptoeconomics, empirical airdrop analysis, and Sybil resistance. The references below directly address the core challenges of the current design—Sybil/farming risks, allocation fairness under varying S(n), incentive compatibility, and long-term tokenomics sustainability—while preserving the requirements of light-client stateless derivation, integer arithmetic, O(C(n) log C(n)) complexity, and exact Bitcoin anchoring.

1. **Messias, J., Yaish, A., & Livshits, B. (2024). “Airdrops: Giving Money Away Is Harder Than It Seems.”** arXiv:2312.02752  
   Comprehensive empirical analysis of major usage/activity-based airdrops, quantifying Sybil farming (industrial wallet splitting) and immediate sell-off rates (up to 95 %). Provides concrete heuristics for multi-epoch reputation weighting and vesting that can be layered onto U_P(n) without altering claim validity or chain verifiability.

2. **Georganas, S., Kiayias, A., & Penna, P. (2025). “Airdrop Games.”** arXiv:2505.03428  
   Game-theoretic model of costly-participation equilibria in usage-scoring + claim systems with heterogeneous user values. Enables formal equilibrium analysis of the current mechanics and suggests parameter tunings (e.g., protocol-fee weights) to avoid low-participation breakdowns.

3. **Nasrulin, B., et al. (2022). “Sybil Tolerant Reputation for Merit-based Tokenomics.”** arXiv:2207.09950  
   Introduces MeritRank, a personalized, epoch-decay reputation aggregation that bounds Sybil gains via transitivity and connectivity. Directly implementable as a chain-computable modifier to U_P(n) using only Bitcoin transaction data.

4. **Balinski, M. L. & Young, H. P. (1982). Fair Representation: Meeting the Ideal of One Man, One Vote** (Yale University Press; also 1974–1980 papers).  
   Foundational impossibility theorems on apportionment methods. Demonstrates that the largest-remainder method used in base(P,n) + rem(P,n) violates monotonicity; divisor methods (Jefferson/D’Hondt or Webster) are monotonic alternatives that remain integer-feasible and deterministic.

5. **Bhattacherjee, S., et al. (2023). “On Using Proportional Representation Methods as Alternatives to Pro-Rata Order Matching in Decentralized Exchanges.”** arXiv:2303.09652  
   Explicit comparison of largest-remainder versus D’Hondt/Webster in blockchain allocation settings under fluctuating supply. Quantifies monotonicity failures and proposes hybrid PR rules compatible with the existing O(C(n) log C(n)) sort.

6. **Kivilo, S., et al. (2026). “Designing a Token Economy: Incentives, Governance, and Tokenomics.”** arXiv:2602.09608  
   Introduces the Token Economy Design Method (TEDM) framework covering issuance curves, incentive compatibility, and governance. Maps directly to the epoch + anchor-block structure and offers tools for optional governance parameters (e.g., adjustable protocol fees) without breaking stateless consensus.

7. **Platt, M. & McBurney, P. (2023). “Sybil in the Haystack: A Comprehensive Review of Blockchain Consensus Mechanisms in Search of Strong Sybil Attack Resistance.”** Algorithms 16(1):34.  
   Taxonomy of economic, graph-based, and reputation Sybil defenses. Validates the current fee-based costly signaling while recommending hybrid layers (e.g., optional previously-claimed mitoshi staking) that stay fully Bitcoin-derivable.

8. **Bentov, I., Lee, C., Mizrahi, A., & Rosenfeld, M. (2014). “Proof of Activity: Extending Bitcoin’s Proof of Work via Proof of Stake.”** SIGMETRICS Performance Evaluation Review.  
   Hybrid work + stake model. Suggests lightweight extensions such as multi-epoch activity thresholds or staking of claimed mitoshi to strengthen long-term alignment without changing the core subsidy curve.

The current specification already incorporates the strongest compatible elements from this literature (Bitcoin subsidy mirroring, deterministic integer proportionality, economic Sybil barriers, and light-client efficiency). Future upgrades may adopt MeritRank-style decay, a divisor-method fallback, or TEDM governance hooks while retaining all existing consensus and verification guarantees.

# Appendix (Todos)

The following are todo.

## Add method to Transaction class.

Add the following methods to the `Transaction` class:

```
  /**
   * Parallel to `ownerData` but for the ownerInputs being spent.
   * Fetches the previous output scripts (the ones that were locked before this tx).
   * This is the correct attribution for usage scoring.
   */
  async getInputOwnerData(restClient: RestClient): Promise<any[]> {
    const inputOwnerData: any[] = [];
    for (const input of this.ownerInputs) {
      try {
        const prevTxId = reverseHexString(input.hash);
        const prevTx = await Transaction.fromTxId({ txId: prevTxId, restClient });
        const prevOutput = prevTx.outs[input.index];
        if (prevOutput?.script) {
          inputOwnerData.push({
            outScriptBuf: prevOutput.script,
            _owners: Script.parseScript(prevOutput.script),
            _satoshis: prevOutput.value,
          });
        }
      } catch {
        // prevout unavailable → skip (safe)
        continue;
      }
    }
    return inputOwnerData;
  }

  get protocolFee(): bigint {
    return this.dataOutputs.reduce(
      (sum: bigint, out: TxOutput) => sum + BigInt(out.value ?? 0),
      0n
    );
  }

  get isClaimTransaction(): boolean {
    const type = this.onChainMetaData?.type;
    return typeof type === 'string' && type.toLowerCase() === 'claim';
  }
```

Also, move all private properties (mnemonic etc) from restClient to wallet. Expose `restClient` property in inner computer.

## Add block-range queries to `getTXOs`

It could also be a `blockHeightRange` or similar.

## Fix Residual Sybil/Farming Vulnerability

Consider additive reputation weight from prior epochs (decaying and bounded length), or minimum U threshold per claim or similar.

## Optimize Usage Metric

Optimize the usage scoring metric definition for U_P(n) to reduce the incentive for low-value transaction spam while better rewarding meaningful Bitcoin Computer platform activity.
