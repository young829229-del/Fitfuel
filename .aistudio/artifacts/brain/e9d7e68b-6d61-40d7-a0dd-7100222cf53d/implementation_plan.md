# Product Detail Page Implementation Plan

To implement dynamic product detail pages for FitFul Nepal without existing data, I will follow this plan:

## 1. Data Structure & Generation
- Create a comprehensive `src/data/products.ts` file.
- Generate realistic, professional descriptions, nutritional facts, and usage instructions for the five products currently in the carousel.
- Each product entry will include: `id`, `slug`, `name`, `price`, `description`, `keyBenefits`, `nutritionalInfo`, `ingredients`, `usage`, `stockStatus`.

## 2. Routing
- Use `react-router-dom` to implement dynamic routing: `/product/:slug`.
- Ensure the `ProductHero` component links directly to these URLs.

## 3. Detail Page Component
- Develop a reusable `ProductDetail` component.
- **Desktop**: Split-pane layout with image (left), purchase/info (right).
- **Mobile**: Stacked layout.
- **Functionality**:
    - Add to Cart / Buy Now buttons.
    - Quantity selector.
    - Sectionized information (Details, Nutrition, How to use, Reviews).

## 4. Cart Integration
- Implement a simple context-based cart provider to manage state for "Add to Cart" functionality across the app.

## 5. Review & Verification
- Verify dynamic navigation from the homepage hero to individual product pages.
- Ensure all product details are correctly displayed for each unique slug.
- Verify cart functionality.
