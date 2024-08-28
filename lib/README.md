# lfp-wc

LFP Web Components are an ever-growing collection of small and useful web components; easy to style and fast to write.

## Installation

Using npm:

```shell
$ npm i -D @lowfatprophet/lfp-wc
```

## Usage

As soon as you've added the package to your project, you're ready to go. Each web component is self-contained without any dependencies outside of this package. As such, bundling with [Rollup](https://rollupjs.org), [Parcel](https://parceljs.org) or [Webpack](https://webpack.js.org) is a breeze and bundle sizes remain conveniently small.

### Usage in HTML

Example usage of the table of contents component included with the package.
```html
<script type="module">
  import '@lowfatprophet/lfp-wc/ToC';
</script>
<lfp-toc toc-root="#article" set-id></lfp-toc>
```

That's it.

### Usage in JavaScript

```ts
import '@lowfatprophet/lfp-wc/Tablist';

document.querySelector('main')!.innerHTML += `<lfp-tablist>${APIResponse.reduce(
  (pv, cv) => pv + `<section tab-description="${cv.title}">${cv.content}</section>`, ''
)}</lfp-tablist>`;
```