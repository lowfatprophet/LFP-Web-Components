# lfp-wc

LFP Web Components are an ever-growing collection of small and useful web components; easy to style and fast to write.

## Installation

Using npm:

```shell
$ npm i -D @lowfatprophet/lfp-wc
```

## Usage

As soon as you've added the package to your project, you're ready to go. Each web component is self-contained without any dependencies outside of this package. As such, bundling with [Rollup](https://rollupjs.org), [Parcel](https://parceljs.org) or [Webpack](https://webpack.js.org) is a breeze and bundle sizes remain conveniently small.

Keep in mind that you would have to update automatic path completion if you are working with pure TypeScript (see [documentation](https://www.typescriptlang.org/tsconfig/#paths)).

### HTML

All web components can work for themselves and do not have any dependencies, neither for development or building nor for production.

Example usage of the table of contents component included with the package.
```html
<script type="module">
  // import { ToC } from '@lowfatprophet/lfp-wc';
  import '@lowfatprophet/lfp-wc/ToC';
</script>
<lfp-toc toc-root="#article" set-id></lfp-toc>
```

That's it.

### JavaScript

Simply link to the JavaScript file or include it with your source code and import the necessary classes to instantiate the components.

```ts
import '@lowfatprophet/lfp-wc/Tablist';

document.querySelector('main')!.innerHTML += `<lfp-tablist>${APIResponse.reduce(
  (pv, cv) => pv + `<section tab-description="${cv.title}">${cv.content}</section>`, ''
)}</lfp-tablist>`;
```

### CSS

The CSS is mostly simple and based on selecting the component by its tag rather than by class or identifier. This has the advantage for you to simply override the web component by adding your own classes and/or identifiers.

Speaking of styling: have it even simpler and use CSS layers. All components are placed on their own layer `lfp` which you can place anywhere you wish on your layer hierarchy. This is a possible configuration:

```css
@layer reset, lfp, base, layout, components;
```

This way you can ensure to not let shine through any of the component's base style through your design system.

## Components

- [Disclosure component](#disclosure-component)
- [Heading component](#heading-component)
- [Nixie tube component](#nixie-tube-component)
- [Number input component](#number-input-component)
- [Progressbar component](#progressbar-component)
- [Tablist component](#tablist-component)
- [Toast component](#toast-component)
- [ToC component](#toc-component)

### Disclosure

#### Attributes

#### Example

#### Markup

### Heading

#### Attributes

#### Example

#### Markup

### Nixie tube

#### Attributes

#### Example

#### Markup

### Number input

#### Attributes

#### Example

#### Markup

### Progressbar

#### Attributes

#### Example

#### Markup

### Scrollmeter

#### Attributes

#### Example

#### Markup

### Skeleton

#### Attributes

#### Example

#### Markup

### Tablist

#### Attributes

#### Example

#### Markup

### Toast

#### Attributes

#### Example

#### Markup

### ToC

The ToC component automatically creates a table of contents based on the given parameters. By default, the component displays elements from heading level 2 to 5 (`h2`...`h5`). If you want to display other levels of headings, you can do this by applying the following attributes.

#### Attributes

##### `max-level`

- type: number

Set an upper bound for the table of content, so that headings with a lower level are included, this is useful if you do not want to include the top most headings or only want to include a subsection of your page with `h4`s and `h5`s. Defaults to `2`, so does not include the `h1` heading of which only one should exist on any given page, anyway.

**Caution**: Be aware that the value for `max-level` should reflect the level of your ToC's first heading element. This element should also be on the top most level of your content hierarchy (i.e., do not start your ToC with a `h3` if your top most heading element is `h2`).

##### `min-level`

- type: number

Set a lower bound for the table of contents if you do not want to feature headings of a certain lower level. Defaults to `5`, so that all headings are included in the ToC.

##### `set-id`

- type: boolean

The component is capable of giving each of the heading you want to include in the table of content a corresponding id, so that linking and deeplinking are working as expected. This is done by generating a unique ID from the text content of the heading element. And don't worry, if any of your headings already have IDs, they will stay untouched.

##### `no-numeration`

- type: boolean

Add this attribute if you do not want the ToC to be numbered.

**Note**: If there is only a single item on the given heading level, no numeration is shown by default, regardless of this attribute being set or not.

##### `add-items`

- type: string

This attribute stands for additional elements you want to include in your ToCs (e.g., for example custom headings or captions). They get added to the list just like regular headings, only without the capability of nesting because there is no hierarchy to follow.

**Note**: If you want to only display custom headings or elements in your ToC simply add them with the `add-items`-attribute and set both `min-level`  and `max-level` to `0`. This way, no heading gets selected and only custom additional elements are added to the list.

##### `toc-root`

- type: string



#### Example

#### Markup