# Mobile Responsiveness Guidelines for NIBOG Admin Panel

## Overview
This document provides comprehensive guidelines for maintaining and improving mobile responsiveness across the NIBOG admin panel. Follow these guidelines to ensure a consistent and user-friendly mobile experience.

## Core Principles

### 1. Mobile-First Approach
- Design for mobile screens first, then enhance for larger screens
- Use `min-width` media queries to progressively enhance
- Ensure core functionality works on 320px width screens

### 2. Touch-Friendly Design
- Minimum touch target size: 44px × 44px
- Adequate spacing between interactive elements
- Use `touch-manipulation` CSS class for better touch response

### 3. Progressive Enhancement
- Essential content and functionality available on all screen sizes
- Enhanced features for larger screens
- Graceful degradation when features aren't available

## Breakpoint Strategy

### Tailwind CSS Breakpoints
```css
/* Mobile First */
/* Default: 0px - 639px (Mobile) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Custom Mobile Hook
Use the `useIsMobile()` hook for JavaScript-based responsive behavior:
```typescript
import { useIsMobile } from "@/hooks/use-mobile"

const isMobile = useIsMobile() // Returns true for screens < 768px
```

## Layout Guidelines

### Grid Systems
```tsx
// ✅ Good: Responsive grid
<div className="grid gap-4 sm:gap-6 lg:grid-cols-2">

// ❌ Bad: Fixed grid that breaks on mobile
<div className="grid grid-cols-2 gap-6">
```

### Spacing
```tsx
// ✅ Good: Responsive spacing
<div className="space-y-3 sm:space-y-4 lg:space-y-6">
<div className="p-3 sm:p-4 lg:p-6">

// ❌ Bad: Fixed spacing
<div className="space-y-6 p-6">
```

### Container Widths
```tsx
// ✅ Good: Responsive containers
<div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-full">

// ❌ Bad: Fixed width containers
<div className="w-full max-w-6xl mx-auto p-6">
```

## Component Guidelines

### Navigation
```tsx
// Mobile sidebar implementation
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button 
      variant="ghost" 
      size="icon" 
      className="fixed left-3 top-3 z-40 md:hidden h-10 w-10 touch-manipulation"
    >
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-72 p-0 touch-manipulation">
    {/* Mobile menu content */}
  </SheetContent>
</Sheet>

// Desktop sidebar
<aside className="hidden w-64 border-r bg-background md:block">
  {/* Desktop menu content */}
</aside>
```

### Data Tables
```tsx
// Use EnhancedDataTable with mobile card view
<EnhancedDataTable
  data={data}
  columns={columns.map(col => ({
    ...col,
    priority: col.priority || 999, // Set priority for mobile display
    hideOnMobile: col.hideOnMobile || false
  }))}
  // ... other props
/>
```

### Forms
```tsx
// ✅ Good: Responsive form layout
<form>
  <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
    <Card>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        {/* Form fields */}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4 sm:pt-6 p-4 sm:p-6">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full sm:w-auto touch-manipulation"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="w-full sm:w-auto touch-manipulation"
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  </div>
</form>
```

### Buttons
```tsx
// ✅ Good: Touch-friendly buttons
<Button className="touch-manipulation h-10 min-w-[44px]">
  Action
</Button>

// Mobile-specific button sizing
<Button className={cn(
  "touch-manipulation",
  isMobile ? "w-full h-12" : "w-auto h-10"
)}>
  Responsive Button
</Button>
```

### Popovers and Dropdowns
```tsx
// ✅ Good: Mobile-optimized popover
<PopoverContent 
  className="w-80 sm:w-96" 
  align="end" 
  sideOffset={8}
>
  <div className="space-y-3 sm:space-y-4 p-1">
    {/* Popover content */}
    <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
      <Button className="w-full sm:w-auto touch-manipulation">
        Action
      </Button>
    </div>
  </div>
</PopoverContent>
```

## Header Guidelines

### Admin Header
```tsx
// Mobile-optimized header
<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
  <div className="flex h-16 items-center gap-2 sm:gap-4 px-3 sm:px-6">
    {/* Breadcrumbs - Hidden on mobile */}
    <div className="flex-1 min-w-0 hidden sm:block">
      <Breadcrumb>
        {/* Breadcrumb content */}
      </Breadcrumb>
    </div>

    {/* Mobile title - Only shown on mobile */}
    <div className="flex-1 min-w-0 sm:hidden">
      <h1 className="text-lg font-semibold truncate">
        {mobileTitle}
      </h1>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Mobile-specific actions */}
    </div>
  </div>
</header>
```

## Input Guidelines

### Search Inputs
```tsx
<div className="relative flex-1 sm:max-w-xs">
  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
  <Input
    placeholder="Search..."
    className="pl-9 h-10 touch-manipulation"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

### Form Inputs
```tsx
// ✅ Good: Properly sized inputs
<Input 
  className="h-10 touch-manipulation" 
  placeholder="Enter value"
/>

// ✅ Good: Responsive textarea
<Textarea 
  className="min-h-[80px] sm:min-h-[100px] touch-manipulation"
  rows={3}
/>
```

## Testing Requirements

### Viewport Meta Tag
Ensure all admin layouts include:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

### Responsive Testing
1. Test on actual mobile devices when possible
2. Use browser dev tools responsive mode
3. Test at these key breakpoints:
   - 320px (iPhone SE)
   - 375px (iPhone 8)
   - 390px (iPhone 12)
   - 768px (iPad)
   - 1024px (Desktop)

### Performance Considerations
- Use `touch-manipulation` for better touch response
- Avoid fixed positioning that might interfere with mobile keyboards
- Ensure smooth scrolling with `-webkit-overflow-scrolling: touch`

## Common Patterns

### Responsive Card Layout
```tsx
<div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <Card key={item.id} className="touch-manipulation hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        {/* Card content */}
      </CardContent>
    </Card>
  ))}
</div>
```

### Responsive Action Bar
```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
    {/* Primary actions */}
  </div>
  <div className="flex flex-col sm:flex-row gap-2">
    {/* Secondary actions */}
  </div>
</div>
```

## Accessibility Considerations

### Touch Targets
- Minimum 44px × 44px for touch targets
- Adequate spacing between interactive elements
- Use `touch-manipulation` CSS property

### Text Readability
- Minimum 16px font size for body text
- Adequate contrast ratios
- Avoid horizontal scrolling for text content

### Navigation
- Ensure all functionality is accessible via touch
- Provide clear visual feedback for interactions
- Use semantic HTML elements

## Maintenance Checklist

When adding new components or pages:
- [ ] Test on mobile devices (< 768px width)
- [ ] Ensure touch targets meet minimum size requirements
- [ ] Verify no horizontal scrolling occurs
- [ ] Check that all functionality is accessible on mobile
- [ ] Test with the ResponsiveTestHelper component
- [ ] Validate with the mobile responsiveness test guide

## Tools and Resources

### Development Tools
- `useIsMobile()` hook for responsive JavaScript
- `ResponsiveTestHelper` component for testing
- Tailwind CSS responsive utilities
- Browser dev tools responsive mode

### Testing Resources
- Mobile Responsiveness Test Guide
- Physical device testing
- Browser compatibility testing
- Performance monitoring tools

## Best Practices Summary

1. **Always design mobile-first**
2. **Use responsive utilities consistently**
3. **Test on real devices regularly**
4. **Ensure adequate touch targets**
5. **Maintain consistent spacing patterns**
6. **Optimize for performance on mobile networks**
7. **Follow accessibility guidelines**
8. **Document responsive behavior in components**
