<div align="center">
  <h1>Bitcoin Computer Design System</h1>
  <p>
    Brand book and machine-readable design system, v1.0.0 (2026-09-22)
    <br />
    <a href="https://www.bitcoincomputer.io/">website</a> &#183; <a href="https://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

[`index.html`](./index.html) is the whole package. It is the brand book for people and the specification for build tools. Nothing in the file is loaded from the network. Logos and the Formular webfonts are embedded.

The specification inside the file is version 1.0.0, dated 2026-09-22. The `package.json` version follows the monorepo release.

## Where the data is

| Location | Contents |
| --- | --- |
| `script#bc-design-system` | The specification, as JSON. If the prose and the JSON disagree, the JSON wins. |
| `style#bc-fonts` | `@font-face` rules for Formular Regular, Italic, Bold, and Mono |
| `style#bc-tokens` | Colors, roles, spacing, radius, and layout, for light and dark |
| `style#bc-components` | Reference component CSS. Class prefix `bc-` |
| `style#bc-book` | Styles for this document only |
| `[data-asset]` | Previews and download links for each embedded asset |

Parse the JSON with `document.getElementById('bc-design-system').textContent`. Without a DOM, take the text from the end of the opening `script` tag whose id is `bc-design-system` up to the next `</script>`.

## Preview

Open `index.html` in a browser, or from this directory:

```sh
npm start
```

Then open [http://127.0.0.1:4174](http://127.0.0.1:4174).

## Using it from another package

The [website](../website) copies `#bc-fonts`, `#bc-tokens`, and `#bc-components` into its own `index.html`. Those three blocks are the shared system. Page layout stays in the page.

Product pages pick colors by role (`tokens.roles`), use the type scale, and follow `rules.do`, `rules.dont`, and `rules.website` in the JSON. Ready-to-paste CSS, a Tailwind config, and a flowbite-react theme are in `code`.

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

Formular is a commercial typeface by Brownfox (Gayane Bagdasaryan and Vyacheslav Kirilenko). The embedded files are the Regular, Italic, Bold, and Mono webfonts. Public web use requires a web license from [brownfox.org](https://brownfox.org/fonts/formular/).

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
