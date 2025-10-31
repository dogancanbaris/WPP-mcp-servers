# Marketing Platforms API Capabilities - Comprehensive Research

**Research Date:** October 31, 2025
**Purpose:** Document API capabilities for 6 new marketing platforms to be integrated into WPP Digital Marketing MCP Server

---

## Executive Summary

This document provides a comprehensive analysis of 6 major marketing platforms and their API capabilities. All platforms support OAuth 2.0 authentication, making them compatible with our centralized authorization system.

**Platforms Analyzed:**
1. Meta (Facebook/Instagram) Marketing API
2. Amazon Ads API
3. Amazon Seller/Vendor Central (SP-API)
4. Microsoft Advertising (Bing Ads) API
5. Bing Webmaster Tools API (Organic Search)
6. X (Twitter) Ads API
7. TikTok Marketing API

**Total Estimated Operations:** ~510 API operations across all platforms

**Key Finding:** All platforms support OAuth 2.0, ensuring seamless integration with our existing authorization infrastructure.

---

## Authentication Matrix

| Platform | Auth Method | Token Type | Scopes/Permissions | Additional Requirements |
|----------|-------------|------------|-------------------|-------------------------|
| **Meta** | OAuth 2.0 | Access Token | ads_management, ads_read | Facebook App |
| **Amazon Ads** | OAuth 2.0 | Access Token + Refresh | advertising::campaign_management | Developer Token |
| **Amazon SP-API** | LWA OAuth 2.0 | LWA Access Token | Multiple scopes per API | App registration |
| **Microsoft Ads** | OAuth 2.0 | Access Token | https://ads.microsoft.com/msads.manage | Developer Token |
| **Bing Webmaster** | OAuth 2.0 | Access Token | webmaster.read, webmaster.manage | Site ownership |
| **X Ads** | OAuth 1.0a/2.0 | Access Token | ads:write, ads:read, analytics:read | Ads API access approval |
| **TikTok** | OAuth 2.0 | Access Token | Advertiser management | Business verification |

---

## Platform 1: Meta (Facebook/Instagram) Marketing API

**Base URL:** `https://graph.facebook.com/v24.0/`
**Current Version:** v24.0 (versioned API)
**OAuth Scopes:** `ads_management`, `ads_read`, `business_management`

### READ Operations (~15 operations)

**Account & Campaign Hierarchy:**
- `GET /act_{ad_account_id}/campaigns` - List campaigns
- `GET /{campaign_id}` - Get campaign details
- `GET /act_{ad_account_id}/adsets` - List ad sets
- `GET /{ad_set_id}` - Get ad set details
- `GET /act_{ad_account_id}/ads` - List ads
- `GET /{ad_id}` - Get ad details
- `GET /{creative_id}` - Get creative details

**Performance & Insights:**
- `GET /act_{ad_account_id}/insights` - Account-level insights
- `GET /{campaign_id}/insights` - Campaign performance
- `GET /{ad_set_id}/insights` - Ad set performance
- `GET /{ad_id}/insights` - Ad performance
- `GET /{ad_set_id}/delivery_estimate` - Delivery estimates

**Audiences:**
- `GET /act_{ad_account_id}/customaudiences` - List custom audiences
- `GET /{audience_id}` - Get audience details

**Creatives:**
- `GET /{creative_id}/previews` - Ad creative previews

### WRITE Operations (~35 operations)

**Campaign Management:**
- `POST /act_{ad_account_id}/campaigns` - Create campaign
  - Required: name, objective, status, special_ad_categories
  - Objectives: OUTCOME_TRAFFIC, OUTCOME_LEADS, OUTCOME_SALES, OUTCOME_ENGAGEMENT, OUTCOME_AWARENESS, LINK_CLICKS, CONVERSIONS, APP_INSTALLS, VIDEO_VIEWS, etc.
- `POST /{campaign_id}` - Update campaign
  - Updatable: objective, daily_budget, lifetime_budget, status, bid_strategy
  - Status options: ACTIVE, PAUSED, ARCHIVED
- Budget schedule specs support

**Ad Set Management:**
- `POST /act_{ad_account_id}/adsets` - Create ad set
  - Required: name, campaign_id, daily_budget/lifetime_budget, billing_event, optimization_goal, targeting, status
  - Billing events: IMPRESSIONS, LINK_CLICKS, THRUPLAY, APP_INSTALLS
  - Optimization goals: LINK_CLICKS, CONVERSIONS, IMPRESSIONS, REACH, LANDING_PAGE_VIEWS, THRUPLAY
- `POST /{ad_set_id}` - Update ad set
- `POST /{ad_set_id}/copies` - Copy ad set
  - Options: deep_copy, rename_strategy, status_option

**Ad Management:**
- `POST /act_{ad_account_id}/ads` - Create ad
  - Required: name, adset_id, creative, status, tracking_specs
- `POST /{ad_id}` - Update ad
- `POST /{ad_id}/copies` - Copy ad

**Creative Management:**
- `POST /act_{ad_account_id}/adcreatives` - Create creative
  - Types: Link ads, image ads, video ads, carousel ads, collection ads, catalog ads
  - object_story_spec: link_data, video_data, template_data
  - Features: format_automation, media_type_automation, standard_enhancements
  - Authorization categories: POLITICAL, POLITICAL_WITH_DIGITALLY_CREATED_MEDIA
- Image/video uploads
- Dynamic creative optimization
- Catalog product feeds

**Audience Management:**
- `POST /act_{ad_account_id}/customaudiences` - Create custom audience
  - Types: CUSTOM, LOOKALIKE, WEBSITE_TRAFFIC, APP_ACTIVITY, CUSTOMER_LIST
- `POST /customaudiences` - Create lookalike audience
  - Based on: conversion data, custom audiences, page engagement
  - Expansion: 1%-20% of country population
- Upload customer match data (emails, phones, hashed)

**Conversion Tracking:**
- Facebook Pixel setup
- Conversions API (server-side events)
- Custom conversions
- Offline conversions

---

## Platform 2: Amazon Ads API

**Base URL:** `https://advertising-api.amazon.com/`
**Current Version:** v3 (Reporting), v2 (Legacy campaigns), v1 (Unified)
**OAuth Scopes:** `advertising::campaign_management`
**Additional Auth:** Developer Token required

### READ Operations (~40 operations)

**Account:**
- `GET /v2/profiles` - List advertising profiles
- `GET /v2/profiles/{profileId}` - Profile details

**Campaigns:**
- `GET /v2/sp/campaigns` - List Sponsored Products campaigns
- `GET /v2/sp/campaigns/extended` - Campaigns with metrics
- `GET /v2/sb/campaigns` - Sponsored Brands campaigns
- `GET /v2/sd/campaigns` - Sponsored Display campaigns
- `GET /v3/campaigns` - Unified campaign API (v1 model)

**Ad Groups:**
- `GET /v2/sp/adGroups` - List ad groups
- `GET /v2/sp/adGroups/extended` - Ad groups with metrics
- `GET /v2/sb/adGroups` - Sponsored Brands ad groups
- `GET /sd/adgroups/{adGroupId}` - Sponsored Display ad group

**Keywords & Targets:**
- `GET /v2/sp/keywords` - List keywords
- `GET /v2/sp/keywords/extended` - Keywords with Quality Score
- `GET /v2/sp/negativeKeywords` - Negative keywords
- `GET /v2/sp/campaignNegativeKeywords` - Campaign-level negatives
- `GET /v2/sp/targets` - Product/category targets
- `GET /v2/sp/targets/extended` - Targets with metrics
- `GET /v2/sp/negativeTargets` - Negative targets

**Product Ads:**
- `GET /v2/sp/productAds` - List product ads
- `GET /v2/sp/productAds/extended` - Product ads with metrics

**Reporting (v3 API):**
- `POST /reporting/reports` - Create async report request
  - Report types: spCampaigns, spAdGroups, spKeywords, spTargets, spProductAds, sbCampaigns, sdCampaigns
  - Time units: DAILY, SUMMARY
  - Formats: GZIP_JSON, CSV
  - Columns: impressions, clicks, cost, conversions, sales, ACOS, ROAS, CTR, CPC, campaignId, adGroupId, keyword, date
  - Group by: campaign, adGroup, keyword, target, campaignPlacement
- `GET /reporting/reports/{reportId}` - Get report status
- `DELETE /reporting/reports/{reportId}` - Delete report

