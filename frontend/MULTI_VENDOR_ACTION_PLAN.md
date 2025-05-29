# Multi-Vendor E-commerce Platform: Action Plan

This document outlines the steps to transform the existing single-vendor e-commerce platform into a multi-vendor marketplace where users can create, manage, and sell their own "Collections" of products.

## Phase 1: Core Backend & Data Structure (MVP for Sellers)

**Goal:** Establish the foundational database changes and backend logic to support sellers and their collections.

1.  **Database Schema Design & Implementation:**
    *   [ ] **User Roles:**
        *   [ ] Add `role` column to `profiles` table (e.g., `customer`, `seller`, `admin`).
        *   [ ] Consider a `seller_profiles` table for additional seller-specific, non-public info (payout details, verification status, linked to `user_id`).
    *   [ ] **`sellers` Table (Public Storefront Info):**
        *   Fields: `id` (PK), `user_id` (FK to `users`), `store_name`, `store_slug`, `store_logo_url`, `store_description`, `contact_email`, `status` ('pending_approval', 'active', 'suspended').
    *   [ ] **`collections` Table:**
        *   Fields: `id` (PK), `seller_id` (FK to `sellers`), `name`, `slug`, `description`, `cover_image_url`, `price` (Numeric, price of the collection itself), `status` ('draft', 'pending_approval', 'active', 'rejected', 'inactive'), `platform_commission_rate` (Numeric, default or specific), `created_at`, `updated_at`.
    *   [ ] **`collection_items` Table (Junction):**
        *   Fields: `id` (PK), `collection_id` (FK to `collections`), `product_id` (FK to `products`).
    *   [ ] **`products` Table Modification:**
        *   [ ] Add `seller_id` (FK to `sellers`, nullable if platform can also own products).
        *   [ ] Determine if products are platform-wide or seller-specific. For now, assume sellers group existing platform products.
    *   [ ] **`orders` Table Modification:**
        *   [ ] Add `seller_id` to `order_items` if an order item can be a product from a specific seller (not part of a collection).
        *   [ ] If a collection is an order item, ensure `order_items` can reference `collection_id` and store its price.
    *   [ ] **`seller_earnings` Table:**
        *   Fields: `id` (PK), `order_id` (FK), `collection_id` (FK, if applicable), `seller_id` (FK), `total_sale_amount`, `platform_commission_amount`, `seller_earned_amount`, `transaction_date`, `status` ('pending', 'paid').

2.  **Backend API Development (Supabase Functions):**
    *   [ ] **Seller Onboarding:**
        *   [ ] `apply-for-seller-account` (User requests to become a seller).
        *   [ ] `admin-manage-seller-application` (Admin approves/rejects seller applications).
    *   [ ] **Collection Management (for Sellers):**
        *   [ ] `create-collection` (Authenticated seller endpoint).
        *   [ ] `get-seller-collections` (Authenticated seller endpoint).
        *   [ ] `update-collection` (Authenticated seller endpoint).
        *   [ ] `delete-collection` (Authenticated seller endpoint).
        *   [ ] `submit-collection-for-approval` (Authenticated seller endpoint).
    *   [ ] **Collection Management (for Admin):**
        *   [ ] `admin-get-pending-collections`.
        *   [ ] `admin-approve-collection`.
        *   [ ] `admin-reject-collection`.
    *   [ ] **Public Collection Endpoints:**
        *   [ ] `get-public-collections` (For display on the main collections page, filter by status='active').
        *   [ ] `get-public-collection-details` (Includes products within the collection).

3.  **Authentication & Authorization:**
    *   [ ] Implement Row Level Security (RLS) on new tables to ensure sellers can only manage their own data, and admins have full access.
    *   [ ] Update API endpoints to check user roles and permissions.

## Phase 2: Frontend Seller Dashboard & Collection Creation

**Goal:** Enable sellers to manage their profile and create/submit collections.

1.  **Seller Dashboard UI:**
    *   [ ] Create new route and page structure for `/seller/dashboard`.
    *   [ ] **Profile Management:**
        *   [ ] Form to update `store_name`, `store_description`, `store_logo_url`.
    *   [ ] **Collections Management Tab:**
        *   [ ] List seller's collections with status (draft, pending, active, rejected).
        *   [ ] Links to edit, view, or delete collections.
        *   [ ] "Create New Collection" button.
2.  **Collection Creation/Editing Form UI:**
    *   [ ] Form fields for `name`, `description`, `price`, `cover_image_upload`.
    *   [ ] **Product Selector:**
        *   [ ] UI to browse/search existing platform products.
        *   [ ] Mechanism to add/remove products from the current collection being built.
        *   [ ] Display selected products.
    *   [ ] "Save Draft" and "Submit for Approval" buttons.
