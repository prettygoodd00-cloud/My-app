import React, { useState, useEffect } from 'react';
import { X, Package, User as UserIcon, Heart, LogOut, Check, ExternalLink, Clock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, Product } from '../types';
import { formatPrice, formatDate, getOrderStatusInfo } from '../utils/formatters';

interface UserCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOpenProductDetail: (p: Product) => void;
}

export const UserCabinetModal: React.FC<UserCabinetModalProps> = ({
  isOpen,
  onClose,
  products,
  onOpenProductDetail,
}) => {
  const { user, token, logout, updateProfile } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setAddress(user.address || '');
    }
  }, [user]);

  // Fetch orders
  useEffect(() => {
    if (!isOpen || !token) return;

    async function loadOrders() {
      setIsLoadingOrders(true);
      try {
        const res = await fetch('/api/orders/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    loadOrders();
  }, [isOpen, token]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const ok = await updateProfile({ name, email, phone, address });
    setIsUpdatingProfile(false);
    if (ok) {
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    }
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-3xl rounded-sm shadow-2xl border border-[#E3DFD5] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E8E6E0] bg-[#FAF9F6] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#807C73] font-medium block">
              Клиентский клуб VELORA
            </span>
            <h2 className="font-serif text-2xl text-[#111111] font-medium">
              Личный кабинет: {user.name}
            </h2>
            <p className="text-xs text-[#706C64] mt-0.5">Логин: @{user.username}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#736F66] hover:text-black rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAE6DC] px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 text-xs uppercase tracking-widest font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                : 'text-[#807C73] hover:text-black'
            }`}
          >
            <Package size={16} />
            <span>Мои заказы ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 text-xs uppercase tracking-widest font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                : 'text-[#807C73] hover:text-black'
            }`}
          >
            <UserIcon size={16} />
            <span>Профиль &amp; Адрес</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3.5 text-xs uppercase tracking-widest font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                : 'text-[#807C73] hover:text-black'
            }`}
          >
            <Heart size={16} />
            <span>Избранное ({wishlistProducts.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {isLoadingOrders ? (
                <div className="py-12 text-center text-xs text-[#807C73]">
                  Загрузка истории заказов...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-14 text-center">
                  <Package size={36} className="mx-auto text-[#AAA59C] mb-3" strokeWidth={1.5} />
                  <h4 className="font-serif text-lg text-[#1C1C1A] mb-1">
                    У вас пока нет оформленных заказов
                  </h4>
                  <p className="text-xs text-[#807C73] max-w-sm mx-auto mb-4 font-light">
                    Все ваши будущие покупки с курьерской примеркой и индивидуальным сервисом будут отображаться здесь.
                  </p>
                </div>
              ) : (
                orders.map((ord) => {
                  const statusInfo = getOrderStatusInfo(ord.status);
                  return (
                    <div
                      key={ord.id}
                      className="border border-[#E5E2DC] rounded-xs p-5 bg-[#FAF9F6] space-y-4 hover:border-[#CDC8BD] transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DC] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-base font-semibold text-[#1C1C1A]">
                              № {ord.id}
                            </span>
                            <span
                              className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#807C73] block mt-0.5">
                            {formatDate(ord.createdAt)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-[#807C73] block">Сумма заказа:</span>
                          <span className="font-medium text-base text-[#111111]">
                            {formatPrice(ord.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt=""
                                className="w-12 h-14 object-cover rounded-xs border border-[#E3DFD5]"
                              />
                              <div>
                                <p className="font-medium text-[#1C1C1A]">{item.title}</p>
                                <span className="text-[11px] text-[#7A766F]">
                                  Размер: {item.size} · Цвет: {item.color} · {item.quantity} шт.
                                </span>
                              </div>
                            </div>
                            <span className="font-medium text-[#111111]">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer: Tracking & Details */}
                      <div className="pt-3 border-t border-[#EAE6DC] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6E6A62]">
                        <div>
                          <span>Доставка: </span>
                          <strong className="text-[#1C1C1A]">
                            {ord.customer.deliveryMethod === 'courier'
                              ? 'Курьер VELORA'
                              : ord.customer.deliveryMethod === 'boutique'
                              ? 'Бутик'
                              : 'Экспресс'}
                          </strong>
                          {ord.trackingNumber && (
                            <span className="ml-2 font-mono">({ord.trackingNumber})</span>
                          )}
                        </div>
                        <span className="text-[#807C73]">
                          Адрес: {ord.customer.city}, {ord.customer.address}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg mx-auto py-2">
              {saveToast && (
                <div className="p-3 bg-[#EEF7ED] border border-[#C5E1C3] text-[#2E7D32] text-xs rounded-xs flex items-center gap-2">
                  <Check size={16} />
                  <span>Данные профиля успешно сохранены</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Имя и Фамилия
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Электронная почта
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Основной адрес доставки
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Город, улица, дом, квартира"
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-3 bg-[#1C1C1A] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-xs disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div className="py-14 text-center">
                  <Heart size={36} className="mx-auto text-[#AAA59C] mb-3" strokeWidth={1.5} />
                  <h4 className="font-serif text-lg text-[#1C1C1A] mb-1">
                    Список избранного пуст
                  </h4>
                  <p className="text-xs text-[#807C73] max-w-sm mx-auto mb-4 font-light">
                    Добавляйте понравившиеся модели, чтобы вернуться к ним позже.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="border border-[#E5E2DC] rounded-xs p-3 flex gap-3 bg-[#FAF9F6] items-center justify-between"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          onOpenProductDetail(p);
                        }}
                        className="flex items-center gap-3 cursor-pointer group flex-1"
                      >
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-14 h-18 object-cover rounded-xs border border-[#DDD9D2]"
                        />
                        <div>
                          <h5 className="font-serif text-xs font-medium text-[#1C1C1A] line-clamp-1 group-hover:text-[#7A6B53]">
                            {p.title}
                          </h5>
                          <span className="text-xs font-semibold text-[#1C1C1A] block mt-0.5">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            addToCart(p, p.sizes[0] || 'S', p.colors[0]?.name || 'Стандарт', 1);
                          }}
                          className="px-2.5 py-1.5 bg-[#1C1C1A] text-white text-[10px] uppercase tracking-wider font-medium hover:bg-black rounded-xs"
                        >
                          В корзину
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="text-[10px] text-[#8C2D19] hover:underline text-center"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-[#E8E6E0] bg-[#FAF9F6] flex justify-between items-center text-xs">
          <span className="text-[#807C73]">
            Аккаунт зарегистрирован: {formatDate(user.createdAt)}
          </span>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-[#8C2D19] hover:text-black transition-colors font-medium uppercase tracking-wider text-[11px]"
          >
            <LogOut size={14} />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>
  );
};
