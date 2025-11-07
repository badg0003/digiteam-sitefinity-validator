# CDN Quick Reference

## 🚀 After Publishing to npm

Your package will be automatically available on these CDNs:

### unpkg.com
```html
<!-- Latest version -->
<script src="https://unpkg.com/digiteam-sitefinity-validator/dist/accessibility-validator.umd.js"></script>

<!-- Pinned version (recommended for production) -->
<script src="https://unpkg.com/digiteam-sitefinity-validator@1.1.0/dist/accessibility-validator.umd.js"></script>

<!-- Specific file types -->
<script src="https://unpkg.com/digiteam-sitefinity-validator@1.1.0/dist/accessibility-validator.esm.js" type="module"></script>
```

### jsDelivr (Recommended for Production)
```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator/dist/accessibility-validator.umd.js"></script>

<!-- Pinned version with SRI hash -->
<script src="https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator@1.1.0/dist/accessibility-validator.umd.js" 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>

<!-- Combine multiple files (jsdelivr feature) -->
<script src="https://cdn.jsdelivr.net/combine/npm/digiteam-sitefinity-validator@1.1.0/dist/accessibility-validator.umd.js,npm/other-package"></script>
```

### esm.sh (ES Modules)
```html
<script type="module">
  import AccessibilityValidator from 'https://esm.sh/digiteam-sitefinity-validator';
  
  const validator = new AccessibilityValidator({
    widgetSelectors: ['.card-video']
  });
</script>

<!-- With version -->
<script type="module">
  import AccessibilityValidator from 'https://esm.sh/digiteam-sitefinity-validator@1.1.0';
</script>
```

### Skypack
```html
<script type="module">
  import AccessibilityValidator from 'https://cdn.skypack.dev/digiteam-sitefinity-validator';
</script>

<!-- Pinned version -->
<script type="module">
  import AccessibilityValidator from 'https://cdn.skypack.dev/digiteam-sitefinity-validator@1.1.0';
</script>
```

---

## 📦 Without npm (GitHub CDN)

If you haven't published to npm yet, you can use GitHub + jsDelivr:

```html
<!-- Using GitHub tag/release -->
<script src="https://cdn.jsdelivr.net/gh/badg0003/digiteam-sitefinity-validator@v1.1.0/dist/accessibility-validator.umd.js"></script>

<!-- Using latest commit from main branch (not recommended for production) -->
<script src="https://cdn.jsdelivr.net/gh/badg0003/digiteam-sitefinity-validator@main/dist/accessibility-validator.umd.js"></script>
```

**Note:** For GitHub CDN to work:
1. Commit your `dist/` folder to the repository
2. Create a Git tag: `git tag v1.1.0 && git push origin v1.1.0`
3. Or create a GitHub Release

---

## 📋 Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Accessibility Validator Demo</title>
</head>
<body>
    <div class="card-video">
        <h2>My Widget</h2>
        <img src="image.jpg" />
        <a href="#">Link</a>
    </div>

    <!-- Load from CDN -->
    <script src="https://unpkg.com/digiteam-sitefinity-validator@1.1.0/dist/accessibility-validator.umd.js"></script>
    
    <!-- Initialize -->
    <script>
        const validator = new AccessibilityValidator({
            widgetSelectors: ['.card-video'],
            enableDebugLogging: true,
            includeIncomplete: undefined // Default: include color-contrast incomplete results
        });
    </script>
</body>
</html>
```

---

## 🔒 Security Best Practices

### 1. Pin Versions
```html
<!-- ✅ Good - pinned version -->
<script src="https://unpkg.com/digiteam-sitefinity-validator@1.1.0/dist/accessibility-validator.umd.js"></script>

<!-- ❌ Avoid - unpinned (auto-updates) -->
<script src="https://unpkg.com/digiteam-sitefinity-validator/dist/accessibility-validator.umd.js"></script>
```

### 2. Use SRI (Subresource Integrity) with jsDelivr
```html
<script src="https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator@1.1.0/dist/accessibility-validator.umd.js" 
        integrity="sha384-HASH_HERE" 
        crossorigin="anonymous"></script>
```

Get SRI hash from: https://www.srihash.org/

### 3. Use HTTPS
Always use `https://` URLs, never `http://`

---

## 📊 CDN Comparison

| Feature | unpkg | jsDelivr | esm.sh | Skypack |
|---------|-------|----------|--------|---------|
| **Speed** | Fast | Fastest | Fast | Fast |
| **Global CDN** | ✅ | ✅ | ✅ | ✅ |
| **SRI Support** | ❌ | ✅ | ❌ | ❌ |
| **Stats/Analytics** | ❌ | ✅ | ❌ | ❌ |
| **Combine Files** | ❌ | ✅ | ❌ | ❌ |
| **ES Module Optimization** | ❌ | ❌ | ✅ | ✅ |
| **GitHub Repos** | ❌ | ✅ | ❌ | ❌ |

**Recommendation:** 
- **Production:** jsDelivr (best features, SRI support, stats)
- **Development:** unpkg (simple, reliable)
- **ES Modules:** esm.sh or Skypack

---

## 🔄 Updating Your CDN Package

1. **Update your code**
2. **Build:** `npm run build`
3. **Version bump:** `npm version patch` (or minor/major)
4. **Publish:** `npm publish`
5. **Wait 1-5 minutes** - CDNs auto-sync from npm

New version will be available at:
- `https://unpkg.com/digiteam-sitefinity-validator@1.1.0/...`
- `https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator@1.1.0/...`

---

## ❓ FAQ

**Q: How long does it take for CDNs to update after publishing?**  
A: Usually 1-5 minutes. jsDelivr and unpkg sync automatically from npm.

**Q: Can I use CDN without publishing to npm?**  
A: Yes! Use jsDelivr GitHub CDN (see "Without npm" section above).

**Q: Which CDN should I use?**  
A: jsDelivr for production (SRI, stats, reliability), unpkg for simplicity.

**Q: Do I need to do anything special for CDNs to work?**  
A: No! Just publish to npm and they automatically pick it up.

**Q: Can I test CDN URLs before publishing?**  
A: Yes! Publish as a scoped package first: `@yourname/test-package`