**DSP (Amazon Demand-Side Platform):**
- `GET /dsp/v1/orders` - List DSP orders
- `GET /dsp/v1/lineItems` - List line items
- `GET /dsp/v1/adGroups` - List DSP ad groups

**Amazon Attribution:**
- `GET /attribution/publishers` - Publisher integrations
- `GET /attribution/campaigns` - Attribution campaigns

### WRITE Operations (~40 operations)

**Campaigns:**
- `POST /v2/sp/campaigns` - Create campaign
  - Required: name, campaignType (sponsoredProducts), targetingType (manual/auto), state, dailyBudget
  - States: enabled, paused, archived
  - Bidding: legacyForSales, autoForSales, manual
- `PUT /v2/sp/campaigns` - Update campaigns
  - Updatable: name, state, dailyBudget, startDate, endDate, premiumBidAdjustment
- `POST /v3/campaigns` - Unified create (SP, SB, SD, DSP)
- Campaign budget schedules

**Ad Groups:**
- `POST /v2/sp/adGroups` - Create ad group
  - Required: campaignId, name, defaultBid, state
- `PUT /v2/sp/adGroups` - Update ad groups
- `POST /sd/adgroups` - Create SD ad group with targeting

**Keywords:**
- `POST /v2/sp/keywords` - Add keywords
  - Required: campaignId, adGroupId, keywordText, matchType (exact, phrase, broad), state
  - Optional: bid (max CPC)
- `PUT /v2/sp/keywords` - Update keywords (bids, match type, state)
- `DELETE /v2/sp/keywords` - Archive keywords

**Negative Keywords:**
- `POST /v2/sp/negativeKeywords` - Add ad group negative keywords
- `POST /v2/sp/campaignNegativeKeywords` - Add campaign negative keywords
- Match types: negativeExact, negativePhrase

**Product Targeting:**
- `POST /v2/sp/targets` - Add product/category/ASIN targets
- `PUT /v2/sp/targets` - Update targets
- `POST /v2/sp/negativeTargets` - Add negative targets

**Product Ads:**
- `POST /v2/sp/productAds` - Create product ad
  - Required: campaignId, adGroupId, sku, state
- `PUT /v2/sp/productAds` - Update product ads

**DSP Operations:**
- `POST /dsp/v1/orders` - Create DSP order
- `POST /dsp/v1/lineItems` - Create line item
- `POST /dsp/v1/adGroups` - Create ad group
- `POST /dsp/v1/adCreatives` - Upload creative
- `POST /dsp/v1/adCreatives/associations/adGroups` - Associate creative to ad group

**Bulk Operations:**
- `POST /bulk_operations` - Mass create/update/archive
  - Supports: campaigns, ad groups, keywords, product ads, targets
  - Max 2,000 operations per file
  - Operations: create, update, archive, pause

**Budgets:**
- Managed at campaign level
- Daily budget updates via campaign update

**Portfolio Bid Strategies:**
- Available via DSP for cross-campaign bidding

---

## Platform 3: Amazon Seller/Vendor Central (SP-API)

**Base URL:** `https://sellingpartnerapi-na.amazon.com/`
**Authentication:** LWA (Login with Amazon) OAuth 2.0
**Current Version:** Multiple API versions (2020-2024)

### READ Operations (~60 operations)

**Orders API:**
- `GET /orders/v0/orders` - List orders
  - Filters: CreatedAfter, CreatedBefore, OrderStatuses, MarketplaceIds
  - Statuses: Pending, Unshipped, PartiallyShipped, Shipped, Canceled, Unfulfillable
- `GET /orders/v0/orders/{orderId}` - Order details
- `GET /orders/v0/orders/{orderId}/orderItems` - Order line items

**Fulfillment Outbound (FBA):**
- `GET /fba/outbound/2020-07-01/fulfillmentOrders` - List FBA fulfillment orders
  - Filters: queryWindowInDays, fulfillmentOrderState
  - States: PENDING, SHIPPED, CANCELLED, COMPLETE
- `GET /fba/outbound/2020-07-01/fulfillmentOrders/{sellerFulfillmentOrderId}` - FBA order details

**Fulfillment Inbound:**
- `GET /fba/inbound/v0/shipments` - List inbound shipments
- `GET /fba/inbound/v0/shipments/{shipmentId}` - Shipment details
- `GET /fba/inbound/v0/shipments/{shipmentId}/items` - Shipment items

**Inventory:**
- `GET /fba/inventory/v1/summaries` - FBA inventory levels
  - Filters: granularityType, sellerSkus, marketplaceIds
  - Metrics: fulfillableQuantity, inboundWorkingQuantity, reservedQuantity

**Listings:**
- `GET /listings/2021-08-01/items/{sellerId}/{sku}` - Listing details
  - Includes: attributes, images, fulfillment, offers

**Product Catalog:**
- `GET /catalog/2022-04-01/items/{asin}` - Product catalog data
- `GET /catalog/2022-04-01/items` - Search catalog

**Reports API:**
- `GET /reports/2021-06-30/reports/{reportId}` - Report status
- `GET /reports/2021-06-30/documents/{reportDocumentId}` - Download report
- Report types:
  - Inventory: GET_MERCHANT_LISTINGS_ALL_DATA, GET_FBA_INVENTORY_AGED_DATA
  - Orders: GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL
  - Sales: GET_SALES_AND_TRAFFIC_REPORT
  - Returns: GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA
  - Performance: GET_SELLER_FEEDBACK_DATA
  - Brand Analytics: GET_BRAND_ANALYTICS_MARKET_BASKET_REPORT

**Vendor Direct Fulfillment:**
- `GET /vendorDirectFulfillment/orders/v1/orders` - List VDF orders
- `GET /vendorDirectFulfillment/orders/v1/orders/{orderId}` - VDF order details
- `GET /vendorDirectFulfillment/inventory/v1` - Inventory status

**Pricing:**
- `GET /products/pricing/v0/price` - Competitive pricing
- `GET /products/pricing/v0/competitivePrice` - Buy Box prices

**Fees:**
- `POST /products/fees/v0/listings/{SellerSKU}/feesEstimate` - Fee estimate

**Finances:**
- `GET /finances/v0/financialEventGroups` - Financial events
- `GET /finances/v0/financialEvents` - Transactions

**Notifications:**
- `GET /notifications/v1/subscriptions/{notificationType}` - Subscription status

**Uploads:**
- `GET /uploads/2020-11-01/uploadDestinations/{resource}` - Upload URL

### WRITE Operations (~40 operations)

**Listings Management:**
- `PUT /listings/2021-08-01/items/{sellerId}/{sku}` - Create/fully update listing
  - Supports: product type, attributes, images, fulfillment, offers
- `PATCH /listings/2021-08-01/items/{sellerId}/{sku}` - Partial listing update
- `DELETE /listings/2021-08-01/items/{sellerId}/{sku}` - Delete listing

**Fulfillment Outbound:**
- `POST /fba/outbound/2020-07-01/fulfillmentOrders` - Create FBA order
  - Required: sellerFulfillmentOrderId, displayableOrderId, shippingSpeedCategory, destinationAddress, items
- `PUT /fba/outbound/2020-07-01/fulfillmentOrders/{sellerFulfillmentOrderId}/cancel` - Cancel order
- `POST /fba/outbound/2020-07-01/fulfillmentOrders/{sellerFulfillmentOrderId}/return` - Create return

**Fulfillment Inbound:**
- `POST /fba/inbound/v0/shipments` - Create inbound shipment
- `PUT /fba/inbound/v0/shipments/{shipmentId}` - Update shipment
- `POST /fba/inbound/v0/shipments/{shipmentId}/transport` - Set transport details
- `POST /fba/inbound/v0/shipments/{shipmentId}/confirm` - Confirm shipment

**Inventory Management:**
- `POST /fba/inventory/v1` - Update FBA inventory quantity

**Vendor Direct Fulfillment:**
- `POST /vendorDirectFulfillment/orders/v1/acknowledgements` - Acknowledge order
- `PUT /vendorDirectFulfillment/inventory/v1/inventory` - Submit inventory update
- `POST /vendorDirectFulfillment/shipping/v1/shippingLabels` - Create shipping label
- `POST /vendorDirectFulfillment/shipping/v1/shippingLabels/{purchaseOrderNumber}` - Get label

