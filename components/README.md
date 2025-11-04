# Animated Background Component

A reusable animated background component that provides playful, engaging backgrounds for different pages of the NIBOG platform.

## Usage

1. Import the `AnimatedBackground` component:

```tsx
import { AnimatedBackground } from '@/components/animated-background';
import type { PageBackground } from '@/lib/background-styles';
```

2. Wrap your page content with the `AnimatedBackground` component and specify the variant:

```tsx
export default function HomePage() {
  return (
    <AnimatedBackground variant="home">
      {/* Your page content */}
      <div className="container mx-auto p-4">
        <h1>Welcome to NIBOG!</h1>
        {/* Rest of your content */}
      </div>
    </AnimatedBackground>
  );
}
```

## Available Variants

- `home` - Warm welcome with stars, clouds, and balloons
- `events` - Exciting event-themed background with confetti
- `games` - Energetic game-themed background with game elements
- `register` - Clean background for forms with subtle decorations
- `about` - Warm and trustworthy background with book and heart icons
- `contact` - Calm and supportive background with cloud and chat elements

## Customization

You can pass additional CSS classes to the component using the `className` prop:

```tsx
<AnimatedBackground 
  variant="home" 
  className="bg-opacity-50"
>
  {/* Content */}
</AnimatedBackground>
```

## Accessibility

The animated elements are marked with `aria-hidden="true"` to ensure they don't interfere with screen readers. The component is designed to maintain good contrast and readability of the content.

## Performance

The animations are optimized using Framer Motion's `motion` components for smooth performance. The animations are hardware-accelerated and should not impact the performance of your application.
