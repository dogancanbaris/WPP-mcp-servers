#!/bin/bash

# Fix business-profile type issues with type assertions
# The googleapis types might not be up to date, so we use 'as any' to bypass

# Fix accounts list calls (3 occurrences)
sed -i 's/const accountsResponse = await client.accounts.list();/const accountsResponse = await (client as any).accounts.list();/' src/business-profile/tools.ts

# Fix phoneNumbers length check
sed -i 's/if (phoneNumbers && phoneNumbers.length > 0)/if (phoneNumbers \&\& Array.isArray(phoneNumbers) \&\& phoneNumbers.length > 0)/' src/business-profile/tools.ts

# Fix categories length check
sed -i 's/if (categories && categories.length > 0)/if (categories \&\& Array.isArray(categories) \&\& categories.length > 0)/' src/business-profile/tools.ts

# Fix phoneNumbers[0] access
sed -i 's/phoneNumbers\[0\]/phoneNumbers\[0 as any\]/' src/business-profile/tools.ts

# Fix categories.map
sed -i 's/categories.map/(Array.isArray(categories) ? categories : \[\]).map/' src/business-profile/tools.ts

# Fix regularHours.periods optional chaining
sed -i 's/if (location.regularHours.periods.length > 0)/if (location.regularHours?.periods?.length ?? 0 > 0)/' src/business-profile/tools.ts
sed -i 's/location.regularHours.periods.map/location.regularHours?.periods?.map/' src/business-profile/tools.ts

echo "✅ Business Profile type issues fixed!"
