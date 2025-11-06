# Digiteam Sitefinity Validator

## Overview
The AccessibilityValidator module now supports three modes for rule checking:

1. **All Rules** (Default) - Check for everything
2. **Specific Rules** - Check only certain rule IDs
3. **Tag-based** - Check by accessibility standard tags

## 1. Check ALL Accessibility Rules (Recommended)

```typescript
// Run ALL available axe-core rules (most comprehensive)
const validator = new AccessibilityValidator({
    widgetSelectors: ['.card-video', '.widget'],
    // Don't specify axeRules or axeTags = run everything
});

// Or explicitly with empty arrays
const validatorExplicit = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeRules: [], // Empty = run all rules
});
```

## 2. Tag-based Checking (By Standards)

```typescript
// WCAG 2.1 AA compliance only
const wcagValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeTags: ['wcag2a', 'wcag2aa']
});

// Section 508 compliance
const section508Validator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeTags: ['section508']
});

// Best practices only
const bestPracticeValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeTags: ['best-practice']
});

// Multiple standards
const comprehensiveValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeTags: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'section508', 'best-practice']
});
```

## 3. Specific Rules (Targeted Checking)

```typescript
// Only image and link accessibility
const imageLinksValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeRules: [
        'image-alt',
        'role-img-alt', 
        'link-name',
        'image-redundant-alt',
        'svg-img-alt'
    ]
});

// Color and contrast issues only
const colorValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeRules: [
        'color-contrast',
        'color-contrast-enhanced',
        'link-in-text-block'
    ]
});
```

## Available Tags

- `wcag2a` - WCAG 2.1 Level A
- `wcag2aa` - WCAG 2.1 Level AA  
- `wcag2aaa` - WCAG 2.1 Level AAA
- `wcag21a` - WCAG 2.1 Level A (specific)
- `wcag21aa` - WCAG 2.1 Level AA (specific)
- `wcag21aaa` - WCAG 2.1 Level AAA (specific)
- `section508` - Section 508 compliance
- `best-practice` - Best practices beyond standards
- `experimental` - Experimental rules

## Common Rule Categories

### Images & Media
- `image-alt` - Images must have alt text
- `image-redundant-alt` - Alt text shouldn't repeat nearby text
- `svg-img-alt` - SVG images need accessible names
- `video-caption` - Videos need captions

### Links & Navigation  
- `link-name` - Links must have accessible names
- `link-in-text-block` - Links in text need sufficient contrast
- `identical-links-same-purpose` - Same text links should go to same place

### Forms
- `label` - Form controls must have labels
- `form-field-multiple-labels` - No multiple labels per field
- `aria-required-attr` - Required ARIA attributes

### Color & Contrast
- `color-contrast` - Sufficient color contrast
- `color-contrast-enhanced` - Enhanced contrast (AAA)

## Migration from Previous Version

```typescript
// OLD: Limited rules only
const oldValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeRules: ['image-alt', 'link-name'] // Limited checking
});

// NEW: Check everything (recommended)
const newValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video']
    // No axeRules = check ALL accessibility issues
});

// Or stick with tag-based approach for specific standards
const standardsValidator = new AccessibilityValidator({
    widgetSelectors: ['.card-video'],
    axeTags: ['wcag2aa'] // Just WCAG AA compliance
});
```

## Runtime Configuration Changes

```typescript
const validator = new AccessibilityValidator({
    widgetSelectors: ['.card-video']
});

// Switch to specific rules later
validator.updateConfig({
    axeRules: ['color-contrast', 'image-alt']
});

// Switch to tag-based checking  
validator.updateConfig({
    axeRules: undefined, // Clear specific rules
    axeTags: ['wcag2aa']
});

// Switch back to checking everything
validator.updateConfig({
    axeRules: [], // Empty = all rules
    axeTags: undefined
});
```

## Performance Considerations

- **All Rules**: Most comprehensive but slowest
- **Tag-based**: Good balance of coverage and performance  
- **Specific Rules**: Fastest but limited coverage

For production use, consider starting with `['wcag2aa']` tags and expanding as needed.
