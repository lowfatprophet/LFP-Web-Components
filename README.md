# LFP Web Components

This is a comprehensive collection of all of my web components.
See the index.html for examples and explanations for every single component.

## Usage

All web components can work for themselves and do not have any dependencies, neither for development or building nor for production.

### JS

Simply link to the JavaScript file or include it with your source code and import the necessary classes to instantiate the components.

### CSS

The CSS is mostly simple and based on selecting the component by its tag rather than by class or identifier. This has the advantage for you to simply override the web component by adding your own classes and/or identifiers.

Speaking of styling: have it even simpler and use CSS layers. All components are placed on their own layer `lfp` which you can place anywhere you wish on your layer hierarchy. This is a possible configuration:

```css
@layer reset, lfp, base, layout, components;
```

This way you can ensure to not let shine through any of the component's base  style through your design system.

## Overview

- [ToC component](#toc-component)
- [Disclosure component](#disclosure-component)
- [Toast component](#toast-component)
- [Tablist component](#tablist-component)
- [Progressbar component](#progressbar-component)
- [The Heading component](#the-heading-component)
- [Number input component](#number-input-component)
- [Nixie tube component](#nixie-tube-component)

### ToC component

Use this component with `<lfp-toc></lfp-toc>`.

#### Customization

By default, the component display only elements from level 2 to 5 (`h2`...`h5`). If you want to display other levels of headings, you can do this by applying the following attributes:

##### `max-level`

Set an upper bound for the table of content, so that only headings with a lower level are included, this is useful if you do not want to include the top most headings or only want to include a subsection of your page with `h4`s and `h5`s. Defaults to `2`, so does not include the `h1` heading of which only one should exist on any given page.

**Caution**: Be aware that the value for `max-level` should reflect the level of your ToC's first heading element. This element should also be on the top most level of your content hierarchy (i.e., do not start your ToC with an `h3` if your top most heading element is `h2`).

##### `min-level`

Set a lower bound for the table of content if you do not want to feature headings of a certain lower level. Defaults to `6`, so that all headings are included in the ToC.

##### `set-id`

The component is capable of giving each of the heading you want to incude in the table of content a corresponding id, so that linking and deeplinking are working as expected. This is done by generating a unique id from the text content of the heading element. And don't worry, if any of your headings already have IDs, they will stay untouched.

##### `no-numeration`

Add this attribute if you do not want the ToC to be numbered.

**Note**: If there is only a single item on a given heading level, no numeration is shown by default, regardless of this attribute being set or not.

##### `add-items`

This attribute stands for additional elements you want to include in your ToCs (e.g., for example custom headings or captions). They get added to the list just like regular headings, only without the capability of nesting because there is no hierarchy to follow.

**Note**: If you want to only display custom headings or elements in your ToC, simply add them with the `add-items`-attribute and set both, `min-level` and `max-level`, to `0`. This way, no heading gets selected and only custom additional elements are added to the list.

##### `toc-root`

Specify the root element inside which the component looks for headings and other elements to index. Accepts every kind of valid CSS selector. Defaults to `document`.

#### Styling

This component is quite opiniated in its styling. By including the component's custom CSS you agree to a certain style that is easy to override but nonetheless sets a bit of style up.

To mitigate this, just do not include the CSS or override the default styles. Be aware of the following styling structure:

- To change the numeration, use `counter` and `counter-increment`.
- To override or style the numeration, access the pseudo element with `lfp-toc ol li::before { }`.

#### Example usage

THe above mentioned customization settings can be used as follows:

```html
<lfp-toc min-level="4" max-level="3" add--items="dt" toc-root="main" set-id no-numeration></lfp-toc>
```

This ToC component is...

- ...displaying only headings of level 3 and 4 (`h3`, `h4`),
- ...additionally showing `dt` elements,
- ...setting IDs to elements without one,
- ...and disdplays an unorderd (i.e., not numbered) list.

### Disclosure component

Simply used with `<lfp-disclosure></lfp-diclosure>`. Add the `[trigger]` and `[content]´ elements inside the component.

### Toast component

Simply used with `<lfp-toast></lfp-toast>`. Adjust the duration for which the toast is visible by adding a `close-delay`-attribute and specifying the duration in milliseconds. If you want to trigger an animation before the toast gets removed from the DOM, add an `animation-delay`-attribute specify the time your animation will take to run. For an animation to run, simply add `animation: <animation-name> <animation-duration> <animation-play-state>`. Make sure that your animation features the following criteria:

- the animation's current play state is `paused`
- the animation's durations equals the toast components value for `animation-delay`
- the animation's name starts with `"toast..."`

Trigger a toast by emitting a new toast with `LFPToast.emit(description, title?, dismissable=false)`. Alternatively, dispatch your own event: LFPToast listens to `lfp:toast` and requires your event to feature the following `detail` object:

```javascript
detail: {
  title: string,
  description: string,
  dismissable: boolean
}
```

### Tablist component

Simply used with `<lfp-tablist></lfp-tablist>`. Add a `tab-description`-attribute to each of the tab panels that you place inside the component. This attribute's content is than placed in the tab navigation menu. Optionally, add `menu-orientation="vertical"` for vertically oriented tab buttons.

#### Get started

Add the `<lfp-tablist></lfp-tablist>`-component to your site and the content for each of your tab panels inside of it. Just do not forget to add the `tab-description`-attribute to every panel. The panels can be organised in any way you like, just keep in mind that `tab-description`-attributes are not allowed to be nested (except for when your tab panel itself contains another tab list).

Using a descriptive tab text is advised, the component falls back to a numbered list, if no description is provided.

#### Advanced usage

If your layout requires a vertically oriented navigation area, add the `menu-orientation="vertical"`-attribute to your component. The tab buttons will be displayed in a stacked order and the keyboard navigation is adjusted accordingly.

Don't forget to add headings to your tab panel. This component offers two ways to add headings (that work with site and cross-site navigation):

- Simply put a heading element inside your tab panel. The document's order is unchanged by the tab list component. If you want your heading's to be reachable by links, just add an `id`-attribute.
- If the component's tab buttons should be your headings, add the `heading-level="3"`-attribute to the component itself. The number specifies the requested heading level (`h3` in this case).

#### Customization

Customization is easily done. Aside from bare minimum regarding the vertical tab button design, there really are no predesigned elements with the tab listing. Just keep in mind that the navigation area is structured as follows: `ul > li > button`. The tab panels are hidden on `[aria-selected="true"]` by shrinking the container down and apply `visibility: hidden`.

To style the currently active tab button, simply target `button.active` inside the component's `nav`-element. The button receives the `button`-class when its associated thab panel is currently shown.

### Progressbar component

### The heading component

Add your heading inside a `<lfp-h></lfp-h>` tag. There is virtually no difference to a normally placed heading. The custom web component merely adds a link based on the heading's text content. The component checks for any existing id on the passed heading element and creates its own if nothing is found.

Also, notice that the heading's block end margin does not behave as usual when followed by a paragraph or similar elements, because the heading is wrapped inside an element. Please, just keep this in mind when using `<lfp-h>` in your design system.

Customize your heading by adding one, several, or all of the following attributes to the custom component:

- `link-symbol`: Give it a value like "§" or "+". This prefixes the heading element. Omit the value (just add the attribute) for the default "#".
- `symbol-hidden`: Add this attribute to the component to only show the prefix you added with `link-symbol` only when hovering over the heading. Has no effect if `link-symbol` is not present.
- `link-all`: By default only the prefixed part (if added) contains a link to the heading. Add this attribute to turn the entire heading into an anchor element. Keep in mind that you will either need this attribute or a `link-symbol` for the component to generate an anchor element.

While this element is quite opionated in its design approach. Customizing it to your heart's content is quite simple, too. Any style that is applied out of the box can easily be overridden by applying custom styles to a higher order `@layer` (as with all web components offered here).

### Number input component

### Nixie tube component

It's not about the clock, that's merely a demonstrator. It's more about the specific clock design with Nixie tubes. These Nixies are driven by a web component, every digit is its own component. The clock merely updates the component's attributes every once in a while and that's it.

This demo uses [Advent Pro from Google Fonts](https://fonts.google.com/specimen/Advent+Pro) because it supports variable font weights. The default font weight is set to 300 which has not necessarily an impact on your font face because quite a few monospaced fonts do not support lighter font weights. But the Nixie Tube component uses a normal 400 font weight for digits that are active (and "glowing"); by transitioning between the different weights there is the impression that the wire is starting to glow. Be aware that this effect might not work if you use a font that is not capable of displaying lighter font weights.

#### Customization

##### Color

By default, the currently active digit is lighting up in bright red, but that can be changed anytime in CSS with `lfp-nixie-tube > div.selected { color: ...; }` on any layer that is ordered above the component's default design.

The component's default color is currently set to `#000` but can be changed with `lfp-nixie-tube { --_font-clr: <color>; }`. Just keep in mind that it is advised that you use fully opaque colors.

**Caution**: The `color(<color> from xyz x y z / a);` syntax used in this component does currently not support color inference from `currencolor`, `initial` and `inherit`.

##### Appearance

By default the currently active digit is moved to the top most layer of its "stack of digits" for better readablity. If you'd prefer to preserve the "physical" order of the digits from "0" in the back all the way to "9" in the front, add `preserve-stack` as an attribute to `lfp-nixie-tube`.

##### Behavior

To show a digit on the `lfp-nixie-tube` add the `active-digit` attribute to the component with a value of a single-digit integer, use either a string or an integer number. Make sure that your argument only consists of a single digit (be careful with potential zero-padding).

For repeated changes (for example a clock that is ticking every second or minute) simply update the attribute with JavaScript when applicable, the component handles the rest.

To identify multiple Nixie Tubes (again, like with a clock) add an `identifier` tag and you're good to go.