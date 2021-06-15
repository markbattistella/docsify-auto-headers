<div align="center">

# docsify-autoHeaders

![Github2npm](https://github.com/markbattistella/docsify-autoHeaders/workflows/gh2npm/badge.svg?event=registry_package) ![npm (scoped)](https://img.shields.io/npm/v/@markbattistella/docsify-autoheaders) ![GitHub](https://img.shields.io/github/license/markbattistella/docsify-autoheaders) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@markbattistella/docsify-autoheaders)

---

[![](https://img.shields.io/badge/%20-@markbattistella-blue?logo=paypal&style=for-the-badge)](https://www.paypal.me/markbattistella/6AUD)
[![](https://img.shields.io/badge/%20-buymeacoffee-black?logo=buy-me-a-coffee&style=for-the-badge)](https://www.buymeacoffee.com/markbattistella)

[![](https://img.shields.io/badge/demo-@markbattistella/docsify--autoHeaders-1E5749?style=for-the-badge)](https://markbattistella.github.io/docsify-autoHeaders/)

</div>

---

# Auto number headings

This plugin is designed to create heading numbers in your pages if you are creating a reference guide.

It stops you from having to manually number the heading, and then have to then trawl through every heading afterwards to change the numbering system again.

It allows you to either have all the headings in one page, or if you split them over many `markdown` documents then specify what the heading number it should be starting at.

![How it works](img/header.gif)

## Installation

### Update `index.html` file

Assuming you have a working [docsify](https://docsify.js.org/) framework set up, it is easy to use the plugin.

1. Add the following script tag to your `index.html` via either CDN or downloading it and using it locally:

    ```html
    <!-- unpkg.com -->
    <script src="https://unpkg.com/@markbattistella/docsify-autoheaders@latest"></script>

    <!-- jsDelivr -->
    <script src="https://cdn.jsdelivr.net/npm/@markbattistella/docsify-autoheaders@latest"></script>

    <!-- locally -->
    <script src="docsify-autoheaders.min.js"></script>
    ```

1. In docsify setup configure the plugin (see [configuration](#configuration) for setup):

    ```js
    <script>
    window.$docsify = {
      autoHeaders: {
        separator: String,          // how numbers should be separated
		custom:    String,          // if `separator` is set to other then specify own here
        levels:    String | Object, // heading levels h[1-6]
        scope:     String,          // plugin search scope
        debug:     Boolean          // show console.log messages
      }
    };
    </script>
    ```

### npm install

Or if you're using `npm` to manage your dependencies:

```sh
npm i @markbattistella/docsify-autoheaders
```

### Configuration

There are some options available for the `docsify-autoHeaders`:

| setting   | options                                                         |
|-----------|-----------------------------------------------------------------|
| separator | how the numbers are separated: `decimal`, `dash`, `bracket`, or `other` |
| custom    | if `separator` is set to `other` then you can specify the custom styled separator here |
| levels    | String: heading levels to target `1-6`                          |
|           | Object: start and finish for custom range
| scope     | the element to narrow it down to. `#main` is the default scope  |
| debug     | `true` or `false` if you want to see `console.log` info         |

### Usage

At the top of your file add the following snippet:

```md
@autoHeader:
```

At the end of the identifier `(marked with #)`, add the starting heading number. If you don't have a valid entry then it won't auto number.

It accepts only numbers, and decimals are rounded down.

You can have a starting header at `0` using:

```md
@autoHeader:0
```

## Example data

### `index.html`

```js
window.$docsify = {
  autoHeaders: {
    separator: 'decimal',
    levels:    '3',
    scope:     '#main',
    debug:     false
  },
};
```

### `file.md`

```md
@autoHeader:34

# Black Books

## Season 2

### Episode 1

#### Characters
- Bernard
- Fran

#### Quotes
You! What have you been telling Kate? She thinks I'm
the renaissance. I have to go along with all this
"reclusive genius" stuff... she's going to be very
upset when she finds out I'm a reclusive wanker.
```

### Output data

![Example output](img/example.jpg)

## Live Examples

- [View heading starting at `1`](page1)
- [View heading starting at `n`](pageN)

## Customising individual numbers

You can also manually set the starting number of each of the levels by using the following format:

```md
@autoheaders:3.5.6.6.1.12

##### New heading
```

Respectively starting the first level 6 heading (H6) at:

```md
3.5.6.6.2.1 New heading
```

## Start and finish range

You can also target specific heading levels for the numbering which works well if you want to skip H1.

```js
<script>
window.$docsify = {
  autoHeaders: {
	separator: 'other',
	custom:    '--',
	levels:    {
	  start:  '2',
	  finish: '4'
	}
	scope:     '#main',
	debug:     false
  }
};
</script>
```

```md
@autoheaders:1.2.3.4.5.6

# Level 1 heading

## Level 2 heading

### Level 3 heading
```

```md
Level 1 heading

1-- Level 2 heading

1--2-- Level 3 heading
```

!> **Note:** though it skips H1, the numbering starts at the first integer from the `@autoheaders:1.2.3.4.5.6` data. The above example should be read as `@autoheaders:1.2.3`

## Contributing

1. Clone the repo:

    `git clone https://github.com/markbattistella/docsify-autoHeaders.git`

1. Create your feature branch:

    `git checkout -b my-feature`

1. Commit your changes:

    `git commit -am 'Add some feature'`

1. `Push` to the branch:

    `git push origin my-new-feature`

1. Submit the `pull` request