**Feeds:**
- `POST /feeds/2021-06-30/feeds` - Submit feed
  - Feed types: POST_PRODUCT_DATA, POST_INVENTORY_AVAILABILITY_DATA, POST_PRODUCT_PRICING_DATA, POST_PRODUCT_IMAGE_DATA
- `POST /feeds/2021-06-30/documents` - Create feed document
- `GET /feeds/2021-06-30/feeds/{feedId}` - Feed processing status

**Reports:**
- `POST /reports/2021-06-30/reports` - Create report
  - Create async report for inventory, orders, sales, traffic, etc.

**Pricing:**
- `POST /products/pricing/v0/price` - Update competitive price

**Notifications:**
- `POST /notifications/v1/subscriptions/{notificationType}` - Subscribe
- `DELETE /notifications/v1/subscriptions/{notificationType}/{subscriptionId}` - Unsubscribe
- Notification types: ORDER_CHANGE, FEED_PROCESSING_FINISHED, FBA_INVENTORY_AVAILABILITY, etc.

**Messaging:**
- `POST /messaging/v1/orders/{amazonOrderId}/messages` - Send buyer message

**Solicitations:**
- `POST /solicitations/v1/orders/{amazonOrderId}/solicitations/productReviewAndSellerFeedback` - Request review

---

## Platform 4: Microsoft Advertising (Bing Ads) API

**Base URL:** `https://campaign.api.bingads.microsoft.com/Api/Advertiser/CampaignManagement/v13/`
**Protocol:** SOAP + REST (v13 supports both)
**Current Version:** v13
**OAuth Scopes:** `https://ads.microsoft.com/msads.manage`
**Additional Auth:** Developer Token in request header

### READ Operations (~70 operations)

**Campaigns:**
- `GetCampaignsByAccountId` - List all campaigns in account
- `GetCampaignsByIds` - Get specific campaigns
- `GetCampaignIdsByBidStrategyIds` - Campaigns using bid strategy
- `GetCampaignIdsByBudgetIds` - Campaigns using budget
- `GetCampaignCriterionsByIds` - Campaign-level targeting

**Ad Groups:**
- `GetAdGroupsByCampaignId` - List ad groups in campaign
- `GetAdGroupsByIds` - Get specific ad groups
- `GetAdGroupCriterionsByIds` - Ad group-level targeting

**Ads:**
- `GetAdsByAdGroupId` - List ads in ad group
- `GetAdsByEditorialStatus` - Ads by editorial status
- `GetAdsByIds` - Get specific ads

**Keywords:**
- `GetKeywordsByAdGroupId` - List keywords in ad group
- `GetKeywordsByEditorialStatus` - Keywords by editorial status
- `GetKeywordsByIds` - Get specific keywords
- `GetNegativeKeywordsByEntityIds` - Negative keywords for entity

**Audiences:**
- `GetAudiencesByIds` - Get audience details
  - Types: RemarketingList, CustomAudience, ProductAudience, SimilarRemarketingList, CustomerList
- `GetAudienceGroupsByIds` - Get audience group details
- `GetAudienceGroupAssetGroupAssociationsByAssetGroupIds` - Associations by asset group
- `GetAudienceGroupAssetGroupAssociationsByAudienceGroupIds` - Associations by audience

**Budgets:**
- `GetBudgetsByIds` - Get budget details
  - Types: DailyBudgetAccelerated, DailyBudgetStandard

**Bid Strategies:**
- `GetBidStrategiesByIds` - Get bid strategy details
  - Types: EnhancedCpc, ManualCpc, MaxClicks, MaxConversions, TargetCpa, MaxConversionValue, TargetRoas

**Ad Extensions:**
- `GetAdExtensionIdsByAccountId` - List extension IDs
- `GetAdExtensionsByIds` - Get extension details
  - Types: SitelinkAdExtension, CallAdExtension, LocationAdExtension, CalloutAdExtension, StructuredSnippetAdExtension, PriceAdExtension, PromotionAdExtension, ActionAdExtension, ImageAdExtension, VideoAdExtension, FilterLinkAdExtension
- `GetAdExtensionsAssociations` - Extension associations
- `GetAdExtensionsEditorialReasons` - Editorial rejection reasons

**Labels:**
- `GetLabelsByIds` - Get label details
- `GetLabelAssociationsByEntityIds` - Labels by entity
- `GetLabelAssociationsByLabelIds` - Entities by label

**Asset Groups (Performance Max):**
- `GetAssetGroupsByCampaignId` - List asset groups
- `GetAssetGroupsByIds` - Get asset group details
- `GetAssetGroupListingGroupsByIds` - Product group trees
- `GetAssetGroupsEditorialReasons` - Editorial feedback

**Experiments:**
- `GetExperimentsByIds` - Get experiment details

**Conversion Goals:**
- `GetConversionGoalsByIds` - Get conversion goal details
  - Types: UrlGoal, DurationGoal, PagesViewedPerVisitGoal, EventGoal, AppInstallGoal, OfflineConversionGoal, InStoreTransactionGoal
- `GetConversionGoalsByTagIds` - Goals by UET tag
- `GetNewCustomerAcquisitionGoalsByAccountId` - New customer goals
- `GetConversionValueRulesByAccountId` - Value rules
- `GetConversionValueRulesByIds` - Value rule details

**Offline Conversions:**
- `GetOfflineConversionReports` - Offline conversion upload reports

**Media:**
- `GetMediaAssociations` - Media usage across entities
- `GetMediaMetaDataByAccountId` - List media
- `GetMediaMetaDataByIds` - Media details
- `GetVideosByIds` - Video details

**Shared Lists:**
- `GetSharedEntities` - List shared entities
  - Types: NegativeKeywordList, PlacementExclusionList, AccountNegativeKeywordList
- `GetSharedEntitiesByAccountId` - Shared entities by account
- `GetListItemsBySharedList` - Items in shared list
- `GetSharedEntityAssociationsByEntityIds` - Associations by entity
- `GetSharedEntityAssociationsBySharedEntityIds` - Associations by shared entity

**Negative Sites:**
- `GetNegativeSitesByCampaignIds` - Campaign placement exclusions
- `GetNegativeSitesByAdGroupIds` - Ad group placement exclusions

**UET Tags:**
- `GetUetTagsByIds` - UET tag details

**Import:**
- `GetImportJobsByIds` - Import job details (Google Ads import)
- `GetImportResults` - Import results
- `GetImportEntityIdsMapping` - Entity ID mappings

**Recommendations:**
- `GetResponsiveAdRecommendationJob` - Recommendation job status

**Brand Kits:**
- `GetBrandKitsByAccountId` - List brand kits
- `GetBrandKitsByIds` - Brand kit details
- `GetClipchampTemplates` - Video templates
- `GetSupportedClipchampAudio` - Audio options
- `GetSupportedFonts` - Font options

**Data Exclusions:**
- `GetDataExclusionsByAccountId` - List data exclusions
- `GetDataExclusionsByIds` - Data exclusion details

**Seasonality Adjustments:**
- `GetSeasonalityAdjustmentsByAccountId` - List adjustments
- `GetSeasonalityAdjustmentsByIds` - Adjustment details

**Account:**
- `GetAccountProperties` - Account settings
- `GetAccountMigrationStatuses` - Migration status

**Utilities:**
- `GetEditorialReasonsByIds` - Editorial rejection details
- `GetGeoLocationsFileUrl` - Geographic targeting data file
- `GetProfileDataFileUrl` - Demographic data file
- `SearchCompanies` - Company search for targeting
- `GetBMCStoresByCustomerId` - Bing Merchant Center stores
- `GetBSCCountries` - Bing Shopping Campaign countries
- `GetDiagnostics` - API diagnostics
- `GetHealthCheck` - Service health
- `GetFileImportUploadUrl` - Bulk import upload URL
- `GetAnnotationOptOut` - Annotation opt-out status

### WRITE Operations (~70 operations)

**Campaigns:**
- `AddCampaigns` - Create campaigns (max 100 per call)
  - Types: Search, Shopping, DynamicSearchAds, Audience, Performance Max
  - Required: Name, BudgetId, TimeZone, CampaignType
  - Optional: Settings, DailyBudget, Languages, AdRotation
- `UpdateCampaigns` - Update campaigns
  - Updatable: Name, Description, Status, BudgetType, DailyBudget, MonthlyBudget, TimeZone, AdRotation
