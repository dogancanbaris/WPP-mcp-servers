# Agent 9: Location, Price & Promotion Extension Tools - Complete

**Date:** October 31, 2025
**Status:** ✅ COMPLETE
**Tools Created:** 5

---

## 📋 Tools Created

### 1. Create Location Extension (`create_location_extension`)
**File:** `/src/ads/tools/extensions/create-location-extension.tool.ts`

**Purpose:** Create location extensions from Google Business Profile

**Features:**
- **Discovery Workflow:**
  1. Account selection
  2. Business Profile location discovery
  3. Campaign attachment (optional)
  4. Dry-run preview
  5. Execute with confirmation

**Key Validations:**
- Checks if Business Profile is linked
- Provides setup guidance if no locations found
- Account-level vs campaign-level options
- Automatic policy review timeline

**Character Limits:** N/A (uses Google Business Profile data)

**Example Use Case:**
- Show business address below ads
- Help users find physical location
- Increase trust and credibility

---

### 2. Update Location Extension (`update_location_extension`)
**File:** `/src/ads/tools/extensions/update-location-extension.tool.ts`

**Purpose:** Update location extension status (enable/disable/remove)

**Features:**
- **Discovery Workflow:**
  1. Account selection
  2. Asset discovery (existing locations)
  3. Status selection (ENABLED, PAUSED, REMOVED)
  4. Dry-run preview
  5. Execute with confirmation

**Key Validations:**
- Warns about REMOVED being permanent
- Explains PAUSED vs ENABLED differences
- Shows timeline for changes to take effect

---

### 3. Create Price Extension (`create_price_extension`)
**File:** `/src/ads/tools/extensions/create-price-extension.tool.ts`

**Purpose:** Create price extensions with product/service pricing table (3-8 items)

**Features:**
- **Discovery Workflow:**
  1. Account selection
  2. Price qualifier (FROM, UP_TO, AVERAGE)
  3. Currency code selection
  4. Price items specification (3-8 items)
  5. Validation
  6. Dry-run preview
  7. Execute with confirmation

**Key Validations:**
- **Minimum 3 items, maximum 8 items**
- **Header:** Max 25 characters (required)
- **Description:** Max 25 characters (required)
- **Price:** Positive number (required)
- **URL:** Valid HTTPS URL (required)

**Character Limits:**
- Header: 25 chars
- Description: 25 chars

**Example Use Cases:**
- Service tiers (Basic, Pro, Enterprise)
- Product categories (Shoes, Shirts, Accessories)
- Event tickets (General, VIP, Premium)

**Price Qualifiers:**
- **FROM:** "From $99"
- **UP_TO:** "Up to $499"
- **AVERAGE:** "Average $299"

---

### 4. Create Promotion Extension (`create_promotion_extension`)
**File:** `/src/ads/tools/extensions/create-promotion-extension.tool.ts`

**Purpose:** Create promotion extensions for sales/special offers

**Features:**
- **Discovery Workflow:**
  1. Account selection
  2. Promotion target specification (max 15 chars)
  3. Discount type (PERCENT_OFF, MONEY_OFF, UP_TO_PERCENT_OFF, UP_TO_MONEY_OFF)
  4. Discount amount
  5. Currency code (if money discount)
  6. Occasion & dates
  7. Landing page URL
  8. Validation
  9. Dry-run preview
  10. Execute with confirmation

**Key Validations:**
- **Promotion Target:** Max 15 characters
- **End Date:** REQUIRED, must be in future
- **Start Date:** Optional, defaults to immediate
- **URL:** Must be HTTPS
- **Dates:** Start < End, End > Today

**Character Limits:**
- Promotion target: 15 chars

**Discount Types:**
- **PERCENT_OFF:** "20% OFF"
- **MONEY_OFF:** "$50 OFF"
- **UP_TO_PERCENT_OFF:** "Up to 50% OFF"
- **UP_TO_MONEY_OFF:** "Up to $100 OFF"

**Occasions:**
- BLACK_FRIDAY, CYBER_MONDAY
- CHRISTMAS, NEW_YEARS
- MOTHERS_DAY, FATHERS_DAY
- BACK_TO_SCHOOL, LABOR_DAY
- HALLOWEEN, THANKSGIVING
- VALENTINES_DAY, EASTER
- UNKNOWN (generic)

**Example Use Cases:**
- Holiday sales (Black Friday, Christmas)
- Seasonal promotions (Back to School)
- Flash sales (Limited time offers)
- Event-specific discounts

**Auto-Expiration:** Promotions automatically stop after end date

---

### 5. Update Promotion Extension (`update_promotion_extension`)
**File:** `/src/ads/tools/extensions/update-promotion-extension.tool.ts`

**Purpose:** Update promotion extension status

**Features:**
- **Discovery Workflow:**
  1. Account selection
  2. Asset discovery (existing promotions)
  3. Status selection (ENABLED, PAUSED, REMOVED)
  4. Dry-run preview
  5. Execute with confirmation

**Key Validations:**
- Warns about REMOVED being permanent
- Checks if promotion is past end date
- Explains status implications

---

## 🔧 Technical Implementation

### Interactive Workflow Pattern
All tools use the `WorkflowBuilder` pattern:

```typescript
const workflow = new WorkflowBuilder()
  .addStep(condition1, handler1)  // Account discovery
  .addStep(condition2, handler2)  // Resource discovery
  .addStep(condition3, handler3)  // Input specification
  .addStep(condition4, handler4)  // Dry-run preview
  .addStep(condition5, handler5)  // Execute with confirmation

return await workflow.execute(input);
```

