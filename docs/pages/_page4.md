<!-- autoHeader:Z.Y -->

?> This is **Page 4**.<br>The `autoHeader` of this page is: `<!-- autoHeader:Z.Y -->`.<br>Assuming the original configuration is used, the splitter is `.` and the levels are `H1`-`H6`.

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

Z. HEADING 1
Z.Y. HEADING 2
Z.Y.A. HEADING 3
Z.Y.A.A. HEADING 4
Z.Y.A.A.A. HEADING 5
Z.Y.A.A.A.A. HEADING 6

Z.Z. HEADING 2
Z.Z.A. HEADING 3   <-- note: restarts at A when resetting (22 --> 23)
Z.ZA. HEADING 2
Z.AA.A. HEADING 3
Z.AA.A.A. HEADING 4
Z.AA.A.A.A. HEADING 5
Z.AA.A.A.A.A. HEADING 6
Z.AA.A.A.A.B. HEADING 6
```