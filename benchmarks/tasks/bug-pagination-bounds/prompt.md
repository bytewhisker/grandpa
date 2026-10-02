# Defensive Pagination Bounds Calculation

Write an exported function `paginate({ totalItems, pageSize, currentPage })` that:
- Calculates `{ totalPages, offset, limit, hasPrev, hasNext, validPage }`.
- Handles edge cases: totalItems <= 0 returns 1 totalPage and offset 0.
- Clamps currentPage between 1 and totalPages.
- Never returns negative offset.
