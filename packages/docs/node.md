---
order: -50
icon: package
visibility: hidden
---

# Node

The Bitcoin Computer Node is a vanilla Bitcoin (or Litecoin) node enhanced with the following capabilities:

**Pre-computed Balances**. All balances are pre-computed during synchronization (on a vanilla node it takes ca 10 mins to initially compute the balance of a given address, which leads to a bad UX)

**Recent Transactions**. It can return the recent sent a received transactions for a given address (this is not supported on vanilla nodes)

**Optimized for Development**. On regtest, the halving period is increased to infinity. This has the advantage that a large number of tests can be run without having to restart the node.

**Multi-Chain**. Supports BTC and LTE

**Multi-Platform**. Multiplatform Docker images work on all major architectures (todo: list architectures) 

**Easy to Use**. No compilation needed. You can start the node in a single line of code.

**Easy to Configure**. Allow and deny access to RPC endpoints using a regular expression

## Configuration

```bash
# Use this .env file when deploying locally.
# Port for Bitcoin Computer Node
PORT=1031

# Postgres connection credentials
POSTGRES_USER=bcn
POSTGRES_PASSWORD=bcn
POSTGRES_DB=bcn

RPC_USER='bcn-admin'
RPC_PASSWORD='kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
RPC_AUTH='bcn-admin:c71460f0f08e4eeec90e033c04f7bb82$c36e8561d46abbf3bf13da6b88612c19d758d46d02c45cd2716f06a13ec407af'
RPC_HOST=127.0.0.1
DEFAULT_WALLET=defaultwallet

# Allowed RPC methods
ALLOWED_RPC_METHODS=^get|^gen|^send|^lis

# DEBUG_MODE levels are defined as follows:
# 0 - Error output only
# 1 - Error and warning output
# 2 - Error, warning, and info output
# 3 - Error, warning, info and http output
# 4 - Error, warning, info, http and debug output
DEBUG_MODE=4

# Log file settings
# Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
LOG_MAX_FILES=20m
# Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. (default: null)
LOG_MAX_SIZE=14d
# A boolean to define whether or not to gzip archived log files. (default 'false')
LOG_ZIP=false

# Bitcoin Computer activation block for non-standard sequential sync
BC_START_HEIGHT=3211106

```