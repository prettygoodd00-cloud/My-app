import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Truck, Building2, CreditCard, Banknote, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatters';
import { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { user, token } = useAuth();
  const {
    items,
    subtotal,
    discountAmount,
    shippingAmount,
    totalAmount,
    promoCode,
    clearCart,
  } = useCart();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+7 ');
  const [city, setCity] = useState('Алматы');
  const [address, setAddress] = useState(user?.address || '');
  const [comment, setComment] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'boutique' | 'express'>('courier');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp' | 'cash'>('card');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || phone.trim().length < 8) {
      setError('Пожалуйста, укажите имя и контактный телефон');
      return;
    }

    if (deliveryMethod !== 'boutique' && !address.trim()) {
      setError('Пожалуйста, укажите адрес доставки');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: deliveryMethod === 'boutique' ? 'Самовывоз из бутика VELORA' : address.trim(),
          deliveryMethod,
          paymentMethod,
          comment: comment.trim(),
        },
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal,
        discount: discountAmount,
        shipping: shippingAmount,
        totalAmount,
        promoCode: promoCode || undefined,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при сохранении заказа');
      }

      setCompletedOrder(data.order);
      clearCart();
      onOrderSuccess(data.order);
    } catch (err: any) {
      setError(err.message || 'Сетевая ошибка при отправке заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-3xl rounded-sm shadow-2xl border border-[#E3DFD5] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8E6E0] bg-[#FAF9F6] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#807C73] font-medium block">
              Модный дом VELORA
            </span>
            <h2 className="font-serif text-2xl text-[#111111] font-medium">
              Оформление персонального заказа
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#736F66] hover:text-black rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8">
          {completedOrder ? (
            /* Success View */
            <div className="text-center py-8 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-[#E8F3E9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>

              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#736F66] block mb-1">
                  Благодарим за выбор VELORA
                </span>
                <h3 className="font-serif text-3xl text-[#111111] font-medium">
                  Заказ № {completedOrder.id} оформлен
                </h3>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E8E6E0] p-6 max-w-lg mx-auto text-left rounded-sm space-y-3 text-xs text-[#595650]">
                <div className="flex justify-between border-b border-[#EAE6DC] pb-2">
                  <span>Получатель:</span>
                  <strong className="text-[#1C1C1A]">{completedOrder.customer.name}</strong>
                </div>
                <div className="flex justify-between border-b border-[#EAE6DC] pb-2">
                  <span>Телефон для связи:</span>
                  <strong className="text-[#1C1C1A]">{completedOrder.customer.phone}</strong>
                </div>
                <div className="flex justify-between border-b border-[#EAE6DC] pb-2">
                  <span>Способ доставки:</span>
                  <strong className="text-[#1C1C1A]">
                    {completedOrder.customer.deliveryMethod === 'courier'
                      ? 'Курьер VELORA с примеркой (15 мин)'
                      : completedOrder.customer.deliveryMethod === 'boutique'
                      ? 'Самовывоз из бутика'
                      : 'Экспресс-доставка'}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-[#EAE6DC] pb-2">
                  <span>Адрес:</span>
                  <strong className="text-[#1C1C1A] text-right max-w-xs">{completedOrder.customer.address}</strong>
                </div>
                <div className="flex justify-between border-b border-[#EAE6DC] pb-2">
                  <span>Трек-номер:</span>
                  <strong className="text-[#1C1C1A] font-mono">{completedOrder.trackingNumber}</strong>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-serif font-medium text-[#111111]">Сумма к оплате:</span>
                  <strong className="text-base font-semibold text-[#111111]">
                    {formatPrice(completedOrder.totalAmount)}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-[#7A766F] max-w-md mx-auto font-light leading-relaxed">
                Наш персональный консьерж свяжется с вами в течение 10 минут для уточнения удобного интервала примерки и подтверждения заказа.
              </p>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-xs"
                >
                  Вернуться к покупкам
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {error && (
                <div className="p-3.5 bg-[#FDF2F0] border border-[#F3C5BC] text-[#8C2D19] text-xs rounded-xs">
                  {error}
                </div>
              )}

              {/* 1. Contact Info */}
              <div>
                <h4 className="font-serif text-lg text-[#111111] mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1C1C1A] text-white text-[11px] flex items-center justify-center font-sans">
                    1
                  </span>
                  <span>Контактная информация</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                      ФИО получателя *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Анна Смирнова"
                      className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                      Телефон для связи *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (999) 000-00-00"
                      className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                      Электронная почта (для чека и статуса)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@velora.com"
                      className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Options */}
              <div>
                <h4 className="font-serif text-lg text-[#111111] mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1C1C1A] text-white text-[11px] flex items-center justify-center font-sans">
                    2
                  </span>
                  <span>Способ доставки</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <label
                    className={`border p-3.5 cursor-pointer rounded-xs flex flex-col justify-between transition-all ${
                      deliveryMethod === 'courier'
                        ? 'border-black bg-[#F5F4F0]'
                        : 'border-[#DDD9D2] hover:border-[#99968F]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Truck size={18} className="text-[#1C1C1A]" />
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === 'courier'}
                        onChange={() => setDeliveryMethod('courier')}
                        className="accent-black"
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1C1A] block">
                      Курьер с примеркой
                    </span>
                    <span className="text-[10px] text-[#706C64] mt-1">
                      15 минут на примерку, смежные размеры
                    </span>
                  </label>

                  <label
                    className={`border p-3.5 cursor-pointer rounded-xs flex flex-col justify-between transition-all ${
                      deliveryMethod === 'boutique'
                        ? 'border-black bg-[#F5F4F0]'
                        : 'border-[#DDD9D2] hover:border-[#99968F]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Building2 size={18} className="text-[#1C1C1A]" />
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === 'boutique'}
                        onChange={() => setDeliveryMethod('boutique')}
                        className="accent-black"
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1C1A] block">
                      Флагманский бутик
                    </span>
                    <span className="text-[10px] text-[#706C64] mt-1">
                      Москва, Столешников / СПб, Невский
                    </span>
                  </label>

                  <label
                    className={`border p-3.5 cursor-pointer rounded-xs flex flex-col justify-between transition-all ${
                      deliveryMethod === 'express'
                        ? 'border-black bg-[#F5F4F0]'
                        : 'border-[#DDD9D2] hover:border-[#99968F]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Truck size={18} className="text-[#7A6B53]" />
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === 'express'}
                        onChange={() => setDeliveryMethod('express')}
                        className="accent-black"
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1C1A] block">
                      VIP Экспресс (3 часа)
                    </span>
                    <span className="text-[10px] text-[#706C64] mt-1">
                      Срочная доставка день-в-день
                    </span>
                  </label>
                </div>

                {deliveryMethod !== 'boutique' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                        Город доставки *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Алматы, Астана..."
                        className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                        Улица, дом, корпус, квартира *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="пр. Достык, 117, кв. 45"
                        className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                    Комментарий для курьера или пожелания по упаковке
                  </label>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Например: позвонить за 30 минут, подарочная коробка с лентой"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3.5 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs resize-none"
                  />
                </div>
              </div>

              {/* 3. Payment Method */}
              <div>
                <h4 className="font-serif text-lg text-[#111111] mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1C1C1A] text-white text-[11px] flex items-center justify-center font-sans">
                    3
                  </span>
                  <span>Способ оплаты</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`border p-3.5 cursor-pointer rounded-xs flex items-center justify-between transition-all ${
                      paymentMethod === 'card'
                        ? 'border-black bg-[#F5F4F0]'
                        : 'border-[#DDD9D2] hover:border-[#99968F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} />
                      <span className="text-xs font-semibold text-[#1C1C1A]">Банковская карта</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-black"
                    />
                  </label>

                  <label
                    className={`border p-3.5 cursor-pointer rounded-xs flex items-center justify-between transition-all ${
                      paymentMethod === 'sbp'
                        ? 'border-black bg-[#F5F4F0]'
                        : 'border-[#DDD9D2] hover:border-[#99968F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-xs">QR</span>
                      <span className="text-xs font-semibold text-[#1C1C1A]">Kaspi QR / Онлайн</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'sbp'}
                      onChange={() => setPaymentMethod('sbp')}
                      className="accent-black"
                    />
                  </label>

                  <label
                    className={`border p-3.5 cursor-pointer rounded-xs flex items-center justify-between transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-black bg-[#F5F4F0]'
                        : 'border-[#DDD9D2] hover:border-[#99968F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote size={18} />
                      <span className="text-xs font-semibold text-[#1C1C1A]">При получении</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="accent-black"
                    />
                  </label>
                </div>
              </div>

              {/* Order Items Review */}
              <div className="pt-4 border-t border-[#E8E6E0]">
                <h5 className="text-xs uppercase tracking-wider text-[#736F66] font-medium mb-3">
                  Состав заказа ({items.length})
                </h5>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-2 mb-4 divide-y divide-[#F2EFE9]">
                  {items.map((i) => (
                    <div key={`${i.productId}-${i.size}-${i.color}`} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={i.image} alt="" className="w-10 h-12 object-cover rounded-xs" />
                        <div>
                          <p className="font-medium text-[#1C1C1A] line-clamp-1">{i.title}</p>
                          <span className="text-[11px] text-[#7A766F]">
                            {i.size} · {i.color} · {i.quantity} шт.
                          </span>
                        </div>
                      </div>
                      <span className="font-medium text-[#111111]">{formatPrice(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Final Calculation */}
                <div className="bg-[#FAF9F6] p-4 rounded-xs border border-[#E8E6E0] space-y-1.5 text-xs text-[#636059]">
                  <div className="flex justify-between">
                    <span>Сумма товаров:</span>
                    <span className="font-medium text-[#1C1C1A]">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#8C2D19]">
                      <span>Скидка по промокоду ({promoCode}):</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Доставка:</span>
                    <span>{shippingAmount === 0 ? 'Бесплатно' : formatPrice(shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#111111] pt-2 border-t border-[#EAE6DC]">
                    <span className="font-serif">Итого к оплате:</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-4 bg-[#1C1C1A] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 rounded-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Сохранение заказа в базе...</span>
                  ) : (
                    <>
                      <span>Подтвердить и оформить заказ</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C887E] tracking-wider uppercase mt-3">
                  <ShieldCheck size={13} className="text-[#3E7B44]" />
                  <span>Безопасная оплата и гарантия подлинности каждого изделия</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
