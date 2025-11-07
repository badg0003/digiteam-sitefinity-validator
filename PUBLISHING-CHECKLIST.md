# Publishing Checklist

## Before Publishing

- [ ] Update `author` field in `package.json` with your name/email
- [ ] Verify package name is available: https://www.npmjs.com/package/digiteam-sitefinity-validator
- [ ] Build succeeds: `npm run build`
- [ ] Test locally with `demo.html`
- [ ] Update version if needed: `npm version patch/minor/major`
- [ ] Commit all changes: `git add . && git commit -m "Release v1.0.0"`
- [ ] Create Git tag: `git tag v1.0.0`

## Publishing to npm

### First Time Setup
```bash
# Create npm account (if needed)
npm adduser

# Or login
npm login
```

### Publish
```bash
# Build first
npm run build

# Publish as public package (required for CDNs)
npm publish --access public
```

## After Publishing

- [ ] Verify on npm: https://www.npmjs.com/package/digiteam-sitefinity-validator
- [ ] Test unpkg (wait 1-5 min): https://unpkg.com/digiteam-sitefinity-validator/
- [ ] Test jsDelivr: https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator/
- [ ] Push to GitHub: `git push && git push --tags`
- [ ] Create GitHub Release
- [ ] Update README with CDN URLs
- [ ] Update demo.html to use CDN

## CDN URLs (After Publishing)

### unpkg
```
https://unpkg.com/digiteam-sitefinity-validator@1.0.0/dist/accessibility-validator.umd.js
```

### jsDelivr
```
https://cdn.jsdelivr.net/npm/digiteam-sitefinity-validator@1.0.0/dist/accessibility-validator.umd.js
```

### esm.sh
```
https://esm.sh/digiteam-sitefinity-validator@1.0.0
```

## Future Updates

```bash
# Make changes
# ...

# Build
npm run build

# Bump version
npm version patch  # 1.0.0 -> 1.0.1

# Publish
npm publish

# Push to GitHub
git push && git push --tags
```

## Alternative: GitHub-Only CDN

If you prefer not to publish to npm:

1. **Commit dist folder** (remove from .gitignore)
   ```bash
   # Edit .gitignore to allow dist/
   git add dist/
   git commit -m "Add dist folder"
   ```

2. **Create Git tag**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Use jsDelivr GitHub CDN**
   ```html
   <script src="https://cdn.jsdelivr.net/gh/badg0003/digiteam-sitefinity-validator@v1.0.0/dist/accessibility-validator.umd.js"></script>
   ```

## Notes

- **unpkg** and **jsDelivr** require npm publish (recommended)
- **GitHub CDN** via jsDelivr works without npm but requires committing dist/
- CDNs sync automatically within 1-5 minutes after npm publish
- Always use pinned versions in production: `@1.0.0`
