# Dynamic Product Catalog Integration

**Goal**: Implement a `/products` route with server‑side pagination, filtering, and sorting using MongoDB/Mongoose. Update the UI to use the existing `shop.ejs` view (or create a new `products.ejs` if needed) and ensure the database schema includes required fields. Seed at least 20‑30 products.

## User Review Required

> [!IMPORTANT]
> This plan introduces a new route (`/products`) and modifies the existing `shopController.getShop` to handle pagination, filters, and sorting. It also adds/updates the Mongoose `Product` schema and seed script. Please confirm that you want these changes applied.

## Open Questions

> [!CAUTION]
> - Do you prefer to keep the current `shop.ejs` as the product listing page (currently accessed via `/products` in `server.js`) or create a separate `products.ejs`? The current `shop.ejs` already supports pagination and filters, but the route is mounted at `/products` via `shopRoutes`. Confirm if any UI adjustments are needed.
> - Would you like to add a new field `stock` to the schema and display it in the UI, or just keep it in the data model for future use?
> - Should we include any additional sorting options (e.g., newest, price‑low/high) beyond those already present?

## Proposed Changes

---
### Models

#### [MODIFY] [Product.js](file:///c:/Ecommerce%20App%20EJS/models/Product.js)
- Ensure schema includes `name`, `price`, `category`, `rating`, `stock`, `originalPrice`, `badge`, `description`, `image`, `reviewCount`, `createdAt`.
- Add default values where appropriate and enable timestamps.

---
### Controllers

#### [MODIFY] [shopController.js](file:///c:/Ecommerce%20App%20EJS/controllers/shopController.js)
- Refactor `getShop` to: 
  - Parse query parameters: `page`, `category`, `search`, `minPrice`, `maxPrice`, `sort`.
  - Build Mongoose query with filters.
  - Apply pagination (`limit = 8`).
  - Return `totalPages`, `currentPage`, `totalCount`, and filtered `products` to the view.
- Ensure `filters` object passed to view includes all current filter values for UI persistence.

---
### Routes

#### [MODIFY] [shop.js](file:///c:/Ecommerce%20App%20EJS/routes/shop.js)
- Change route path to `/products` (already mounted in `server.js`). Ensure it uses the updated controller.

---
### Views

#### [MODIFY] [shop.ejs](file:///c:/Ecommerce%20App%20EJS/views/shop.ejs)
- Verify pagination controls use the new `queryString` without the `page` param.
- Ensure the search bar form points to `/products` and preserves other filters.
- Optionally display `stock` information if desired.

---
### Data Seeding

#### [MODIFY] [seed.js](file:///c:/Ecommerce%20App%20EJS/data/seed.js)
- Update seed data to include the `stock` field for each product.
- Ensure at least 30 products across categories (electronics, clothing, books, home) are inserted.

---
### Front‑End Enhancements

- Add UI indication for active filters (already present).
- Ensure pagination links retain all filter query parameters.
- Adjust CSS if needed for new elements (e.g., stock badge).

---
## Verification Plan

### Automated Tests
- Run the seed script and verify `Product.countDocuments()` ≥ 30.
- Start the server (`npm start`) and request `/products?page=2&category=electronics&minPrice=50&maxPrice=200&search=headphones&sort=price-low`.
- Confirm response HTML includes correct number of product cards (≤8) and correct pagination info.
- Verify that filtering works by checking product names and prices.

### Manual Verification
- Open the site in a browser, navigate to the Products page, try different filters, pagination, and sorting.
- Ensure the search bar works and filters persist across navigation.
- Check that the UI looks consistent with the rest of the site (no broken layout).

---
**Next Steps**: Await user approval or clarification on the open questions before applying changes.
