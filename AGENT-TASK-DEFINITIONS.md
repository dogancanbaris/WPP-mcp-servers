# 15 Parallel Agent Task Definitions - Google Ads Tool Expansion

**Date:** October 31, 2025
**Mission:** Add 39 new Google Ads MCP tools via 15 parallel agents
**Target:** 66 total Google Ads tools (from 27 current)

---

## AGENT 1: Ad Group Management (3 tools)

**Tools:** create_ad_group, update_ad_group, list_ad_groups
**Directory:** Create `src/ads/tools/ad-groups/`
**Complexity:** HIGH (foundation tools)
**Estimated Time:** 2-3 hours

---

## AGENT 2: Ad Creative Management (3 tools)

**Tools:** create_ad, update_ad, list_ads
**Directory:** Create `src/ads/tools/ads/`
**Complexity:** HIGH (responsive search ads, character validation)
**Estimated Time:** 2-3 hours

---

## AGENT 3: Keyword Discovery & Removal (2 tools)

**Tools:** list_keywords, remove_keywords
**File:** Update `src/ads/tools/keywords.ts`
**Complexity:** MEDIUM
**Estimated Time:** 1.5-2 hours

---

## AGENT 4: Keyword Update Operations (2 tools)

**Tools:** update_keyword, pause_keyword
**File:** Update `src/ads/tools/keywords.ts`
**Complexity:** MEDIUM
**Estimated Time:** 1.5-2 hours

---

## AGENT 5: Portfolio Bidding Strategies (3 tools)

**Tools:** create_portfolio_bidding_strategy, update_bidding_strategy, set_ad_group_cpc_bid
**File:** Update `src/ads/tools/bidding.ts`
**Complexity:** MEDIUM-HIGH
**Estimated Time:** 2-3 hours

---

## AGENT 6: Advanced Reporting (3 tools)

**Tools:** run_custom_report, get_ad_group_performance, get_ad_performance
**Directory:** Update `src/ads/tools/reporting/`
**Complexity:** HIGH (flexible GAQL builder)
**Estimated Time:** 2-3 hours

---

## AGENT 7: Sitelink & Callout Extensions (4 tools)

**Tools:** create_sitelink_extension, update_sitelink_extension, create_callout_extension, update_callout_extension
**Directory:** Create `src/ads/tools/extensions/`
**Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

---

## AGENT 8: Structured Snippet & Call Extensions (4 tools)

**Tools:** create_structured_snippet, update_structured_snippet, create_call_extension, update_call_extension
**Directory:** `src/ads/tools/extensions/`
**Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

---

## AGENT 9: Location/Price/Promotion Extensions (5 tools)

**Tools:** create_location_extension, update_location_extension, create_price_extension, create_promotion_extension, update_promotion_extension
**Directory:** `src/ads/tools/extensions/`
**Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

---

## AGENT 10: Label Management (6 tools)

**Tools:** create_label, list_labels, remove_label, apply_label_to_campaign, apply_label_to_ad_group, apply_label_to_keyword
**File:** Create `src/ads/tools/labels.ts`
**Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

---

## AGENT 11: Targeting Criteria (5 tools)

**Tools:** add_location_criteria, add_language_criteria, add_demographic_criteria, add_audience_criteria, set_ad_schedule
**Directory:** Create `src/ads/tools/targeting/`
**Complexity:** MEDIUM-HIGH
**Estimated Time:** 2-3 hours

---

## AGENT 12: Bid Modifiers (4 tools)

**Tools:** create_device_bid_modifier, create_location_bid_modifier, create_demographic_bid_modifier, create_ad_schedule_bid_modifier
**Directory:** Create `src/ads/tools/bid-modifiers/`
**Complexity:** MEDIUM
**Estimated Time:** 2-3 hours

---

## AGENT 13: Remaining Keyword Operations (3 tools)

**Tools:** set_keyword_bid, remove_negative_keywords, update_keyword_match_type
**File:** Update `src/ads/tools/keywords.ts`
**Complexity:** MEDIUM
**Estimated Time:** 1.5-2 hours

---

## AGENT 14: Ad & Ad Group Advanced Ops (3 tools)

**Tools:** pause_ad, update_ad_status, update_ad_group_bid_modifier
**Files:** `src/ads/tools/ads/` and `src/ads/tools/ad-groups/`
**Complexity:** MEDIUM
**Estimated Time:** 1.5-2 hours

---

## AGENT 15: Quality & Insights Reports (2 tools)

**Tools:** get_quality_score_report, get_auction_insights
**Directory:** `src/ads/tools/reporting/`
**Complexity:** MEDIUM
**Estimated Time:** 1.5-2 hours

---

**TOTAL: 39 tools across 15 agents, 3-4 hours parallel execution**