- `DeleteCampaigns` - Delete campaigns
- `AddCampaignCriterions` - Add campaign targeting
  - Criterion types: Location, Age, Gender, DayTime, Device, Radius, ProfileCriterion
- `UpdateCampaignCriterions` - Update campaign targeting
- `DeleteCampaignCriterions` - Remove campaign targeting
- `AddCampaignConversionGoals` - Associate conversion goals
- `DeleteCampaignConversionGoals` - Remove conversion goals

**Ad Groups:**
- `AddAdGroups` - Create ad groups
  - Required: CampaignId, Name, StartDate, Network
  - Optional: SearchBid, ContentMatchBid, EndDate, Language, AdRotation, BiddingScheme
- `UpdateAdGroups` - Update ad groups
  - Updatable: Name, Status, SearchBid, AdRotation, AdScheduleUseSearcherTimeZone, BidAdjustments
- `DeleteAdGroups` - Delete ad groups
- `AddAdGroupCriterions` - Add ad group targeting
- `UpdateAdGroupCriterions` - Update ad group targeting
- `DeleteAdGroupCriterions` - Remove ad group targeting

**Ads:**
- `AddAds` - Create ads
  - Types: ExpandedTextAd, DynamicSearchAd, ProductAd, ResponsiveAd, ResponsiveSearchAd
  - Required: AdGroupId, Type, FinalUrls, Text/Titles (ad-specific)
- `UpdateAds` - Update ads
- `DeleteAds` - Delete ads
- `AppealEditorialRejections` - Appeal ad disapprovals

**Keywords:**
- `AddKeywords` - Add keywords
  - Required: AdGroupId, Text, MatchType (Exact, Phrase, Broad)
  - Optional: Bid, DestinationUrl, Param1/Param2/Param3
- `UpdateKeywords` - Update keywords
  - Updatable: Bid, DestinationUrl, Status, MatchType
- `DeleteKeywords` - Delete keywords
- `AddNegativeKeywordsToEntities` - Add negative keywords
  - Entity types: Campaign, AdGroup
- `DeleteNegativeKeywordsFromEntities` - Remove negative keywords

**Audiences:**
- `AddAudiences` - Create audiences
  - Types: RemarketingList, CustomAudience, InMarketAudience, ProductAudience, SimilarRemarketingList, CombinedList, CustomerList
- `UpdateAudiences` - Update audiences
- `DeleteAudiences` - Delete audiences
- `AddAudienceGroups` - Create audience groups
- `UpdateAudienceGroups` - Update audience groups
- `DeleteAudienceGroups` - Delete audience groups
- `SetAudienceGroupAssetGroupAssociations` - Associate with asset groups
- `DeleteAudienceGroupAssetGroupAssociations` - Remove associations

**Budgets:**
- `AddBudgets` - Create shared budgets
  - Types: DailyBudgetAccelerated, DailyBudgetStandard
- `UpdateBudgets` - Update budget amounts
- `DeleteBudgets` - Delete budgets

**Bid Strategies:**
- `AddBidStrategies` - Create portfolio bid strategies
  - Types: MaxClicks, MaxConversions, TargetCpa, MaxConversionValue, TargetRoas, EnhancedCpc, ManualCpc, ManualCpv, ManualCpm
- `UpdateBidStrategies` - Update bid strategies
- `DeleteBidStrategies` - Delete bid strategies

**Ad Extensions:**
- `AddAdExtensions` - Create extensions
  - All extension types: Sitelink, Call, Location, Callout, Structured Snippet, Price, Promotion, Action, Image, Video, Filter Link
- `UpdateAdExtensions` - Update extensions
- `DeleteAdExtensions` - Delete extensions
- `SetAdExtensionsAssociations` - Associate with campaigns/ad groups
- `DeleteAdExtensionsAssociations` - Remove associations

**Labels:**
- `AddLabels` - Create labels
- `UpdateLabels` - Update labels
- `DeleteLabels` - Delete labels
- `SetLabelAssociations` - Apply labels to entities
- `DeleteLabelAssociations` - Remove label associations

**Asset Groups (Performance Max):**
- `AddAssetGroups` - Create asset groups
  - Required: CampaignId, Name, StartDate, EndDate, Status
  - Assets: Headlines, Descriptions, Images, Videos, Logos
- `UpdateAssetGroups` - Update asset groups
- `DeleteAssetGroups` - Delete asset groups
- `ApplyAssetGroupListingGroupActions` - Manage product groups
- `CreateAssetGroupRecommendation` - Generate recommendations
- `RefineAssetGroupRecommendation` - Refine recommendations

**Experiments:**
- `AddExperiments` - Create experiments
- `UpdateExperiments` - Update experiments
- `DeleteExperiments` - Delete experiments

**Conversion Goals:**
- `AddConversionGoals` - Create conversion goals
  - Types: Url, Duration, PagesViewedPerVisit, Event, AppInstall, OfflineConversion, InStoreTransaction
- `UpdateConversionGoals` - Update conversion goals
- `DeleteConversionGoals` - Delete conversion goals
- `AddNewCustomerAcquisitionGoals` - Create NCA goals
- `UpdateNewCustomerAcquisitionGoals` - Update NCA goals
- `AddConversionValueRules` - Create value rules
- `UpdateConversionValueRules` - Update value rules
- `UpdateConversionValueRulesStatus` - Change rule status

**Offline Conversions:**
- `ApplyOfflineConversions` - Upload offline conversions
  - Required: ConversionName, ConversionTime, ConversionValue, MicrosoftClickId
- `ApplyOfflineConversionAdjustments` - Adjust/retract conversions
- `ApplyOnlineConversionAdjustments` - Adjust online conversions

**Media & Videos:**
- `AddMedia` - Upload images
- `DeleteMedia` - Delete images
- `AddVideos` - Upload videos
- `UpdateVideos` - Update video metadata
- `DeleteVideos` - Delete videos

**Shared Lists:**
- `AddSharedEntity` - Create shared list
  - Types: NegativeKeywordList, PlacementExclusionList, AccountNegativeKeywordList
- `UpdateSharedEntities` - Update shared lists
- `DeleteSharedEntities` - Delete shared lists
- `AddListItemsToSharedList` - Add items to list
- `DeleteListItemsFromSharedList` - Remove items from list
- `SetSharedEntityAssociations` - Associate with campaigns
- `DeleteSharedEntityAssociations` - Remove associations

**Negative Sites:**
- `SetNegativeSitesToCampaigns` - Set campaign placement exclusions
- `SetNegativeSitesToAdGroups` - Set ad group placement exclusions

**UET Tags:**
- `AddUetTags` - Create UET tags
- `UpdateUetTags` - Update UET tags

**Import:**
- `AddImportJobs` - Create Google Ads import job
- `UpdateImportJobs` - Update import job
- `DeleteImportJobs` - Delete import job

**Recommendations:**
- `CreateResponsiveAdRecommendation` - Generate responsive ad
- `RefineResponsiveAdRecommendation` - Refine recommendation
- `CreateResponsiveSearchAdRecommendation` - Generate RSA
- `RefineResponsiveSearchAdRecommendation` - Refine RSA
- `CreateBrandKitRecommendation` - Generate brand kit

**Brand Kits:**
- `AddBrandKits` - Create brand kit
- `UpdateBrandKits` - Update brand kit
- `DeleteBrandKits` - Delete brand kit

**Data Exclusions:**
- `AddDataExclusions` - Create data exclusion
  - Use case: Exclude promotional periods from bid optimization
- `UpdateDataExclusions` - Update data exclusion
- `DeleteDataExclusions` - Delete data exclusion

**Seasonality Adjustments:**
- `AddSeasonalityAdjustments` - Create seasonality adjustment
  - Use case: Inform algorithm of expected conversion rate changes
- `UpdateSeasonalityAdjustments` - Update adjustment
- `DeleteSeasonalityAdjustments` - Delete adjustment

**Product/Hotel Partitions:**
- `ApplyProductPartitionActions` - Manage shopping product groups
- `ApplyHotelGroupActions` - Manage hotel ad groups

**Account:**
- `SetAccountProperties` - Update account settings
- `UpdateAnnotationOptOut` - Annotation preferences
- `ApplyCustomerListItems` - Upload customer match list
- `ApplyCustomerListUserData` - Upload hashed customer data

---

## Platform 5: Bing Webmaster Tools API (Organic Search)

