import { supabase } from '../../lib/supabaseClient';

export const merchandiseService = {
  getProducts: async (category = 'All', search = '') => {
    let query = supabase.from('merchandise').select('*');
    
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
    const { data, error } = await supabase
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

  createProduct: async (productData) => {
    const id = productData.id || `merch-${Math.floor(1000 + Math.random() * 9000)}`;
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
  }
};

