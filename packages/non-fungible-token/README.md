# Non-Fungible Token Application

A minimal application for creating and sharing tokens. You can create a new artwork token and send it to a friend. The screen refreshes every few seconds to show the tokens owned by each user. Build using [Bitcoin|Computer](https://bitcoin-computer.gitbook.io/docs/).

![app image](/public/screen-shot.png)


The application first creates a Computer object. You can configure the parameters to use <em>regtest</em> (local) or <em>testnet</em> network modes. You can use a set of [BIP39 words] (https://iancoleman.io/bip39/) as seed.


```javascript
const [config] = useState({
    chain: 'LTC',
    network: 'testnet',
    url: 'https://node.bitcoincomputer.io',
    // to run locally, change network and url:
    // network: 'regtest',
    // url: 'http://127.0.0.1:3000',
  });
  const [computer, setComputer] = useState(
    new Computer({
      ...config,
      seed: 'travel upgrade inside soda birth essence junk merit never twenty system opinion'
    })
  );
```

You can find more information in the [docs](https://bitcoin-computer.gitbook.io/docs/). Also check out the corresponding [Youtube tutorial](https://www.youtube.com/watch?v=SnTwevzmRrs).

<a href="http://www.youtube.com/watch?feature=player_embedded&v=SnTwevzmRrs
" target="_blank"><img src="http://img.youtube.com/vi/SnTwevzmRrs/0.jpg"
alt="IMAGE ALT TEXT HERE" width="300" border="10" /></a>