**Base URL:** `https://ssl.bing.com/webmaster/api.svc/`
**Formats:** JSON, XML (POX), SOAP
**Current Version:** Stable API (no versioning)
**OAuth 2.0 Support:** ✅ CONFIRMED
**OAuth Endpoints:**
- Authorization: `https://www.bing.com/webmasters/oauth/authorize`
- Token: `https://www.bing.com/webmasters/oauth/token`
- Refresh: `https://www.bing.com/webmasters/token`

**OAuth Scopes:**
- `webmaster.read` - Read access to Bing Webmaster data
- `webmaster.manage` - Read and write access

**Token Lifecycle:**
- Authorization codes: 5 minutes expiry
- Access tokens: 3,599 seconds (~1 hour)
- Refresh tokens: Valid until user revokes

### READ Operations (~35 operations)

**Search Performance Analytics:**
- `GetQueryStats(siteUrl)` - Top queries with impressions, clicks, CTR, avg position
  - Returns: Query, Date, Impressions, Clicks, AvgClickPosition, AvgImpressionPosition
- `GetQueryPageStats(siteUrl)` - Query-page combination traffic
- `GetQueryPageDetailStats(siteUrl)` - Granular query-page statistics
- `GetQueryTrafficStats(siteUrl)` - Detailed query performance metrics
- `GetRankAndTrafficStats(siteUrl)` - Overall traffic statistics
  - Returns: Date, Impressions, Clicks
- `GetPageStats(siteUrl)` - Top pages traffic data
- `GetPageQueryStats(siteUrl)` - Page-level query performance

**Keyword Research:**
- `GetKeyword(siteUrl, query)` - Keyword impressions for selected period
- `GetKeywordStats(siteUrl)` - Historical keyword statistics
- `GetRelatedKeywords(siteUrl, query)` - Related keyword suggestions

**Crawl & Index Management:**
- `GetCrawlStats(siteUrl)` - Crawl statistics
  - Returns: CrawlDuration, CrawledPages, CrawlErrors, BlockedPages
- `GetCrawlSettings(siteUrl)` - Current crawl rate configuration
- `GetCrawlIssues(siteUrl)` - List of crawl errors and issues
  - Issue types: DNS errors, server errors, robots.txt blocks, timeout errors
- `GetUrlInfo(siteUrl, url)` - Index details for single page
  - Returns: Url, DiscoveryDate, LastCrawledDate, HttpStatus, IsPage, DocumentSize, AnchorCount, TotalChildUrlCount
- `GetUrlTrafficInfo(siteUrl, url)` - Index traffic data for page
- `GetChildrenUrlInfo(siteUrl, url)` - Directory-level indexing details
- `GetChildrenUrlTrafficInfo(siteUrl, url)` - Directory traffic metrics
- `GetFetchedUrls(siteUrl)` - List of fetched URLs
- `GetFetchedUrlDetails(siteUrl, url)` - Detailed fetch information
- `GetBlockedUrls(siteUrl)` - List blocked pages/directories

**Link Analysis:**
- `GetLinkCounts(siteUrl)` - Pages with inbound links count
- `GetUrlLinks(siteUrl, url)` - Inbound links for specific URL
  - Returns: SourceUrl, AnchorText, DiscoveryDate
- `GetConnectedPages(siteUrl)` - External pages linking to site

**Feeds & Sitemaps:**
- `GetFeeds(siteUrl)` - All top-level feeds/sitemaps
  - Returns: FeedUrl, SubmittedDate, LastCrawledDate, UrlCount, ErrorCount
- `GetFeedDetails(siteUrl, feedUrl)` - Sitemap index details

**Site Management:**
- `GetUserSites()` - List user's verified sites
- `GetSiteMoves(siteUrl)` - Site migration tracking
- `GetSiteRoles(siteUrl)` - User access roles for site
- `GetCountryRegionSettings(siteUrl)` - Geographic targeting settings

**Quota Management:**
- `GetUrlSubmissionQuota(siteUrl)` - Daily URL submission quota (10,000/day)
- `GetContentSubmissionQuota(siteUrl)` - Content submission limits

**Query Parameters:**
- `GetQueryParameters(siteUrl)` - URL normalization parameter settings

**Page Preview:**
- `GetActivePagePreviewBlocks(siteUrl)` - Pages with preview restrictions

**Deep Links (Deprecated but available):**
- `GetDeepLink(siteUrl, query)` - Deep link data for query
- `GetDeepLinkAlgoUrls(siteUrl)` - Pages with deep link potential
- `GetDeepLinkBlocks(siteUrl)` - Deep link restrictions

### WRITE Operations (~15 operations)

**URL Submission:**
- `SubmitUrl(siteUrl, url)` - Submit single URL for crawling
  - Quota: 10,000 URLs per day
- `SubmitUrlBatch(siteUrl, urlList)` - Batch URL submission
  - Max: 500 URLs per batch, 10,000 URLs per day total
- `SubmitContent(siteUrl, url, content, contentType, maxDepth)` - Direct content submission
  - Bypass crawling, submit content directly
- `FetchUrl(siteUrl, url)` - Request URL fetch by Bingbot

**Crawl Management:**
- `SaveCrawlSettings(siteUrl, crawlRate)` - Modify crawl rate preferences
  - Options: Normal, Faster, Slower

**URL Control:**
- `AddBlockedUrl(siteUrl, blockedUrl)` - Block page/directory from indexing
- `RemoveBlockedUrl(siteUrl, entityId)` - Unblock content
- `AddQueryParameter(siteUrl, parameterName)` - Add URL normalization rule
- `EnableDisableQueryParameter(siteUrl, parameterName, enabled)` - Toggle parameter handling
- `RemoveQueryParameter(siteUrl, parameterName)` - Remove normalization rule

**Feeds & Sitemaps:**
- `SubmitFeed(siteUrl, feedUrl)` - Submit sitemap
- `RemoveFeed(siteUrl, feedUrl)` - Remove sitemap

**Link Management:**
- `AddConnectedPage(siteUrl, connectedPageUrl)` - Add external linking page

**Site Management:**
- `AddSite(siteUrl)` - Add new site to account
- `RemoveSite(siteUrl)` - Remove site from account
- `VerifySite(siteUrl)` - Attempt site ownership verification
  - Methods: Meta tag, XML file, CNAME record
- `SubmitSiteMove(siteUrl, newSiteUrl, moveDatetime)` - Register site migration

**User Access:**
- `AddSiteRoles(siteUrl, userEmail, roles)` - Delegate site access
  - Roles: Reader, Contributor, Owner
- `RemoveSiteRole(siteUrl, userEmail)` - Revoke user access

**Regional Settings:**
- `AddCountryRegionSettings(siteUrl, countryRegion)` - Geographic targeting
- `RemoveCountryRegionSettings(siteUrl, countryRegion)` - Remove regional settings

**Page Preview:**
- `AddPagePreviewBlock(siteUrl, url)` - Block page preview generation
- `RemovePagePreviewBlock(siteUrl, url)` - Enable preview generation

**Deep Links:**
- `UpdateDeepLink(siteUrl, query, url, weight)` - Adjust deep link weighting
- `AddDeepLinkBlock(siteUrl, query, url)` - Restrict deep link display
- `RemoveDeepLinkBlock(siteUrl, query, url)` - Allow deep link display

---

## Platform 6: X (Twitter) Ads API

**Base URL:** `https://ads-api.x.com/12/`
**Current Version:** v12
**Authentication:** OAuth 1.0a or OAuth 2.0
**OAuth Scopes:** `ads:write`, `ads:read`, `analytics:read`
**Access:** Requires Ads API access approval via ads.x.com

### READ Operations (~20 operations)

**Account Management:**
- `GET /12/accounts/:account_id` - Account details
  - Returns: name, timezone, currency, approval_status
- `GET /12/accounts/:account_id/features` - Available features

**Funding:**
- `GET /12/accounts/:account_id/funding_instruments` - List payment methods
  - Types: Credit card, prepay, credit line

**Campaigns:**
- `GET /12/accounts/:account_id/campaigns` - List campaigns
  - Filters: campaign_ids, funding_instrument_ids, with_deleted
  - Pagination: count, cursor
  - Sort options: created_at, updated_at
- `GET /12/accounts/:account_id/campaigns/:campaign_id` - Campaign details
  - Returns: id, name, funding_instrument_id, currency, daily_budget, total_budget, standard_delivery, frequency_cap, duration_in_days, start_time, end_time, entity_status
  - Limit: 200 active campaigns (expandable to 8,000)

