# Grand Prix Social - Global CSS Style Guide

## 🎨 **Design System Overview**

### **Color Palette**
- **Primary Purple**: `rgba(168, 85, 247, 0.3)` with blur effects
- **Background**: Dark gradient `linear-gradient(135deg, #000000 0%, #1a0a0a 50%, #000000 100%)`
- **Card Backgrounds**: Glass morphism with purple accents
- **Text**: White primary, gray-300 secondary, gray-400 tertiary

### **Typography System**
- **Primary Font**: `Orbitron` (headings, titles, important UI)
- **Secondary Font**: `Rajdhani` (body text, descriptions, buttons)
- **Body Default**: `font-rajdhani` applied globally

#### Typography Classes:
```css
.f1-heading-xl    /* 4xl font-bold font-orbitron text-white */
.f1-heading-lg    /* 3xl font-bold font-orbitron text-white */
.f1-heading-md    /* 2xl font-semibold font-orbitron text-white */
.f1-heading-sm    /* xl font-medium font-orbitron text-white */
.f1-body-lg       /* lg font-rajdhani text-gray-300 */
.f1-body-md       /* base font-rajdhani text-gray-300 */
.f1-body-sm       /* sm font-rajdhani text-gray-400 */
```

### **Glass Morphism System**
#### Base Glass:
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

#### Colored Glass Variants:
```css
.glass-purple {
  background: rgba(168, 85, 247, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  border: 2px solid rgba(168, 85, 247, 0.5) !important;
  box-shadow: 0 8px 32px 0 rgba(168, 85, 247, 0.4) !important;
}

.glass-blue     /* Blue variant */
.glass-green    /* Green variant */
.glass-yellow   /* Yellow variant */
.glass-red      /* Red variant */
```

### **Card System**
#### F1 Card:
```css
.f1-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1.5rem;
  space-y: 1rem;
}
```

#### Team Card:
```css
.team-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### **Button System**
#### F1 Themed Buttons:
```css
.btn-f1-red      /* Red border, red text, red hover */
.btn-f1-blue     /* Blue border, blue text, blue hover */
.btn-f1-green    /* Green border, green text, green hover */
.btn-f1-yellow   /* Yellow border, yellow text, yellow hover */
.btn-f1-ferrari  /* Ferrari red variant */
.btn-f1-mercedes /* Mercedes cyan variant */
.btn-f1-mclaren  /* McLaren orange variant */
.btn-f1-redbull  /* Red Bull blue variant */
```

#### Glass Button:
```css
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  hover:bg-white/20;
}
```

### **Layout System**
```css
.f1-container    /* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */
.f1-section      /* py-12 space-y-8 */
.f1-grid         /* grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */
.f1-flex-center  /* flex items-center justify-center */
.f1-flex-between /* flex items-center justify-between */
.f1-flex-start   /* flex items-center justify-start */
```

### **Icon System**
- **LUCIDE ICONS ONLY** - No emojis, Font Awesome, or other icon libraries
- Default stroke-width: 2
- Emojis are globally disabled via CSS
- Use Lucide React components for all icons

### **Tab System with Glass Effects**
- Active tabs use colored glass effects
- Purple theme for Fantasy section
- Radix UI TabsTrigger overrides with maximum specificity
- Active state: `background: rgba(168, 85, 247, 0.4) !important`

### **Mobile Optimization**
```css
.mobile-optimized  /* bg-gradient-to-br from-gray-900 via-black to-red-900/20 pb-20 */
.mobile-card       /* bg-gray-900/60 border border-gray-700 rounded-lg p-4 backdrop-blur-sm */
.mobile-btn        /* flex items-center justify-center rounded-lg font-medium transition-colors */
```

### **Racing Theme Variables**
```css
--racing-red: #dc2626;
--racing-blue: #2563eb;
--racing-gold: #f59e0b;
--racing-ferrari: #dc143c;
--racing-mercedes: #00d2be;
--racing-mclaren: #ff8700;
--racing-redbull: #0600ef;
```

## 📋 **Style Consistency Rules**

1. **Always use `glass-purple` for Fantasy Formula section**
2. **Orbitron for all headings, Rajdhani for body text**
3. **Lucide icons only - no emojis**
4. **Purple accents throughout Fantasy section**
5. **Glass morphism cards with blur effects**
6. **Consistent spacing with f1-section and f1-container**
7. **All buttons follow F1 button system**
8. **Modal dialogs use glass background with site colors**

## 🎯 **Fantasy Formula Specific**
- **Primary color**: Purple (`rgba(168, 85, 247, 0.3)`)
- **Cards**: `glass-purple` class
- **Buttons**: Purple variants
- **Icons**: Lucide Trophy, Car, etc.
- **Background**: Same as global dark gradient
- **Typography**: Orbitron headings, Rajdhani body