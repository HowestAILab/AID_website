# App.vue Refactoring Summary

## Overview
The original `App.vue` file was 475 lines long and contained complex logic for managing application state, layout calculations, navigation, and canvas interactions. This refactoring splits the code into separate, focused composables and constants files.

## Created Files

### 1. `src/constants/app.ts`
Contains all static constants extracted from App.vue:
- `TABS` - Tab names array
- `SECTION_LABEL_TEXTS` - Section labels for the diamond layout
- `FULL_HEIGHT_LINE_INDICES` - Indices for full-height lines
- `IMAGE_WIDTH_SCALE_FACTOR` - Scaling factor for image sizing
- `DEFAULT_KONVA_CONFIG` & `DEFAULT_IMAGE_CONFIG` - Default configurations
- `IMAGE_ASPECT_RATIO` - Calculated aspect ratio

### 2. `src/composables/useNavigation.ts`
Handles all navigation-related logic:
- `currentPage` and `currentPhase` state management
- Navigation handlers for different pages
- Project-aware navigation logic
- Integration with the projects system

### 3. `src/composables/useTabs.ts`
Manages tab functionality:
- Active tab state
- Button references management
- Tab switching with layout updates
- Helper functions for tab state validation

### 4. `src/composables/useCanvas.ts`
Handles canvas and image management:
- Konva canvas configuration
- Image loading and setup
- Selected pins management
- Integration with project system for pin persistence

### 5. `src/composables/useLayout.ts`
Contains all layout calculation logic:
- Responsive layout calculations
- Vertical line positioning
- Section label generation
- Resize event handling
- Complex geometric calculations for the diamond layout

## Benefits of This Refactoring

### 1. **Separation of Concerns**
Each composable has a single responsibility:
- Navigation logic is isolated
- Layout calculations are separate from business logic
- Canvas management is decoupled from other concerns

### 2. **Reusability**
Composables can be potentially reused in other components:
- `useNavigation` could be used in other parts of the app
- `useLayout` calculations could be shared with other layout-heavy components

### 3. **Testability**
Each composable can be tested independently:
- Layout calculations can be unit tested
- Navigation logic can be tested without UI dependencies
- Canvas interactions can be mocked and tested

### 4. **Maintainability**
- Reduced complexity in App.vue (from 475 lines to ~160 lines)
- Easier to locate and modify specific functionality
- Clear separation between different types of logic

### 5. **Type Safety**
- Proper TypeScript types for all composables
- Constrained types for tab names and indices
- Better IDE support and autocomplete

## App.vue Changes

The refactored `App.vue`:
- Imports and initializes all composables
- Provides wrapper functions that coordinate between composables
- Maintains the same template structure
- Reduces script section from ~400 lines to ~100 lines

## Key Integration Points

1. **Layout Updates**: The `updateLayoutWithConfigs` function coordinates between layout calculations and canvas configuration.

2. **Navigation Integration**: Navigation composable integrates with the existing projects system.

3. **State Synchronization**: Canvas composable automatically syncs selected pins with project state.

4. **Event Coordination**: Tab changes trigger layout updates through wrapper functions.

## Future Improvements

1. **Further Decomposition**: The layout composable could potentially be split further.
2. **Custom Types**: Create dedicated TypeScript interfaces for configuration objects.
3. **Error Handling**: Add more robust error handling in composables.
4. **Performance**: Consider memoization for expensive layout calculations. 