3.  **Frontend API Integration:**
    *   [ ] Connect Seller Dashboard and Collection forms to the backend APIs created in Phase 1.
    *   [ ] Handle loading states, errors, and user feedback (toasts).

## Phase 3: Public Collections Display & Purchasing

**Goal:** Allow customers to view and purchase user-created collections.

1.  **`CollectionsPage.jsx` Enhancements:**
    *   [ ] Fetch and display `active` user-created collections alongside existing platform collections.
        *   [ ] API call to `get-public-collections`.
        *   [ ] Display seller attribution (e.g., "Curated by [Store Name]").
        *   [ ] Link to a (future) seller storefront page.
    *   [ ] "Create Your Collection" CTA (visible to logged-in users, potentially linking to seller application if not yet a seller).
2.  **Individual User-Created Collection Detail Page:**
    *   [ ] New route like `/collections/user/:collection_slug` or `/s/:store_slug/collections/:collection_slug`.
    *   [ ] Display collection details: name, description, price, cover image, seller info.
    *   [ ] List products included in the collection.
    *   [ ] "Add Collection to Cart" button.
3.  **Cart & Checkout Integration:**
    *   [ ] Modify cart state (e.g., Redux slice) to handle "collection" as an item type.
        *   Store `collection_id`, `name`, `price`, `seller_id`.
    *   [ ] Update cart UI to display collections correctly.
    *   [ ] Ensure checkout process passes necessary collection and seller info to the order creation backend.
4.  **Order Processing Backend (Enhancement):**
    *   [ ] When an order containing a user-created collection is placed:
        *   [ ] Identify the `seller_id` associated with the collection.
        *   [ ] Calculate platform commission and seller earning based on `collection.platform_commission_rate` and `collection.price`.
        *   [ ] Record the transaction in `seller_earnings`.

## Phase 4: Payouts, Fame & Advanced Features

**Goal:** Implement seller payouts and introduce features related to collection popularity.

1.  **Seller Payout System:**
    *   [ ] **Admin Payout Management UI:**
        *   [ ] View pending payouts for sellers.
        *   [ ] Mark payouts as processed.
    *   [ ] **Seller Earnings View (Seller Dashboard):**
        *   [ ] Display total earnings, pending payouts, paid history.
    *   [ ] **Payment Gateway Integration (Critical & Complex):**
        *   [ ] Research and integrate a marketplace payment solution (e.g., Stripe Connect, PayPal for Marketplaces).
        *   [ ] Implement logic to trigger payouts to sellers.
2.  **"Fame" & Popularity Features:**
    *   [ ] **Popularity Score Calculation:**
        *   [ ] Backend logic (e.g., scheduled Supabase function) to calculate `popularity_score` for collections (based on views, sales, ratings - start simple).
    *   [ ] **Display Popularity:**
        *   [ ] Show "Popular" badges or sort options on `CollectionsPage.jsx`.
    *   [ ] **Value Adjustment (Future Iteration):**
        *   [ ] Define strategy for how fame impacts price/commission (e.g., dynamic surcharge, seller-controlled tiers).
        *   [ ] Implement backend and frontend changes for this.
3.  **Reviews & Ratings for Collections:**
    *   [ ] Allow users to rate and review collections.
    *   [ ] Store reviews linked to `collection_id`.
    *   [ ] Display average ratings and reviews on collection pages.
4.  **Seller Storefront Pages:**
    *   [ ] Create public pages for each seller (e.g., `/store/:store_slug`) listing all their active collections.

## Phase 5: Ongoing Improvements & Maintenance

*   [ ] **Analytics & Reporting:** For admins (platform performance, top sellers) and for sellers (their collection performance).
*   [ ] **Dispute Resolution System:** Mechanism for handling issues between buyers and sellers.
*   [ ] **Enhanced Search & Filtering:** For collections (by seller, category of products within, price, etc.).
*   [ ] **Marketing & Promotion Tools:** For sellers to promote their collections.
*   [ ] **Taxation Logic:** Address tax collection and remittance based on regional requirements.
*   [ ] **Performance Optimization:** As the platform grows, ensure database queries and API responses are efficient.
*   [ ] **Security Audits & Updates.**

---

**Key Considerations Throughout:**

*   **User Experience (UX):** Keep the process intuitive for both sellers and buyers.
*   **Scalability:** Design database and backend with growth in mind.
*   **Security:** Protect user data, financial information, and platform integrity.
*   **Legal Compliance:** Terms of Service, privacy policy, payout regulations.
*   **Phased Rollout:** Consider launching features incrementally to gather feedback and manage complexity.

This action plan provides a high-level roadmap. Each item will require further detailed planning, design, and development effort.