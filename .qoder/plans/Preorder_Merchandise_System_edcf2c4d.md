# Preorder-Only Merchandise Management System

## Current State Assessment

The project already has a **solid foundation**:
- Product catalog CRUD with multi-image upload
- Single-product checkout flow with buyer info collection
- 8-status order lifecycle with audit trail
- Manual bank transfer + QRIS payment with WhatsApp confirmation
- Admin order management (filtering, bulk ops, detail drawer, PDF/CSV export)
- Payment tracking page for buyers (invoice lookup)
- RBAC admin system with permission gating

**What's missing** for a complete preorder-only system:

| Gap | Impact |
|-----|--------|
| No preorder window (start/end dates) | Can't define when preorder opens/closes |
| No stock quantity or max preorder limit | Can't cap production quantity |
| No estimated delivery date | Buyers don't know when to expect goods |
| No production stage tracking | Admin can't track manufacturing progress |
| No preorder batch/round system | Can't group orders by production batch |
| No payment proof upload | Receipts sent via WhatsApp only, not stored in system |
| No customer notification system | Buyers must manually check tracking page |
| Invoice number collision risk | Client-side random 6-digit, no uniqueness constraint |
| No preorder analytics | No conversion rate, demand forecast, or batch performance data |
| JSONB-only order data | Hard to query aggregated data efficiently |

---

## Design Philosophy

Since this is **preorder-only** (not a general e-commerce store), the system should follow these principles:

1. **Preorder Window is King** — Every product has a clear open/close timeframe. Outside that window, ordering is blocked.
2. **Production-Driven** — After preorder closes, the focus shifts to manufacturing/production tracking.
3. **Manual Payment is Fine** — Bank transfer + QRIS + WhatsApp is appropriate for a fansite operation. Don't over-engineer with payment gateways yet.
4. **No Cart Needed** — Single-product preorder orders are sufficient. Fans preorder one item at a time per drop.
5. **Batch-Oriented** — Each preorder window = one production batch. This simplifies inventory and fulfillment.

---

## Phase 1: Database Schema Extensions

### Task 1.1: Extend `merchandise` table with preorder fields

**New migration file**: `database/migration_preorder_system.sql`

Add columns to `merchandise`:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `preorder_start` | TIMESTAMPTZ | NULL | When preorder opens (NULL = always open) |
| `preorder_end` | TIMESTAMPTZ | NULL | When preorder closes (NULL = no deadline) |
| `max_quantity` | INTEGER | NULL | Max total preorder quantity (NULL = unlimited) |
| `current_quantity` | INTEGER | 0 | Current ordered quantity (incremented on order) |
| `estimated_delivery` | TEXT | NULL | Estimated delivery text (e.g., "Agustus 2026") |
| `production_stage` | TEXT | NULL | Production tracking: `design`, `sampling`, `mass_production`, `qc`, `warehousing`, `shipping_prep` |
| `production_notes` | TEXT | NULL | Internal admin notes about production |
| `preorder_round` | INTEGER | 1 | Round/batch number |
| `is_preorder` | BOOLEAN | true | Flag to distinguish preorder vs regular products |

### Task 1.2: Add payment proof upload to `payments` table

Add columns to `payments`:

| Column | Type | Purpose |
|--------|------|---------|
| `proof_image_url` | TEXT | Uploaded payment receipt image URL |
| `invoice_number` | TEXT | Direct link to order invoice (for easier lookup) |
| `status` | TEXT DEFAULT 'pending' | `pending`, `verified`, `rejected` |
| `verified_by` | TEXT | Admin who verified |
| `verified_at` | TIMESTAMPTZ | Verification timestamp |

### Task 1.3: Harden invoice number uniqueness

Add a UNIQUE constraint on `orders.invoice_number` and switch generation from client-side random to a server-side pattern (e.g., DB sequence or timestamp-based: `INV-YYYYMMDD-XXXX`).

### Task 1.4: Add notification log table

New table `order_notifications`:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID PK | Auto-generated |
| `invoice_number` | TEXT | Related order |
| `type` | TEXT | `order_created`, `payment_verified`, `status_changed`, `preorder_reminder`, `shipping_update` |
| `channel` | TEXT | `whatsapp`, `email` |
| `message` | TEXT | Notification content |
| `sent_at` | TIMESTAMPTZ | When sent |
| `status` | TEXT | `pending`, `sent`, `failed` |

