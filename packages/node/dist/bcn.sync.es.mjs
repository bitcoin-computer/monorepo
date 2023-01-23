import{backOff as t}from"exponential-backoff";import{Computer as e}from"@bitcoin-computer/lib";import s from"dotenv";import n from"is-primitive";import r from"is-plain-object";import a from"fs";import o from"os";import{dirname as i}from"path";import{fileURLToPath as c}from"url";import{format as l,createLogger as p,transports as d}from"winston";import u from"bitcoind-rpc";import y from"util";import f from"pg-promise";import m from"pg-monitor";import h from"@bitcoin-computer/bitcore-lib-ltc";const{deleteProperty:g}=Reflect;const w=n;const S=r;const v=t=>"object"==typeof t&&null!==t||"function"==typeof t;const $=t=>{if(!w(t))throw new TypeError("Object keys must be strings or symbols");if((t=>"__proto__"===t||"constructor"===t||"prototype"===t)(t))throw new Error(`Cannot set unsafe key: "${t}"`)};const E=(t,e)=>e&&"function"==typeof e.split?e.split(t):"symbol"==typeof t?[t]:Array.isArray(t)?t:((t,e,s)=>{const n=(t=>Array.isArray(t)?t.flat().map(String).join(","):t)(e?((t,e)=>{if("string"!=typeof t||!e)return t;let s=t+";";return void 0!==e.arrays&&(s+=`arrays=${e.arrays};`),void 0!==e.separator&&(s+=`separator=${e.separator};`),void 0!==e.split&&(s+=`split=${e.split};`),void 0!==e.merge&&(s+=`merge=${e.merge};`),void 0!==e.preservePaths&&(s+=`preservePaths=${e.preservePaths};`),s})(t,e):t);$(n);const r=O.cache.get(n)||s();return O.cache.set(n,r),r})(t,e,(()=>((t,e={})=>{const s=e.separator||".";const n="/"!==s&&e.preservePaths;if("string"==typeof t&&!1!==n&&/\//.test(t))return[t];const r=[];let a="";const o=t=>{let e;""!==t.trim()&&Number.isInteger(e=Number(t))?r.push(e):r.push(t)};for(let e=0;e<t.length;e++){const n=t[e];"\\"!==n?n!==s?a+=n:(o(a),a=""):a+=t[++e]}return a&&o(a),r})(t,e)));const b=(t,e,s,n)=>{if($(e),void 0===s)g(t,e);else if(n&&n.merge){const r="function"===n.merge?n.merge:Object.assign;r&&S(t[e])&&S(s)?t[e]=r(t[e],s):t[e]=s}else t[e]=s;return t};const O=(t,e,s,n)=>{if(!e||!v(t))return t;const r=E(e,n);let a=t;for(let t=0;t<r.length;t++){const e=r[t];const o=r[t+1];if($(e),void 0===o){b(a,e,s,n);break}"number"!=typeof o||Array.isArray(a[e])?(v(a[e])||(a[e]={}),a=a[e]):a=a[e]=[]}return t};O.split=E,O.cache=new Map,O.clear=()=>{O.cache=new Map};var R=O;var T=a;var N="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};var I="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};var _=function(){function t(t,e){for(var s=0;s<e.length;s++){var n=e[s];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,s,n){return s&&t(e.prototype,s),n&&t(e,n),e}}();var H=function t(e,s){var n=s.indexOf(".");if(!~n){if(null==e)return;return e[s]}var r=s.substring(0,n),a=s.substring(n+1);if(null!=e)return e=e[r],a?t(e,a):e},A=R,k=function(t,e){if("function"!=typeof e)return JSON.parse(T.readFileSync(t));T.readFile(t,"utf-8",(function(t,s){try{s=JSON.parse(s)}catch(e){t=t||e}e(t,s)}))},x=a,M=o;var C=function(){function t(e,s){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.options=s=s||{},s.stringify_width=s.stringify_width||2,s.stringify_fn=s.stringify_fn||null,s.stringify_eol=s.stringify_eol||!1,s.ignore_dots=s.ignore_dots||!1,this.path=e,this.data=this.read()}return _(t,[{key:"set",value:function(t,e,s){var n=this;return"object"===(void 0===t?"undefined":I(t))?function(t,e){var s=0,n=[];if(Array.isArray(t))for(;s<t.length&&!1!==e(t[s],s);++s);else if("object"===(void 0===t?"undefined":N(t))&&null!==t)for(n=Object.keys(t);s<n.length&&!1!==e(t[n[s]],n[s]);++s);}(t,(function(t,e){A(n.data,e,t,s)})):this.options.ignore_dots?this.data[t]=e:A(this.data,t,e,s),this.options.autosave&&this.save(),this}},{key:"get",value:function(t){return t?this.options.ignore_dots?this.data[t]:H(this.data,t):this.toObject()}},{key:"unset",value:function(t){return this.set(t,void 0)}},{key:"append",value:function(t,e){var s=this.get(t);if(s=void 0===s?[]:s,!Array.isArray(s))throw new Error("The data is not an array!");return s.push(e),this.set(t,s),this}},{key:"pop",value:function(t){var e=this.get(t);if(!Array.isArray(e))throw new Error("The data is not an array!");return e.pop(),this.set(t,e),this}},{key:"read",value:function(t){if(!t)try{return k(this.path)}catch(t){return{}}k(this.path,(function(e,s){t(null,s=e?{}:s)}))}},{key:"write",value:function(t,e){return e?x.writeFile(this.path,t,e):x.writeFileSync(this.path,t),this}},{key:"empty",value:function(t){return this.write("{}",t)}},{key:"save",value:function(t){var e=JSON.stringify(this.data,this.options.stringify_fn,this.options.stringify_width,this.options.stringify_eol);return this.write(this.options.stringify_eol?e+M.EOL:e,t),this}},{key:"toObject",value:function(){return this.data}}]),t}();s.config();const P=new C(`${i(c(import.meta.url))}/../../package.json`,{stringify_eol:!0});const{PORT:B,ZMQ_URL:F,CHAIN:L,NETWORK:D,BCN_ENV:W,BCN_URL:K,DEBUG_MODE:j,POSTGRES_USER:G,POSTGRES_PASSWORD:U,POSTGRES_DB:Y,POSTGRES_HOST:V,POSTGRES_PORT:q,RPC_PROTOCOL:z,RPC_USER:J,RPC_PASSWORD:X,RPC_HOST:Z,RPC_PORT:Q,SERVER_VERSION:tt,DEFAULT_WALLET:et,SYNC_INTERVAL_CHECK:st,POSTGRES_MAX_PARAM_NUM:nt,DB_CONNECTION_RETRY_TIME:rt,SIGNATURE_FRESHNESS_MINUTES:at,ALLOWED_RPC_METHODS:ot,NODE_MAX_PROGRESS:it,SYNC_MAX_PROGRESS:ct,MAX_BLOCKCHAIN_HEIGHT:lt,MWEB_HEIGHT:pt,BC_START_HEIGHT:dt,WORKER_ID:ut,NUM_WORKERS:yt,SYNC_NON_STANDARD:ft,ZMQ_WAIT_PERCENTAGE:mt}=process.env;const ht=L||"LTC";const gt=D||"regtest";const wt=W||"dev";const St=K||"http://127.0.0.1:3000";const vt=parseInt(j,10)||1;const $t=G||"bcn";const Et=U||"bcn";const bt=Y||"bcn";const Ot=V||"127.0.0.1";const Rt=parseInt(q,10)||"5432";const Tt=z||"http";const Nt=J||"bcn-admin";const It=X||"kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A=";const _t=Z||"node";const Ht=parseInt(Q,10)||19332;tt||P.get("version");const At=parseInt(nt,10)||1e4;const kt=parseInt(rt,10)||500;!ot||ot.split(",").map((t=>new RegExp(t)));const xt=parseInt(dt||"",10)||25e5;const Mt=parseInt(ut,10)||1;const Ct=parseInt(yt||"",10)||1;const Pt="true"===ft||!1;const Bt=l.combine(l.timestamp({format:"MM-DD-YYYY HH:mm:ss"}),l.printf((t=>`[${t.timestamp}] [${t.level}] ${t.message}`)));const Ft=p({level:["error","warn","info","http","verbose","debug","silly"][vt],format:Bt,transports:[new d.Console({format:Bt})],exceptionHandlers:[new d.File({filename:"logs/exceptions.log"})],rejectionHandlers:[new d.File({filename:"logs/rejections.log"})]});const Lt={maxFiles:1,maxSize:1e5};vt>=0&&Ft.add(new d.File({filename:"error.log",level:"error"})),vt>=1&&Ft.add(new d.File({filename:"logs/warn.log",level:"warn",...Lt})),vt>=2&&Ft.add(new d.File({filename:"logs/info.log",level:"info",...Lt})),vt>=3&&Ft.add(new d.File({filename:"logs/http.log",level:"http",...Lt})),vt>=4&&Ft.add(new d.File({filename:"logs/verbose.log",level:"verbose",...Lt})),vt>=5&&Ft.add(new d.File({filename:"logs/debug.log",level:"debug",...Lt}));const Dt=new u({protocol:Tt,user:Nt,pass:It,host:_t,port:Ht});const Wt=y.promisify(u.prototype.createwallet.bind(Dt));const Kt=y.promisify(u.prototype.generateToAddress.bind(Dt));const jt=y.promisify(u.prototype.getaddressinfo.bind(Dt));const Gt=y.promisify(u.prototype.getBlock.bind(Dt));const Ut=y.promisify(u.prototype.getBlockchainInfo.bind(Dt));const Yt=y.promisify(u.prototype.getBlockHash.bind(Dt));const Vt=y.promisify(u.prototype.getRawTransaction.bind(Dt));const qt=y.promisify(u.prototype.getTransaction.bind(Dt));const zt=y.promisify(u.prototype.getNewAddress.bind(Dt));const Jt={createwallet:Wt,generateToAddress:Kt,getaddressinfo:jt,getBlock:Gt,getBlockchainInfo:Ut,getBlockHash:Yt,getRawTransaction:Vt,getTransaction:qt,importaddress:y.promisify(u.prototype.importaddress.bind(Dt)),listunspent:y.promisify(u.prototype.listunspent.bind(Dt)),sendRawTransaction:y.promisify(u.prototype.sendRawTransaction.bind(Dt)),getNewAddress:zt,sendToAddress:y.promisify(u.prototype.sendToAddress.bind(Dt))};const Xt={error:(t,e)=>{if(e.cn){const{host:s,port:n,database:r,user:a,password:o}=e.cn;Ft.debug(`Waiting for db to start { message:${t.message} host:${s}, port:${n}, database:${r}, user:${a}, password: ${o}`)}},noWarnings:!0};"dev"===wt&&vt>0&&(m.isAttached()?m.detach():(m.attach(Xt),m.setTheme("matrix")));const Zt=f(Xt)({host:Ot,port:Rt,database:bt,user:$t,password:Et,allowExitOnIdle:!0,idleTimeoutMillis:100});const{PreparedStatement:Qt}=f;class te{static async select(t){const e=new Qt({name:`SyncStatus.select.${Math.random()}`,text:'SELECT "syncedHeight" FROM "SyncStatus" WHERE "workerId" = $1',values:[t]});return Zt.one(e)}static async update({syncedHeight:t,workerId:e}){const s=new Qt({name:`SyncStatus.update.${Math.random()}`,text:'UPDATE "SyncStatus" SET "syncedHeight" = $1 WHERE "workerId" = $2',values:[t,e]});await Zt.any(s)}static async insert({syncedHeight:t,workerId:e}){const s=new Qt({name:`SyncStatus.insert.${Math.random()}`,text:'INSERT INTO  "SyncStatus"("syncedHeight","workerId") VALUES ($1, $2) ON CONFLICT DO NOTHING',values:[t,e]});await Zt.any(s)}}class ee{static async select(t){return te.select(t)}static async update(t){await te.update(t)}static async insert(t){await te.insert(t)}}class se{static updateSync=async t=>ee.update(t);static selectSync=async t=>ee.select(t);static insertSync=async t=>ee.insert(t)}const{PreparedStatement:ne}=f;class re{static async query(t){const{publicKey:e,classHash:s,limit:n,offset:r,order:a}=t;if(void 0===e&&void 0===s)return[];if(a&&"ASC"!==a&&"DESC"!==a)throw new Error("Invalid order");let o='SELECT "rev"\n      FROM "NonStandard"\n      WHERE true ';const i=[];e&&(i.push(e),o+=` AND $${i.length} = ANY ("publicKeys")`),s&&(i.push(s),o+=` AND "classHash" = $${i.length}`),a&&(o+=` order by "lastUpdated" ${a}`),n&&(i.push(n),o+=` limit $${i.length}`),r&&(i.push(r),o+=` offset $${i.length}`);const c=new ne({name:`NonStandard.query.${Math.random()}`,text:o,values:i});return(await Zt.any(c)).map((t=>t.rev))}static async insert({id:t,rev:e,publicKeys:s,classHash:n}){const r=new ne({name:`NonStandard.insert.${Math.random()}`,text:'INSERT INTO "NonStandard"("id", "rev", "publicKeys", "classHash") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',values:[t,e,s,n]});await Zt.none(r)}static async update({id:t,rev:e,publicKeys:s}){const n=new ne({name:`NonStandard.update.${Math.random()}`,text:'UPDATE "NonStandard" SET "rev"=$2, "publicKeys"=$3 WHERE "id" = $1',values:[t,e,s]});return Zt.none(n)}static async getRevsByIds(t){const e=new ne({name:`NonStandard.getRevsByIds.${Math.random()}`,text:'SELECT "rev" FROM "NonStandard" WHERE "id" LIKE ANY($1)',values:[[t]]});return Zt.any(e)}static async select(t){const e=new ne({name:`NonStandard.select.${Math.random()}`,text:'SELECT "id", "classHash" FROM "NonStandard" WHERE "rev" = $1',values:[t]});return Zt.oneOrNone(e)}}class ae{static async select(t){return re.select(t)}static async query(t){return re.query(t)}static async getRevsByIds(t){return re.getRevsByIds(t)}static async insert(t){return re.insert(t)}static async update(t){return re.update(t)}}const{crypto:oe}=h;class ie{static add=async t=>{const{zip:e,outData:s}=t;await Promise.all(e.map((async([t,e],n)=>{const{exp:r="",_owners:a=[]}=s[n]||{};if(null===t&&e)return/^[0-9A-Fa-f]{64}\/\d+$/.test(e),void await ae.insert({id:e,rev:e,publicKeys:a,classHash:oe.Hash.sha256(Buffer.from(r)).toString("hex")});if(e&&t){const{id:s,classHash:n}=await ae.select(t)||{};await ae.update({id:s,rev:e,publicKeys:a,classHash:n})}})))};static query=async t=>ae.query(t);static getRevsByIds=async t=>(await ae.getRevsByIds(t)).map((t=>t.rev))}const{PreparedStatement:ce}=f;class le{static async select(t){const e=new ce({name:`Input.select.${Math.random()}`,text:'SELECT "rev" FROM "Input" WHERE "rev" = $1',values:[t]});return Zt.any(e)}static async insert(t){const e=t.flatMap((t=>[t.rev]));for(;e.length;){const t=e.splice(0,At);const s=[];for(let e=1;e<=t.length;e+=1)s.push(`($${e})`);const n=s.join(",");const r=new ce({name:`Input.insert.${Math.random()}`,text:`INSERT INTO "Input"("rev") VALUES ${n} ON CONFLICT DO NOTHING`,values:t});await Zt.none(r)}}static async count(t){const e=t.map((t=>t.rev));const s=new ce({name:`Input.belong.${Math.random()}`,text:'SELECT count(*) FROM "Input" WHERE "rev" LIKE ANY ($1)',values:[[e]]});const n=await Zt.oneOrNone(s);return parseInt(n?.count,10)||0}}class pe{static async select(t){return le.select(t)}static async insert(t){return le.insert(t)}}const{Transaction:de}=h;const{Input:ue}=de;class ye{static getNonCoinbaseRevs=t=>t.map((t=>ue.fromObject({...t,script:t._scriptBuffer}))).filter((t=>!t.isNull())).map((({prevTxId:t,outputIndex:e})=>({rev:`${t.toString("hex")}/${e}`})));static insert=async t=>pe.insert(this.getNonCoinbaseRevs(t))}const{PreparedStatement:fe}=f;class me{static async select(t){const e=new fe({name:`Output.select.${Math.random()}`,text:'SELECT "address", "satoshis", "scriptPubKey", "rev" FROM "Output" WHERE "address" = $1',values:[t]});return Zt.any(e)}static async insert(t){const e=t.flatMap((t=>[t.rev,t.address,t.satoshis,t.scriptPubKey]));for(;e.length;){const t=e.splice(0,At);const s=[];for(let e=1;e<=t.length;e+=4)s.push(`($${e}, $${e+1}, $${e+2}, $${e+3})`);const n=s.join(",");const r=new fe({name:`Output.insert.${Math.random()}`,text:`INSERT INTO "Output"("rev", "address", "satoshis", "scriptPubKey") VALUES ${n}  ON CONFLICT DO NOTHING`,values:t});await Zt.none(r)}}}class he{static async select(t){return me.select(t)}static async insert(t){return me.insert(t)}}class ge{static insert=async t=>{const e=t.flatMap((t=>t.tx.outputs.map(((e,s)=>{const{script:n}=e;let r="false";!1===n.isMultisigOut()&&(r=n.toAddress(gt).toString("legacy")),"false"===r&&(r=null);const a=n.toHex();const o=Math.round(e.satoshis);return{address:r,rev:`${t.txId}/${s}`,scriptPubKey:a,satoshis:o}}))));return he.insert(e)}}const we=new e({chain:ht,network:gt,url:St});class Se{static waitForBlock=async e=>{await t((async()=>{Ft.info(`Sync workerId ${Mt}: waiting for block ${e} ...`),await Jt.getBlockHash(e)}),{startingDelay:3e4,timeMultiple:1,numOfAttempts:720}),Ft.info(`Node is ready. Starting Sync actions for worker ${Mt}`)};static syncBlock=async t=>{const{result:e}=await Jt.getBlockHash(t);const{result:s}=await Jt.getBlock(e,2);const{tx:n}=s;Ft.info(`Backfilling progress ${t} Backfilling ${n.length} transactions...`);const r=await Promise.allSettled(n.map((t=>we.txFromHex({hex:t.hex}))));const a=r.filter((t=>"fulfilled"===t.status)).map((t=>t.value));const o=r.filter((t=>"rejected"===t.status)).map((t=>t.reason));var i,c;o.length&&Ft.error(`Failed to parse ${o.length} transactions of block num ${t}: ${o.map((t=>t)).join(", ")}\n        Failed txs: ${i=n.map((t=>t.id)),c=a.map((t=>t.tx.id)),i.filter((t=>-1===c.indexOf(t)))}`),await this.syncTxs(a,t)};static sync=async(t,e,s,n)=>{try{let r=e;const a=await se.selectSync(t);for(a.syncedHeight>e&&(r=a.syncedHeight+s),Ft.info(`Starting sync process { initialBlock: ${e} increment: ${s} nonStandard: ${n} syncedHeight:${a.syncedHeight}, currentBlockHeight:${r} }`);n||r<xt;)try{await this.syncBlock(r),await se.updateSync({syncedHeight:r,workerId:t}),r+=s}catch(t){t.message.includes("out of range")||Ft.error(`Syncing block num ${r} failed with error '${t.message}'`)}}catch(t){Ft.error(`Sync action failed with error '${t.message}'`)}};static syncTxs=async(t,e)=>{try{await ge.insert(t),await ye.insert(t.flatMap((t=>t.tx.inputs))),e>=xt&&t.map((async t=>{try{t.isBcTx(ht,gt)&&await ie.add(t)}catch(e){Ft.error(`Failed to add non-standard tx ${t.tx.txid} ${e.message}`)}}))}catch(t){Ft.error(`Processing block ${e} failed with error '${t.message}'`)}};static register=async t=>{try{await se.insertSync({syncedHeight:-1,workerId:t}),Ft.info(`Register workerId: '${t}'`)}catch(t){Ft.error(`Register action failed with error '${t.message}'`)}}}!function(){try{const e=`Synchronizing { nonStandard:${Pt} url: ${St}, chain:${ht} network:${gt} numWorkers: ${Ct} workerId: ${Mt} }`;Ft.info(e),"regtest"!==gt&&(async()=>{await(async()=>{await t((()=>Zt.connect()),{startingDelay:kt})})(),await Se.register(Mt),Pt?(await Se.waitForBlock(xt),await Se.sync(Mt,xt,1,Pt)):(await Se.waitForBlock(Mt),await Se.sync(Mt,Mt,Ct,!1))})()}catch(t){Ft.error(`Synchronizing failed with error '${t.message}'`)}}();