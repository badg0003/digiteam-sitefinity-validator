# Migration Summary: Axe-core Dependency

## What Changed

### Before
- Required manual inclusion of axe-core from CDN: `https://unpkg.com/axe-core/axe.min.js`
- Two separate script tags needed
- Potential CDN reliability issues
- No version control

### After
- axe-core is bundled automatically via npm
- Single file includes everything
- Reliable, version-controlled dependency
- Offline-capable

## Files Created/Modified

### New Files
1. **package.json** - NPM package configuration with dependencies
2. **tsconfig.json** - TypeScript compiler configuration
3. **rollup.config.mjs** - Bundler configuration
4. **.gitignore** - Ignore node_modules and dist folders
5. **demo.html** - Working example

### Modified Files
1. **AccessibilityValidator.ts**
   - Added: `import axe from 'axe-core'`
   - Removed: `WindowWithAxe` interface
   - Changed: Uses imported `axe` instead of `window.axe`
   - Added: ES module exports

2. **README.md**
   - Added build instructions
   - Added usage examples
   - Added quick start guide

## Build Output

Three module formats generated in `dist/`:
- **accessibility-validator.cjs.js** (1.3MB) - CommonJS for Node.js
- **accessibility-validator.esm.js** (1.3MB) - ES Module for modern bundlers
- **accessibility-validator.umd.js** (1.4MB) - UMD for browser globals
- TypeScript definitions (*.d.ts)
- Source maps for debugging

## How to Use

### Development
```bash
npm install    # Install dependencies
npm run build  # Build the library
npm run watch  # Watch mode for development
```

### In Browser (UMD)
```html
<script src="dist/accessibility-validator.umd.js"></script>
<script>
  new AccessibilityValidator({
    widgetSelectors: ['.card-video']
  });
</script>
```

### In Modern JS/TS Project
```typescript
import AccessibilityValidator from './dist/accessibility-validator.esm.js';

const validator = new AccessibilityValidator({
    widgetSelectors: ['.card-video']
});
```

### In Node.js
```javascript
const AccessibilityValidator = require('./dist/accessibility-validator.cjs.js');
```

## Benefits

1. **Simplified Setup** - No manual script loading
2. **Version Control** - Lock axe-core to specific version
3. **Better DX** - TypeScript autocomplete works out of the box
4. **Reliability** - No external CDN dependency
5. **Offline** - Works without internet
6. **Build Integration** - Easy to integrate with CI/CD

## Backward Compatibility

The library still exposes `window.AccessibilityValidator` and `window.axe` for backward compatibility with existing code. Legacy `CardA11y` global API is maintained.

## Next Steps

1. Test in your Sitefinity environment
2. Update any documentation referencing the old CDN approach
3. Consider publishing to npm for easier distribution
4. Add automated tests (optional)