---

## Phase 2: Admin Product Management Enhancement

### Task 2.1: Add preorder settings to product editor

**File**: `src/admin/modules/merchandise/index.jsx`

Add a new "Preorder Settings" section in the product editor form:
- Date range picker for `preorder_start` / `preorder_end`
- Number input for `max_quantity` with live counter showing `current_quantity / max_quantity`
- Text input for `estimated_delivery`
- Dropdown for `production_stage` (only visible after preorder closes)
- Textarea for `production_notes` (internal only)
- Toggle for `is_preorder`

### Task 2.2: Add preorder status indicators to product list

**File**: `src/admin/modules/merchandise/index.jsx`

Enhance the product inventory view:
- Show preorder status badge: "Preorder Open", "Preorder Closed", "In Production", "Ready to Ship"
- Show quantity progress bar: `current_quantity / max_quantity`
- Show countdown to preorder close date
- Filter by preorder status

### Task 2.3: Fix `is_new` badge to use actual column

**File**: `src/features/merchandise/MerchandisePage.jsx`

Replace hardcoded `['merch-1', 'merch-2', 'merch-3']` check with actual `is_new` column value from database.

---

## Phase 3: Public Preorder UX Enhancement

### Task 3.1: Add preorder countdown timer to product detail

**File**: `src/features/merchandise/MerchDetailPage.jsx`

- If `preorder_end` is set and in the future, show a countdown timer ("Preorder berakhir dalam 3 hari 12 jam...")
- If `preorder_start` is in the future, show "Preorder akan dibuka dalam..." with countdown
- If preorder is closed (`preorder_end` has passed), show "Preorder Telah Ditutup" and disable the order button
- Show `estimated_delivery` text near the CTA
- Show stock progress: "Tersisa X dari Y slot" if `max_quantity` is set

### Task 3.2: Add preorder status to product listing

**File**: `src/features/merchandise/MerchandisePage.jsx`

- Show "PREORDER" badge with countdown on product cards
- Show "DITUTUP" overlay if preorder has ended
- Show stock availability indicator (e.g., "Sisa 15 slot")
- Sort option: "Ending Soon" for preorders about to close

### Task 3.3: Add payment proof upload to payment confirmation page

**File**: `src/features/merchandise/PaymentConfirmPage.jsx`

- Add file upload for payment receipt (using existing `useMediaUpload` hook)
- Show upload status and preview
- Store in `payments` table with `proof_image_url`
- This replaces the current WhatsApp-only receipt flow (keep WhatsApp as backup)

### Task 3.4: Enhance order tracking with production updates

**File**: `src/features/merchandise/PaymentConfirmPage.jsx`

- Extend the 4-step tracker to show production stage when applicable
- Show `production_stage` with human-readable labels
- Show `estimated_delivery` date
- Timeline: Order Created -> Payment -> Production (with sub-stages) -> Shipping -> Delivered

---

## Phase 4: Admin Order & Production Management

### Task 4.1: Add production tracking to admin order management

**File**: `src/admin/modules/orders/index.jsx`

- Add production stage column to order table
- Filter orders by production stage
- Bulk update production stage
- Production dashboard view showing orders grouped by production stage

### Task 4.2: Add payment proof verification workflow

**File**: `src/admin/modules/orders/index.jsx`

- In order detail drawer, add payment proof section showing uploaded receipt image
- Verify/Reject buttons for payment proof
- When verified, auto-transition status from `pending_review` to `waiting_payment` (or `paid`)

### Task 4.3: Add preorder batch summary view

**New file**: `src/admin/modules/orders/batch-summary.jsx`

- Group orders by product + preorder round
- Show per-batch stats: total orders, total quantity, total revenue, payment status breakdown
- Export batch order list for production planning
- Mark batch as "ready for production" when all payments confirmed

---

## Phase 5: Notification System (Lightweight)

### Task 5.1: WhatsApp notification templates

**New file**: `src/services/public/notificationService.js`

- Predefined message templates for each notification type
- Generate WhatsApp deep links with pre-filled messages
- Trigger points:
  - Order created -> "Terima kasih! Pesanan Anda telah diterima"
  - Payment verified -> "Pembayaran Anda telah diverifikasi"
  - Status changed -> "Status pesanan Anda telah diperbarui"
  - Preorder ending soon (admin-triggered) -> "Preorder akan segera ditutup!"