### Approval Enforcement
All WRITE operations use multi-step approval:

1. **Discovery:** Guide user to provide required parameters
2. **Validation:** Check input constraints (character limits, dates, etc.)
3. **Dry-Run:** Show preview of changes, risks, and recommendations
4. **Confirmation:** User must provide confirmationToken
5. **Execution:** Perform API mutation
6. **Audit:** Log operation (success or failure)

### Google Ads API Integration

**Assets Created:**
- **Location:** Links existing Google Business Profile
- **Price:** Creates PRICE asset with 3-8 offerings
- **Promotion:** Creates PROMOTION asset with discount details

**Asset Linking:**
- **Account-level:** `customer_asset` (affects all campaigns)
- **Campaign-level:** `customer_asset` with campaign reference

**API Services Used:**
- `customer.assets.create()` - Create new assets
- `customer.customerAssets.create()` - Link assets to account/campaign
- `customer.customerAssets.update()` - Update asset status

---

## 📊 Integration

### Export Structure

**`/src/ads/tools/extensions/index.ts`:**
```typescript
export { createLocationExtensionTool } from './create-location-extension.tool.js';
export { updateLocationExtensionTool } from './update-location-extension.tool.js';
export { createPriceExtensionTool } from './create-price-extension.tool.js';
export { createPromotionExtensionTool } from './create-promotion-extension.tool.js';
export { updatePromotionExtensionTool } from './update-promotion-extension.tool.js';
```

**`/src/ads/tools/extensions.ts`:**
```typescript
export const extensionTools = [
  listAdExtensionsTool,
  // ... other extensions (8 tools)
  createLocationExtensionTool,       // NEW
  updateLocationExtensionTool,       // NEW
  createPriceExtensionTool,          // NEW
  createPromotionExtensionTool,      // NEW
  updatePromotionExtensionTool,      // NEW
];
```

**Total Extension Tools:** 14 (9 existing + 5 new)

---

## ✅ Verification Checklist

- [x] All 5 tools created with interactive workflows
- [x] Multi-step approval for all WRITE operations
- [x] Character limit validations (price: 25 chars, promotion: 15 chars)
- [x] Date validation (start < end, end > today)
- [x] URL validation (HTTPS required)
- [x] Business Profile linking guidance
- [x] Dry-run previews with risks and recommendations
- [x] Audit logging (success and failure)
- [x] Tools exported in index.ts
- [x] Tools added to extensionTools array
- [x] OAuth token extraction from headers
- [x] Discovery workflows for all required parameters
- [x] Rich guidance in responses (setup instructions, best practices)

---

## 🎯 Key Design Decisions

### 1. Location Extensions
**Decision:** Check for linked Business Profile first
**Rationale:** Location extensions require active Google Business Profile. If not linked, provide setup instructions (not error).

### 2. Price Extensions
**Decision:** Require 3-8 items minimum
**Rationale:** Google Ads policy requires minimum 3 items for price extensions. Maximum 8 for mobile display.

**Decision:** Validate character limits upfront (25 chars)
**Rationale:** Google Ads enforces strict limits. Better to validate before API call.

### 3. Promotion Extensions
**Decision:** Require end date, make start date optional
**Rationale:** Google Ads requires end date for auto-expiration. Start date optional (defaults to immediate).

**Decision:** Provide occasion enum
**Rationale:** Google uses occasions for optimization. Predefined list prevents typos.

### 4. Status Updates
**Decision:** Warn about REMOVED being permanent
**Rationale:** Unlike PAUSED, REMOVED cannot be reversed. Must recreate extension.

---

## 📚 Documentation Added

Each tool includes:
- **Purpose:** What the tool does
- **Parameters:** All required and optional inputs
- **Examples:** Real-world use cases
- **Character Limits:** Google Ads policy requirements
- **Best Practices:** Recommendations for effective use
- **Timeline:** Review times, when changes take effect
- **Next Steps:** Related tools and monitoring suggestions

---

## 🚀 Next Steps

**For Google Backend Integration:**
1. Build TypeScript: `npm run build`
2. Start Google backend: `npm run dev:google-backend`
3. Verify all 5 tools load successfully
4. Test with MCP router: `npm run dev:router`

**For Testing:**
1. Call `create_location_extension` without params → Should discover account
2. Call with customerId → Should discover Business Profiles
3. Call with all params except confirmationToken → Should show dry-run
4. Call with confirmationToken → Should create extension

**For Documentation:**
1. Update tool count in CLAUDE.md (66 → 71 tools)
2. Update extension tools count (9 → 14 tools)
3. Add to Google Ads API documentation

---

## 📝 Files Created

1. `/src/ads/tools/extensions/create-location-extension.tool.ts` (436 lines)
2. `/src/ads/tools/extensions/update-location-extension.tool.ts` (344 lines)
3. `/src/ads/tools/extensions/create-price-extension.tool.ts` (532 lines)
4. `/src/ads/tools/extensions/create-promotion-extension.tool.ts` (678 lines)
5. `/src/ads/tools/extensions/update-promotion-extension.tool.ts` (375 lines)

**Total Lines:** 2,365 lines of production code

---

## 🎉 Summary

**AGENT 9 COMPLETE:**
- ✅ 5 extension tools created
- ✅ Interactive workflows implemented
- ✅ Multi-step approval enforced
- ✅ Character limits validated
- ✅ Date validations implemented
- ✅ Business Profile setup guidance
- ✅ Tools integrated into extension collection
- ✅ Ready for build and testing

**Next Agent:** Agent 10 (if any remaining tools) or proceed to build and test.
