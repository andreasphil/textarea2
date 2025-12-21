<h1 align="center">
  Textarea2 🪼
</h1>

<p align="center">
  <strong>A better plain-text input web component</strong>
</p>

- 🎈 Progressively enhances the textarea with tabs, lists, and more
- 🍦 Native web component that works with vanilla JS or any framework
- 🧑‍🔧 Highly customizable to support completions, syntax highlighting, custom lists, etc.
- 👌 Fully typed and tested
- 🐛 Tiny (<7kb min+gzip) footprint

## Installation

From a CDN:

```js
import { Textarea2 } from "https://esm.sh/gh/andreasphil/textarea2@<tag>";
```

With a package manager:

```sh
npm i github:andreasphil/textarea2#<tag>
```

## Usage

Import and define the custom element:

```ts
import { Textarea2 } from "@andreasphil/textarea2";

Textarea2.define();
```

In your HTML, wrap your `textarea` with a `textarea-2` element:

```html
<textarea-2 overscroll>
  <textarea></textarea>
</textarea-2>
```

Because Textarea2 _progressively enhances_ an existing textarea, most of the time you will continue to access and interact with the regular HTML textarea, for example for things like getting and setting the value, and managing readonly states. However, there are a few tools offered by Textarea2 to extend the functionality of the HTML textarea. Those will be explained below.

### Plugins

Most of the functionality is provided by [plugins](./src/plugins/). Plugins need to be enabled _per instance:_

```js
import {
  FlipLinesPlugin,
  FullLineEditsPlugin,
  ListsPlugin,
  TabsPlugin,
} from "@andreasphil/textarea2";

const textarea2 = document.querySelector("textarea-2");

textarea2
  .use(new FlipLinesPlugin())
  .use(new FullLineEditsPlugin())
  .use(new ListsPlugin())
  .use(new TabsPlugin());
```

If you find yourself re-using the same set of plugins all the time, I recommend wrapping the Textarea2 component inside another custom element or whatever component system your framework offers.

### Autocomplete

Autocompletions are also provided as a plugin, but need a bit more configuration than the other plugins:

```js
import { AutocompletePlugin } from "@andreasphil/textarea2";

const textarea2 = document.querySelector("textarea-2");

const completions = [
  {
    trigger: "/",
    id: "slash",
    commands: [
      {
        id: "example1",
        name: "Mention username",
        initial: true, // Shows the command immediately without searching
        value: "@username", // Can also be a function that returns a value
      },
    ],
  },
];

textarea2.use(new AutocompletePlugin(completions));
```

See [autocomplete.d.ts](dist/plugins/autocomplete.d.ts) for more information.

`commands` can be either an array or a function returning an array. You can use this to dynamically return a list of completions. Note that this will be called frequently while the completion menu is open, and doesn't support async functions.

### Acting

Textarea2 instances expose an `act` method that gives you more powerful tools for updating the textarea content, managing selection, and more. You can use it to extend the functionality of a Textarea2 instance, or writing your own plugins:

```js
const textarea2 = document.querySelector("textarea-2");

textarea2.act((context) => {
  // ...
});
```

See [textarea2.d.ts](./dist/textarea2.d.ts) for more information.

### Styling

The component only implements the absolute minimum of styling that is needed for layout and positioning. Anything else is intentionally left out to make it easy to customize for different applications and styles. There are two options:

- The component is designed to work and look nice out of the box when used on pages with [@andreasphil/design-system](https://github.com/andreasphil/design-system).

- Alternatively, you can provide your own styles with a few lines of CSS. See [demo.css](./src/demo/demo.css) for an example.

Keep in mind that the styles of the textarea itself will be reset for the most part. Textarea2 manages the textarea styles rather strictly to support things like autosizing and [custom renderers](#custom-renderers). For this reason, anything that influences how text is laid out (e.g. fonts) or spacing (e.g. paddings, margins, borders) should be defined on the `textarea-2` element rather than the `textarea`, or even better on a container wrapping both of them.

### Customizing how text looks

Textarea2 separates text manipulation from how the value of the textarea is presented. This allows us to use the native textarea element as a simple, reliable plaintext editor, while adding flexibility in terms of how the content looks like. You can use this to implement syntax highlighting, formatting, and similar things.

Internally, this is implemented by making the contents of the textarea invisible. The value is rendered in a HTML container on top of the textarea, with the exact same spacing and formatting.

By default, Textarea2 uses a plaintext renderer without any special formatting. You can supply your own like this:

```js
textarea2.setRender(({ value, oldValue, out }) => {
  out.textContent = value;
});
```

`value` will be the current value of the textarea that needs to be rendered. `out` is the HTML element you should populate with whatever output you generate based on the value. Check out the [plaintext renderer](src/lib/render.ts) for an example.

In simple cases, it might be enough to do a full re-render every time. But keep in mind that the render function is called on every value change, i.e. quite frequently. You will be responsible for keeping this performant. For example, you can use the `oldValue` to compare the new state with the previously rendered state and make more incremental updates to the DOM.

### Using a framework

If you're using a framework, you might want to let the framework take care of the rendering. That way you can use framework components rather than generating HTML elements yourself, and will most likely get all kinds of performance optimizations for free.

To achieve this, you can create the element used for rendering yourself, and add the `custom` attribute. This attribute tells Textarea2 not to render anything, and leave the contents of the output to be generated elsewhere:

```html
<textarea-2>
  <textarea></textarea>
  <div class="t2-output" custom>
    <!-- use your framework to render output here based on the value. -->
  </div>
</textarea-2>
```

## Development

Textarea2 is a web component. It is built with [Vite](https://vitejs.dev). Packages are managed by [pnpm](https://pnpm.io). Tests are powered by [Vitest](https://vitest.dev). The following commands are available:

```sh
node --run dev          # Start development server
node --run test         # Run tests once
node --run test:watch   # Run tests in watch mode
node --run build        # Typecheck, emit declarations, and bundle
```

## Credits

This library uses a number of open source packages listed in [package.json](package.json).

Thanks 🙏
