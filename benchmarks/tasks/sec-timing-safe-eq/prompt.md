# Constant-Time String Comparison

Write an exported function `timingSafeEqual(strA, strB)` that:
1. Returns `true` if strings are identical, else `false`.
2. Compares bytes in constant time using `crypto.timingSafeEqual` to prevent side-channel timing attacks.
3. Handles unequal string lengths safely without throwing or leaking timing info.