**Line Items:**
- `GET /12/accounts/:account_id/line_items` - List line items
  - Filters: campaign_ids, funding_instrument_ids, line_item_ids
  - Limits: 100 line items per campaign, 256 active across all campaigns
- `GET /12/accounts/:account_id/line_items/:line_item_id` - Line item details
  - Returns: bid_amount, bid_strategy, objective, placements, product_type, target_cpa, charge_by, optimization

**Promoted Content:**
- `GET /12/accounts/:account_id/promoted_tweets` - List promoted tweets
- `GET /12/accounts/:account_id/promoted_accounts` - List promoted accounts
- `GET /12/accounts/:account_id/scoped_timeline` - Promotion-only tweets
- `GET /12/accounts/:account_id/scheduled_promoted_tweets` - Scheduled promotions

**Audiences:**
- `GET /12/accounts/:account_id/custom_audiences` - List custom audiences
  - Types: TAILORED, FLEXIBLE, VIDEO_ENGAGEMENT, ENGAGEMENT, APP_ACTIVITY, CONVERSATION, WEB_ACTIVITY
- `GET /12/accounts/:account_id/custom_audiences/:id` - Audience details
- `GET /12/accounts/:account_id/custom_audiences/:id/targeted` - Line items targeting audience

**Targeting:**
- `GET /12/targeting_criteria/locations` - Available location targets
  - Filter by: location_type, query (city/region name)
- `GET /12/targeting_criteria/interests` - Available interest categories
  - Max: 100 interests per line item
- `GET /12/targeting_criteria/platforms` - Device platforms
- `GET /12/targeting_criteria/platform_versions` - OS versions

**Catalogs:**
- `GET /12/product_catalogs/:product_catalog_id` - Catalog details
- `GET /12/product_catalogs/:product_catalog_id/products` - List products
- `GET /12/product_catalogs/:product_catalog_id/product_sets` - List product sets

**Media:**
- `GET /12/accounts/:account_id/media_creatives` - List media creatives
- `GET /12/accounts/:account_id/media_library` - Account media library

**Analytics (Synchronous - Last 7 days):**
- `GET /12/stats/accounts/:account_id` - Real-time stats
  - Entities: campaigns, line_items, promoted_tweets, promoted_accounts
  - Metrics: impressions, clicks, spend, engagements, follows, retweets, likes, replies, url_clicks, app_installs, conversions
  - Granularity: HOUR, DAY, TOTAL
  - Placement: ALL_ON_X, PUBLISHER_NETWORK

**Analytics (Asynchronous - Up to 90 days):**
- `GET /12/stats/jobs/accounts/:account_id` - List analytics jobs
- `GET /12/stats/jobs/accounts/:account_id/:job_id` - Job status
  - Statuses: QUEUED, PROCESSING, SUCCESS, FAILED
- Download URL provided when SUCCESS

### WRITE Operations (~20 operations)

**Campaigns:**
- `POST /12/accounts/:account_id/campaigns` - Create campaign
  - Required: funding_instrument_id, name
  - Optional: daily_budget, total_budget, standard_delivery, duration_in_days, frequency_cap, start_time, end_time
  - Currency in micro-units (e.g., $100 = 100000000)
- `POST /12/batch/accounts/:account_id/campaigns` - Batch create campaigns
  - Max batch size: 40 operations
  - Operations: Create, Update, Delete
- `PUT /12/accounts/:account_id/campaigns/:campaign_id` - Update campaign
  - Updatable: name, daily_budget, total_budget, standard_delivery, frequency_cap, entity_status
  - Status: ACTIVE, PAUSED
- `DELETE /12/accounts/:account_id/campaigns/:campaign_id` - Delete campaign
  - Warning: Non-reversible, subsequent deletes return HTTP 404

**Line Items:**
- `POST /12/accounts/:account_id/line_items` - Create line item
  - Required: campaign_id, objective, placements, product_type, start_time, end_time
  - Objectives: APP_ENGAGEMENTS, APP_INSTALLS, AWARENESS, ENGAGEMENTS, FOLLOWERS, REACH, VIDEO_VIEWS, WEBSITE_CLICKS, IN_STREAM_VIDEO_VIEWS
  - Placements: ALL_ON_TWITTER, PUBLISHER_NETWORK
  - Product types: PROMOTED_TWEETS, PROMOTED_ACCOUNTS
- `POST /12/batch/accounts/:account_id/line_items` - Batch create (max 40)
- `PUT /12/accounts/:account_id/line_items/:line_item_id` - Update line item
  - Updatable: bid_amount, bid_strategy, entity_status, goal, pay_by (limited), start_time, end_time, total_budget
  - Bid strategies: AUTO, MAX, TARGET
- `DELETE /12/accounts/:account_id/line_items/:line_item_id` - Delete line item

**Promoted Content:**
- `POST /12/accounts/:account_id/promoted_tweets` - Create promoted tweet
  - Required: line_item_id, tweet_ids
  - Note: Cannot update promoted tweets (no PUT operation)
- `POST /12/accounts/:account_id/promoted_accounts` - Promote account
- `POST /12/accounts/:account_id/scheduled_promoted_tweets` - Schedule promoted tweet
- `DELETE /12/accounts/:account_id/promoted_tweets/:promoted_tweet_id` - Delete promoted tweet
- `DELETE /12/accounts/:account_id/promoted_accounts/:promoted_account_id` - Delete promoted account

**Targeting:**
- `POST /12/accounts/:account_id/targeting_criteria` - Set targeting rules
  - Types: LOCATION, INTEREST, FOLLOWER_LOOKALIKE, GENDER, AGE, LANGUAGE, PLATFORM, DEVICE, BEHAVIOR, TAILORED_AUDIENCE, CONVERSATION, EVENT, KEYWORD
  - Max locations: 2,000
  - Max interests: 100
- `PUT /12/accounts/:account_id/targeting_criteria/:targeting_criterion_id` - Update targeting
- `DELETE /12/accounts/:account_id/targeting_criteria/:targeting_criterion_id` - Remove targeting

**Audiences:**
- `POST /12/accounts/:account_id/custom_audiences` - Create custom audience
  - Types: TAILORED (website visitors), FLEXIBLE (engagement), VIDEO_ENGAGEMENT, APP_ACTIVITY, CONVERSATION, WEB_ACTIVITY
- `PUT /12/accounts/:account_id/custom_audiences/:custom_audience_id` - Update audience
- `DELETE /12/accounts/:account_id/custom_audiences/:custom_audience_id` - Delete audience
- `POST /12/accounts/:account_id/custom_audiences/:custom_audience_id/users` - Upload user data
  - Supports: email, phone, twitter_id, mobile_ad_id, hashed

**Catalogs:**
- `POST /12/product_catalogs/:product_catalog_id/products` - Add products
- `PUT /12/product_catalogs/:product_catalog_id/products/:product_id` - Update product
- `DELETE /12/product_catalogs/:product_catalog_id/products/:product_id` - Delete product
- `POST /12/product_catalogs/:product_catalog_id/product_sets` - Create product set
- `PUT /12/product_catalogs/:product_catalog_id/product_sets/:product_set_id` - Update product set
- `DELETE /12/product_catalogs/:product_catalog_id/product_sets/:product_set_id` - Delete product set

**Analytics:**
- `POST /12/stats/jobs/accounts/:account_id` - Create async analytics job
  - Entity types: CAMPAIGN, LINE_ITEM, PROMOTED_TWEET, PROMOTED_ACCOUNT, MEDIA_CREATIVE
  - Metrics: All standard metrics + conversion events
  - Max time range: 90 days (in chunks)
  - Segmentation: DEVICES, LOCATIONS, PLATFORMS, GENDER, AGE, etc.
- `DELETE /12/stats/jobs/accounts/:account_id/:job_id` - Cancel analytics job

**Media:**
- `POST /12/accounts/:account_id/media_library` - Upload media
- `DELETE /12/accounts/:account_id/media_library/:media_key` - Delete media

---

## Platform 7: TikTok Marketing API

**Base URL:** `https://business-api.tiktok.com/open_api/v1.3/`
**Current Version:** v1.3
**Authentication:** OAuth 2.0
**OAuth Scopes:** Advertiser management, ad management, reporting

