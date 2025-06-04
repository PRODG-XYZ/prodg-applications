# UI Components

This directory contains shadcn/ui compatible components for the application.

## EtheralShadow Component

A beautiful animated shadow effect component with customizable colors, animations, and noise textures. Perfect for creating eye-catching hero sections and backgrounds.

### Features

- ✨ Animated shadow effects using SVG filters
- 🎨 Customizable colors and opacity
- ⚡ Configurable animation speed and intensity
- 🎭 Optional noise texture overlay
- 📱 Responsive and performant
- 🔧 Built with Framer Motion and TypeScript

### Installation

The component is already integrated into this project. Make sure you have the required dependencies:

```bash
npm install framer-motion
```

### Basic Usage

```tsx
import { EtheralShadow } from "@/components/ui/etheral-shadow";

function MyComponent() {
  return (
    <div className="w-full h-screen">
      <EtheralShadow
        color="rgba(128, 128, 128, 1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
      />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `'rgba(128, 128, 128, 1)'` | RGBA color string for the shadow effect |
| `animation` | `AnimationConfig \| undefined` | `undefined` | Animation configuration object |
| `noise` | `NoiseConfig \| undefined` | `undefined` | Noise texture configuration |
| `sizing` | `'fill' \| 'stretch'` | `'fill'` | How the mask image should be sized |
| `className` | `string` | `undefined` | Additional CSS classes |
| `style` | `CSSProperties` | `undefined` | Additional inline styles |

### Type Definitions

```tsx
interface AnimationConfig {
  scale: number;  // 1-100, controls animation intensity
  speed: number;  // 1-100, controls animation speed
}

interface NoiseConfig {
  opacity: number; // 0-1, noise overlay opacity
  scale: number;   // 0.1-3, noise texture scale
}
```

### Examples

#### Static Shadow (No Animation)
```tsx
<EtheralShadow
  color="rgba(75, 85, 99, 0.8)"
  noise={{ opacity: 0.3, scale: 1 }}
/>
```

#### Fast Animated Shadow
```tsx
<EtheralShadow
  color="rgba(59, 130, 246, 0.9)"
  animation={{ scale: 90, speed: 95 }}
  noise={{ opacity: 0.8, scale: 0.8 }}
  sizing="stretch"
/>
```

#### Ultra-Fast Fluid Animation (Maximum Speed)
```tsx
<EtheralShadow
  color="rgba(128, 128, 128, 1)"
  animation={{ scale: 100, speed: 100 }}
  noise={{ opacity: 1, scale: 1.2 }}
  sizing="fill"
/>
```

#### Hyper-Active Animation (Intense & Fast)
```tsx
<EtheralShadow
  color="rgba(255, 255, 255, 0.8)"
  animation={{ scale: 100, speed: 98 }}
  noise={{ opacity: 0.9, scale: 0.8 }}
  sizing="stretch"
/>
```

#### Slow Animated Shadow
```tsx
<EtheralShadow
  color="rgba(147, 51, 234, 0.7)"
  animation={{ scale: 40, speed: 25 }}
  noise={{ opacity: 0.5, scale: 1.5 }}
/>
```

### Animation Speed Guide

The `speed` parameter controls how fast the hue rotation cycles:
- `speed: 100` = ~50ms cycle (Ultra-fast, maximum fluidity)
- `speed: 98` = ~70ms cycle (Very fast)
- `speed: 95` = ~100ms cycle (Fast)
- `speed: 90` = ~150ms cycle (Medium-fast)
- `speed: 75` = ~300ms cycle (Medium)
- `speed: 50` = ~550ms cycle (Slow)
- `speed: 25` = ~800ms cycle (Very slow)

Higher values create more dynamic, fluid animations, while lower values create more subtle, contemplative effects.

### Demo

Visit `/etheral-demo` to see the component in action with various configurations.

### Notes

- The component uses Framer images for mask and noise textures
- Animation is powered by Framer Motion for smooth performance
- The component is fully responsive and works well in any container
- For best results, place the component in a container with defined dimensions 