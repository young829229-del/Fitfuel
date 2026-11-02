# Security Specification: FitFul Nepal Firebase Firestore

## Data Invariants
1. Products: Store supplement inventory. Publicly readable by all shoppers; writable by authorized administrators.
2. Orders: Shoppers can create purchase orders without exposure of sensitive admin data. Orders stream live to the admin console.
3. Customers: Contact information and order metrics recorded for repeat customer identification.
4. Banners: Promotional banners displayed on the storefront. Publicly readable; writable by administrators.
5. Categories: Taxonomy and filter tags. Publicly readable; writable by administrators.
6. Reviews: Verified customer reviews and ratings. Shoppers can post feedback for products; administrators moderate.
7. Coupons: Promotional discount codes with minimum order limits and expiration flags.
8. Settings: Global store parameters, announcement bar text/toggle, and delivery fee thresholds.
9. Admins: Administrative account permissions.

## The Dirty Dozen (Payloads)
1. Malicious user tries to overwrite root admin config document without permissions.
2. Unauthenticated user attempts to delete an active product from the catalog.
3. Attacker injects a negative price or non-numeric value into a product payload.
4. User tries to inject a 10MB payload into customer reviews.
5. Unauthorized visitor attempts to delete all customer orders.
6. Malicious actor modifies another customer's contact phone number.
7. Attacker tries to set coupon discount to 1000% or negative values.
8. Unverified user attempts to disable store delivery settings.
9. Malicious actor attempts to delete categories and disrupt navigation.
10. Attacker attempts to modify system admin claims via client payload.
11. User attempts to inject script tags into product title or banner description.
12. Attacker attempts to spoof order statuses from 'Pending' to 'Delivered' without administrative access.
