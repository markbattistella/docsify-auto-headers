@autoHeader:1

?> This is **Page 1**.<br>The `autoHeader` of this page is: `@autoHeader:1`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`.

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

1. HEADING 1
1.1. HEADING 2
1.1.1. HEADING 3
1.1.1.1. HEADING 4
1.1.1.1.1. HEADING 5
1.1.1.1.1.1. HEADING 6

1.2. HEADING 2
1.2.1. HEADING 3
1.3. HEADING 2
1.3.1. HEADING 3
1.3.1.1. HEADING 4
1.3.1.1.1. HEADING 5
1.3.1.1.1.1. HEADING 6
1.3.1.1.1.2. HEADING 6
```
