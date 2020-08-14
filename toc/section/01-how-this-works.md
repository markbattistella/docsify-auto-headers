# How this works

Add the config:

```js
<script>
window.$docsify = {
    autoHeading: {
        separator: 'decimal',
        start: '',
        levels: '6',
        scope: 'main',
        path: '#/toc/section/'
    }
}
</script>
```

and load in the plugin script:

```js
<script src="docsify-autoHeaders.js"></script>
```

---

# Roadmap

- [x] Figure out how to do the numbering
- [x] Write it into a plugin
- [x] Rewrite it when you realise its `Javascript` not `jQuery`
- [x] Build the plugin
- [ ] Get it to update the numbers on load
