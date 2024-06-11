<!-- autoHeader:11.22.33.44.55.66 -->

?> This is **Page 2**.<br>The `autoHeader` of this page is: `<!-- autoHeader:11.22.33.44.55.66 -->`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`.

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

11. HEADING 1
11.22. HEADING 2
11.22.33. HEADING 3
11.22.33.44. HEADING 4
11.22.33.44.55. HEADING 5
11.22.33.44.55.66. HEADING 6

11.23. HEADING 2
11.23.1. HEADING 3   <-- note: restarts at 1 when resetting (22 --> 23)
11.24. HEADING 2
11.24.1. HEADING 3
11.24.1.1. HEADING 4
11.24.1.1.1. HEADING 5
11.24.1.1.1.1. HEADING 6
11.24.1.1.1.2. HEADING 6
```
