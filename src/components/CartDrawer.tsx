import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    promoError,
    applyPromoCode,
    removePromoCode,
    subtotal,
    discountAmount,
    shippingAmount,
    totalAmount,
    amountUntilFreeShipping,
    freeShippingThreshold,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] shadow-2xl flex flex-col justify-between border-l border-[#E5E2DC]">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E6E0] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-[#1C1C1A]" />
                <h2 className="font-serif text-xl text-[#111111] font-medium tracking-wide">
                  Корзина
                </h2>
                <span className="text-xs text-[#7A766F] font-sans">
                  ({items.reduce((s, i) => s + i.quantity, 0)})
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-[#7A766F] hover:text-black rounded-full transition-colors"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="mt-4 pt-3 border-t border-[#F2EFE9]">
              <div className="flex items-center justify-between text-xs mb-1.5 font-light">
                {amountUntilFreeShipping > 0 ? (
                  <span className="text-[#595650]">
                    До бесплатной доставки:{' '}
                    <strong className="font-medium text-black">
                      {formatPrice(amountUntilFreeShipping)}
                    </strong>
                  </span>
                ) : (
                  <span className="text-[#3E7B44] font-medium flex items-center gap-1">
                    <ShieldCheck size={14} />
                    Бесплатная курьерская доставка разблокирована!
                  </span>
                )}
                <span className="text-[11px] text-[#8C887E]">{freeShippingProgress}%</span>
              </div>
              <div className="w-full bg-[#EAE6DC] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1C1C1A] h-full transition-all duration-500 ease-out"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#EFECE5]">
            {items.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#EFECE5] flex items-center justify-center text-[#736F66] mb-4">
                  <ShoppingBag size={28} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-[#1C1C1A] mb-2 font-medium">
                  Ваша корзина пуста
                </h3>
                <p className="text-xs text-[#807C73] max-w-xs mb-6 font-light">
                  Откройте для себя нашу новую капсульную коллекцию кашемира и вечерних платьев.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors rounded-xs"
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="pt-4 flex gap-4">
                  <div className="w-20 h-24 bg-[#F2F0EA] rounded-xs overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-medium text-[#1C1C1A] leading-snug line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-[#9E9B93] hover:text-[#8C2D19] p-1 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#736F66] mt-1 space-x-2">
                        <span>Размер: <strong className="text-[#1C1C1A]">{item.size}</strong></span>
                        <span>·</span>
                        <span>Цвет: <strong className="text-[#1C1C1A]">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#DDD9D2] bg-white rounded-xs">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                          }
                          className="px-2.5 py-0.5 text-xs hover:bg-[#F2EFE9] text-[#1C1C1A]"
                        >
                          −
                        </button>
                        <span className="px-2 py-0.5 text-xs font-medium text-center min-w-6">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                          }
                          className="px-2.5 py-0.5 text-xs hover:bg-[#F2EFE9] text-[#1C1C1A]"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-medium text-[#111111]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E8E6E0] space-y-4">
              {/* Promo Code Input */}
              {promoCode ? (
                <div className="flex items-center justify-between p-2.5 bg-[#F2F0EB] rounded-xs text-xs">
                  <div className="flex items-center gap-1.5 text-[#33312E]">
                    <Tag size={14} className="text-[#7A6B53]" />
                    <span>Промокод <strong>{promoCode}</strong> (-{(promoDiscount * 100).toFixed(0)}%)</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs text-[#8C2D19] hover:underline uppercase tracking-wider font-medium"
                  >
                    Отменить
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Промокод (VELORA10)"
                    className="flex-1 bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-black rounded-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1C1C1A] text-white text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors rounded-xs"
                  >
                    Применить
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[11px] text-[#8C2D19] -mt-2">{promoError}</p>
              )}

              {/* Price Calculation breakdown */}
              <div className="space-y-1.5 text-xs text-[#636059]">
                <div className="flex justify-between">
                  <span>Подытог</span>
                  <span className="font-medium text-[#1C1C1A]">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#8C2D19]">
                    <span>Скидка</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>{shippingAmount === 0 ? 'Бесплатно' : formatPrice(shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-[#111111] pt-2 border-t border-[#EFECE5]">
                  <span className="font-serif">Итого</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-4 bg-[#1C1C1A] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 rounded-xs shadow-md"
              >
                <span>Перейти к оформлению</span>
                <ArrowRight size={15} />
              </button>

              <div className="flex items-center justify-between text-[10px] text-[#8C887E] uppercase tracking-wider pt-1">
                <span>Оплата онлайн или при примерке</span>
                <button onClick={clearCart} className="hover:text-[#8C2D19] underline">
                  Очистить корзину
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
