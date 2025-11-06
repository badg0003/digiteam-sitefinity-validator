# Before & After Comparison

## Before: Manual Script Loading ❌

### HTML Setup
```html
<!-- Step 1: Load axe-core from CDN -->
<script src="https://unpkg.com/axe-core/axe.min.js"></script>

<!-- Step 2: Load your validator -->
<script src="AccessibilityValidator.js"></script>

<!-- Step 3: Initialize -->
<script>
  // Wait for both scripts to load...
  new AccessibilityValidator({
    widgetSelectors: ['.card-video']
  });
</script>
```

### Issues
- ❌ Two separate HTTP requests
- ❌ CDN reliability concerns
- ❌ No version control (using latest)
- ❌ Requires internet connection
- ❌ Manual script management
- ❌ Script load order matters
- ❌ Potential CORS issues

---

## After: Bundled Solution ✅

### HTML Setup
```html
<!-- Single file, everything included! -->
<script src="dist/accessibility-validator.umd.js"></script>

<script>
  new AccessibilityValidator({
    widgetSelectors: ['.card-video']
  });
</script>
```

### Modern Module Import
```typescript
import AccessibilityValidator from './dist/accessibility-validator.esm.js';

const validator = new AccessibilityValidator({
    widgetSelectors: ['.card-video']
});
```

### Benefits
- ✅ Single HTTP request
- ✅ No CDN dependency
- ✅ Specific version locked (4.10.2)
- ✅ Works offline
- ✅ Automated dependency management
- ✅ Script load order guaranteed
- ✅ No CORS issues
- ✅ TypeScript support out of the box
- ✅ Source maps for debugging
- ✅ Tree-shaking possible with ES modules

---

## Development Workflow

### Before
```
1. Download axe-core manually or link to CDN
2. Hope it's available when users load page
3. Update manually when new version needed
```

### After
```bash
# One-time setup
npm install

# Build (automatic bundling)
npm run build

# Development with auto-rebuild
npm run watch
```

---

## File Size Comparison

### Before
- axe-core CDN: ~230KB (separate request)
- Your validator: ~20KB (separate request)
- **Total: 250KB + 2 HTTP requests**

### After
- Bundle (UMD): ~1.4MB (single file, includes everything)
- **Total: 1.4MB + 1 HTTP request**

*Note: While the bundled file is larger, having everything in one file with proper caching is often faster and more reliable than multiple requests.*

---

## Integration Examples

### Webpack Project
```javascript
import AccessibilityValidator from 'digiteam-sitefinity-validator';

const validator = new AccessibilityValidator({
    widgetSelectors: ['.widget']
});
```

### Vite Project
```typescript
import AccessibilityValidator from './dist/accessibility-validator.esm.js';

const validator = new AccessibilityValidator({
    widgetSelectors: ['.widget']
});
```

### Plain HTML (UMD)
```html
<script src="dist/accessibility-validator.umd.js"></script>
<script>
  new AccessibilityValidator({ widgetSelectors: ['.widget'] });
</script>
```

### Node.js (CommonJS)
```javascript
const AccessibilityValidator = require('./dist/accessibility-validator.cjs.js');

const validator = new AccessibilityValidator({
    widgetSelectors: ['.widget']
});
```
