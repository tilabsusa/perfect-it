# Sprint Change Proposal: Amplify UI v6 Theming Documentation Correction

**Date:** 2025-01-08
**Author:** Bob (Scrum Master)
**Status:** APPROVED & IMPLEMENTED

## Analysis Summary

### Issue Identified

The front-end-spec.md incorrectly references "Set up Amplify UI theme tokens" when AWS Amplify UI React v6.1.0 doesn't export `{tokens}` as a named export. This caused confusion during Story 1.1 implementation when both dev and QA attempted to follow the specification.

### Trigger Details

- **Triggering Story:** Story 1.1 - Initialize Amplify Project and Repository Setup
- **Issue Location:** docs/front-end-spec.md, Line 544
- **Package Version:** @aws-amplify/ui-react@6.1.0
- **Discovery:** Dev initially attempted to import tokens, later fixed. QA encountered same issue following the spec.

### Impact Assessment

- **Severity:** Low - Documentation inconsistency only
- **Stories Affected:** Story 1.1 (already completed successfully)
- **Code Impact:** None - issue was caught before implementation
- **Timeline Impact:** None - no blocking issues
- **Epic Impact:** Epic 1 continues as planned, no downstream effects

### Rationale for Chosen Path

Direct documentation adjustment is the most efficient solution. The project will use MUI as the primary theming system, with Amplify UI components styled to match where needed. This aligns with the architectural decision to use both libraries complementarily.

## Specific Proposed Edits

### Edit 1: Update front-end-spec.md Line 544

**File:** `docs/front-end-spec.md`

**Current Line 544:**

```markdown
2. Set up Amplify UI theme tokens to match brand
```

**Change To:**

```markdown
2. Configure Amplify UI ThemeProvider with custom theme matching MUI brand colors
```

### Edit 2: Add Theme Integration Section to front-end-spec.md

**File:** `docs/front-end-spec.md`

**Add after Line 551 (after the immediate actions list):**

````markdown
### Theme Integration Strategy

#### MUI as Primary Theme System

Material-UI provides the primary theming system for the application, with custom theme defined in `lib/theme/theme.ts`.

#### Amplify UI Component Theming

For Amplify UI components (primarily the Authenticator), apply consistent theming via:

1. **ThemeProvider Wrapper:**

```typescript
import { ThemeProvider } from '@aws-amplify/ui-react';
import { defaultTheme } from '@aws-amplify/ui-react';

const customTheme = {
  name: 'perfectit-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#FFF4E6',
          20: '#FFE0B2',
          80: '#D2691E',
          90: '#8B4513',
          100: '#5D2F0B'
        }
      }
    },
    components: {
      authenticator: {
        router: {
          borderColor: '{colors.brand.primary.80}'
        }
      }
    }
  }
};

// Wrap Amplify UI components
<ThemeProvider theme={customTheme}>
  <Authenticator />
</ThemeProvider>
```
````

2. **Accessing Theme Values:**
   Use the `useTheme()` hook within components:

```typescript
import { useTheme } from '@aws-amplify/ui-react';

function CustomComponent() {
  const { tokens } = useTheme();
  return <div style={{ color: tokens.colors.brand.primary[80] }}>...</div>;
}
```

3. **Color Palette Alignment:**
   Ensure Amplify UI theme colors match MUI palette:

- Primary: #D2691E (matches MUI primary.main)
- Secondary: #8B4513 (matches MUI secondary.main)
- Error: #F44336 (matches MUI error.main)
- Success: #4CAF50 (matches MUI success.main)

```

## Implementation Status

### Changes Applied
- ✅ Updated front-end-spec.md Line 544 with correct theming guidance
- ✅ Added Theme Integration Strategy section to front-end-spec.md
- ✅ Documented proper Amplify UI v6 theming patterns

### Files Modified
1. `docs/front-end-spec.md` - Documentation corrections and theme integration guide

## Next Steps

1. **Completed:** Documentation updates applied
2. **Optional Enhancement:** Create a shared theme configuration file that exports both MUI and Amplify UI theme objects from a single source of truth
3. **Future Stories:** Use this theming approach when implementing Story 1.3 (Authentication UI Components)

## Agent Handoff Plan

**No handoff required** - Changes have been implemented directly by Scrum Master.

## Success Criteria

- ✅ front-end-spec.md updated with correct Amplify UI v6 theming guidance
- ✅ Theme integration strategy documented
- ✅ No references to incorrect `{tokens}` export pattern remain
- ✅ Sprint Change Proposal archived in `.ignore/sprint-change-proposals/`

## Lessons Learned

1. **Version-specific documentation:** Always verify library APIs against the specific version being used
2. **Early detection beneficial:** Issue was caught during implementation, preventing propagation
3. **Clear theming strategy needed:** Having both MUI and Amplify UI requires explicit integration guidance

## Change Checklist Completion

- [x] **Section 1: Understand Trigger & Context** - Issue fully understood
- [x] **Section 2: Epic Impact Assessment** - Minimal impact, Epic 1 continues
- [x] **Section 3: Artifact Conflict Analysis** - Only front-end-spec.md affected
- [x] **Section 4: Path Forward Evaluation** - Direct adjustment selected
- [x] **Section 5: Sprint Change Proposal** - Generated and approved
- [x] **Section 6: Implementation** - Changes applied successfully
```
