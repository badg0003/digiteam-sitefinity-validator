# Publishing to npm & CDNs

## Prerequisites

1. **Create npm account** (if you don't have one)
   - Go to https://www.npmjs.com/signup
   - Or run: `npm adduser`

2. **Login to npm** (first time only)
   ```bash
   npm login
   ```

## Publishing Steps

### 1. Update Package Information

Edit `package.json`:
- Set your name in `author` field
- Verify `name` is unique (check https://www.npmjs.com/package/digiteam-sitefinity-validator)
- Add repository URL
- Add homepage

### 2. Build the Package
```bash
npm run build
```

### 3. Test Locally (Optional)
```bash
# Create a test link
npm link

# In another project
npm link digiteam-sitefinity-validator
```

### 4. Publish to npm
```bash
# First time - publish as public
npm publish --access public

# Updates
npm version patch  # 1.0.0 -> 1.0.1
npm publish

# For major/minor updates
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0
```

---

## After Publishing - CDN Availability

### ✅ Automatic CDNs (No Setup Required)

Once published to npm, your package is immediately available on:

1. **unpkg** - https://unpkg.com/digiteam-sitefinity-validator
2. **jsDelivr** - https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator
3. **esm.sh** - https://esm.sh/digiteam-sitefinity-validator
4. **Skypack** - https://cdn.skypack.dev/digiteam-sitefinity-validator

### Usage Examples

#### unpkg (UMD)
```html
<script src="https://unpkg.com/digiteam-sitefinity-validator@1.0.0/dist/accessibility-validator.umd.js"></script>
<script>
  new AccessibilityValidator({
    widgetSelectors: ['.card-video']
  });
</script>
```

#### jsDelivr (UMD with Stats)
```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator/dist/accessibility-validator.umd.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator@1.0.0/dist/accessibility-validator.umd.js"></script>
```

#### ES Module from CDN
```html
<script type="module">
  import AccessibilityValidator from 'https://esm.sh/digiteam-sitefinity-validator';
  
  new AccessibilityValidator({
    widgetSelectors: ['.card-video']
  });
</script>
```

---

## Version Management

### Semantic Versioning
- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.1 → 1.1.0): New features, backward compatible
- **Major** (1.1.0 → 2.0.0): Breaking changes

```bash
npm version patch  # Bug fixes
npm version minor  # New features
npm version major  # Breaking changes
npm publish
```

---

## CDN Features Comparison

| CDN | Minified | Compression | Stats | SRI Hash | HTTP/2 |
|-----|----------|-------------|-------|----------|--------|
| unpkg | ✅ | ✅ Brotli | ❌ | ❌ | ✅ |
| jsDelivr | ✅ | ✅ Brotli | ✅ | ✅ | ✅ |
| esm.sh | ✅ | ✅ Brotli | ❌ | ❌ | ✅ |
| Skypack | ✅ | ✅ Brotli | ❌ | ❌ | ✅ |

**Recommendation:** jsDelivr for production (best features + stats)

---

## Alternative: GitHub Releases + jsDelivr

If you don't want to use npm, you can use GitHub releases:

### 1. Create a GitHub Release
- Tag your code: `git tag v1.0.0`
- Push tag: `git push origin v1.0.0`
- Create release on GitHub

### 2. Use jsDelivr GitHub CDN
```html
<script src="https://cdn.jsdelivr.net/gh/badg0003/digiteam-sitefinity-validator@1.0.0/dist/accessibility-validator.umd.js"></script>
```

**Format:** `https://cdn.jsdelivr.net/gh/USER/REPO@VERSION/FILE`

---

## Recommended package.json Updates

```json
{
  "name": "digiteam-sitefinity-validator",
  "version": "1.0.0",
  "description": "Accessibility validation module for Sitefinity widgets using axe-core",
  "author": "Your Name <your.email@example.com>",
  "homepage": "https://github.com/badg0003/digiteam-sitefinity-validator#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/badg0003/digiteam-sitefinity-validator.git"
  },
  "bugs": {
    "url": "https://github.com/badg0003/digiteam-sitefinity-validator/issues"
  },
  "keywords": [
    "accessibility",
    "a11y",
    "axe-core",
    "sitefinity",
    "validator",
    "wcag",
    "aria",
    "cms"
  ]
}
```

---

## After Publishing Checklist

- [ ] Package appears on npm: https://www.npmjs.com/package/digiteam-sitefinity-validator
- [ ] Test unpkg URL works
- [ ] Test jsDelivr URL works
- [ ] Add CDN usage to README
- [ ] Create GitHub release
- [ ] Add badge to README: `![npm](https://img.shields.io/npm/v/digiteam-sitefinity-validator)`

---

## Updating the Package

```bash
# Make your changes
git add .
git commit -m "feat: add new feature"

# Bump version and publish
npm version minor
npm publish

# Push to GitHub
git push
git push --tags
```

Your package will be automatically updated on all CDNs within minutes!
