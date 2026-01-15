# Style Guide

Visual design and TailwindCSS styling rules for this project.

## Color Scheme

- Follow color scheme of `./public/logo.png`
- Primary button color: `#174F7F`
- ALWAYS use TailwindCSS for styling

## Layout Consistency Rules

### Page Structure Requirements

All pages must follow a consistent layout structure for uniform spacing and visual hierarchy.

### Required Page Structure Pattern

```tsx
export default function YourPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Title</h1>
        <p className="text-gray-600">Page description</p>
      </div>

      {/* Additional content sections */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Content */}
      </div>
    </div>
  )
}
```

### Critical Layout Rules

1. **Root Container**: ALWAYS use `<div className="space-y-6">` as root container
2. **Content Cards**: Use `<div className="bg-white shadow rounded-lg p-6">` for sections
3. **No Additional Containers**: NEVER add extra container divs, padding, or margins
4. **Let MainLayout Handle Spacing**: MainLayout.tsx handles all page-level margins

### Forbidden Practices

**DO NOT add to any page:**
- Extra container divs with padding/margins
- Custom margin or padding classes on root page element
- Any layout styling that conflicts with MainLayout
- Page-specific spacing overrides

**DO NOT modify MainLayout margin values:**
- The margin values (`ml-72`, `ml-20`, `mr-2`, `mx-2`, `pt-20`) are calibrated
- These ensure proper sidebar and navbar spacing

## Standard Page Patterns

### Basic Page with Header
```tsx
export default function BasicPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Title</h1>
        <p className="text-gray-600">Brief description</p>
      </div>
    </div>
  )
}
```

### Page with Multiple Sections
```tsx
export default function MultiSectionPage() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Title</h1>
        <p className="text-gray-600">Page description</p>
      </div>

      {/* Stats section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stat cards */}
        </div>
      </div>

      {/* Main content section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Main Content</h2>
        </div>
        <div className="p-6">
          {/* Content */}
        </div>
      </div>
    </div>
  )
}
```

## Correct vs Incorrect Examples

### CORRECT:
```tsx
export default function MyPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Page</h1>
      </div>
    </div>
  )
}
```

### INCORRECT:
```tsx
// DO NOT DO THIS
export default function MyPage() {
  return (
    <div className="container mx-auto p-6"> {/* ❌ Extra container */}
      <div className="max-w-4xl mx-auto"> {/* ❌ Extra wrapper */}
        <h1>My Page</h1>
      </div>
    </div>
  )
}
```

## Layout Consistency Benefits

- **Consistent Visual Hierarchy**: All pages have same spacing and card structure
- **Responsive Design**: MainLayout handles all responsive behavior
- **Sidebar Integration**: Proper spacing for collapsed/expanded states
- **Navbar Integration**: Correct top padding for fixed navbar
- **Mobile Optimization**: Consistent mobile margins and spacing
