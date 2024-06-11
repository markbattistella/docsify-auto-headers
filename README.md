<div align="center">

# docsify.js auto-headers

</div>

This plugin enhances your Docsify documentation by automatically generating numbered headers for your markdown files. It allows you to configure the header levels, numbering format, and inclusion in the sidebar. By utilizing this plugin, you can easily manage and navigate through your documentation headers, ensuring consistency and improved readability.

## Demo pages

| Page link | Description |
|-|-|
| ![](https://img.shields.io/badge/page_1--blue?style=for-the-badge) | The `autoHeader` of this page is: `@autoHeader:1`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`. |
| ![](https://img.shields.io/badge/page_2--blue?style=for-the-badge) | The `autoHeader` of this page is: `<!-- autoHeader:11.22.33.44.55.66 -->`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`. |
| ![](https://img.shields.io/badge/page_3--blue?style=for-the-badge) | The `autoHeader` of this page is: `@autoHeader:`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`. |
| ![](https://img.shields.io/badge/page_4--blue?style=for-the-badge) | The `autoHeader` of this page is: `<!-- autoHeader:Z.Y -->`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`. |
| ![](https://img.shields.io/badge/page_5--blue?style=for-the-badge) | The `autoHeader` of this page is: `<!-- autoHeader:1-2-3 -->`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`. |

## Installation

!> Note: There are breaking changes in the configuration from `v4.x` to `v5.x`. Please take the time to read all the documentation before upgrading

### Update `index.html` file

Assuming you have a working [docsify](https://docsify.js.org/) framework set up, it is easy to use the plugin.

1. Add one of the following script tags to your `index.html` via either CDN or downloading it and using it locally:

    ```html
    <!-- unpkg.com -->
    <script src="https://unpkg.com/@markbattistella/docsify-auto-headers@latest"></script>

    <!-- jsDelivr -->
    <script src="https://cdn.jsdelivr.net/npm/@markbattistella/docsify-auto-headers@latest"></script>

    <!-- locally -->
    <script src="docsify-auto-headers.min.js"></script>
    ```

1. In docsify setup, configure the plugin:

    ```js
    <script>
    window.$docsify = {
      autoHeaders: {

        // Separator for header numbering (e.g., '.', '-', ')')
        separator: '.',

        // Boolean indicating if headers should be added to the sidebar
        sidebar: false,

        // Number of header levels to include (1 to 6) or an object with start and finish properties
        levels: 6,
        // levels: { start: 1, finish: 6 }

        // Boolean to enable or disable debug messages
        debug: false
      }
   };
   </script>
   ```

## Configuration

There are several options available for the docsify-auto-headers plugin:

| Setting     | Type    | Options                             |
|-------------|---------|-------------------------------------|
| `separator` | String  | e.g., `.`, `-`, `)`                 |
| `sidebar`   | Boolean | `true` or `false`                   |
| `levels`    | Number  | `1` to `6`                          |
|             | Object  | `{ start: Number, finish: Number }` |
| `debug`     | Boolean | `true` or `false`                   |

## Usage

The plugin can be configured to apply scoped heading counts in either the sidebar or the main content, depending on your setup.

### Sidebar

If the `sidebar` option is enabled, the headers will be included in the sidebar and processed before rendering the markdown.

### Main Content

If the `sidebar` option is disabled, the headers will be processed and applied directly to the HTML after rendering.

## Contributing

1. Clone the repo:<br>`git clone https://github.com/markbattistella/docsify-auto-headers.git`

1. Create your feature branch:<br>`git checkout -b my-feature`

1. Commit your changes:<br>`git commit -am 'Add some feature'`

1. `Push` to the branch:<br>`git push origin my-new-feature`

1. Submit the `pull` request