### READ Operations (~15 operations)

**Advertiser/Account:**
- `GET /advertiser/info/` - Account details
  - Required: advertiser_id
  - Returns: advertiser_name, currency, timezone, status, industry, language
- `GET /pangle/audience_package/get/` - Pangle audience packages
- `GET /pangle/block_list/get/` - Block list for Pangle
- `GET /term/get/` - Terms and conditions

**Campaigns:**
- `GET /campaign/get/` - List campaigns
  - Required: advertiser_id
  - Optional filters: campaign_ids, campaign_name, objective_type, primary_status
  - Returns: campaign_id, campaign_name, objective_type, budget, budget_mode, status
- `GET /smart_plus/campaign/get/` - Smart Plus campaigns

**Ad Groups:**
- `GET /adgroup/get/` - List ad groups
  - Required: advertiser_id
  - Filters: campaign_id, adgroup_ids, adgroup_name
  - Returns: adgroup_id, adgroup_name, campaign_id, budget, bid_type, placement_type, targeting, schedule, status
- `GET /adgroup/quota/` - Dynamic quota information
- `GET /smart_plus/adgroup/get/` - Smart Plus ad groups

**Ads:**
- `GET /ad/get/` - List ads (regular + ACO)
  - Required: advertiser_id
  - Filters: campaign_id, adgroup_id, ad_ids, primary_status
  - Returns: ad_id, ad_name, ad_format, creative_type, creatives, call_to_action, status
- `GET /smart_plus/ad/get/` - Smart Plus ads
- `GET /smart_plus/ad/review_info/` - Ad review status
- `GET /smart_plus/material/review_info/` - Material review status

**Applications:**
- `GET /app/info/` - App details
- `GET /app/list/` - List all apps
- `GET /app/optimization_event/` - Conversion events
- `GET /app/optimization_event/retargeting/` - Retargeting events

**Audiences:**
- `GET /dmp/custom_audience/list/` - List custom audiences
- `GET /dmp/custom_audience/get/` - Audience details
- `GET /dmp/lookalike/get/` - Lookalike audience details

**Reporting:**
- `GET /reports/integrated/get/` - Basic reports
  - Dimensions: campaign_id, adgroup_id, ad_id, stat_time_day
  - Metrics: impressions, clicks, spend, conversions, cost_per_result, ctr, cpm, cpc, conversion_rate, roas
  - Report types: BASIC (campaigns, ad groups, ads)
  - Date range: Up to 90 days

**Automated Rules:**
- `GET /automated_rule/result/get/` - Rule execution results

### WRITE Operations (~35 operations)

**Advertiser Management:**
- `POST /advertiser/update/` - Update account settings
  - Updatable: advertiser_name, license_no, promotion_link, qualification_images
- `POST /pangle/block_list/update/` - Update block list
- `POST /term/check/` - Check terms acceptance
- `POST /term/confirm/` - Confirm terms

**Campaign Management:**
- `POST /campaign/create/` - Create campaign
  - Required: advertiser_id, campaign_name, objective_type, budget, budget_mode
  - Objective types: TRAFFIC, CONVERSIONS, APP_PROMOTION, REACH, VIDEO_VIEWS, LEAD_GENERATION, ENGAGEMENT, RF_REACH, PRODUCT_SALES
  - Budget modes: BUDGET_MODE_DAY, BUDGET_MODE_TOTAL, BUDGET_MODE_INFINITE
- `POST /campaign/update/` - Update campaign
  - Updatable: campaign_name, budget, budget_mode
- `POST /campaign/status/update/` - Campaign status update
  - Status: ENABLE, DISABLE, DELETE
- `POST /smart_plus/campaign/create/` - Create Smart Plus campaign
- `POST /smart_plus/campaign/update/` - Update Smart Plus campaign
- `POST /smart_plus/campaign/status/update/` - Smart Plus status

**Ad Group Management:**
- `POST /adgroup/create/` - Create ad group
  - Required: advertiser_id, campaign_id, adgroup_name, placement_type, placements, targeting, budget, schedule_type, bid_type
  - Placements: PLACEMENT_TIKTOK, PLACEMENT_PANGLE, PLACEMENT_GLOBAL_APP_BUNDLE
  - Targeting: Location, gender, age, language, interests, devices, connection types, OS
  - Bid types: BID_TYPE_CUSTOM, BID_TYPE_NO_BID
- `POST /adgroup/update/` - Update ad group
  - Updatable: adgroup_name, placement, targeting, budget, schedule, bid
- `POST /adgroup/status/update/` - Ad group status
  - Status: ENABLE, DISABLE, DELETE
- `POST /smart_plus/adgroup/create/` - Create Smart Plus ad group
- `POST /smart_plus/adgroup/update/` - Update Smart Plus ad group
- `POST /smart_plus/adgroup/status/update/` - Smart Plus status

**Ad Management:**
- `POST /ad/create/` - Create ad
  - Required: advertiser_id, adgroup_id, ad_name, ad_format, creatives, call_to_action
  - Ad formats: SINGLE_IMAGE, SINGLE_VIDEO, CAROUSEL, COLLECTION, VIDEO_IMAGES, LIVE
  - Creatives: image_ids, video_id, ad_text, identity (profile/brand name)
  - Call-to-action: LEARN_MORE, SHOP_NOW, DOWNLOAD, SIGN_UP, CONTACT_US, APPLY_NOW, etc.
  - Limit: Max 20 ads per ad group
- `POST /ad/update/` - Update ad
  - Updatable: ad_name, ad_text, call_to_action, creative elements
- `POST /ad/status/update/` - Ad status
  - Status: ENABLE, DISABLE, DELETE
- `POST /smart_plus/ad/create/` - Create Smart Plus ad
- `POST /smart_plus/ad/update/` - Update Smart Plus ad
- `POST /smart_plus/ad/status/update/` - Smart Plus ad status
- `POST /smart_plus/ad/material_status/update/` - Update material status
- `POST /smart_plus/ad/appeal/` - Submit ad appeal

**Application Management:**
- `POST /app/create/` - Create application
- `POST /app/update/` - Update app configuration

**Audience Management:**
- `POST /dmp/custom_audience/create/` - Create custom audience
  - Types: CUSTOMER_FILE, ENGAGEMENT, APP_ACTIVITY, WEBSITE_TRAFFIC
- `POST /dmp/custom_audience/update/` - Update audience
- `DELETE /dmp/custom_audience/delete/` - Delete audience
- `POST /dmp/lookalike/create/` - Create lookalike audience
  - Expansion: 1%-10% (narrow to broad)
- `POST /dmp/lookalike/update/` - Update lookalike
- `POST /dmp/custom_audience/share/` - Share audience
- `POST /dmp/custom_audience/apply/` - Apply audience to ad group

**Pixel & Conversion:**
- Pixel integration (similar to Facebook Pixel)
- Event tracking for conversions
- Custom conversion rules

**Automated Rules:**
- `POST /automated_rule/create/` - Create automation rule
- `POST /automated_rule/object/bind/` - Bind rule to objects
  - Triggers: Performance thresholds
  - Actions: Pause/enable campaigns, adjust bids

**Creative Management:**
- Upload images, videos via creative library
- Video specifications, image specifications
- Ad text requirements

---

## Capabilities Comparison Matrix

