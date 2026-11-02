import React, { useState, useEffect } from 'react';
import {
  Shield,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  Lock,
  Eye,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, User, AdminStats } from '../types';
import { formatPrice, formatDate, getOrderStatusInfo } from '../utils/formatters';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onProductUpdated,
}) => {
  const { user, token, isAdmin, login, logout } = useAuth();

  // Admin login form states (if not logged in)
  const [adminLoginInput, setAdminLoginInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'users'>('products');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Product modal (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Верхняя одежда',
    price: '',
    oldPrice: '',
    description: '',
    composition: '',
    care: '',
    imagesStr: '',
    sizesStr: 'XS, S, M, L',
    colorsStr: 'Черный:#111111, Песочный:#C19A6B',
    stock: '10',
    isFeatured: true,
    isNew: true,
  });

  // Selected Order for detail view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  // Fetch admin data
  const fetchData = async () => {
    if (!token || !isAdmin) return;
    setIsLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }

      // 2. Fetch Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(d.products || []);
      }

      // 3. Fetch Orders
      const ordRes = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }

      // 4. Fetch Users
      const usrRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usrRes.ok) {
        const d = await usrRes.json();
        setUsers(d.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchData();
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  // Handle Admin Login submission
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const result = await login(adminLoginInput, adminPasswordInput);
    setIsLoggingIn(false);

    if (!result.success) {
      setLoginError(result.error || 'Неверный логин или пароль администратора');
    } else if (!result.isAdmin) {
      setLoginError('Указанная учетная запись не обладает правами администратора');
    } else {
      showToast('Успешный вход в защищенную панель');
      fetchData();
    }
  };

  // Open Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      category: 'Верхняя одежда',
      price: '',
      oldPrice: '',
      description: '',
      composition: '100% натуральный кашемир / шелк',
      care: 'Деликатная химчистка',
      imagesStr: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
      sizesStr: 'XS, S, M, L',
      colorsStr: 'Черный:#111111, Песочный:#C19A6B',
      stock: '10',
      isFeatured: true,
      isNew: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      category: p.category,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : '',
      description: p.description,
      composition: p.composition,
      care: p.care,
      imagesStr: p.images.join('\n'),
      sizesStr: p.sizes.join(', '),
      colorsStr: p.colors.map((c) => `${c.name}:${c.hex}`).join(', '),
      stock: String(p.stock),
      isFeatured: p.isFeatured,
      isNew: p.isNew,
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const images = productForm.imagesStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const sizes = productForm.sizesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colors = productForm.colorsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [name, hex] = pair.split(':');
        return { name: name?.trim() || 'Стандарт', hex: hex?.trim() || '#111111' };
      });

    const payload = {
      title: productForm.title.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : undefined,
      description: productForm.description.trim(),
      composition: productForm.composition.trim(),
      care: productForm.care.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85'],
      sizes: sizes.length > 0 ? sizes : ['S', 'M'],
      colors: colors.length > 0 ? colors : [{ name: 'Черный', hex: '#111111' }],
      stock: Number(productForm.stock) || 1,
      isFeatured: productForm.isFeatured,
      isNew: productForm.isNew,
    };

    try {
      if (editingProduct) {
        // Update
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Ошибка обновления товара');
        showToast('Товар успешно обновлен в базе данных');
      } else {
        // Create
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Ошибка создания товара');
        showToast('Товар успешно добавлен в каталог');
      }

      setIsProductModalOpen(false);
      fetchData();
      onProductUpdated();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить товар "${title}"?`)) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Товар удален из базы данных');
        fetchData();
        onProductUpdated();
      }
    } catch (err) {
      alert('Ошибка при удалении товара');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Статус заказа № ${orderId} обновлен на "${newStatus}"`);
        fetchData();
      }
    } catch {
      alert('Ошибка обновления статуса заказа');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Удалить учетную запись клиента @${username}?`)) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast(`Пользователь @${username} удален`);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Не удалось удалить пользователя');
      }
    } catch {
      alert('Ошибка при удалении');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-6xl rounded-sm shadow-2xl border border-[#D9D6CE] overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Notification Toast */}
        {actionToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1A] text-white text-xs px-4 py-2 rounded-xs shadow-lg flex items-center gap-2 animate-fadeIn border border-[#D4AF37]/50 font-medium">
            <Check size={14} className="text-[#D4AF37]" />
            <span>{actionToast}</span>
          </div>
        )}

        {/* IF NOT LOGGED IN AS ADMIN: SHOW SECURE LOGIN */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#1C1C1A] text-[#D4AF37] flex items-center justify-center mx-auto mb-4 shadow-md">
              <Shield size={32} />
            </div>

            <h2 className="font-serif text-3xl text-[#111111] font-medium mb-1">
              VELORA Console
            </h2>
            <p className="text-xs uppercase tracking-[0.2em] text-[#807C73] mb-6">
              Вход в защищенную панель администратора
            </p>

            {loginError && (
              <div className="mb-4 p-3 bg-[#FDF2F0] border border-[#F3C5BC] text-[#8C2D19] text-xs rounded-xs text-left">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Логин администратора
                </label>
                <input
                  type="text"
                  required
                  value={adminLoginInput}
                  onChange={(e) => setAdminLoginInput(e.target.value)}
                  placeholder="Логин"
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Пароль доступа
                </label>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors rounded-xs disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? 'Проверка прав доступа...' : 'Войти в панель'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 border border-[#DDD9D2] text-[#6E6A62] text-xs uppercase tracking-wider hover:text-black transition-colors rounded-xs"
              >
                Вернуться на сайт
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN ADMIN DASHBOARD */
          <>
            {/* Admin Header */}
            <div className="p-5 sm:p-6 bg-[#161614] text-[#FAF9F6] border-b border-[#2C2C28] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#282824] flex items-center justify-center text-[#D4AF37] border border-[#3E3E38]">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-white tracking-wide">
                      VELORA Control Panel
                    </h2>
                    <span className="text-[10px] tracking-wider uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-xs font-semibold">
                      Admin: @{user?.username}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A6A298] tracking-wider">
                    Управление базой данных, каталогом, заказами и клиентами
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  className="p-2 bg-[#282824] hover:bg-[#383832] text-[#D4AF37] rounded-xs border border-[#3E3E38] transition-colors"
                  title="Обновить данные"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider font-medium rounded-xs transition-colors"
                >
                  В магазин
                </button>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="p-2 bg-[#381E19] hover:bg-[#522922] text-[#FF8573] rounded-xs transition-colors"
                  title="Выйти"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Metrics Overview Bar */}
            {stats && (
              <div className="bg-[#FAF9F6] border-b border-[#E8E6E0] grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#E8E6E0]">
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#807C73] block mb-1">
                    Общая выручка
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1C1A]">
                    {formatPrice(stats.totalRevenue)}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#807C73] block mb-1">
                    Всего заказов
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1C1A]">
                      {stats.totalOrders}
                    </span>
                    <span className="text-[11px] text-[#8C2D19] font-medium">
                      ({stats.pendingOrders} активных)
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#807C73] block mb-1">
                    Товары в каталоге
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1C1A]">
                    {stats.totalProducts} позиций
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#807C73] block mb-1">
                    Клиентская база
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1C1A]">
                    {stats.totalUsers} клиентов
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#E8E6E0] px-6 bg-white gap-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3.5 text-xs uppercase tracking-widest font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'products'
                    ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                    : 'text-[#807C73] hover:text-black'
                }`}
              >
                <ShoppingBag size={16} />
                <span>Товары ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3.5 text-xs uppercase tracking-widest font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                    : 'text-[#807C73] hover:text-black'
                }`}
              >
                <Package size={16} />
                <span>Заказы ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`py-3.5 text-xs uppercase tracking-widest font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'users'
                    ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                    : 'text-[#807C73] hover:text-black'
                }`}
              >
                <Users size={16} />
                <span>Клиенты ({users.length})</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F6]">
              {/* TAB 1: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search size={16} className="absolute left-3 top-3 text-[#99968F]" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Поиск по названию или категории..."
                        className="w-full bg-white border border-[#DDD9D2] pl-9 pr-3 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                      />
                    </div>

                    <button
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors rounded-xs flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={15} />
                      <span>Добавить новый товар</span>
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white border border-[#E5E2DC] rounded-xs overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#F2EFE9] border-b border-[#E0DDD5] text-[#706C64] uppercase tracking-wider text-[10px]">
                            <th className="p-3">Фото</th>
                            <th className="p-3">Название</th>
                            <th className="p-3">Категория</th>
                            <th className="p-3">Цена</th>
                            <th className="p-3">Склад</th>
                            <th className="p-3">Размеры</th>
                            <th className="p-3 text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFECE5]">
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors">
                              <td className="p-3">
                                <img
                                  src={p.images[0]}
                                  alt=""
                                  className="w-12 h-16 object-cover rounded-xs border border-[#E3DFD5]"
                                />
                              </td>
                              <td className="p-3">
                                <span className="font-medium text-[#1C1C1A] block leading-tight">
                                  {p.title}
                                </span>
                                <span className="text-[10px] text-[#8C887E]">Арт: {p.id}</span>
                              </td>
                              <td className="p-3 text-[#54524D]">{p.category}</td>
                              <td className="p-3">
                                <span className="font-semibold text-[#1C1C1A]">
                                  {formatPrice(p.price)}
                                </span>
                                {p.oldPrice && (
                                  <span className="text-[10px] text-[#99968F] line-through block">
                                    {formatPrice(p.oldPrice)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`font-medium ${
                                    p.stock <= 3 ? 'text-[#8C2D19]' : 'text-[#3E7B44]'
                                  }`}
                                >
                                  {p.stock} шт.
                                </span>
                              </td>
                              <td className="p-3 text-[#6E6A62]">
                                {p.sizes.join(', ')}
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 text-[#54524D] hover:text-black bg-[#F5F4F0] hover:bg-[#EAE8E2] rounded-xs transition-colors inline-block"
                                  title="Редактировать"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.title)}
                                  className="p-1.5 text-[#8C2D19] hover:text-red-700 bg-[#FDF2F0] hover:bg-[#FCE3DF] rounded-xs transition-colors inline-block"
                                  title="Удалить"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Status filter tabs */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xs uppercase tracking-wider text-[11px] font-medium border transition-colors ${
                          orderStatusFilter === st
                            ? 'bg-[#1C1C1A] text-white border-[#1C1C1A]'
                            : 'bg-white text-[#6E6A62] border-[#DDD9D2] hover:border-black'
                        }`}
                      >
                        {st === 'all' ? 'Все заказы' : getOrderStatusInfo(st).label}
                      </button>
                    ))}
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white border border-[#E5E2DC] rounded-xs overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#F2EFE9] border-b border-[#E0DDD5] text-[#706C64] uppercase tracking-wider text-[10px]">
                            <th className="p-3">Заказ №</th>
                            <th className="p-3">Дата</th>
                            <th className="p-3">Клиент</th>
                            <th className="p-3">Состав</th>
                            <th className="p-3">Сумма</th>
                            <th className="p-3">Статус заказа</th>
                            <th className="p-3 text-right">Детали</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFECE5]">
                          {filteredOrders.map((ord) => {
                            const stInfo = getOrderStatusInfo(ord.status);
                            return (
                              <tr key={ord.id} className="hover:bg-[#FAF9F6] transition-colors">
                                <td className="p-3 font-semibold text-[#1C1C1A]">
                                  {ord.id}
                                </td>
                                <td className="p-3 text-[#706C64]">
                                  {formatDate(ord.createdAt)}
                                </td>
                                <td className="p-3">
                                  <strong className="text-[#1C1C1A] block">
                                    {ord.customer.name}
                                  </strong>
                                  <span className="text-[11px] text-[#706C64]">
                                    {ord.customer.phone} · {ord.customer.city}
                                  </span>
                                </td>
                                <td className="p-3 text-[#54524D]">
                                  {ord.items.length} поз. ({ord.items.reduce((s, i) => s + i.quantity, 0)} шт)
                                </td>
                                <td className="p-3 font-semibold text-[#1C1C1A]">
                                  {formatPrice(ord.totalAmount)}
                                </td>
                                <td className="p-3">
                                  <select
                                    value={ord.status}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])
                                    }
                                    className={`text-[11px] font-medium px-2 py-1 rounded-xs border focus:outline-none cursor-pointer ${stInfo.bg} ${stInfo.text} ${stInfo.border}`}
                                  >
                                    <option value="pending">Ожидает</option>
                                    <option value="processing">В обработке</option>
                                    <option value="shipped">Передан курьеру</option>
                                    <option value="delivered">Доставлен</option>
                                    <option value="cancelled">Отменен</option>
                                  </select>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => setSelectedOrder(ord)}
                                    className="px-2.5 py-1 bg-[#F5F4F0] hover:bg-[#1C1C1A] hover:text-white text-[#2C2C2A] text-[11px] uppercase tracking-wider rounded-xs transition-colors"
                                  >
                                    Просмотр
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: USERS */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E5E2DC] rounded-xs overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#F2EFE9] border-b border-[#E0DDD5] text-[#706C64] uppercase tracking-wider text-[10px]">
                            <th className="p-3">Логин</th>
                            <th className="p-3">Имя клиента</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Телефон</th>
                            <th className="p-3">Роль</th>
                            <th className="p-3">Заказов</th>
                            <th className="p-3">Дата регистрации</th>
                            <th className="p-3 text-right">Действие</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFECE5]">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-[#FAF9F6] transition-colors">
                              <td className="p-3 font-semibold text-[#1C1C1A]">
                                @{u.username}
                              </td>
                              <td className="p-3 text-[#2C2C2A]">{u.name}</td>
                              <td className="p-3 text-[#706C64]">{u.email || '—'}</td>
                              <td className="p-3 text-[#706C64]">{u.phone || '—'}</td>
                              <td className="p-3">
                                {u.role === 'admin' ? (
                                  <span className="px-2 py-0.5 bg-[#1C1C1A] text-[#D4AF37] font-semibold text-[10px] rounded-xs">
                                    ADMIN
                                  </span>
                                ) : (
                                  <span className="text-[#706C64]">Клиент</span>
                                )}
                              </td>
                              <td className="p-3 font-medium text-[#1C1C1A]">
                                {u.ordersCount || 0}
                              </td>
                              <td className="p-3 text-[#807C73]">
                                {formatDate(u.createdAt)}
                              </td>
                              <td className="p-3 text-right">
                                {u.role !== 'admin' && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                    className="p-1 text-[#8C2D19] hover:bg-[#FDF2F0] rounded-xs transition-colors"
                                    title="Удалить аккаунт"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* PRODUCT CREATE / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded-sm max-h-[90vh] overflow-y-auto border border-[#DDD9D2] relative">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-2xl text-[#111111] mb-5 font-normal">
              {editingProduct ? 'Редактирование товара' : 'Добавить новый товар'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Название товара *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="Пальто из кашемира..."
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Категория *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  >
                    <option value="Верхняя одежда">Верхняя одежда</option>
                    <option value="Платья и костюмы">Платья и костюмы</option>
                    <option value="Трикотаж и кашемир">Трикотаж и кашемир</option>
                    <option value="Кожаные сумки">Кожаные сумки</option>
                    <option value="Аксессуары">Аксессуары</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Цена (₸) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="350000"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Старая цена (₸, скидка)
                  </label>
                  <input
                    type="number"
                    value={productForm.oldPrice}
                    onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })}
                    placeholder="420000"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Описание изделия
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Премиальное изделие ручной работы..."
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Состав ткани
                  </label>
                  <input
                    type="text"
                    value={productForm.composition}
                    onChange={(e) => setProductForm({ ...productForm, composition: e.target.value })}
                    placeholder="100% кашемир Loro Piana"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Количество на складе
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Ссылки на фотографии (по одной на строке)
                </label>
                <textarea
                  rows={2}
                  value={productForm.imagesStr}
                  onChange={(e) => setProductForm({ ...productForm, imagesStr: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Размеры (через запятую)
                  </label>
                  <input
                    type="text"
                    value={productForm.sizesStr}
                    onChange={(e) => setProductForm({ ...productForm, sizesStr: e.target.value })}
                    placeholder="XS, S, M, L"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Цвета (формат: Название:#HEX, ...)
                  </label>
                  <input
                    type="text"
                    value={productForm.colorsStr}
                    onChange={(e) => setProductForm({ ...productForm, colorsStr: e.target.value })}
                    placeholder="Черный:#111111, Camel:#C19A6B"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="accent-black"
                  />
                  <span>Выделенный товар (в подборку)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="accent-black"
                  />
                  <span>Новинка (бейдж NEW)</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1C1C1A] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-xs"
                >
                  {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 border border-[#DDD9D2] text-[#6E6A62] text-xs uppercase tracking-wider hover:text-black rounded-xs"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS POPUP */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-sm border border-[#DDD9D2] relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black"
            >
              <X size={18} />
            </button>

            <span className="text-[10px] uppercase tracking-widest text-[#706C64]">Детали заказа</span>
            <h3 className="font-serif text-2xl text-[#111111] mb-4">
              Заказ № {selectedOrder.id}
            </h3>

            <div className="space-y-3 text-xs text-[#595650] mb-5">
              <div className="flex justify-between border-b pb-1.5">
                <span>Клиент:</span>
                <strong className="text-black">{selectedOrder.customer.name}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span>Телефон:</span>
                <strong className="text-black">{selectedOrder.customer.phone}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span>Email:</span>
                <strong className="text-black">{selectedOrder.customer.email || '—'}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span>Город и адрес:</span>
                <strong className="text-black text-right max-w-xs">{selectedOrder.customer.city}, {selectedOrder.customer.address}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span>Способ доставки:</span>
                <strong className="text-black">{selectedOrder.customer.deliveryMethod}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span>Способ оплаты:</span>
                <strong className="text-black">{selectedOrder.customer.paymentMethod}</strong>
              </div>
              {selectedOrder.customer.comment && (
                <div className="border-b pb-1.5">
                  <span>Комментарий:</span>
                  <p className="text-black italic mt-0.5">{selectedOrder.customer.comment}</p>
                </div>
              )}
            </div>

            <h4 className="text-[11px] uppercase tracking-wider text-[#706C64] mb-2 font-medium">Товары в заказе:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-4 divide-y divide-gray-100">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-xs" />
                    <div>
                      <p className="font-medium text-black">{item.title}</p>
                      <span className="text-[10px] text-gray-500">{item.size} · {item.color} · {item.quantity} шт</span>
                    </div>
                  </div>
                  <span className="font-semibold text-black">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-between items-center text-sm font-semibold">
              <span>Итого:</span>
              <span className="text-base text-black">{formatPrice(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
