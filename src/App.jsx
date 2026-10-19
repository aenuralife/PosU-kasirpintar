import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';

const Icon = ({ name, className = "w-5 h-5", onClick }) => {
  const icons = {
    search: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    plus: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
    ),
    minus: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
      </svg>
    ),
    trash: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    cart: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    history: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    grid: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    edit: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    print: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    ),
    close: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    chart: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    logout: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    )
  };
  return <span onClick={onClick} className="inline-flex items-center">{icons[name] || null}</span>;
};

const INITIAL_PRODUCTS = [
  { id: '1', name: 'Kopi Espresso', category: 'Minuman', price: 18000, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Es Teh Manis', category: 'Minuman', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'Kopi Susu Aren', category: 'Minuman', price: 22000, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
  { id: '4', name: 'Nasi Goreng', category: 'Makanan', price: 25000, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('pos');
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const [showCartMobile, setShowCartMobile] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', category: 'Makanan', price: '', imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('pos_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Manajemen Sesi Otentikasi
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ambil Data dari Supabase Setelah Login
  useEffect(() => {
    if (!session) return;

    const fetchCloudData = async () => {
      try {
        const { data: pData, error: pError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (pError) throw new Error('Gagal mengambil data produk: ' + pError.message);
        if (pData) {
          const formattedProducts = pData.map(p => ({
            ...p,
            imageUrl: p.image || p.imageUrl
          }));
          setProducts(formattedProducts);
        }

        const { data: tData, error: tError } = await supabase
          .from('transactions_final')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (tError) throw new Error('Gagal mengambil data transaksi: ' + tError.message);
        if (tData) {
          const formattedTransactions = tData.map(tx => ({
            ...tx,
            grandTotal: tx.grand_total,
            paymentMethod: tx.payment_method
          }));
          setHistory(formattedTransactions);
        }
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchCloudData();
  }, [session]);

  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_history', JSON.stringify(history));
  }, [history]);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      await supabase.auth.signOut();
    }
  };

  const categories = useMemo(() => {
    return ['Semua', ...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCategory = category === 'Semua' || product.category === category;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, category, searchQuery]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const reportData = useMemo(() => {
    const now = new Date();
    const filteredTx = history.filter(tx => {
      const txDate = tx.timestamp ? new Date(tx.timestamp) : now;
      if (reportType === 'daily') {
        const isoDate = txDate.toISOString().split('T')[0];
        return isoDate === selectedDate;
      } else {
        const isoMonth = txDate.toISOString().slice(0, 7);
        return isoMonth === selectedMonth;
      }
    });

    const totalRevenue = filteredTx.reduce((sum, tx) => sum + tx.grandTotal, 0);
    const totalTransactions = filteredTx.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const itemMap = {};
    filteredTx.forEach(tx => {
      tx.items.forEach(item => {
        if (!itemMap[item.name]) itemMap[item.name] = 0;
        itemMap[item.name] += item.qty;
      });
    });

    const topItems = Object.entries(itemMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { filteredTx, totalRevenue, totalTransactions, avgTransaction, topItems };
  }, [history, reportType, selectedDate, selectedMonth]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    if (window.confirm('Yakin ingin menghapus item dari keranjang?')) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setCashGiven(grandTotal.toString());
    setShowCartMobile(false);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (e) => {
  e.preventDefault();
  
  // 1. Deklarasikan variabel cash dan change di sini
  let cash = 0;
  let change = 0;

  if (paymentMethod === 'cash') {
    cash = parseFloat(cashGiven) || 0;
    if (cash < grandTotal) {
      alert('Uang pembayaran kurang!');
      return;
    }
    change = cash - grandTotal;
  } else if (paymentMethod === 'qris') {
    cash = grandTotal;
    change = 0;
  }

  const transaction = {
    id: 'TRX-' + Date.now(),
    date: new Date().toLocaleString('id-ID'),
    timestamp: new Date().toISOString(),
    items: cart,
    subtotal,
    grand_total: grandTotal,
    payment_method: paymentMethod,
    cash,
    change,
    user_id: session?.user?.id
  };

  try {
    const { error } = await supabase
      .from('transactions_final')
      .insert([transaction]);

    if (error) {
      console.error('Gagal simpan ke Supabase:', error.message);
      alert('Gagal simpan ke Supabase: ' + error.message);
      return;
    }
  } catch (err) {
    console.error(err);
  }

  // --- UBAH BAGIAN INI ---
  // Buat objek transaksi dengan format properti yang lengkap untuk state lokal
  const newTransactionWithMapping = {
    ...transaction,
    grandTotal: transaction.grand_total,      // Agar terbaca oleh Laporan & Riwayat
    paymentMethod: transaction.payment_method // Agar terbaca dengan benar
  };

  // Update state lokal & bersihkan keranjang secara real-time
  setHistory(prev => [newTransactionWithMapping, ...prev]);
  setReceiptData(transaction);
  setShowPaymentModal(false);
  setPaymentMethod('cash');
  setCashGiven('');
  clearCart();
};

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        category: product.category || 'Makanan',
        price: product.price || '',
        imageUrl: product.imageUrl || product.image || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', category: 'Makanan', price: '', imageUrl: '' });
    }
    setSelectedFile(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    const numericPrice = parseFloat(productForm.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Masukkan harga yang valid.');
      return;
    }

    const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
    let finalImageUrl = productForm.imageUrl || fallbackImage;

    if (selectedFile) {
      try {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        alert('Gagal upload gambar ke Storage: ' + err.message);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const productPayload = {
      name: productForm.name,
      price: numericPrice,
      category: productForm.category,
      image: finalImageUrl,
      user_id: session?.user?.id
    };

    try {
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id)
          .select();

        if (error) throw error;
        if (data) {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...data[0], imageUrl: data[0].image } : p));
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select();

        if (error) throw error;
        if (data) {
          setProducts([{ ...data[0], imageUrl: data[0].image }, ...products]);
        }
      }

      setSelectedFile(null);
      setShowProductModal(false);
    } catch (err) {
      alert('Gagal menyimpan data produk: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error(err);
      }
      setProducts(products.filter(p => p.id !== id));
      setCart(cart.filter(item => item.id !== id));
    }
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Tampilan Loading
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100 text-slate-500 text-sm font-semibold">
        Memuat aplikasi...
      </div>
    );
  }

  // Tampilan Login / Register jika Belum Login
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      
      {/* Header Utama */}
      <header className="bg-indigo-700 text-white flex-none px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md z-10">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="bg-white text-indigo-700 px-2.5 py-1 rounded-lg font-black text-lg shadow">
              PosU
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Kasir Pintar</h1>
              <p className="text-[10px] text-indigo-200 truncate max-w-[150px]">{session.user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sm:hidden text-indigo-200 hover:text-white p-1"
            title="Keluar"
          >
            <Icon name="logout" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <nav className="flex w-full sm:w-auto justify-between sm:justify-end gap-1 bg-indigo-800/40 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pos' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <Icon name="grid" className="w-4 h-4" /> Kasir
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reports' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <Icon name="chart" className="w-4 h-4" /> Laporan
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <Icon name="history" className="w-4 h-4" /> Riwayat
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'management' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <Icon name="edit" className="w-4 h-4" /> Produk
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1 bg-indigo-800/60 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            title="Keluar Akun"
          >
            <Icon name="logout" className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="flex-1 overflow-hidden flex relative">
        
        {/* VIEW 1: POS KASIR */}
        {activeTab === 'pos' && (
          <div className="flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden">
            <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
              <div className="mb-3 space-y-2 flex-none">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Icon name="search" className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        category === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 pb-16 md:pb-0">
                {filteredProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                    Produk tidak ditemukan
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="w-full h-32 sm:h-36 bg-slate-50 overflow-hidden relative p-2 flex items-center justify-center">
                            <img
                              src={product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 text-[9px] font-bold text-indigo-700 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm uppercase">
                              {product.category}
                            </span>
                          </div>
                          <div className="p-2.5">
                            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                          </div>
                        </div>
                        <div className="px-2.5 pb-2.5 flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{formatIDR(product.price)}</span>
                          <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Icon name="plus" className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Keranjang */}
            <div className={`
              fixed md:static inset-0 z-40 bg-white flex flex-col transition-transform duration-300 ease-in-out
              w-full md:w-80 lg:w-96 border-l border-slate-200 shadow-xl md:shadow-none
              ${showCartMobile ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
            `}>
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <Icon name="cart" className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-slate-800 text-sm">Keranjang ({totalCartCount})</h2>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button onClick={clearCart} className="text-xs text-rose-600 font-medium">
                      Kosongkan
                    </button>
                  )}
                  <button onClick={() => setShowCartMobile(false)} className="md:hidden text-slate-400 p-1">
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                    <Icon name="cart" className="w-10 h-10 text-slate-300" />
                    <p className="text-xs">Keranjang masih kosong</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs gap-2">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                        alt={item.name}
                        className="w-10 h-10 rounded-md object-cover flex-none"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{item.name}</h4>
                        <p className="text-slate-500">{formatIDR(item.price)}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-none">
                        <button onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 rounded bg-white border flex items-center justify-center">
                          <Icon name="minus" className="w-3 h-3 text-slate-600" />
                        </button>
                        <span className="font-semibold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 rounded bg-white border flex items-center justify-center">
                          <Icon name="plus" className="w-3 h-3 text-slate-600" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-1 text-slate-400 hover:text-rose-600">
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Diskon (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-14 px-2 py-0.5 bg-white border border-slate-300 rounded text-right focus:ring-1 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon</span>
                    <span>-{formatIDR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-indigo-700">{formatIDR(grandTotal)}</span>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={handleCheckoutClick}
                  className={`w-full py-2.5 rounded-xl font-bold text-white shadow transition-all ${
                    cart.length > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Bayar Sekarang
                </button>
              </div>
            </div>

            {/* Floating Bar Mobile */}
            <div className="md:hidden fixed bottom-3 left-3 right-3 z-30">
              <button
                onClick={() => setShowCartMobile(true)}
                className="w-full bg-indigo-700 text-white p-3 rounded-2xl shadow-xl flex justify-between items-center font-semibold text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-900 text-white px-2 py-0.5 rounded-full text-xs">{totalCartCount}</span>
                  <span>Lihat Keranjang</span>
                </div>
                <span>{formatIDR(grandTotal)}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: LAPORAN PENJUALAN */}
        {activeTab === 'reports' && (
          <div className="flex-1 p-3 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setReportType('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    reportType === 'daily' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Laporan Harian
                </button>
                <button
                  onClick={() => setReportType('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    reportType === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Laporan Bulanan
                </button>
              </div>

              <div>
                {reportType === 'daily' ? (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Omzet</span>
                <div className="text-xl font-bold text-emerald-600">{formatIDR(reportData.totalRevenue)}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Jumlah Transaksi</span>
                <div className="text-xl font-bold text-indigo-600">{reportData.totalTransactions} Transaksi</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Rata-Rata Transaksi</span>
                <div className="text-xl font-bold text-slate-800">{formatIDR(reportData.avgTransaction)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-slate-800">Top Produk Terlaris</h3>
                {reportData.topItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada data penjualan pada periode ini.</p>
                ) : (
                  <div className="space-y-2">
                    {reportData.topItems.map((item, idx) => (
                      <div key={item.name} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                        <span className="font-semibold text-slate-700">{idx + 1}. {item.name}</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{item.qty} porsi</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-slate-800">Rincian Transaksi Periode Ini</h3>
                {reportData.filteredTx.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Tidak ada transaksi ditemukan.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                        <tr>
                          <th className="p-2.5">ID</th>
                          <th className="p-2.5">Waktu</th>
                          <th className="p-2.5">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.filteredTx.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono text-indigo-600 font-medium">{tx.id}</td>
                            <td className="p-2.5 text-slate-500">{tx.date}</td>
                            <td className="p-2.5 font-bold text-slate-900">{formatIDR(tx.grandTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: RIWAYAT */}
        {activeTab === 'history' && (
          <div className="flex-1 p-3 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
            <h2 className="text-lg font-bold mb-3 text-slate-800">Riwayat Transaksi</h2>

            {history.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-slate-400 border border-slate-200 text-xs">
                Belum ada transaksi.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total</th>
                      <th className="p-3 text-center">Struk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-medium text-indigo-600">{tx.id}</td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">{tx.date}</td>
                        <td className="p-3">
                          {tx.items?.map(i => `${i.name} (x${i.qty})`).join(', ')}
                        </td>
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{formatIDR(tx.grandTotal)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setReceiptData(tx)}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
                          >
                            <Icon name="print" className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: MANAJEMEN PRODUK */}
        {activeTab === 'management' && (
          <div className="flex-1 p-3 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Kelola Produk</h2>
                <p className="text-xs text-slate-500">Daftar produk kasir</p>
              </div>
              <button
                onClick={() => handleOpenProductModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Icon name="plus" className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="p-3">Produk</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.imageUrl || p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover flex-none"
                        />
                        <span className="font-semibold text-slate-800">{p.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-900">{formatIDR(p.price)}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenProductModal(p)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

{/* MODAL PEMBAYARAN */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Konfirmasi Pembayaran</h3>
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              
              {/* Total Tagihan Box */}
              <div className="p-3.5 bg-indigo-50/70 rounded-xl space-y-1 border border-indigo-100">
                <span className="text-slate-500 font-medium">Total Tagihan</span>
                <div className="text-xl font-black text-indigo-700">{formatIDR(grandTotal)}</div>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2.5 px-3 rounded-xl font-semibold border text-center transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    💵 Cash / Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`py-2.5 px-3 rounded-xl font-semibold border text-center transition-all ${
                      paymentMethod === 'qris'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📱 QRIS
                  </button>
                </div>
              </div>

              {/* Kondisional Form Berdasarkan Metode */}
              {paymentMethod === 'cash' ? (
                <div className="space-y-3">
                  <label className="block font-bold text-slate-700">Jumlah Uang Diterima</label>
                  <input
                    type="text"
                    readOnly
                    value={cashGiven ? formatIDR(parseFloat(cashGiven) || 0) : 'Rp 0'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-base text-indigo-700 text-right focus:outline-none"
                  />

                  {/* Tombol Pintasan Nominal Uang Cepat */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCashGiven(grandTotal.toString())}
                      className="py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs border border-indigo-200"
                    >
                      Uang Pas
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('20000')}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs border border-slate-200"
                    >
                      20k
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('50000')}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs border border-slate-200"
                    >
                      50k
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('100000')}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs border border-slate-200"
                    >
                      100k
                    </button>
                  </div>

                  {/* Numpad Kalkulator */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => {
                          if (digit === '⌫') {
                            setCashGiven(prev => prev.slice(0, -1));
                          } else {
                            setCashGiven(prev => prev + digit);
                          }
                        }}
                        className="py-2.5 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl font-bold text-slate-700 border border-slate-200 shadow-sm text-sm transition-all"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>

                  {/* Tombol Clear / Reset */}
                  <button
                    type="button"
                    onClick={() => setCashGiven('')}
                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-semibold text-xs border border-rose-200 transition-colors"
                  >
                    Reset Angka
                  </button>

                  {/* Informasi Kembalian */}
                  <div className="pt-1 flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-600">Kembalian:</span>
                    <span className="font-extrabold text-sm text-emerald-600">
                      {formatIDR(Math.max(0, (parseFloat(cashGiven) || 0) - grandTotal))}
                    </span>
                  </div>
                </div>
              ) : (
            
                /* Tampilan QRIS */
                <div className="py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                  <div className="w-28 h-28 bg-white mx-auto border border-slate-200 rounded-lg flex items-center justify-center shadow-inner">
                    <span className="text-[10px] text-slate-400 font-mono">QRIS CODE</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Scan QR di atas menggunakan aplikasi e-wallet atau m-banking Anda</p>
                </div>
              )}

              {/* Tombol Aksi Batal & Bayar yang Terpisah Rapi */}
              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200 transition-all active:scale-[0.98]"
                >
                  Konfirmasi & Bayar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL STRUK */}
      {receiptData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="text-center space-y-0.5">
              <h2 className="font-bold text-sm text-slate-800">KASIR CAFE</h2>
              <p className="text-[10px] text-slate-400">{receiptData.date}</p>
              <p className="text-[10px] text-slate-400">ID: {receiptData.id}</p>
            </div>

            <div className="border-b border-dashed border-slate-300"></div>

            <div className="space-y-1.5">
              {receiptData.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <div>{item.name}</div>
                    <div className="text-slate-400">{item.qty} x {formatIDR(item.price)}</div>
                  </div>
                  <div className="font-semibold">{formatIDR(item.qty * item.price)}</div>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-slate-300"></div>

            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(receiptData.subtotal)}</span>
              </div>
              {receiptData.discountAmount > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Diskon ({receiptData.discountPercent}%)</span>
                  <span>-{formatIDR(receiptData.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1">
                <span>TOTAL</span>
                <span>{formatIDR(receiptData.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bayar</span>
                <span>{formatIDR(receiptData.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali</span>
                <span>{formatIDR(receiptData.change)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-1"
              >
                <Icon name="print" className="w-3.5 h-3.5" /> Cetak
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="py-1.5 px-3 bg-slate-100 text-slate-600 rounded-lg font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA PRODUK */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-slate-800">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Kopi Latte"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kategori</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Camilan">Camilan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Gambar Produk</label>
                <div className="relative">
                  <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setSelectedFile(file);
                        setProductForm(prev => ({
                          ...prev,
                          imageUrl: URL.createObjectURL(file)
                        }));
                      }}
                    />

                    <div className="mb-2">
                      <Icon name="plus" className="w-6 h-6 text-slate-400 mx-auto" />
                    </div>

                    <p className="text-slate-500 text-xs">
                      {selectedFile ? selectedFile.name : 'Klik untuk upload gambar'}
                    </p>
                  </label>

                  {productForm.imageUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={productForm.imageUrl}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setProductForm(prev => ({
                            ...prev,
                            imageUrl: ''
                          }));
                        }}
                        className="text-xs text-rose-600 hover:underline font-medium"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {isUploading ? 'Mengunggah...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}