# Resume Multi-Vendor Development

## Current Status
You were working on transforming your single-vendor e-commerce platform into a multi-vendor marketplace where users can create and sell collections of products.

## Immediate Next Steps (Phase 1A - Database Foundation)

### 1. Database Schema Setup
Create the foundational tables first:

```sql
-- Add to new migration file
-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin'));

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_slug TEXT UNIQUE NOT NULL,
    store_logo_url TEXT,
    store_description TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'rejected', 'inactive')),
    platform_commission_rate DECIMAL(5,4) DEFAULT 0.15, -- 15% default
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_id, slug)
);

-- Create collection_items junction table
CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, product_id)
);

-- Create seller_earnings table
CREATE TABLE IF NOT EXISTS seller_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    total_sale_amount DECIMAL(10,2) NOT NULL,
    platform_commission_amount DECIMAL(10,2) NOT NULL,
    seller_earned_amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Basic Edge Functions (MVP)
Start with these essential functions:

1. **apply-for-seller-account**
2. **create-collection** 
3. **get-seller-collections**
4. **get-public-collections**

### 3. Minimal Frontend Changes
1. Add "Become a Seller" CTA to CollectionsPage
2. Create basic seller registration form
3. Add user-created collections display to CollectionsPage

## Quick Win Implementation Plan

### Week 1: Database + Seller Registration
- [ ] Create database migration
- [ ] Build seller application form
- [ ] Create apply-for-seller-account function

### Week 2: Collection Creation (Seller Side)
- [ ] Build basic seller dashboard
- [ ] Create collection creation form
- [ ] Implement create-collection function

### Week 3: Public Display
- [ ] Modify CollectionsPage to show user collections
- [ ] Add collection detail page
- [ ] Implement get-public-collections function

### Week 4: Cart Integration
- [ ] Modify cart to handle collections
- [ ] Update checkout process
- [ ] Add seller earnings tracking

## Files to Focus On
1. `/frontend/src/pages/CollectionsPage.jsx` - Your current focus
2. Create `/frontend/src/pages/seller/` directory structure
3. New migration file in `/supabase/migrations/`
4. New Edge Functions in `/supabase/functions/`

## Key Decision Points
1. **User Registration Flow**: Should users apply to become sellers or auto-approve?
2. **Collection Approval**: Admin approval vs. auto-publish?
3. **Product Integration**: Sellers use existing products or create their own?

Would you like me to implement any of these specific parts to get you back on track?
