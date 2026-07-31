import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { rateLimit, getClientIp } from '@/lib/auth/requireAdmin';

const SETTINGS_ROW_IDS = ['payment_settings', 'game_settings', 'photobooth_settings'];

// Only persist known checkout fields into order_data JSONB
const ALLOWED_ORDER_FIELDS = [
  'name', 'email', 'phone', 'lineId', 'irisMemberId',
  'deliveryMethod', 'address', 'city', 'province', 'postalCode',
  'shippingCost', 'shipping_cost', 'notes', 'subtotal', 'totalAmount',
  'quantity', 'productId', 'productName', 'selectedSize', 'courier', 'service', 'status',
];

function sanitizeOrderData(raw) {
  const cleaned = {};
  for (const key of ALLOWED_ORDER_FIELDS) {
    if (raw[key] !== undefined) cleaned[key] = raw[key];
  }
  return cleaned;
}

// Server-side invoice generation: INV-YYYYMMDD-XXXX (WIB date + 4-digit sequence)
function buildInvoiceNumber(sequence) {
  const now = new Date();
  const jakarta = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = jakarta.getUTCFullYear();
  const mm = String(jakarta.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(jakarta.getUTCDate()).padStart(2, '0');
  return `INV-${yyyy}${mm}${dd}-${String(sequence).padStart(4, '0')}`;
}

export async function POST(request) {
  const ip = getClientIp(request);
  const { error: rlError } = rateLimit(ip, { key: 'order-create', max: 10, windowMs: 60_000 });
  if (rlError) return rlError;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error('Order API config error:', err);
    return NextResponse.json(
      { success: false, error: 'Konfigurasi server belum lengkap.' },
      { status: 500 }
    );
  }

  let productId = null;
  let quantity = 0;

  try {
    const body = await request.json();
    const orderData = sanitizeOrderData(body?.orderData || {});

    productId = typeof orderData.productId === 'string' ? orderData.productId : null;
    quantity = Number.parseInt(orderData.quantity, 10) || 0;

    if (!orderData.name?.trim() || !orderData.phone?.trim() || !productId || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Data pesanan tidak lengkap atau tidak valid.' },
        { status: 400 }
      );
    }

    if (SETTINGS_ROW_IDS.includes(productId)) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 1. Validate product & preorder availability
    const { data: product, error: productError } = await supabase
      .from('merchandise')
      .select('id, name, is_available, is_preorder, preorder_closed, preorder_start, preorder_end')
      .eq('id', productId)
      .maybeSingle();

    if (productError) {
      console.error('Error fetching product for order:', productError);
      return NextResponse.json(
        { success: false, error: 'Gagal memeriksa ketersediaan produk.' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (!product.is_available) {
      return NextResponse.json(
        { success: false, error: 'Produk sedang tidak tersedia.' },
        { status: 409 }
      );
    }

    if (product.is_preorder) {
      // Preorder is controlled by the manual closed switch + schedule window
      const now = Date.now();
      let reason = null;
      if (product.preorder_closed) {
        reason = 'Preorder untuk produk ini telah ditutup.';
      } else if (product.preorder_start && new Date(product.preorder_start).getTime() > now) {
        reason = 'Preorder untuk produk ini belum dibuka.';
      } else if (product.preorder_end && new Date(product.preorder_end).getTime() < now) {
        reason = 'Preorder untuk produk ini telah ditutup.';
      }
      if (reason) {
        return NextResponse.json({ success: false, error: reason }, { status: 409 });
      }
    }

    // 2. Generate unique invoice number with retry against UNIQUE index
    const todayPrefix = buildInvoiceNumber(0).slice(0, -5); // "INV-YYYYMMDD-"
    const { count: todayCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .like('invoice_number', `${todayPrefix}%`);

    const finalOrderData = {
      ...orderData,
      status: 'pending_review',
      quantity,
    };

    let insertedOrder = null;
    let lastError = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const sequence = attempt === 0
        ? (todayCount || 0) + 1
        : Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = buildInvoiceNumber(sequence);

      const { data, error } = await supabase
        .from('orders')
        .insert([{ invoice_number: invoiceNumber, order_data: finalOrderData }])
        .select()
        .single();

      if (!error) {
        insertedOrder = data;
        break;
      }
      lastError = error;
      // 23505 = unique_violation -> retry with a new sequence
      if (error.code !== '23505') break;
    }

    if (!insertedOrder) {
      console.error('Error creating order:', lastError);
      return NextResponse.json(
        { success: false, error: 'Gagal membuat pesanan. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    // 3. Log order_created notification (best effort, non-blocking)
    const { error: notifError } = await supabase.from('order_notifications').insert([{
      invoice_number: insertedOrder.invoice_number,
      type: 'order_created',
      channel: 'whatsapp',
      message: `Terima kasih ${orderData.name}! Pesanan ${insertedOrder.invoice_number} telah kami terima dan sedang menunggu peninjauan admin.`,
      status: 'pending',
    }]);
    if (notifError) {
      console.error('Error logging order notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      invoiceNumber: insertedOrder.invoice_number,
      orderId: insertedOrder.id,
    });
  } catch (error) {
    console.error('API Create Order Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
