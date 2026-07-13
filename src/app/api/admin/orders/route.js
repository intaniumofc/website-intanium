import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// GET all orders or a single order
export async function GET(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    const supabase = createAdminClient();

    if (orderId) {
      // Fetch single order details
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error(`Error fetching order detail for ${orderId}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      let product = null;
      if (order.order_data?.productId) {
        const { data: prod } = await supabase
          .from('merchandise')
          .select('*')
          .eq('id', order.order_data.productId)
          .maybeSingle();
        product = prod;
      }

      const totalAmount = order.order_data?.totalAmount || 0;
      const auditLogs = order.order_data?.auditLogs || [];

      const result = {
        order: {
          id: order.id,
          order_number: order.invoice_number,
          shipping_name: order.order_data?.name || '-',
          shipping_phone: order.order_data?.phone || '-',
          shipping_address: order.order_data?.address || '-',
          shipping_postal_code: order.order_data?.postalCode || '-',
          shipping_city: order.order_data?.city || '-',
          shipping_courier: order.order_data?.deliveryMethod === 'pickup_fx' ? 'Bertemu di FX' : (order.order_data?.courier || 'J&T'),
          shipping_service: order.order_data?.deliveryMethod === 'pickup_fx' ? 'Pickup' : (order.order_data?.service || 'EZ'),
          shipping_cost: order.order_data?.shipping_cost || 0,
          total_amount: totalAmount,
          subtotal_amount: order.order_data?.subtotal || totalAmount,
          discount_amount: order.order_data?.discount_amount || 0,
          discount_code: order.order_data?.discount_code || null,
          status: order.order_data?.status || 'pending_review',
          notes: order.order_data?.notes || '-',
          created_at: order.created_at,
          updated_at: order.order_data?.updated_at || order.created_at,
          tracking_number: order.order_data?.trackingNumber || null,
          tracking_url: order.order_data?.trackingUrl || null,
          shipped_at: order.order_data?.shipped_at || null,
          line_id: order.order_data?.lineId || null,
          iris_member_id: order.order_data?.irisMemberId || order.order_data?.intaniumMemberId || null,
          delivery_method: order.order_data?.deliveryMethod || 'expedition_jnt',
          province: order.order_data?.province || null,
        },
        items: [
          {
            id: order.id + '-item',
            product_name: product ? product.name : 'Unknown Product',
            selected_size: order.order_data?.selectedSize || null,
            quantity: order.order_data?.quantity || 1,
            subtotal: order.order_data?.subtotal || totalAmount,
          }
        ],
        auditLogs
      };

      return NextResponse.json({ success: true, ...result });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = orders.map(order => ({
      id: order.id,
      order_number: order.invoice_number,
      shipping_name: order.order_data?.name || '-',
      shipping_phone: order.order_data?.phone || '-',
      shipping_address: order.order_data?.address || '-',
      shipping_postal_code: order.order_data?.postalCode || '-',
      shipping_city: order.order_data?.city || '-',
      shipping_courier: order.order_data?.deliveryMethod === 'pickup_fx' ? 'Bertemu di FX' : (order.order_data?.courier || 'J&T'),
      shipping_service: order.order_data?.deliveryMethod === 'pickup_fx' ? 'Pickup' : (order.order_data?.service || 'EZ'),
      shipping_cost: order.order_data?.shipping_cost || 0,
      total_amount: order.order_data?.totalAmount || 0,
      subtotal_amount: order.order_data?.subtotal || order.order_data?.totalAmount || 0,
      status: order.order_data?.status || 'pending_review',
      created_at: order.created_at,
      updated_at: order.order_data?.updated_at || order.created_at,
      tracking_number: order.order_data?.trackingNumber || null,
      tracking_url: order.order_data?.trackingUrl || null,
      shipped_at: order.order_data?.shipped_at || null,
      productId: order.order_data?.productId || null,
      quantity: order.order_data?.quantity || 1,
      line_id: order.order_data?.lineId || null,
      iris_member_id: order.order_data?.irisMemberId || order.order_data?.intaniumMemberId || null,
      delivery_method: order.order_data?.deliveryMethod || 'expedition_jnt',
      province: order.order_data?.province || null,
      notes: order.order_data?.notes || null,
      order_data: order.order_data,
    }));

    return NextResponse.json({ success: true, orders: mapped });
  } catch (err) {
    console.error('API admin orders GET error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}

// PUT to update status, shipping cost, or tracking details
export async function PUT(request) {
  const { profile, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch current order
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const currentOrderData = order.order_data || {};
    const actorName = profile.role === 'super_admin' ? 'Super Admin' : (profile.role === 'coordinator' ? 'Koordinator' : 'Staff Admin');
    const actorEmail = profile.username || 'admin@iris.admin';

    let updatedOrderData = { ...currentOrderData };
    let statusLogMsg = '';

    if (action === 'updateStatus') {
      const { nextStatus, note } = body;
      if (!nextStatus) return NextResponse.json({ success: false, error: 'nextStatus is required' }, { status: 400 });

      const prevStatus = currentOrderData.status || 'pending_review';
      const auditLogs = currentOrderData.auditLogs || [];

      const newLog = {
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        previous_status: prevStatus,
        next_status: nextStatus,
        created_at: new Date().toISOString(),
        actor_name: actorName,
        actor_email: actorEmail,
        note: note || ''
      };

      updatedOrderData.status = nextStatus;
      updatedOrderData.updated_at = new Date().toISOString();
      updatedOrderData.auditLogs = [...auditLogs, newLog];
      statusLogMsg = `Update status order ${order.invoice_number} dari ${prevStatus} menjadi ${nextStatus}`;

    } else if (action === 'updateFulfillment') {
      const { trackingNumber, trackingUrl, markShipped, note } = body;
      const prevStatus = currentOrderData.status || 'pending_review';
      const auditLogs = currentOrderData.auditLogs || [];
      const nextStatus = markShipped ? 'shipped' : prevStatus;

      const newLog = {
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        previous_status: prevStatus,
        next_status: nextStatus,
        created_at: new Date().toISOString(),
        actor_name: actorName,
        actor_email: actorEmail,
        note: note || `Fulfillment info updated. Resi: ${trackingNumber || '-'}`
      };

      updatedOrderData.trackingNumber = trackingNumber || null;
      updatedOrderData.trackingUrl = trackingUrl || null;
      updatedOrderData.status = nextStatus;
      updatedOrderData.shipped_at = markShipped ? new Date().toISOString() : (currentOrderData.shipped_at || null);
      updatedOrderData.updated_at = new Date().toISOString();
      updatedOrderData.auditLogs = [...auditLogs, newLog];
      statusLogMsg = `Update fulfillment order ${order.invoice_number}. Resi: ${trackingNumber || '-'}. Status: ${nextStatus}`;

    } else if (action === 'updateShippingCost') {
      const { newCost } = body;
      if (newCost === undefined) return NextResponse.json({ success: false, error: 'newCost is required' }, { status: 400 });

      const subtotal = currentOrderData.subtotal || currentOrderData.totalAmount || 0;
      const totalAmount = Number(subtotal) + Number(newCost);
      const prevStatus = currentOrderData.status || 'pending_review';
      const auditLogs = currentOrderData.auditLogs || [];

      const newLog = {
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        previous_status: prevStatus,
        next_status: prevStatus,
        created_at: new Date().toISOString(),
        actor_name: actorName,
        actor_email: actorEmail,
        note: `Ongkos kirim disesuaikan dari Rp ${currentOrderData.shipping_cost || 0} menjadi Rp ${newCost}`
      };

      updatedOrderData.shipping_cost = Number(newCost);
      updatedOrderData.totalAmount = totalAmount;
      updatedOrderData.updated_at = new Date().toISOString();
      updatedOrderData.auditLogs = [...auditLogs, newLog];
      statusLogMsg = `Sesuaikan ongkos kirim order ${order.invoice_number} menjadi Rp ${newCost}`;

    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // 2. Perform DB Update
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ order_data: updatedOrderData })
      .eq('id', orderId)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating order:', updateErr);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // 3. Write admin activity log
    await supabase.from('admin_activity_logs').insert([
      {
        admin_username: actorEmail,
        action: statusLogMsg,
      }
    ]);

    const mapped = {
      id: updated.id,
      order_number: updated.invoice_number,
      shipping_name: updated.order_data?.name || '-',
      shipping_phone: updated.order_data?.phone || '-',
      shipping_address: updated.order_data?.address || '-',
      shipping_postal_code: updated.order_data?.postalCode || '-',
      shipping_city: updated.order_data?.city || '-',
      shipping_courier: updated.order_data?.deliveryMethod === 'pickup_fx' ? 'Bertemu di FX' : (updated.order_data?.courier || 'J&T'),
      shipping_service: updated.order_data?.deliveryMethod === 'pickup_fx' ? 'Pickup' : (updated.order_data?.service || 'EZ'),
      shipping_cost: updated.order_data?.shipping_cost || 0,
      total_amount: updated.order_data?.totalAmount || 0,
      subtotal_amount: updated.order_data?.subtotal || updated.order_data?.totalAmount || 0,
      status: updated.order_data?.status || 'pending_review',
      created_at: updated.created_at,
      updated_at: updated.order_data?.updated_at || updated.created_at,
      tracking_number: updated.order_data?.trackingNumber || null,
      tracking_url: updated.order_data?.trackingUrl || null,
      shipped_at: updated.order_data?.shipped_at || null,
    };

    return NextResponse.json({ success: true, order: mapped });
  } catch (err) {
    console.error('API admin orders PUT error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}

// DELETE an order
export async function DELETE(request) {
  const { profile, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'id query parameter is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch invoice number first for activity logging
    const { data: order } = await supabase
      .from('orders')
      .select('invoice_number')
      .eq('id', orderId)
      .maybeSingle();

    const invoiceNum = order ? order.invoice_number : orderId;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log the deletion activity
    const actorEmail = profile.username || 'admin@iris.admin';
    await supabase.from('admin_activity_logs').insert([
      {
        admin_username: actorEmail,
        action: `Menghapus order ${invoiceNum}`,
      }
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API admin orders DELETE error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
