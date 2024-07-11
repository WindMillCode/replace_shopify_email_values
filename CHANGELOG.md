#v.0 [7/10/2024 03:45:21 PM EST]

[UPDATE]

`README.md`

- Added description for "Replace Shopify Email Variables"
- Key features and drawbacks are now listed

[PATCH]

`extension/content.js`

- Added new button selectors in `editBtnSelector`
- Added new button selectors in `confirmRevertBtnSelector`
- Wrapped `resetEmailTemplate` function with a try-catch block

[UPDATE]

`extension/manifest.json`

- Restricted `host_permissions` to `https://admin.shopify.com/*`
- Updated `content_scripts` to match `https://admin.shopify.com/*`

[BUG]

`extension/popup.js`

- Fixed index calculation in `getValues` and `DOMContentLoaded` events

