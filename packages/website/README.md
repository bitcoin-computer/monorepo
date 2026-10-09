<div align="center">
  <h1>Bitcoin Computer Website</h1>
  <p>
    The official Bitcoin Computer website
    <br />
    <a href="https://www.bitcoincomputer.io/">website</a> &#183; <a href="https://docs.bitcoincomputer.io/">docs</a> &#183; <a href="../design-system/">design system</a>
  </p>
</div>

The page is [`index.html`](./index.html). Logos and the Formular webfonts are embedded. Screenshots live in [`images/`](./images) and load as the reader reaches them.

The font, color, and component style blocks (`#bc-fonts`, `#bc-tokens`, `#bc-components`) are copied from the [design system](../design-system). That package is the source for those blocks. The `#page` style block belongs to this page.

## Preview

Open `index.html` in a browser, or from this directory:

```sh
npm start
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Deploy

Follow [deploy.md](./deploy.md). Publishing happens by merging into main and running the deploy script, which publishes `index.html` to GitHub Pages.

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

The page embeds Formular Regular, Italic, Bold, and Mono, a commercial typeface by Brownfox (Gayane Bagdasaryan and Vyacheslav Kirilenko). Public web use of those files requires a web license from [brownfox.org](https://brownfox.org/fonts/formular/).

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
