## Theory

Correlation slides a template T over image I and measures similarity:

R(x, y) = Σ Σ I(x + i, y + j) T(i, j)

Common template matching methods:

1. Squared Difference (SQDIFF)
   - Minimum value indicates best match.

2. Cross-Correlation (CCORR)
   - Maximum value indicates best match.

3. Correlation Coefficient (CCOEFF)
   - Normalized similarity.
   - Robust to illumination changes.
