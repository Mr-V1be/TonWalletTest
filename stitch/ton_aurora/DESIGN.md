# Design System Specification: High-End Crypto Editorial

## 1. Overview & Creative North Star: "The Ethereal Vault"
The North Star for this design system is **"The Ethereal Vault."** In the world of self-custodial crypto, users often feel a tension between high-tech complexity and the need for security. This system resolves that tension by treating the UI not as a utility app, but as a premium digital gallery.

We move beyond the "template" look by embracing **intentional asymmetry** and **tonal depth**. Rather than a grid of boxes, we use a "layered glass" metaphor. Information is not just displayed; it is curated. Large, high-contrast display typography is paired with dense, technical monospaced data, creating an authoritative "Editorial Tech" aesthetic that feels both futuristic and trustworthy.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The color palette is anchored in a deep navy cosmos, allowing the vibrant TON Blue to act as a beacon for action.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Traditional lines create visual "noise" that interrupts the premium feel. 
- **Boundaries:** Define sections solely through background shifts (e.g., a `surface-container-low` card nested within a `surface` background).
- **Transitions:** Use subtle tonal variations to imply structure.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent layers.
- **Base Layer:** `surface` (#0f131c)
- **Primary Containers:** `surface-container-low` (#181c24) for broad sections.
- **Actionable Cards:** `surface-container` (#1c2028) or `surface-container-high` (#262a33) to pull focus forward.

### The Glass & Gradient Rule
To achieve a "signature" look, main CTAs and hero balance cards must utilize **Signature Textures**. 
- **The TON Glow:** Use a linear gradient from `primary-container` (#0098ea) to `primary` (#96ccff) at a 135-degree angle.
- **Glassmorphism:** For floating overlays (modals/tooltips), use `surface-variant` (#31353e) at 60% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
The type system blends the approachability of *Inter* with the architectural precision of *Plus Jakarta Sans* and the technical clarity of *Space Grotesk*.

| Level | Token | Font Family | Size | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Plus Jakarta Sans | 3.5rem | Hero balances & TON amounts |
| **Headline** | `headline-md` | Plus Jakarta Sans | 1.75rem | Page titles |
| **Title** | `title-md` | Inter | 1.125rem | Section headers |
| **Body** | `body-md` | Inter | 0.875rem | Descriptions & metadata |
| **Label** | `label-md` | Space Grotesk | 0.75rem | Addresses, Hashes, Monospaced data |

**Design Note:** Always pair `display-lg` (TON balance) with `label-md` (Wallet Address) to create a high-contrast hierarchy that feels like a modern financial broadsheet.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to represent "elevation" in the traditional sense. Instead, we use **Tonal Layering**.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "recessed" look without harsh shadows.
- **Ambient Shadows:** Only for highest-level floating elements (e.g., Send Confirmations). Use a 40px blur, 6% opacity shadow tinted with `surface-tint` (#96ccff).
- **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` (#3f4851) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components: Primitive styling

### Buttons
- **Primary:** Gradient fill (`primary-container` to `primary`), `xl` (1.5rem) roundedness. No border. Text color: `on-primary`.
- **Secondary:** `surface-container-highest` fill. Subtle `surface-tint` ghost border (10% opacity).
- **Tertiary:** No background. Text color: `primary`.

### Input Fields
- **Container:** `surface-container-low`.
- **Active State:** Change background to `surface-container-high`. Add a 1px "Ghost Border" using `primary` at 20% opacity.
- **Typography:** User input should always use `body-lg`. Wallet addresses/public keys must use `label-md` (Space Grotesk).

### Cards & Lists (The "Divider-Free" Rule)
- **Style:** Forbid the use of divider lines.
- **Separation:** Use `spacing-4` (1rem) vertical white space or shift the background from `surface-container-low` to `surface-container-highest` to differentiate list items.
- **Glassmorphism:** Use for "Quick Action" bars at the bottom of the screen—`surface-container-low` at 70% opacity with backdrop-blur.

### Transaction Chips
- **Status:** Use `tertiary-container` (#d87901) for pending and `error_container` (#93000a) for failed. Roundedness: `full`.

---

## 6. Do’s and Don’ts

### Do
- **Use "Breathing Room":** Leverage `spacing-12` (3rem) and `spacing-16` (4rem) for margins around large balances.
- **Embrace Monospace:** Use Space Grotesk for all crypto-specific strings (TxIDs, Seed Phrases, Addresses).
- **Layer with Intent:** Ensure that every nested container is either a step darker or lighter than its parent.

### Don’t
- **Don’t use 1px lines:** Do not use dividers to separate transactions in a list; use vertical rhythm and background shifts.
- **Don’t use generic blue:** Avoid standard hex codes. Only use the defined `TON blue` (#0098EA) for primary intent.
- **Don’t use "Flat" buttons:** Avoid buttons that lack the signature gradient or glass effect, as they will look unfinished against the deep navy background.