| Feature | Meta | Amazon Ads | Amazon SP-API | MS Ads | Bing WMT | X Ads | TikTok |
|---------|------|------------|---------------|--------|----------|-------|--------|
| **Total Operations** | ~50 | ~80 | ~100 | ~140 | ~50 | ~40 | ~50 |
| **Campaign Management** | ✅ Full | ✅ Full | ❌ N/A | ✅ Full | ❌ N/A | ✅ Full | ✅ Full |
| **Ad Group/Line Item** | ✅ Ad Sets | ✅ Ad Groups | ❌ | ✅ Ad Groups | ❌ | ✅ Line Items | ✅ Ad Groups |
| **Ad Management** | ✅ | ✅ Product Ads | ❌ | ✅ Multiple Types | ❌ | ✅ Promoted Content | ✅ Multiple Formats |
| **Creative Management** | ✅ Rich | ✅ Product-focused | ❌ | ✅ Rich | ❌ | ✅ Basic | ✅ Rich |
| **Keyword Management** | ❌ Interest | ✅ Keywords | ❌ | ✅ Keywords | ❌ | ❌ Interest | ❌ Interest |
| **Audience Targeting** | ✅ Custom | ✅ Product/Category | ❌ | ✅ Custom | ❌ | ✅ Custom | ✅ Custom |
| **Budget Management** | ✅ Daily/Lifetime | ✅ Daily | ❌ | ✅ Shared | ❌ | ✅ Campaign | ✅ Campaign/AdGroup |
| **Conversion Tracking** | ✅ Pixel + API | ✅ Attribution | ❌ | ✅ UET | ❌ | ✅ Conversion | ✅ Pixel |
| **Reporting** | ✅ Insights | ✅ Async | ✅ SP Reports | ✅ Reporting Service | ✅ Query Stats | ✅ Sync/Async | ✅ Basic |
| **Organic Search Data** | ❌ | ❌ | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| **E-commerce Integration** | ✅ Catalog | ✅ Product Ads | ✅ Full | ✅ Shopping | ❌ | ✅ Product Catalog | ❌ |
| **Orders/Fulfillment** | ❌ | ❌ | ✅ Complete | ❌ | ❌ | ❌ | ❌ |
| **Inventory Management** | ❌ | ❌ | ✅ FBA + Seller | ❌ | ❌ | ❌ | ❌ |
| **Product Listings** | ✅ Catalog | ✅ Sponsored | ✅ Full CRUD | ✅ Shopping | ❌ | ✅ Catalog | ❌ |
| **Offline Conversions** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Bid Strategies** | ✅ Auto | ✅ Auto/Manual | ❌ | ✅ Portfolio | ❌ | ✅ Auto/Max/Target | ✅ Auto |
| **Batch Operations** | ✅ Limited | ✅ Bulk API | ✅ Feeds | ✅ Bulk Service | ✅ Batch URL | ✅ Max 40 | ❌ |
| **OAuth 2.0 Support** | ✅ | ✅ | ✅ LWA | ✅ | ✅ | ✅ OAuth 1.0a/2.0 | ✅ |

---

## Read vs Write Operation Breakdown

| Platform | Read Operations | Write Operations | Read % | Write % |
|----------|----------------|------------------|--------|---------|
| **Meta** | 15 | 35 | 30% | 70% |
| **Amazon Ads** | 40 | 40 | 50% | 50% |
| **Amazon SP-API** | 60 | 40 | 60% | 40% |
| **Microsoft Ads** | 70 | 70 | 50% | 50% |
| **Bing Webmaster** | 35 | 15 | 70% | 30% |
| **X Ads** | 20 | 20 | 50% | 50% |
| **TikTok** | 15 | 35 | 30% | 70% |
| **TOTAL** | 255 | 255 | 50% | 50% |

---

## Tool Prioritization Recommendations

### Phase 1: Essential Operations (20-30% Coverage)

**Meta (10-12 tools):**
- Account/campaign/ad set/ad listing (4 read)
- Insights API (1 read)
- Campaign CRUD (3 write)
- Ad set CRUD (3 write)
- Basic audience creation (1 write)
**Estimated tokens:** ~15,000

**Amazon Ads (15-18 tools):**
- Profile/campaign/ad group listing (3 read)
- Keyword performance (1 read)
- Reporting API (2 read)
- Campaign CRUD (3 write)
- Ad group CRUD (3 write)
- Keyword management (3 write)
**Estimated tokens:** ~20,000

**Amazon SP-API (18-20 tools):**
- Orders listing (2 read)
- FBA inventory (2 read)
- Listings get (1 read)
- Reports (2 read)
- Listing CRUD (3 write)
- FBA order create (1 write)
- Feed submission (2 write)
**Estimated tokens:** ~25,000

**Microsoft Ads (20-25 tools):**
- Campaign/ad group/keyword listing (6 read)
- Performance reports (2 read)
- Campaign CRUD (3 write)
- Ad group CRUD (3 write)
- Keyword CRUD (3 write)
- Budget management (2 write)
- Conversion goals (2 write)
**Estimated tokens:** ~30,000

**Bing Webmaster (8-10 tools):**
- GetQueryStats (1 read)
- GetRankAndTrafficStats (1 read)
- GetCrawlStats (1 read)
- GetUrlInfo (1 read)
- SubmitUrl (1 write)
- SubmitUrlBatch (1 write)
- SubmitFeed (1 write)
- Site management (2 write)
**Estimated tokens:** ~12,000

**X Ads (10-12 tools):**
- Account/campaign/line item listing (3 read)
- Analytics sync (1 read)
- Campaign CRUD (3 write)
- Line item CRUD (3 write)
- Promoted tweet management (2 write)
**Estimated tokens:** ~15,000

**TikTok (10-12 tools):**
- Advertiser/campaign/ad group/ad listing (4 read)
- Reporting (1 read)
- Campaign CRUD (3 write)
- Ad group CRUD (3 write)
- Ad CRUD (2 write)
**Estimated tokens:** ~15,000

**Phase 1 Total:** ~100 tools, ~132,000 tokens

### Phase 2: Advanced Operations (Full Coverage)

All remaining operations including:
- Advanced audience management (lookalikes, similar audiences)
- Conversion tracking (pixel, offline conversions)
- Media/asset management
- Labels and organization
- Experiments/A-B testing
- Import jobs
- Recommendations
- Advanced reporting with segmentation
- Catalog management
- Automated rules

**Phase 2 Total:** ~410 tools, ~378,000 tokens

### Recommended Approach for Token Management

**Problem:** Loading all 510 operations = ~510,000 tokens (exceeds practical MCP limits)

**Solutions to Explore:**

1. **Lazy Loading / On-Demand Tool Registration**
   - Register only tool metadata initially (~500 tokens per tool)
   - Load full descriptions/guidance only when tool is called
   - Research: MCP servers with dynamic tool loading

2. **Separate MCP Servers by Platform**
   - Create individual MCP servers per platform
   - User connects only to needed platforms
   - Each server: 50-140 tools, manageable token count

3. **Tiered Documentation**
   - Level 1: Tool name + 1-sentence description (minimal tokens)
   - Level 2: Parameters + basic guidance (loaded on first use)
   - Level 3: Full agent guidance (loaded on confirmation prompts)

4. **Platform-Specific MCP Servers with Routing**
   - Master MCP server (lightweight) routes to platform-specific servers
   - Each platform server loads only when needed
   - Example: wpp-meta-ads-mcp, wpp-amazon-ads-mcp, etc.

**Recommendation:** Research MCP protocol to see if tools can be loaded dynamically or if we need to implement a router pattern with multiple specialized MCP servers.

---

## Next Steps

1. ✅ **Complete API research** - Done
2. ✅ **Document findings** - This file
3. ⏳ **Research MCP token optimization strategies** - Using Context7 to find MCP server patterns
4. ⏳ **Decide implementation approach** - Single server vs multiple servers
5. ⏳ **Prioritize tools** - Select Phase 1 tools (20-30% coverage)
6. ⏳ **Implement selected tools** - Following existing patterns in wpp-digital-marketing MCP

---

## Reference Links

**Meta:**
- Docs: https://developers.facebook.com/docs/marketing-api
- Graph API: https://developers.facebook.com/docs/graph-api

**Amazon Ads:**
- Docs: https://advertising.amazon.com/API/docs/en-us
- GitHub: https://github.com/idealerror/amazon-ads-api-docs

**Amazon SP-API:**
- Docs: https://developer-docs.amazon.com/sp-api
- Seller Central: https://sellercentral.amazon.com

**Microsoft Advertising:**
- Docs: https://learn.microsoft.com/en-us/advertising/
- Campaign Management: https://learn.microsoft.com/en-us/advertising/campaign-management-service/

**Bing Webmaster:**
- Docs: https://learn.microsoft.com/en-us/bingwebmaster/
- OAuth: https://learn.microsoft.com/en-us/bingwebmaster/oauth2

**X Ads:**
- Docs: https://developer.x.com/en/docs/x-ads-api
- API Reference Index: https://developer.x.com/en/docs/x-ads-api/api-reference-index

**TikTok:**
- Docs: https://business-api.tiktok.com/portal/docs
- SDK: https://github.com/tiktok/tiktok-business-api-sdk

---

**Document Version:** 1.0
**Last Updated:** October 31, 2025
**Research Completed By:** Claude Code
**Total Platforms:** 6 new + 1 existing (Google ecosystem)
**Total Operations Documented:** ~510
