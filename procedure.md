## Procedure

1. Load main image and template.
2. Convert both images to grayscale.
3. Apply template matching using:
   - SQDIFF
   - CCORR
   - CCOEFF
4. Find best match location from score map.
5. Draw bounding box around detected region.
6. Compare accuracy across methods.

## Feedback

- Which method matched best?
- Was the difference between score maps clear?

## Additional Help

- Use multi-scale matching if template size varies.
