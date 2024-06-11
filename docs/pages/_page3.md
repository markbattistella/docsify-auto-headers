@autoHeader:

?> This is **Page 3**.<br>The `autoHeader` of this page is: `@autoHeader:`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`.

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

@autoHeader:    <-- note: invalid input, should exit script and not remove

HEADING 1       <-- note: invalid signifier, means no numbering should occur
HEADING 2
HEADING 3
HEADING 4
HEADING 5
HEADING 6

HEADING 2
HEADING 3
HEADING 2
HEADING 3
HEADING 4
HEADING 5
HEADING 6
HEADING 6
```
