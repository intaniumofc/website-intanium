import { supabase } from '../../lib/supabaseClient';

export const merchandiseService = {
  getProducts: async (category = 'All', search = '') => {
    let query = supabase.from('merchandise').select('*').neq('id', 'payment_settings').neq('id', 'game_settings');
    
    if (category !== 'All') {
      query = query.eq('category', category);
    }
    
    if (search.trim()) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching merchandise:', error);
      return [];
    }
    return data;
  },

  getProductById: async (id) => {
    const { data, error } = await supabase
      .from('merchandise')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching merchandise with id ${id}:`, error);
      return null;
    }
    return data;
  },

  getOrderByInvoice: async (invoiceNumber) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .maybeSingle();
      
    if (error) {
      console.error(`Error fetching order by invoice ${invoiceNumber}:`, error);
      return null;
    }
    return data;
  },

  createOrder: async (orderData) => {
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from('orders')
      .insert([{ invoice_number: invoiceNumber, order_data: orderData }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
    return {
      success: true,
      invoiceNumber: data.invoice_number,
      ...orderData
    };
  },

  confirmPayment: async (confirmData) => {
    const { error } = await supabase
      .from('payments')
      .insert([{ confirm_data: confirmData }])
      .select()
      .single();
      
    if (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: error.message };
    }
    return {
      success: true,
      message: 'Konfirmasi pembayaran berhasil dikirim. Kami akan memverifikasi dalam waktu 24 jam.'
    };
  },

  checkPaymentSubmitted: async (invoiceNumber) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .contains('confirm_data', { invoiceNumber });
      
    if (error) {
      console.error('Error checking payment existence:', error);
      return false;
    }
    return data && data.length > 0;
  },

  createProduct: async (productData) => {
    const id = productData.id || `merch-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from('merchandise')
      .insert([{ ...productData, id }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateProduct: async (id, productData) => {
    const { data, error } = await supabase
      .from('merchandise')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('merchandise').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  getAdminOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching admin orders:', error);
      throw new Error(error.message);
    }
    
    return data.map(order => ({
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
      intanium_member_id: order.order_data?.intaniumMemberId || null,
      delivery_method: order.order_data?.deliveryMethod || 'expedition_jnt',
      province: order.order_data?.province || null,
      notes: order.order_data?.notes || null,
      order_data: order.order_data,
    }));
  },

  getAdminOrderDetail: async (orderId) => {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (error) {
      console.error('Error fetching admin order detail:', error);
      throw new Error(error.message);
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
    
    return {
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
        intanium_member_id: order.order_data?.intaniumMemberId || null,
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
  },

  updateAdminOrderStatus: async (orderId, nextStatus, note) => {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (fetchErr) {
      throw new Error(fetchErr.message);
    }
    
    const prevStatus = order.order_data?.status || 'pending_review';
    const auditLogs = order.order_data?.auditLogs || [];
    
    const newLog = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      previous_status: prevStatus,
      next_status: nextStatus,
      created_at: new Date().toISOString(),
      actor_name: 'Admin',
      actor_email: 'admin@intanium.com',
      note: note || ''
    };
    
    const updatedOrderData = {
      ...order.order_data,
      status: nextStatus,
      updated_at: new Date().toISOString(),
      auditLogs: [...auditLogs, newLog]
    };
    
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ order_data: updatedOrderData })
      .eq('id', orderId)
      .select()
      .single();
      
    if (updateErr) {
      throw new Error(updateErr.message);
    }
    
    return {
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
  },

  updateAdminOrderFulfillment: async (orderId, { trackingNumber, trackingUrl, markShipped, note }) => {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (fetchErr) {
      throw new Error(fetchErr.message);
    }
    
    const prevStatus = order.order_data?.status || 'pending_review';
    const auditLogs = order.order_data?.auditLogs || [];
    const nextStatus = markShipped ? 'shipped' : prevStatus;
    
    const newLog = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      previous_status: prevStatus,
      next_status: nextStatus,
      created_at: new Date().toISOString(),
      actor_name: 'Admin',
      actor_email: 'admin@intanium.com',
      note: note || `Fulfillment info updated. Resi: ${trackingNumber || '-'}`
    };
    
    const updatedOrderData = {
      ...order.order_data,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
      status: nextStatus,
      shipped_at: markShipped ? new Date().toISOString() : (order.order_data?.shipped_at || null),
      updated_at: new Date().toISOString(),
      auditLogs: [...auditLogs, newLog]
    };
    
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ order_data: updatedOrderData })
      .eq('id', orderId)
      .select()
      .single();
      
    if (updateErr) {
      throw new Error(updateErr.message);
    }
    
    return {
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
  },

  deleteAdminOrder: async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
      
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  },

  updateAdminOrderShippingCost: async (orderId, newCost) => {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (fetchErr) throw new Error(fetchErr.message);
    
    const subtotal = order.order_data?.subtotal || order.order_data?.totalAmount || 0;
    const totalAmount = Number(subtotal) + Number(newCost);
    const prevStatus = order.order_data?.status || 'pending_review';
    const auditLogs = order.order_data?.auditLogs || [];
    
    const newLog = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      previous_status: prevStatus,
      next_status: prevStatus,
      created_at: new Date().toISOString(),
      actor_name: 'Admin',
      actor_email: 'admin@intanium.com',
      note: `Ongkos kirim disesuaikan dari Rp ${order.order_data?.shipping_cost || 0} menjadi Rp ${newCost}`
    };
    
    const updatedOrderData = {
      ...order.order_data,
      shipping_cost: Number(newCost),
      totalAmount: totalAmount,
      updated_at: new Date().toISOString(),
      auditLogs: [...auditLogs, newLog]
    };
    
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ order_data: updatedOrderData })
      .eq('id', orderId)
      .select()
      .single();
      
    if (updateErr) throw new Error(updateErr.message);
    
    return {
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
  },

  getPaymentSettings: async () => {
    const { data, error } = await supabase
      .from('merchandise')
      .select('*')
      .eq('id', 'payment_settings')
      .maybeSingle();

    if (error) {
      console.error('Error fetching payment settings:', error);
      return null;
    }

    if (!data) {
      return {
        id: 'payment_settings',
        bank_name: 'BANK JAGO',
        account_number: '107287946603',
        account_holder: 'Muhammad Fauzan Casimira',
        qris_url: ''
      };
    }

    let parsedDesc = {};
    try {
      parsedDesc = JSON.parse(data.description || '{}');
    } catch (e) {
      console.error('Error parsing settings description:', e);
    }

    return {
      id: 'payment_settings',
      bank_name: data.name,
      account_number: parsedDesc.account_number || '',
      account_holder: parsedDesc.account_holder || '',
      qris_url: data.image_url || ''
    };
  },

  updatePaymentSettings: async (settings) => {
    const payload = {
      id: 'payment_settings',
      name: settings.bank_name,
      price: 0,
      category: 'Settings',
      image_url: settings.qris_url || '',
      description: JSON.stringify({
        account_number: settings.account_number,
        account_holder: settings.account_holder
      }),
      is_available: false,
      sizes: []
    };

    const { data, error } = await supabase
      .from('merchandise')
      .upsert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error updating payment settings:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
};

