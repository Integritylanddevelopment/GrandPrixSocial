# 🚫 ICON POLICY ENFORCEMENT - GRAND PRIX SOCIAL
*Created: 2025-08-20*
*Priority: CRITICAL - STRICTLY ENFORCED*

## 🔒 ABSOLUTE PROHIBITION

### **STRICTLY FORBIDDEN ICONS:**
- ❌ **ALL Emoji icons** (🏎️, 🏆, 💡, 📊, etc.)
- ❌ **ALL Phone-style icons** 
- ❌ **ALL Unicode emoji characters**
- ❌ **ANY non-Lucide icon library**

## ✅ APPROVED ICONS ONLY

### **LUCIDE ICONS EXCLUSIVELY:**
- ✅ **ONLY Lucide React icons are permitted**
- ✅ Import from: `import { IconName } from "lucide-react"`
- ✅ All icons must be Lucide library components

### **Global CSS Enforcement:**
The global CSS already contains comprehensive emoji prevention:
```css
/* LUCIDE ICONS ONLY - NO EXCEPTIONS */
/* Prevent ALL emoji usage site-wide */
* {
  font-variant-emoji: text !important;
}

/* Hide emoji characters completely */
body {
  font-family: var(--font-rajdhani), "Lucide", sans-serif !important;
}

/* Global emoji prevention - hide all Unicode emoji ranges */
```

## 📋 REPLACEMENT GUIDE

### **Fantasy Formula Page Corrections:**
**BEFORE (FORBIDDEN):**
```typescript
<h3>🏎️ Team Building</h3>     // ❌ WRONG
<h3>🏆 Scoring System</h3>     // ❌ WRONG  
<h3>🎮 League Types</h3>       // ❌ WRONG
<h3>💡 Driver Selection</h3>   // ❌ WRONG
<h3>🏗️ Constructor</h3>        // ❌ WRONG
<h3>📊 Budget Management</h3>  // ❌ WRONG
```

**AFTER (CORRECT):**
```typescript
<div className="flex items-center gap-2">
  <Car className="w-5 h-5 text-purple-400" />        // ✅ CORRECT
  <h3>Team Building</h3>
</div>

<div className="flex items-center gap-2">
  <Trophy className="w-5 h-5 text-purple-400" />     // ✅ CORRECT
  <h3>Scoring System</h3>
</div>

<div className="flex items-center gap-2">
  <Users className="w-5 h-5 text-purple-400" />      // ✅ CORRECT
  <h3>League Types</h3>
</div>

<div className="flex items-center gap-2">
  <Target className="w-5 h-5 text-purple-400" />     // ✅ CORRECT
  <h3>Driver Selection Tips</h3>
</div>

<div className="flex items-center gap-2">
  <Settings className="w-5 h-5 text-purple-400" />   // ✅ CORRECT
  <h3>Constructor Strategy</h3>
</div>

<div className="flex items-center gap-2">
  <TrendingUp className="w-5 h-5 text-purple-400" /> // ✅ CORRECT
  <h3>Budget Management</h3>
</div>
```

## 🔍 ENFORCEMENT PROTOCOL

### **Before ANY Code Changes:**
1. **Review global CSS** for icon restrictions
2. **Check imports** - ensure only `lucide-react`
3. **Scan for emoji** - use regex: `/[\u{1f600}-\u{1f64f}]|[\u{1f300}-\u{1f5ff}]|[\u{1f680}-\u{1f6ff}]|[\u{2600}-\u{26ff}]|[\u{2700}-\u{27bf}]/gu`
4. **Validate compliance** before implementing

### **Icon Approval Process:**
1. **Source**: Must be from Lucide React library
2. **Import**: `import { IconName } from "lucide-react"`
3. **Usage**: Standard Lucide component syntax
4. **Styling**: Consistent with design system

## 🚨 VIOLATION CONSEQUENCES

### **Immediate Actions Required:**
- **Stop all development** until violations are corrected
- **Remove ALL emoji icons** immediately
- **Replace with Lucide equivalents** 
- **Document the violation** for prevention

### **Prevention Measures:**
- **Pre-commit hooks** to scan for emoji
- **Linting rules** to enforce Lucide-only
- **Code reviews** must check icon compliance
- **Automated testing** for icon violations

## 📚 LUCIDE ICON REFERENCE

### **Common F1/Racing Icons:**
```typescript
import { 
  Car,           // Racing cars
  Trophy,        // Winners/achievements
  Target,        // Precision/strategy
  Settings,      // Configuration/setup
  TrendingUp,    // Performance/analytics
  Users,         // Teams/community
  DollarSign,    // Budget/pricing
  HelpCircle,    // Information/help
  BookOpen       // Guides/documentation
} from "lucide-react"
```

## 🔐 COMMITMENT STATEMENT

**This policy is NON-NEGOTIABLE:**
- Emoji icons cause user experience degradation
- Consistency is paramount for professional UI
- Lucide icons provide superior scalability
- Brand coherence requires icon standardization

**ALL DEVELOPERS MUST:**
- Understand this policy completely
- Check global CSS before any icon changes
- Use ONLY Lucide React icons
- Never introduce emoji or phone-style icons

---

## Tags
#type:policy #project:grandprix #intent:enforcement #priority:critical #icons:lucide-only #forbidden:emoji