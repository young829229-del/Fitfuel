# Security Specification

## Data Invariants
1. Products: Only admins can create/update/delete products. Users can only read.
2. Users: Users can only read/write their own profile.

## The Dirty Dozen (Payloads)
1. User creates a product: { name: 'Hack', price: 1, slug: 'hack' }
2. User updates a product price: { price: 0 }
3. User deletes a product
4. User updates another user's profile: { displayName: 'Hacked' }
5. User reads another user's profile
...and more.

## Test Runner (firestore.rules.test.ts)
// Implementation omitted for brevity, but will contain tests for above payloads.
