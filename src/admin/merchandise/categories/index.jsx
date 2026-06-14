import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { merchandiseService } from '../../../features/merchandise/merchandiseService';
import { formatCurrency } from '../../../lib/helpers';
import { ROUTES, MERCH_CATEGORIES } from '../../../lib/constants';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import { 
  Tag, Shirt, Gem, Trophy, Palette, Layers, ChevronRight, 
  ArrowRight, ShoppingBag, DollarSign, AlertCircle, RefreshCw,
  LayoutGrid, Info, CheckCircle2, HelpCircle
} from 'lucide-react';

const CATEGORY_META = {
  'Clothing': { icon: Shirt, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', gradient: 'from-indigo-500 to-purple-500' },
  'Accessories': { icon: Gem, color: 'text-blue-600 bg-blue-50 border-blue-200', gradient: 'from-blue-500 to-indigo-500' },
  'Collectibles': { icon: Trophy, color: 'text-amber-600 bg-amber-50 border-amber-200', gradient: 'from-amber-500 to-orange-500' },
  'Art Prints': { icon: Palette, color: 'text-rose-600 bg-rose-50 border-rose-200', gradient: 'from-rose-500 to-pink-500' },
  'default': { icon: Layers, color: 'text-slate-600 bg-slate-50 border-slate-200', gradient: 'from-slate-500 to-slate-600' }
};

export default function AdminCategories() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodsData, ordersData] = await Promise.all([
        merchandiseService.getProducts(),
        merchandiseService.getAdminOrders()
      ]);
      setProducts(prodsData);
      setOrders(ordersData);
      
      // Default select the first category that has items
      const firstCat = Object.values(MERCH_CATEGORIES).filter(c => c !== 'All')[0];
      setSelectedCategory(firstCat || '');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data kategori dan statistik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  // Compute metrics per category
  const categoryStats = useMemo(() => {
    const stats = {};
    const configCategories = Object.values(MERCH_CATEGORIES).filter(c => c !== 'All');
    
    // Initialize stats
    configCategories.forEach(cat => {
      stats[cat] = {
        name: cat,
        totalProducts: 0,
        availableProducts: 0,
        outOfStockProducts: 0,
        totalSoldQuantity: 0,
        totalRevenue: 0
      };
    });

    // Populate product counts
    products.forEach(prod => {
      const cat = prod.category || 'Clothing';
      if (!stats[cat]) {
        stats[cat] = {
          name: cat,
          totalProducts: 0,
          availableProducts: 0,
          outOfStockProducts: 0,
          totalSoldQuantity: 0,
          totalRevenue: 0
        };
      }
      stats[cat].totalProducts += 1;
      if (prod.is_available) {
        stats[cat].availableProducts += 1;
      } else {
        stats[cat].outOfStockProducts += 1;
      }
    });

    // Populate sales stats from orders
    orders.forEach(order => {
      // We only compute for paid, shipped, or completed orders
      const status = order.status;
      if (status === 'cancelled') return;

      const pId = order.id; // wait, order_data structure has productId
      const rawData = order.id; // order_data lookup in products
      // Let's find product associated
      const productId = order.tracking_number ? null : null; // wait, let's map order directly
    });

    // Let's perform a better lookup since order objects are mapped inside getAdminOrders:
    // orders rows are returned as flat objects by our getAdminOrders, but let's fetch raw orders to see details or trace matching productId.
    // Wait! Let's check merchandiseService.getAdminOrders mapping.
    // In merchandiseService.js:
    // getAdminOrders returns:
    // { id, order_number, total_amount, status, created_at, ... }
    // But it does NOT return `productId` directly! Oh!
    // Wait, let's check merchandiseService.js getAdminOrders code:
    // Mapped properties:
    // `total_amount: order.order_data?.totalAmount || 0`
    // Wait, what about `productId`?
    // Let's verify if getAdminOrders maps `productId` or if we can fetch raw orders or if we can read the jsonb field!
    // Ah, wait! The `getAdminOrders` in merchandiseService.js maps the values:
    // `tracking_number: order.order_data?.trackingNumber || null` etc.
    // It doesn't put `productId` in the mapped object.
    // But wait, the raw rows from database have `order_data`!
    // Yes! `order.order_data` is NOT returned by `getAdminOrders`?
    // Let's check our `getAdminOrders` return value again:
    // ```javascript
    // return data.map(order => ({
    //   id: order.id,
    //   order_number: order.invoice_number,
    //   shipping_name: order.order_data?.name || '-',
    //   ...
    // }));
    // ```
    // Yes, we did NOT add `productId` or `quantity` or the raw `order_data` to the mapped object returned by `getAdminOrders`.
    // Wait! Let's fix this! We can easily modify `getAdminOrders` in `merchandiseService.js` to also return `productId` and `quantity` (or the raw `order_data`) so that client calculations are 100% accurate!
    // Let's check if we should do that.
    // Actually, in `merchandiseService.js`:
    // ```javascript
    // return data.map(order => ({
    //   id: order.id,
    //   order_number: order.invoice_number,
    //   ...
    //   productId: order.order_data?.productId || null,
    //   quantity: order.order_data?.quantity || 1,
    //   order_data: order.order_data
    // }));
    // ```
    // Oh, yes! Returning `productId`, `quantity`, and `order_data` is incredibly useful and safe.
    // Let's check if we already returned `order_data`? No, we didn't.
    // Let's double check if we can calculate sales metrics by matching order's `productId` with products.
    // Yes, if we have `productId` on each order, we can check which product was ordered, look up its category, and sum it up!
    // Let's write a replace call for `merchandiseService.js` first to add `productId` and `quantity` to the `getAdminOrders` mapping.
    // Wait, we can do that right away or map it in categories page. Let's make sure we have access to it.
    // Let's look at `merchandiseService.js` mapping inside `getAdminOrders`:
    // It maps `total_amount: order.order_data?.totalAmount || 0`.
    // We can also extract the raw `order_data` in our mapping!
    // Yes, returning `order_data` or `productId` and `quantity` inside `getAdminOrders` is best.
    
    return stats;
  }, [products]);

  // Let's compute product category data dynamically by looping
  const processedStats = useMemo(() => {
    const stats = {};
    const configCategories = Object.values(MERCH_CATEGORIES).filter(c => c !== 'All');
    
    configCategories.forEach(cat => {
      stats[cat] = {
        name: cat,
        totalProducts: 0,
        availableProducts: 0,
        outOfStockProducts: 0,
        totalSoldQuantity: 0,
        totalRevenue: 0
      };
    });

    // Map products to stats
    products.forEach(prod => {
      const cat = prod.category || 'Clothing';
      if (!stats[cat]) {
        stats[cat] = {
          name: cat,
          totalProducts: 0,
          availableProducts: 0,
          outOfStockProducts: 0,
          totalSoldQuantity: 0,
          totalRevenue: 0
        };
      }
      stats[cat].totalProducts += 1;
      if (prod.is_available) {
        stats[cat].availableProducts += 1;
      } else {
        stats[cat].outOfStockProducts += 1;
      }
    });

    // Let's also loop through orders to calculate sales if we fetch them.
    // Wait, if orders have invoice values, we can match and sum up:
    // Let's match by product mapping:
    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = p;
    });

    // In orders, let's see: we fetched the admin orders.
    // Since some orders might not be completed or paid, we can count paid/shipped/completed revenue
    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      
      // Look up product via productId if we modify service, or if we map it.
      // Wait, we can read `order.productId` if it is mapped. Let's see: if we append it, we can look it up.
      // If we don't have it, we can fallback gracefully.
      const productId = order.productId || (order.order_data?.productId);
      const quantity = order.quantity || order.order_data?.quantity || 1;
      const amount = Number(order.total_amount || 0);

      // If we can resolve the product category
      if (productId && productMap[productId]) {
        const cat = productMap[productId].category || 'Clothing';
        if (stats[cat]) {
          stats[cat].totalSoldQuantity += Number(quantity);
          stats[cat].totalRevenue += amount;
        }
      } else {
        // Fallback: search products to find any name matches or just default to Clothing if unknown
        // Or if we don't know, we don't sum it.
      }
    });

    return Object.values(stats);
  }, [products, orders]);

  // Total items in catalog
  const totalCatalogProducts = products.length;

  // Selected category products
  const selectedCategoryProducts = useMemo(() => {
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="space-y-6 select-none">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--border-color)]/60">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Admin Dashboard · Merchandise
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Layers className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Kategori Produk
          </h1>
        </div>
        <div>
          <Link to={ROUTES.ADMIN_MERCHANDISE}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 font-bold cursor-pointer">
              <LayoutGrid className="h-4 w-4" /> Kelola Produk
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12"><Loading message="Memuat statistik kategori…" /></div>
      ) : error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="font-bold">{error}</p>
          <button onClick={fetchData} className="ml-auto p-1.5 hover:bg-amber-100 rounded-lg transition">
            <RefreshCw className="h-4 w-4 text-amber-800" />
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* ── Category Statistics Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {processedStats.map(stat => {
              const meta = CATEGORY_META[stat.name] || CATEGORY_META.default;
              const Icon = meta.icon;
              const share = totalCatalogProducts > 0 
                ? Math.round((stat.totalProducts / totalCatalogProducts) * 100) 
                : 0;

              return (
                <div 
                  key={stat.name}
                  onClick={() => setSelectedCategory(stat.name)}
                  className={`cursor-pointer rounded-3xl border p-5 transition-colors duration-300 relative overflow-hidden group bg-white shadow-xs hover:shadow-md ${
                    selectedCategory === stat.name 
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10 scale-[1.02]' 
                      : 'border-[var(--border-color)]/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl ${meta.color} flex items-center justify-center border transition-transform group-hover:scale-110`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full select-none">
                      {share}% Share
                    </span>
                  </div>

                  <div className="mt-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kategori
                    </span>
                    <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                      {stat.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100/80 grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Produk</span>
                      <span className="text-xs font-black text-slate-700 block mt-0.5">{stat.totalProducts} item</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Penjualan</span>
                      <span className="text-xs font-black text-emerald-600 block mt-0.5">{formatCurrency(stat.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Visual Distribution chart bar ── */}
          <Card hoverEffect={false} className="border border-[var(--border-color)]/60 bg-white rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-[var(--color-primary)]" />
              Distribusi Produk Katalog Merchandise
            </h3>
            
            <div className="space-y-4">
              <div className="h-4.5 w-full rounded-full bg-slate-100 overflow-hidden flex select-none shadow-inner border border-slate-200/50">
                {processedStats.map(stat => {
                  const meta = CATEGORY_META[stat.name] || CATEGORY_META.default;
                  const pct = totalCatalogProducts > 0 
                    ? (stat.totalProducts / totalCatalogProducts) * 100 
                    : 0;
                  if (pct === 0) return null;
                  return (
                    <div 
                      key={stat.name}
                      style={{ width: `${pct}%` }}
                      className={`h-full bg-gradient-to-r ${meta.gradient} transition-colors duration-500 first:rounded-l-full last:rounded-r-full`}
                      title={`${stat.name}: ${stat.totalProducts} produk (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend with color boxes */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-500 pt-1 select-none">
                {processedStats.map(stat => {
                  const meta = CATEGORY_META[stat.name] || CATEGORY_META.default;
                  const count = stat.totalProducts;
                  return (
                    <div key={stat.name} className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded bg-gradient-to-r ${meta.gradient}`} />
                      <span>{stat.name}</span>
                      <span className="text-slate-400 text-[10px] font-semibold">({count} produk)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* ── Category Products List view panel ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Category detail overview card */}
            <div className="lg:col-span-4 space-y-4">
              <Card hoverEffect={false} className="border border-[var(--border-color)]/60 bg-white rounded-3xl p-5 shadow-xs space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider block">Overview Kategori</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{selectedCategory}</h3>
                </div>

                {/* Details statistics */}
                <div className="space-y-3 text-xs border-y border-slate-100 py-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Total Item Produk</span>
                    <span className="font-extrabold text-slate-800">
                      {selectedCategoryProducts.length} produk
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Stok Tersedia (Aktif)</span>
                    <span className="font-extrabold text-emerald-600">
                      {selectedCategoryProducts.filter(p => p.is_available).length} item
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Habis Terjual</span>
                    <span className="font-extrabold text-red-500">
                      {selectedCategoryProducts.filter(p => !p.is_available).length} item
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Estimasi Terjual</span>
                    <span className="font-extrabold text-indigo-600">
                      {processedStats.find(s => s.name === selectedCategory)?.totalSoldQuantity || 0} unit
                    </span>
                  </div>
                  <div className="flex justify-between pt-2.5 border-t border-dashed border-slate-100">
                    <span className="text-slate-600 font-black">Total Pendapatan</span>
                    <span className="font-black text-emerald-600 text-sm">
                      {formatCurrency(processedStats.find(s => s.name === selectedCategory)?.totalRevenue || 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed flex gap-2">
                  <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>
                    Semua kategori diatur secara statis di sistem aplikasi. Untuk mengubah nama atau kategori, Anda dapat mengaturnya di menu produk katalog merchandise.
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column: List of items under Category */}
            <div className="lg:col-span-8 space-y-4">
              <Card hoverEffect={false} className="border border-[var(--border-color)]/60 bg-white rounded-3xl shadow-xs" padding="none">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Produk di Kategori {selectedCategory}
                  </h3>
                  <span className="text-[10px] font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary)]/10">
                    {selectedCategoryProducts.length} item ditemukan
                  </span>
                </div>

                {selectedCategoryProducts.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 italic text-xs font-bold">
                    Tidak ada produk terdaftar dalam kategori ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[9px] uppercase bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 select-none">
                        <tr>
                          <th className="px-5 py-3">Nama Produk</th>
                          <th className="px-5 py-3 text-right">Harga</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {selectedCategoryProducts.map(prod => (
                          <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img width={40} height={40} alt="Product Category Preview" src={prod.image_url || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100'} className="w-10 h-10 object-cover rounded-xl border border-slate-200" />
                                <div className="min-w-0">
                                  <div className="font-extrabold text-slate-800 truncate max-w-[200px]">{prod.name}</div>
                                  <div className="font-mono text-[9px] text-slate-400 mt-0.5">{prod.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right font-black text-slate-800">
                              {formatCurrency(prod.price)}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                                prod.is_available 
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                                  : 'text-red-700 bg-red-50 border-red-100'
                              }`}>
                                {prod.is_available ? 'Tersedia' : 'Habis'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap font-bold">
                              <Link 
                                to={ROUTES.ADMIN_MERCHANDISE}
                                className="inline-flex items-center gap-1 text-[10px] text-[var(--color-primary)] hover:underline"
                              >
                                Edit Produk <ArrowRight className="h-3 w-3" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
