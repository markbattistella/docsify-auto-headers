<!-- autoHeader:1-2-3 -->

?> This is **Page 5**.<br>The `autoHeader` of this page is: `<!-- autoHeader:1-2-3 -->`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`.

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

<!-- autoHeader:1-2-3 -->    <-- note: invalid input, should exit
                                       script and not remove, though
                                       since it is a HTML comment it
                                       will not show up in render

HEADING 1                    <-- note: invalid signifier, means no
HEADING 2                              numbering should occur
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
