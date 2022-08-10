import t from "body-parser";
import e from "cors";
import r from "express";
import s from "http";
import * as n from "zeromq";
import o from "express-rate-limit";
import a from "dotenv";
import i from "is-primitive";
import c from "is-plain-object";
import l from "fs";
import d from "os";
import { createLogger as u, format as p, transports as f } from "winston";
import { Bitcoin as y } from "bitcoin-computer-bitcore";
import h, { PreparedStatement as m } from "pg-promise";
import g from "pg-monitor";
import { backOff as S } from "exponential-backoff";
import w from "bitcoind-rpc";
import E from "util";
import { ec as T } from "elliptic";
import R from "hash.js";
import v from "path";
const { deleteProperty: $ } = Reflect;
const O = i;
const b = c;
const _ = (t) => ("object" == typeof t && null !== t) || "function" == typeof t;
const N = (t) => {
  if (!O(t)) throw new TypeError("Object keys must be strings or symbols");
  if (((t) => "__proto__" === t || "constructor" === t || "prototype" === t)(t))
    throw new Error(`Cannot set unsafe key: "${t}"`);
};
const P = (t, e) =>
  e && "function" == typeof e.split
    ? e.split(t)
    : "symbol" == typeof t
    ? [t]
    : Array.isArray(t)
    ? t
    : ((t, e, r) => {
        const s = ((t) =>
          Array.isArray(t) ? t.flat().map(String).join(",") : t)(
          e
            ? ((t, e) => {
                if ("string" != typeof t || !e) return t;
                let r = t + ";";
                return (
                  void 0 !== e.arrays && (r += `arrays=${e.arrays};`),
                  void 0 !== e.separator && (r += `separator=${e.separator};`),
                  void 0 !== e.split && (r += `split=${e.split};`),
                  void 0 !== e.merge && (r += `merge=${e.merge};`),
                  void 0 !== e.preservePaths &&
                    (r += `preservePaths=${e.preservePaths};`),
                  r
                );
              })(t, e)
            : t
        );
        N(s);
        const n = C.cache.get(s) || r();
        return C.cache.set(s, n), n;
      })(t, e, () =>
        ((t, e = {}) => {
          const r = e.separator || ".";
          const s = "/" !== r && e.preservePaths;
          if ("string" == typeof t && !1 !== s && /\//.test(t)) return [t];
          const n = [];
          let o = "";
          const a = (t) => {
            let e;
            "" !== t.trim() && Number.isInteger((e = Number(t)))
              ? n.push(e)
              : n.push(t);
          };
          for (let e = 0; e < t.length; e++) {
            const s = t[e];
            "\\" !== s
              ? s !== r
                ? (o += s)
                : (a(o), (o = ""))
              : (o += t[++e]);
          }
          return o && a(o), n;
        })(t, e)
      );
const x = (t, e, r, s) => {
  if ((N(e), void 0 === r)) $(t, e);
  else if (s && s.merge) {
    const n = "function" === s.merge ? s.merge : Object.assign;
    n && b(t[e]) && b(r) ? (t[e] = n(t[e], r)) : (t[e] = r);
  } else t[e] = r;
  return t;
};
const C = (t, e, r, s) => {
  if (!e || !_(t)) return t;
  const n = P(e, s);
  let o = t;
  for (let t = 0; t < n.length; t++) {
    const e = n[t];
    const a = n[t + 1];
    if ((N(e), void 0 === a)) {
      x(o, e, r, s);
      break;
    }
    "number" != typeof a || Array.isArray(o[e])
      ? (_(o[e]) || (o[e] = {}), (o = o[e]))
      : (o = o[e] = []);
  }
  return t;
};
(C.split = P),
  (C.cache = new Map()),
  (C.clear = () => {
    C.cache = new Map();
  });
var A = C;
var I = l;
var H =
  "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
    ? function (t) {
        return typeof t;
      }
    : function (t) {
        return t &&
          "function" == typeof Symbol &&
          t.constructor === Symbol &&
          t !== Symbol.prototype
          ? "symbol"
          : typeof t;
      };
var j =
  "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
    ? function (t) {
        return typeof t;
      }
    : function (t) {
        return t &&
          "function" == typeof Symbol &&
          t.constructor === Symbol &&
          t !== Symbol.prototype
          ? "symbol"
          : typeof t;
      };
var M = (function () {
  function t(t, e) {
    for (var r = 0; r < e.length; r++) {
      var s = e[r];
      (s.enumerable = s.enumerable || !1),
        (s.configurable = !0),
        "value" in s && (s.writable = !0),
        Object.defineProperty(t, s.key, s);
    }
  }
  return function (e, r, s) {
    return r && t(e.prototype, r), s && t(e, s), e;
  };
})();
var L = function t(e, r) {
    var s = r.indexOf(".");
    if (!~s) {
      if (null == e) return;
      return e[r];
    }
    var n = r.substring(0, s),
      o = r.substring(s + 1);
    if (null != e) return (e = e[n]), o ? t(e, o) : e;
  },
  B = A,
  D = function (t, e) {
    if ("function" != typeof e) return JSON.parse(I.readFileSync(t));
    I.readFile(t, "utf-8", function (t, r) {
      try {
        r = JSON.parse(r);
      } catch (e) {
        t = t || e;
      }
      e(t, r);
    });
  },
  k = l,
  U = d;
var F = (function () {
  function t(e, r) {
    !(function (t, e) {
      if (!(t instanceof e))
        throw new TypeError("Cannot call a class as a function");
    })(this, t),
      (this.options = r = r || {}),
      (r.stringify_width = r.stringify_width || 2),
      (r.stringify_fn = r.stringify_fn || null),
      (r.stringify_eol = r.stringify_eol || !1),
      (r.ignore_dots = r.ignore_dots || !1),
      (this.path = e),
      (this.data = this.read());
  }
  return (
    M(t, [
      {
        key: "set",
        value: function (t, e, r) {
          var s = this;
          return (
            "object" === (void 0 === t ? "undefined" : j(t))
              ? (function (t, e) {
                  var r = 0,
                    s = [];
                  if (Array.isArray(t))
                    for (; r < t.length && !1 !== e(t[r], r); ++r);
                  else if (
                    "object" === (void 0 === t ? "undefined" : H(t)) &&
                    null !== t
                  )
                    for (
                      s = Object.keys(t);
                      r < s.length && !1 !== e(t[s[r]], s[r]);
                      ++r
                    );
                })(t, function (t, e) {
                  B(s.data, e, t, r);
                })
              : this.options.ignore_dots
              ? (this.data[t] = e)
              : B(this.data, t, e, r),
            this.options.autosave && this.save(),
            this
          );
        },
      },
      {
        key: "get",
        value: function (t) {
          return t
            ? this.options.ignore_dots
              ? this.data[t]
              : L(this.data, t)
            : this.toObject();
        },
      },
      {
        key: "unset",
        value: function (t) {
          return this.set(t, void 0);
        },
      },
      {
        key: "append",
        value: function (t, e) {
          var r = this.get(t);
          if (((r = void 0 === r ? [] : r), !Array.isArray(r)))
            throw new Error("The data is not an array!");
          return r.push(e), this.set(t, r), this;
        },
      },
      {
        key: "pop",
        value: function (t) {
          var e = this.get(t);
          if (!Array.isArray(e)) throw new Error("The data is not an array!");
          return e.pop(), this.set(t, e), this;
        },
      },
      {
        key: "read",
        value: function (t) {
          if (!t)
            try {
              return D(this.path);
            } catch (t) {
              return {};
            }
          D(this.path, function (e, r) {
            t(null, (r = e ? {} : r));
          });
        },
      },
      {
        key: "write",
        value: function (t, e) {
          return (
            e ? k.writeFile(this.path, t, e) : k.writeFileSync(this.path, t),
            this
          );
        },
      },
      {
        key: "empty",
        value: function (t) {
          return this.write("{}", t);
        },
      },
      {
        key: "save",
        value: function (t) {
          var e = JSON.stringify(
            this.data,
            this.options.stringify_fn,
            this.options.stringify_width,
            this.options.stringify_eol
          );
          return (
            this.write(this.options.stringify_eol ? e + U.EOL : e, t), this
          );
        },
      },
      {
        key: "toObject",
        value: function () {
          return this.data;
        },
      },
    ]),
    t
  );
})();
a.config();
const G = (function (t, e) {
  return new F(t, { stringify_eol: !0 });
})(`${__dirname}/../../package.json`);
const {
  PORT: W = "3000",
  ZMQ_URL: K = "tcp://litecoind:28332",
  CHAIN: V = "LTC",
  NETWORK: Y = "regtest",
  BCN_ENV: J = "dev",
  BCN_URL: q = "http://127.0.0.1:3000",
  DEBUG_MODE: z = "1",
  POSTGRES_USER: Z = "bcn",
  POSTGRES_PASSWORD: Q = "bcn",
  POSTGRES_DB: X = "bcn",
  POSTGRES_HOST: tt = "127.0.0.1",
  POSTGRES_PORT: et = "5432",
  RPC_PROTOCOL: rt = "http",
  RPC_USER: st = "bcn-admin",
  RPC_PASSWORD: nt = "kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A=",
  RPC_HOST: ot = "litecoind",
  RPC_PORT: at = "19332",
  TESTING: it = !1,
  DEFAULT_WALLET: ct = "defaultwallet",
} = process.env;
const lt = process.env.ALLOWED_RPC_METHODS
  ? process.env.ALLOWED_RPC_METHODS.split(",").map((t) => new RegExp(t))
  : [];
const dt = G.get("version");
var ut = {
  PORT: parseInt(W, 10),
  ZMQ_URL: K,
  CHAIN: V,
  NETWORK: Y,
  BCN_ENV: J,
  BCN_URL: q,
  DEBUG_MODE: parseInt(z, 10),
  POSTGRES_USER: Z,
  POSTGRES_PASSWORD: Q,
  POSTGRES_DB: X,
  POSTGRES_HOST: tt,
  POSTGRES_PORT: parseInt(et, 10),
  POSTGRES_MAX_PARAM_NUM: 1e4,
  RPC_PROTOCOL: rt,
  RPC_USER: st,
  RPC_PASSWORD: nt,
  RPC_HOST: ot,
  RPC_PORT: parseInt(at, 10),
  SYNC_HEIGHT: 1,
  SYNC_INTERVAL_CHECK: 3e3,
  SERVER_VERSION: dt,
  TESTING: JSON.parse(it.toString()),
  DB_CONNECTION_RETRY_TIME: 500,
  SIGNATURE_FRESHNESS_MINUTES: 3,
  DEFAULT_WALLET: ct,
  ALLOWED_RPC_METHODS: lt,
};
const { DEBUG_MODE: pt } = ut;
const ft = u({
  level: ["error", "warn", "info", "http", "verbose", "debug", "silly"][pt],
  format: p.json(),
  transports: [
    new f.Console({
      format: p.combine(
        p.colorize(),
        p.timestamp({ format: "MM-DD-YYYY HH:mm:ss" }),
        p.printf((t) => `[2m${t.timestamp}[0m ${t.level} ${t.message}`)
      ),
    }),
  ],
  exceptionHandlers: [new f.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: [new f.File({ filename: "logs/rejections.log" })],
});
const yt = { maxFiles: 1, maxSize: 1e5 };
pt >= 0 && ft.add(new f.File({ filename: "error.log", level: "error" })),
  pt >= 1 &&
    ft.add(new f.File({ filename: "logs/warn.log", level: "warn", ...yt })),
  pt >= 2 &&
    ft.add(new f.File({ filename: "logs/info.log", level: "info", ...yt })),
  pt >= 3 &&
    ft.add(new f.File({ filename: "logs/http.log", level: "http", ...yt })),
  pt >= 4 &&
    ft.add(
      new f.File({ filename: "logs/verbose.log", level: "verbose", ...yt })
    ),
  pt >= 5 &&
    ft.add(new f.File({ filename: "logs/debug.log", level: "debug", ...yt }));
const ht = () => "dev" === ut.BCN_ENV;
const mt = () => ut.DEBUG_MODE >= 6;
const gt = (t, e) => {
  if (t.length !== e.length) return !1;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    const n = Object.keys(s);
    let o = !1;
    for (let t = 0; t < e.length; t++) {
      const r = e[t];
      const a = Object.keys(r);
      if (
        n.length === a.length &&
        n.every((t) => a.includes(t)) &&
        n.every((t) => s[t] === r[t])
      ) {
        o = !0;
        break;
      }
    }
    if (!o) return !1;
  }
  return !0;
};
const St = (t) =>
  new Promise((e) => {
    setTimeout(e, t);
  });
const wt = (t, e) => Object.assign(new Array(e).fill(null), t);
const {
  POSTGRES_HOST: Et,
  POSTGRES_PORT: Tt,
  POSTGRES_DB: Rt,
  POSTGRES_USER: vt,
  POSTGRES_PASSWORD: $t,
  DB_CONNECTION_RETRY_TIME: Ot,
} = ut;
const bt = {
  error: (t, e) => {
    if (e.cn) {
      const { host: r, port: s, database: n, user: o, password: a } = e.cn;
      ft.debug(
        `Waiting for db to start { message:${t.message} host:${r}, port:${s}, database:${n}, user:${o}, password: ${a}`
      );
    }
  },
  noWarnings: !0,
};
ht() &&
  ut.DEBUG_MODE > 0 &&
  (g.isAttached() ? g.detach() : (g.attach(bt), g.setTheme("matrix")));
const _t = h(bt)({
  host: Et,
  port: Tt,
  database: Rt,
  user: vt,
  password: $t,
  allowExitOnIdle: !0,
  idleTimeoutMillis: 100,
});
class Nt {
  static async select(t) {
    const e = new m({
      name: `OffChain.select.${Math.random()}`,
      text: 'SELECT "data" FROM "OffChain" WHERE "id" = $1',
      values: [t],
    });
    return _t.oneOrNone(e);
  }
  static async insert({ id: t, data: e }) {
    const r = new m({
      name: `OffChain.insert.${Math.random()}`,
      text: 'INSERT INTO "OffChain" ("id", "data") VALUES ($1, $2) ON CONFLICT DO NOTHING',
      values: [t, e],
    });
    return _t.none(r);
  }
  static async delete(t) {
    const e = new m({
      name: `OffChain.delete.${Math.random()}`,
      text: 'WITH deleted AS (DELETE FROM "OffChain" WHERE "id" = $1 RETURNING *) SELECT count(*) FROM deleted;',
      values: [t],
    });
    return (await _t.any(e))[0].count > 0;
  }
}
class Pt {
  static async select(t) {
    const e = await Nt.select(t);
    return (null == e ? void 0 : e.data) || null;
  }
  static async insert(t) {
    return Nt.insert(t);
  }
  static async delete(t) {
    return Nt.delete(t);
  }
}
const { crypto: xt } = y;
const Ct = r.Router();
Ct.get("/:id", async ({ params: { id: t }, url: e, method: r }, s) => {
  void 0 === s.locals.authToken &&
    (ft.error(`Authorization failed at ${r} ${e}.`),
    s.status(403).json({ error: `Authorization failed at ${r} ${e}.` }));
  try {
    const e = await Pt.select(t);
    e
      ? s.status(200).json(e)
      : s.status(403).json({ error: "No entry found." });
  } catch (t) {
    ft.error(`GET ${e} failed with error '${t.message}'`),
      s.status(500).json({ error: t.message });
  }
}),
  Ct.post("/", async (t, e) => {
    const {
      body: { data: r },
      url: s,
    } = t;
    try {
      const s = xt.Hash.sha256(Buffer.from(r)).toString("hex");
      await Pt.insert({ id: s, data: r });
      const n = `${t.protocol}://${t.get("host")}/store/${s}`;
      e.status(201).json({ _url: n });
    } catch (t) {
      ft.error(`POST ${s} failed with error '${t.message}'`),
        e.status(500).json({ error: t.message });
    }
  }),
  Ct.delete("/:id", async ({ params: { id: t }, url: e, method: r }, s) => {
    ht() ||
      (ft.error(`Authorization failed at ${r} ${e}.`),
      s.status(403).json({ error: `Authorization failed at ${r} ${e}.` }));
    try {
      (await Pt.delete(t))
        ? s.status(204).send()
        : s.status(403).json({ error: "No entry found." });
    } catch (t) {
      ft.error(`DELETE ${e} failed with error '${t.message}'`),
        s.status(500).json({ error: t.message });
    }
  });
class At {
  static async select() {
    return _t.one(
      'SELECT "syncedHeight", "bitcoindSyncedHeight", "bitcoindSyncedProgress" FROM "Sync"'
    );
  }
  static async update({
    syncedHeight: t,
    bitcoindSyncedHeight: e,
    bitcoindSyncedProgress: r,
  }) {
    const s = new m({
      name: `Sync.update.${Math.random()}`,
      text: 'UPDATE "Sync" SET "syncedHeight" = $1, "bitcoindSyncedHeight" = $2, "bitcoindSyncedProgress" = $3',
      values: [t, e, r],
    });
    await _t.any(s);
  }
}
var It = async () =>
  class {
    static async select() {
      return At.select();
    }
    static async update(t) {
      await At.update(t);
    }
  }.select();
const Ht = {
  protocol: ut.RPC_PROTOCOL,
  user: ut.RPC_USER,
  pass: ut.RPC_PASSWORD,
  host: ut.RPC_HOST,
  port: ut.RPC_PORT,
};
const jt = new w(Ht);
const Mt = {
  createwallet: E.promisify(w.prototype.createwallet.bind(jt)),
  generateToAddress: E.promisify(w.prototype.generateToAddress.bind(jt)),
  getaddressinfo: E.promisify(w.prototype.getaddressinfo.bind(jt)),
  getBlock: E.promisify(w.prototype.getBlock.bind(jt)),
  getBlockchainInfo: E.promisify(w.prototype.getBlockchainInfo.bind(jt)),
  getBlockHash: E.promisify(w.prototype.getBlockHash.bind(jt)),
  getRawTransaction: E.promisify(w.prototype.getRawTransaction.bind(jt)),
  getTransaction: E.promisify(w.prototype.getTransaction.bind(jt)),
  importaddress: E.promisify(w.prototype.importaddress.bind(jt)),
  listunspent: E.promisify(w.prototype.listunspent.bind(jt)),
  sendRawTransaction: E.promisify(w.prototype.sendRawTransaction.bind(jt)),
};
class Lt {
  static async select(t) {
    const e = new m({
      name: `Standard.select.${Math.random()}`,
      text: 'SELECT "address", "satoshis", "scriptPubKey", "rev" FROM "Standard" WHERE "address" = $1 AND "spent" = FALSE',
      values: [t],
    });
    return (await _t.any(e)).map((t) => ({
      ...t,
      satoshis: parseInt(t.satoshis, 10),
    }));
  }
  static async insert(t) {
    const e = t.flatMap((t) => [
      t.rev,
      t.address,
      t.satoshis,
      t.scriptPubKey,
      !1,
    ]);
    for (; e.length; ) {
      const t = e.splice(0, ut.POSTGRES_MAX_PARAM_NUM);
      const r = [];
      for (let e = 1; e <= t.length; e += 5)
        r.push(`($${e}, $${e + 1}, $${e + 2}, $${e + 3}, $${e + 4})`);
      const s = r.join(",");
      const n = new m({
        name: `Standard.insert.${Math.random()}`,
        text: `INSERT INTO "Standard"("rev", "address", "satoshis", "scriptPubKey", "spent") VALUES ${s}  ON CONFLICT DO NOTHING`,
        values: t,
      });
      await _t.none(n);
    }
  }
  static async update(t) {
    const e = t.flatMap((t) => [
      `${t.prevTxId.toString("hex")}/${t.outputIndex}`,
    ]);
    if (0 === e.length) return [];
    const r = [];
    for (let t = 1; t <= e.length; t += 1) r.push(`("rev" = $${t})`);
    const s = r.join(" OR ");
    const n = new m({
      name: `Standard.update.${Math.random()}`,
      text: `UPDATE "Standard" SET "spent" = TRUE WHERE ${s} RETURNING "rev"`,
      values: e,
    });
    return _t.any(n);
  }
  static async getBalance(t) {
    const e = new m({
      name: `Standard.getBalance.${Math.random()}`,
      text: 'SELECT SUM("satoshis") FROM "Standard" WHERE "address" = $1 AND "spent" = FALSE',
      values: [t],
    });
    const r = await _t.oneOrNone(e);
    return parseInt(null == r ? void 0 : r.sum, 10) || 0;
  }
}
class Bt {
  static async select(t) {
    return (await Lt.select(t)).map((t) => ({
      ...t,
      amount: t.satoshis / 1e8,
    }));
  }
  static async getBalance(t) {
    return Lt.getBalance(t);
  }
  static async insert(t) {
    const e = t.map((t) => ({
      rev: `${t.txId}/${t.outputIndex}`,
      address: t.address.toString("legacy"),
      satoshis: t.satoshis,
      scriptPubKey: t.script.toHex(),
      spent: !1,
    }));
    return Lt.insert(e);
  }
}
const { Script: Dt, Transaction: kt } = y;
const { Transaction: Ut } = y;
const { Input: Ft } = Ut;
class Gt {
  static async query(t) {
    const { publicKey: e, classHash: r } = t;
    if (void 0 === e && void 0 === r) return [];
    let s =
      'SELECT "rev"\n      FROM "NonStandard"\n      WHERE "spent" = FALSE';
    const n = [];
    e && (n.push(e), (s += ' AND $1 = ANY ("publicKeys")')),
      r && (n.push(r), (s += ` AND "classHash" = $${n.length}`));
    const o = new m({
      name: `NonStandard.query.${Math.random()}`,
      text: s,
      values: n,
    });
    return (await _t.any(o)).map((t) => t.rev);
  }
  static async insert({ id: t, rev: e, publicKeys: r, classHash: s }) {
    const n = new m({
      name: `NonStandard.insert.${Math.random()}`,
      text: 'INSERT INTO "NonStandard"("id", "rev", "publicKeys", "classHash", "spent") VALUES ($1, $2, $3, $4, FALSE) ON CONFLICT DO NOTHING',
      values: [t, e, r, s],
    });
    await _t.none(n);
  }
  static async update(t) {
    const e = new m({
      name: `NonStandard.update.${Math.random()}`,
      text: 'UPDATE "NonStandard" SET "spent" = TRUE WHERE "rev" = $1 AND "spent" = FALSE',
      values: [t],
    });
    return _t.none(e);
  }
  static async getRevsByIds(t) {
    const e = new m({
      name: `NonStandard.getRevsByIds.${Math.random()}`,
      text: 'SELECT "rev" FROM "NonStandard" WHERE "id" LIKE ANY($1) AND "spent" = FALSE',
      values: [[t]],
    });
    return _t.any(e);
  }
  static async select(t) {
    const e = new m({
      name: `NonStandard.select.${Math.random()}`,
      text: 'SELECT "id", "classHash" FROM "NonStandard" WHERE "rev" = $1',
      values: [t],
    });
    return _t.oneOrNone(e);
  }
}
class Wt {
  static async select(t) {
    return Gt.select(t);
  }
  static async query(t) {
    return Gt.query(t);
  }
  static async getRevsByIds(t) {
    return Gt.getRevsByIds(t);
  }
  static async insert(t) {
    return Gt.insert(t);
  }
  static async update(t) {
    return Gt.update(t);
  }
}
const { crypto: Kt } = y;
class Vt {
  static async getTransaction(t) {
    const { result: e } = await Mt.getTransaction(t);
    return e;
  }
  static async getBulkTransactions(t) {
    return (await Promise.all(t.map((t) => Mt.getRawTransaction(t)))).map(
      (t) => t.result
    );
  }
  static async sendRawTransaction(t) {
    const { result: e, error: r } = await Mt.sendRawTransaction(t);
    if (r) throw (ft.error(r), new Error("Error sending transaction"));
    return e;
  }
}
var Yt = async (t) => await Vt.getBulkTransactions(t);
const { Computer: Jt } = ut.TESTING
  ? require("@vivek-singh/lib-testing")
  : require("@vivek-singh/lib");
const { CHAIN: qt, NETWORK: zt, BCN_URL: Zt } = ut;
const Qt = new Jt({ chain: qt, network: zt, url: Zt });
const Xt = (t) =>
  t.tx.inputs
    .map((t) =>
      y.Transaction.Input.fromObject({ ...t, script: t._scriptBuffer })
    )
    .filter((t) => !t.isNull());
const te = async (t) => {
  const e = Xt(t);
  if (e.length > 0) {
    const r = await (async (t) => {
      const e = Xt(t);
      let r = [];
      return (
        e.length > 0 &&
          (r = await (async (t) => {
            const e = await class {
              static async areSpent(t) {
                return class {
                  static async areSpent(t) {
                    const e = t
                      .map(
                        (t) =>
                          `('${t.prevTxId.toString("hex")}/${t.outputIndex}')`
                      )
                      .join(",");
                    const r = new m({
                      name: `Utxos.areSpent.${Math.random()}`,
                      text: `SELECT "rev", "stSpent", "nstSpent" from "Utxos"  WHERE "rev" IN (${e})`,
                    });
                    return _t.any(r);
                  }
                }.areSpent(t);
              }
            }.areSpent(t);
            return e;
          })(e)),
        r
      );
    })(t);
    const s = e.flatMap((t) => {
      const e = `${t.prevTxId.toString("hex")}/${t.outputIndex}`;
      return r.some((t) => t.rev === e) ? [] : [t];
    });
    await Promise.all(
      s.map(async (t) => {
        try {
          ft.info(`Repairing input:${t.prevTxId.toString("hex")}`);
          const [e] = await Yt([t.prevTxId.toString("hex")]);
          const r = await Qt.db.fromTxHex(e);
          await te(r),
            ft.info(
              `Repaired successfully input:${t.prevTxId.toString("hex")}`
            );
        } catch (e) {
          ft.error(
            `Error on repair input:${t.prevTxId.toString("hex")}: ${e.message}`
          );
        }
      })
    );
  }
  await (async (t, e) => {
    const r = t.flatMap((t, r) => {
      const s = Dt.fromBuffer(t._scriptBuffer);
      const { PUBKEYHASH_OUT: n, SCRIPTHASH_OUT: o } = Dt.types;
      if (![n, o].includes(s.classify())) return [];
      const a = s.toAddress(ut.NETWORK).toString("legacy");
      const i = s.toHex();
      const c = t.satoshis / 1e8;
      const l = Math.round(t.satoshis);
      return [
        new kt.UnspentOutput({
          address: a,
          txId: e,
          outputIndex: r,
          scriptPubKey: i,
          amount: c,
          satoshis: l,
        }),
      ];
    });
    await Bt.insert(r);
  })(t.tx.outputs, t.txId),
    await (async (t) => {
      const e = t
        .map((t) => Ft.fromObject({ ...t, script: t._scriptBuffer }))
        .filter((t) => !t.isNull());
      return Lt.update(e);
    })(t.tx.inputs);
  const { inRevs: r = [], outRevs: s = [], outData: n = [] } = t;
  await (async (t, e, r) => {
    const s = Math.max(t.length, e.length);
    const n = wt(t, s);
    const o = wt(e, s);
    const a = ((i = o), n.map((t, e) => [t, i[e]]));
    var i;
    await Promise.all(
      a.map(async ([t, e], s) => {
        const { __cls: n = "", _owners: o = [] } = r[s] || {};
        if (null === t && e)
          return (
            /^[0-9A-Fa-f]{64}\/\d+$/.test(e),
            void (await Wt.insert({
              id: e,
              rev: e,
              publicKeys: o,
              classHash: Kt.Hash.sha256(Buffer.from(n)).toString("hex"),
            }))
          );
        if (e && t) {
          const { id: r = "", classHash: s = "" } = (await Wt.select(t)) || {};
          await Wt.insert({ id: r, classHash: s, rev: e, publicKeys: o }),
            await Wt.update(t);
        }
      })
    );
  })(r, s, n);
};
const ee = async (t) => {
  try {
    const e = t.toString("hex");
    ft.info(`ZMQ message { rawTx:${e} }`),
      "dev" === ut.BCN_ENV && l.appendFileSync("zmqlog.log", `${e} \r\n`);
    const r = await Qt.db.fromTxHex(e);
    try {
      await te(r);
    } catch (t) {
      ft.error(`Error parsing transaction ${t.message} ${t.stack}`);
    }
  } catch (t) {
    ft.error(`RawTxSubscriber failed with error '${t.message} ${t.stack}'`);
  }
};
var re = async (t) => Bt.select(t);
var se = async (t) => (
  void 0 === (await Mt.getaddressinfo(t)).result.timestamp &&
    (ft.info(`Importing address: ${t}`), await Mt.importaddress(t, !1)),
  (await Mt.listunspent(0, 999999, [t])).result
);
const ne = {
  protocol: ut.RPC_PROTOCOL,
  user: ut.RPC_USER,
  pass: ut.RPC_PASSWORD,
  host: ut.RPC_HOST,
  port: ut.RPC_PORT,
};
const oe = new w(ne);
const ae = {};
const ie = JSON.parse(JSON.stringify(w.callspec));
Object.keys(ie).forEach((t) => {
  ie[t.toLowerCase()] = ie[t];
});
const ce = {
  str: (t) => t.toString(),
  string: (t) => t.toString(),
  int: (t) => parseFloat(t),
  float: (t) => parseFloat(t),
  bool: (t) =>
    !0 === t ||
    "1" === t ||
    1 === t ||
    "true" === t ||
    "true" === t.toString().toLowerCase(),
  obj: (t) => ("string" == typeof t ? JSON.parse(t) : t),
};
try {
  Object.keys(w.prototype).forEach((t) => {
    if (t && "function" == typeof w.prototype[t]) {
      const e = t.toLowerCase();
      (ae[t] = E.promisify(w.prototype[t].bind(oe))),
        (ae[e] = E.promisify(w.prototype[e].bind(oe)));
    }
  });
} catch (t) {
  ft.error(`Error occurred while binding RPC methods: ${t.message}`);
}
const le = new T("secp256k1");
const de = r();
let ue;
try {
  ue = s.createServer(de);
} catch (t) {
  throw (ft.error(`Starting server failed with error '${t.message}'`), t);
}
if (
  (ft.info(`Server listening on port ${ut.PORT}`),
  de.use(e()),
  "dev" !== ut.BCN_ENV)
) {
  const t = o({
    windowMs: 9e5,
    max: 300,
    standardHeaders: !0,
    legacyHeaders: !1,
  });
  de.use(t);
}
de.use(t.json({ limit: "100mb" })),
  de.use(t.urlencoded({ limit: "100mb", extended: !0 })),
  de.use(async (t, e, r) => {
    try {
      const s = t.get("Authentication");
      if (!s) return void r();
      const n = ((t) => {
        const e = t.split(" ");
        if (2 !== e.length || "Bearer" !== e[0])
          throw new Error("Authentication header is invalid.");
        const r = Buffer.from(e[1], "base64").toString().split(":");
        if (3 !== r.length) throw new Error();
        return {
          signature: r[0],
          publicKey: r[1],
          timestamp: parseInt(r[2], 10),
        };
      })(s);
      const { signature: o, publicKey: a, timestamp: i } = n;
      if (Date.now() - i > 1e3 * ut.SIGNATURE_FRESHNESS_MINUTES * 60)
        return void e.status(401).json({ error: "Signature is too old." });
      const c = R.sha256()
        .update(ut.BCN_URL + i)
        .digest("hex");
      if (!le.keyFromPublic(a, "hex").verify(c, o))
        return void e
          .status(401)
          .json({
            error:
              "The origin and public key pair doesn't match the signature.",
          });
      (e.locals.authToken = n), r();
    } catch (t) {
      ft.error(`Auth failed with error '${t.message}'`),
        e.status(401).json({ error: t.message });
    }
  }),
  de.use(({ url: t }, e, r) => {
    if (void 0 !== e.locals.authToken)
      try {
        let t;
        try {
          const e = ht() ? "bcn.test.config.json" : "bcn.config.json";
          t = l.readFileSync(v.join(__dirname, "..", "..", e));
        } catch (t) {
          if (t.message.includes("ENOENT: no such file or directory"))
            return void r();
          throw (ft.error(`Access-list failed with error '${t.message}'`), t);
        }
        const { blacklist: s, whitelist: n } = JSON.parse(t.toString());
        if (s && n)
          return void e
            .status(403)
            .json({
              error: "Cannot enforce blacklist and whitelist at the same time.",
            });
        const { publicKey: o } = e.locals.authToken;
        if ((n && !n.includes(o)) || (s && s.includes(o)))
          return void e
            .status(403)
            .json({ error: `Public key ${o} is not allowed.` });
        r();
      } catch (r) {
        ft.error(`Authorization failed at ${t} with error: '${r.message}'`),
          e.status(403).json({ error: r.message });
      }
    else r();
  });
const pe = (() => {
  const t = r.Router();
  return (
    t.get("/wallet/:address/utxos", async ({ params: t, url: e }, r) => {
      try {
        const { address: e } = t;
        const s = await re(e);
        const n = s.map(({ satoshis: t, rev: e }) => {
          const [r, s] = e.split("/");
          return { amount: t / 1e8, txid: r, vout: parseInt(s, 10) };
        });
        if (mt()) {
          let t = [];
          let r = !1;
          let s = 10;
          do {
            try {
              (t = (await se(e)) || []), (r = !0);
            } catch (t) {
              ft.debug(`Retrying to get utxos '${t.message}'`),
                await St(1e3),
                (s -= 1);
            }
          } while (!r && s > 0);
          const o = t.map(({ amount: t, txid: e, vout: r }) => ({
            amount: t,
            txid: e,
            vout: r,
          }));
          gt(n, o) ||
            (ft.error(
              `Inconsistency on UTXO set calculation for address ${e}.`
            ),
            ft.error(
              `db utxos ${JSON.stringify(
                n,
                null,
                2
              )} rpc utxos ${JSON.stringify(o, null, 2)}`
            ),
            ft.error(
              `db utxos length ${n.length} rpc utxos length: ${o.length}`
            ));
        }
        r.status(200).json(s);
      } catch (t) {
        ft.error(`GET ${e} failed with error '${t.message}'`),
          r.status(404).json({ error: t.message });
      }
    }),
    t.get("/non-standard-utxos", async ({ query: t, url: e }, r) => {
      try {
        const e = await (async (t) => Wt.query(t))(t);
        r.status(200).json(e);
      } catch (t) {
        ft.error(`GET ${e} failed with error '${t.messages}'`),
          r.status(404).json({ error: t.message });
      }
    }),
    t.get("/address/:address/balance", async ({ params: t, url: e }, r) => {
      try {
        const { address: s } = t;
        const n = await re(s);
        const o = await (async (t) => Bt.getBalance(t))(s);
        const a = n.map(({ satoshis: t, rev: e }) => {
          const [r, s] = e.split("/");
          return { amount: t / 1e8, txid: r, vout: parseInt(s, 10) };
        });
        if (mt()) {
          let t = [];
          let r = !1;
          let n = 10;
          do {
            try {
              (t = (await se(s)) || []), (r = !0);
            } catch (t) {
              ft.debug(`Retrying ${e} getStandardUtxosAction: ${t.message}`),
                await St(1e3),
                (n -= 1);
            }
          } while (!r && n > 0);
          const i = 1e8 * t.reduce((t, e) => t + e.amount, 0);
          const c = t.map(({ amount: t, txid: e, vout: r }) => ({
            amount: t,
            txid: e,
            vout: r,
          }));
          (o === Math.round(i) && gt(a, c)) ||
            (ft.error(
              `Inconsistency on balance calculation for address ${s}: dbBalance ${o} rpcBalance: ${i}`
            ),
            ft.error(`db utxos ${a}`),
            ft.error(`rpc utxos: ${JSON.stringify(a)}`));
        }
        r.status(200).json(o);
      } catch (t) {
        ft.error(`GET ${e} failed with error '${t.message}'`),
          r.status(404).json({ error: t.message });
      }
    }),
    t.post("/tx/bulk", async ({ body: { txIds: t }, url: e }, r) => {
      try {
        if (void 0 === t || 0 === t.length)
          return void r.status(500).json({ error: "Missing input txIds." });
        const e = await Yt(t);
        e ? r.status(200).json(e) : r.status(404).json({ error: "Not found" });
      } catch (t) {
        ft.error(`POST ${e} failed with error '${t.message}'`),
          r.status(500).json({ error: t.message });
      }
    }),
    t.post("/tx/send", async ({ body: { rawTx: t }, url: e }, r) => {
      try {
        const e = await (async (t) => Vt.sendRawTransaction(t))(t);
        await ee(t), r.status(200).json(e);
      } catch (t) {
        ft.error(`POST ${e} failed with error '${t.message}'`),
          r.status(500).json({ error: t.message });
      }
    }),
    t.post("/revs", async ({ body: { ids: t }, url: e }, r) => {
      try {
        if (void 0 === t || 0 === t.length)
          return void r
            .status(404)
            .json({ error: "Missing input object ids." });
        const e = await (async (t) =>
          (await Wt.getRevsByIds(t)).map((t) => t.rev))(t);
        r.status(200).json(e);
      } catch (t) {
        ft.error(`POST ${e} failed with error '${t.message}'`),
          r.status(404).json({ error: t.message });
      }
    }),
    t.post("/rpc", async ({ body: t, url: e }, r) => {
      try {
        if (!t || !t.method)
          throw new Error("Please provide appropriate RPC method name");
        if (!ut.ALLOWED_RPC_METHODS.some((e) => e.test(t.method)))
          throw new Error("Method is not allowed");
        const e = (function (t, e) {
          if (void 0 === ie[t] || null === ie[t])
            throw new Error("This RPC method does not exist, or not supported");
          const r = e.trim().split(" ");
          const s = ie[t].trim().split(" ");
          if (0 === e.trim().length && 0 !== ie[t].trim().length)
            throw new Error(
              `Too few params provided. Expected ${s.length} Provided 0`
            );
          if (0 !== e.trim().length && 0 === ie[t].trim().length)
            throw new Error(
              `Too many params provided. Expected 0 Provided ${r.length}`
            );
          if (r.length < s.length)
            throw new Error(
              `Too few params provided. Expected ${s.length} Provided ${r.length}`
            );
          if (r.length > s.length)
            throw new Error(
              `Too many params provided. Expected ${s.length} Provided ${r.length}`
            );
          return 0 === e.length ? [] : r.map((t, e) => ce[s[e]](t));
        })(t.method, t.params);
        const s = e.length ? await ae[t.method](...e) : await ae[t.method]();
        return void r.status(200).json({ result: s });
      } catch (t) {
        ft.error(`POST ${e} failed with error '${t.message}'`),
          r.status(404).json({ error: t.message });
      }
    }),
    t.post("/non-standard-utxo", async (t, e) => {
      e.status(500).json({
        error:
          "Please upgrade to @vivek-singh/lib-testing@0.7.7.0-beta or greater.",
      });
    }),
    t.get("/tx/:txId", async ({ params: t }, e) => {
      const { txId: r } = t;
      const [s] = await Yt([r]);
      s ? e.status(200).json(s) : e.status(404).json({ error: "Not found" });
    }),
    t
  );
})();
de.use(`/v1/${ut.CHAIN}/${ut.NETWORK}`, pe),
  de.use("/v1/store", Ct),
  de.get("/", (t, e) => e.status(200).send("OK")),
  de.get("/health", (t, e) => e.status(200).send("healthy")),
  de.get("/version", (t, e) => e.status(200).send(ut.SERVER_VERSION)),
  ue.listen(ut.PORT, () => {
    ft.info(`Rev ${ut.SERVER_VERSION} Started web server on port ${ut.PORT}`);
  });
const fe = new n.Subscriber();
fe.connect(ut.ZMQ_URL),
  fe.subscribe("rawtx"),
  ft.info(`ZMQ Subscriber connected to ${ut.ZMQ_URL}`),
  (async () => {
    await (async () => {
      await S(() => _t.connect(), { startingDelay: Ot });
    })(),
      await (async (t) => {
        try {
          await (async () => {
            try {
              await Mt.createwallet(ut.DEFAULT_WALLET);
            } catch (t) {
              ft.debug(`Wallet creation failed with error '${t.message}'`);
            }
          })(),
            "regtest" !== ut.NETWORK &&
              (await (async () => {
                let t = -1;
                let e = -1;
                let r = 0;
                ft.info("Checking sync progress...syncedHeight: -1 from -1");
                do {
                  ({
                    syncedHeight: t,
                    bitcoindSyncedHeight: e,
                    bitcoindSyncedProgress: r,
                  } = await It()),
                    t > 0
                      ? ft.info(
                          `Sync progress ${t}/${e} blocks [${(
                            (t / e) *
                            100
                          ).toFixed(4)}% (bitcoind progress: ${(
                            100 * r
                          ).toFixed(4)}%)]`
                        )
                      : ft.info(
                          `Sync progress initializing... ${t}/${e} blocks `
                        ),
                    await St(ut.SYNC_INTERVAL_CHECK);
                } while (t < e || r < 0.999);
                ft.info(
                  `BCN reaches sync end...currentBlockHeight: ${t} from ${e} (chain progress: ${(
                    100 * r
                  ).toFixed(4)})`
                );
              })()),
            ut.TESTING
              ? ft.info(
                  `Bitcoin Computer Node is ready on testing ${ut.SERVER_VERSION}`
                )
              : ft.info(`Bitcoin Computer Node is ready ${ut.SERVER_VERSION}`);
          for await (const [, e] of t) await ee(e);
        } catch (t) {
          ft.error(`ZMQ subscription failed with error '${t.message}'`);
        }
      })(fe);
  })();
