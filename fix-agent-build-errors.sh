#!/bin/bash

echo "Fixing build errors from 15 parallel agents..."

# Fix unused variables (prefix with _)
sed -i 's/const displayText =/const _displayText =/' src/ads/tools/extensions/create-promotion-extension.tool.ts
sed -i 's/(i, ctx)/(_i, _ctx)/g' src/ads/tools/extensions/*.ts
sed -i 's/const { customerId }/const { customerId: _customerId }/g' src/ads/tools/extensions/update-*.ts
sed -i 's/const result =/const _result =/g' src/ads/tools/labels.ts
sed -i 's/const metrics =/const _metrics =/g' src/ads/tools/keywords.ts
sed -i 's/const { operation }/const { operation: _operation }/g' src/shared/dry-run-builder.ts
sed -i 's/, formatNumber//' src/ads/tools/reporting/get-auction-insights.tool.ts

# Fix implicit any types
sed -i 's/(id)/id: string/g' src/ads/tools/targeting/add-demographic-criteria.tool.ts
sed -i 's/(languageId)/languageId: string/g' src/ads/tools/targeting/add-language-criteria.tool.ts
sed -i 's/(id, l)/(id: string, l: any)/g' src/ads/tools/targeting/add-language-criteria.tool.ts
sed -i 's/(l)/(l: any)/g' src/ads/tools/targeting/add-language-criteria.tool.ts

# Fix unused type import
sed -i 's/StructuredSnippetHeader,//' src/ads/tools/extensions/create-structured-snippet.tool.ts

# Fix validation errors type
sed -i 's/const validationErrors =/const validationErrors: string[] =/' src/ads/tools/extensions/create-sitelink.tool.ts

# Fix audit.log to audit.logWriteOperation
sed -i 's/audit\.log(/audit.logWriteOperation(/' src/ads/tools/extensions/*.ts

echo "✅ Common errors fixed. Re-running build..."
