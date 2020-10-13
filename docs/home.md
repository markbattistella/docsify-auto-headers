# docsify-autoHeaders: Auto numbering headings

![npm Publish](https://github.com/markbattistella/docsify-autoHeaders/workflows/npm%20Publish/badge.svg?event=registry_package) ![npm (tag)](https://img.shields.io/npm/v/docsify-autoheaders/latest) ![GitHub](https://img.shields.io/github/license/markbattistella/docsify-autoheaders) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/docsify-autoheaders)

This plugin is designed to create heading numbers in your pages if you are creating a reference guide. It stops you from having to manually number the items, and then have to then trawl through every heading afterwards to change the numbering system again. It allows you to either have all the headings in one page, or if you split them over many markdown documents then specify what the heading number it should be starting at.

## Installation

### 1. Update `index.html` file

Assuming you have a working [docsify](https://docsify.js.org/) framework set up, it is easy to use the plugin.

1. Add the following script tag to your `index.html` via either CDN or downloading it and using it locally:

 ```html
 <!-- unpkg.com -->
 <script src="https://unpkg.com/docsify-autoheaders"></script>

 <!-- jsDelivr -->
 <script src="https://cdn.jsdelivr.net/npm/docsify-autoheaders"></script>

 <!-- locally -->
 <script src="docsify-autoheaders.js"></script>
 ```

1. In docsify setup configure the plugin:

 ```js
<script>
window.$docsify = {
    autoHeaders: {
        separator: '',
        levels:    '',
        scope:     ''
    },
};
</script>
```

There are some options available for the `docsify-autoHeaders`:

| setting   | options |
| :-------- | :------ |
| separator | how you'd like the numbers to be separated. `decimal`, `dash`, or `bracket`
| levels    | heading levels to target `1-6`
| scope     | the element to narrow it down to. `#main` is the normal scope
| debug     | `true` or `false` if you want to see `console.log` info

### 2. Usage

At the top of your file add the following snippet:

```md
@autoHeader:
```

At the end of the identifier, add the section starting number. If you don't have that it won't auto number (good for pages not needing numbering).

You can :heart: have a starting header at `0` using:

```md
@autoHeader:0
```

## Examples

- [View heading starting at `1`](/page1)
- [View heading starting at `n`](/pageN)
