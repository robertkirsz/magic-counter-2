# Importance Feature

The importance feature allows you to hide UI elements based on their importance level using a slider in the bottom left corner of the screen.

## How it works

1. **Slider Control**: A slider in the bottom left corner allows you to set the importance level (1-5)
2. **Element Visibility**: Elements with importance levels lower than the current setting are automatically hidden
3. **CSS Classes**: Elements use `importance-{n}` classes where `n` is the importance level (1-5)

## Usage

### Method 1: Using ImportanceWrapper Component

Wrap any element with the `ImportanceWrapper` component:

```tsx
import { ImportanceWrapper } from './components/ImportanceWrapper'

;<ImportanceWrapper importance={3}>
  <p>This text will be hidden when importance is set to 1 or 2</p>
</ImportanceWrapper>
```

### Method 2: Direct CSS Classes

Add the importance class directly to any element:

```tsx
<div className="importance-4">This element will be hidden when importance is set to 1, 2, or 3</div>
```

### Method 3: Using Utility Functions

```tsx
import { getImportanceClass } from './utils/importance'

;<div className={`${getImportanceClass(2)} other-classes`}>This element has importance level 2</div>
```

## Importance Levels

- **Level 1**: Always visible (basic functionality)
- **Level 2**: Hidden when importance < 2 (secondary information)
- **Level 3**: Hidden when importance < 3 (detailed information)
- **Level 4**: Hidden when importance < 4 (advanced features)
- **Level 5**: Hidden when importance < 5 (expert features)

## Example Implementation

In the Games component, different elements have different importance levels:

- **Add New Game button**: Importance 1 (always visible)
- **Created date**: Importance 2 (hidden at level 1)
- **Player names**: Importance 3 (hidden at levels 1-2)
- **Tracking info**: Importance 4 (hidden at levels 1-3)
- **Edit/Delete buttons**: Importance 5 (hidden at levels 1-4)

## Technical Details

- The feature uses CSS classes and JavaScript to manage visibility
- The `useImportanceVisibility` hook handles the dynamic class application
- Elements with `importance-{n}` classes get a `hidden-importance` class when the current importance is less than `n`
- The system is responsive and updates immediately when the slider changes