### Task 5.2: Add notification triggers to order status changes

**File**: `src/app/api/admin/orders/route.js`

- On status change, create notification record in `order_notifications`
- Generate WhatsApp link for admin to send notification
- Optional: auto-send via WhatsApp Business API (future enhancement)

---

## Phase 6: Service Layer & API Updates

### Task 6.1: Extend `merchandiseService.js`

**File**: `src/services/public/merchandiseService.js`

- Add methods: `getPreorderStatus()`, `incrementQuantity()`, `checkPreorderAvailability()`
- Update `createOrder()` to validate preorder window and stock limits
- Add `uploadPaymentProof()` method
- Update `getOrderByInvoice()` to include payment proof data

### Task 6.2: Extend admin orders API

**File**: `src/app/api/admin/orders/route.js`

- Add `updateProductionStage` action
- Add `verifyPayment` action
- Add batch summary endpoint
- Add notification trigger on status changes

### Task 6.3: Fix invoice number generation

Move from client-side random to server-side generation in the API route:
- Format: `INV-YYYYMMDD-XXXX` (date + 4-digit sequence)
- Add UNIQUE constraint on `invoice_number` column
- Return generated invoice number from API after order creation

---

## Phase 7: Analytics & Dashboard

### Task 7.1: Add preorder analytics to admin dashboard

**File**: `src/admin/modules/merchandise/index.jsx` or new analytics section

- Preorder conversion rate (views vs orders)
- Revenue per preorder batch
- Demand by category
- Average fulfillment time
- Outstanding payments summary

---

## Implementation Priority & Dependencies

```
Phase 1 (DB Schema)           -- Foundation, must be first
    |
    v
Phase 6.3 (Invoice fix)       -- Quick win, prevents future data issues
    |
    v
Phase 2 (Admin Product Mgmt)  -- Admin can manage preorder settings
    |
    v
Phase 3 (Public UX)           -- Buyers see preorder info + upload proof
    |
    v
Phase 4 (Admin Order Mgmt)    -- Production tracking + payment verification
    |
    v
Phase 5 (Notifications)       -- Keep buyers informed
    |
    v
Phase 7 (Analytics)           -- Data-driven decisions
```

## Rejected Alternatives

| Alternative | Why Rejected |
|-------------|-------------|
| Full e-commerce with cart + multi-product orders | Overkill for preorder-only fansite; adds complexity without proportional value |
| Payment gateway integration (Midtrans/Xendit) | Manual bank transfer works fine for current scale; gateway adds fees and compliance burden |
| Customer accounts/login for buyers | Adds friction; current anonymous + invoice lookup is simpler for a fansite context |
| Normalize `order_data` JSONB into relational tables | High migration risk; JSONB works fine for current scale; add generated columns later if needed |
| Real-time notification via WebSocket/Email | Premature optimization; WhatsApp + manual notification is sufficient for fansite operations |
| Separate `preorder` table | Unnecessary complexity; extending `merchandise` table keeps the data model simple |

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Migration breaks existing data | All new columns are nullable with defaults; existing products continue working |
| Invoice format change breaks existing lookups | Keep backward compatibility: support both old `INV-XXXXXX` and new `INV-YYYYMMDD-XXXX` formats |
| `current_quantity` gets out of sync | Use DB-level atomic increment (`UPDATE SET current_quantity = current_quantity + 1`) with check against `max_quantity` |
| Payment proof images consume storage | Reuse existing Cloudflare R2 upload infrastructure with image compression via `useMediaUpload` hook |
| Production stage changes need audit trail | Reuse existing audit log pattern from order status changes |

## Critical Files

| File | Changes |
|------|---------|
| `database/schema.sql` + new migration | Schema extensions for preorder fields, payment proofs, notifications |
| `src/admin/modules/merchandise/index.jsx` | Preorder settings in product editor, status indicators |
| `src/features/merchandise/MerchDetailPage.jsx` | Countdown timer, stock indicator, delivery estimate |
| `src/features/merchandise/PaymentConfirmPage.jsx` | Payment proof upload, production stage display |
| `src/services/public/merchandiseService.js` | Preorder validation, quantity management, proof upload |
| `src/admin/modules/orders/index.jsx` | Production tracking, payment verification, batch summary |
| `src/app/api/admin/orders/route.js` | New API actions for production, payment verification, invoice generation |
