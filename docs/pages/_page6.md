---
autoHeader: 10
---

?> This is **Page 6**.<br>The `autoHeader` of this page is: `autoHeader: 10`. Inside Front Matter YAML.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`.

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

---

## Heading 2

### Heading 3

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

###### Heading 6

---

```text
Expected output:

10. HEADING 1
10.1. HEADING 2
10.1.1. HEADING 3
10.1.1.1. HEADING 4
10.1.1.1.1. HEADING 5
10.1.1.1.1.1. HEADING 6

10.2. HEADING 2
10.2.1. HEADING 3
10.3. HEADING 2
10.3.1. HEADING 3
10.3.1.1. HEADING 4
10.3.1.1.1. HEADING 5
10.3.1.1.1.1. HEADING 6
10.3.1.1.1.2. HEADING 6
```

<details>
<summary><strong>See the original markdown data for this page</strong></summary>

[filename](_page6.md ':include :type=code')

</details>
