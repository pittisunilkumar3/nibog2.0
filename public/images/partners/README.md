# Partner Logos Directory

## How to Add Partner Logos

1. **Add your partner logo images** to this directory (`public/images/partners/`)
   - Recommended format: PNG with transparent background
   - Recommended size: 200x200px to 400x400px
   - Name them descriptively, e.g., `partner-name.png`

2. **Update the partners array** in `components/partners-section.tsx`:

```typescript
const partners = [
  {
    name: "Partner Name",
    logo: "/images/partners/partner-name.png",
    alt: "Partner Name Logo"
  },
  // Add more partners...
]
```

3. **Uncomment the Image component** in `components/partners-section.tsx`:
   - Find the commented `<Image>` component
   - Uncomment it to display actual partner logos
   - Remove or comment out the placeholder div

## Tips

- Use high-quality logos with transparent backgrounds
- Keep file sizes optimized (compress images before uploading)
- Maintain consistent aspect ratios for better display
- Update the `name` and `alt` text for accessibility
