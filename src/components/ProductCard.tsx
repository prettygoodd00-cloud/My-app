import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'One Size');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Стандарт');
  const [showSizePicker, setShowSizePicker] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleAddDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.sizes.length > 1 && !showSizePicker) {
      setShowSizePicker(true);
      return;
    }
    addToCart(product, selectedSize, selectedColor, 1);
    setShowSizePicker(false);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group cursor-pointer flex flex-col h-full bg-white border border-[#EBE8E1] hover:border-[#D6D2C7] transition-all duration-300 rounded-sm overflow-hidden"
    >
      {/* Image Container */}
      <div
        className="relative aspect-[3/4] bg-[#F5F4F0] overflow-hidden"
        onMouseEnter={() => {
          if (product.images.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => {
          setCurrentImageIndex(0);
        }}
      >
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="text-[10px] tracking-[0.18em] uppercase font-semibold bg-[#1C1C1A] text-white px-2 py-0.5 rounded-xs">
              New
            </span>
          )}
          {product.oldPrice && (
            <span className="text-[10px] tracking-[0.18em] uppercase font-semibold bg-[#8C2D19] text-white px-2 py-0.5 rounded-xs">
              Sale
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="text-[9px] tracking-[0.14em] uppercase font-medium bg-[#786C5A] text-white px-1.5 py-0.5 rounded-xs">
              Осталось {product.stock} шт
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorited
              ? 'bg-[#8C2D19] text-white'
              : 'bg-white/80 text-[#2C2C2A] hover:bg-white hover:text-black'
          }`}
          title={isFavorited ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={1.75} />
        </button>

        {/* Quick View Floating Action */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2.5 px-3 bg-white/95 backdrop-blur-md text-[#1C1C1A] text-[11px] uppercase tracking-[0.16em] font-medium hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-sm rounded-xs"
          >
            <Eye size={14} />
            <span>Просмотр</span>
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Color indicators */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#807C73] mb-1.5">
            <span className="uppercase tracking-[0.15em] text-[10px] font-medium">
              {product.category}
            </span>
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.map((c) => (
                  <span
                    key={c.name}
                    className="w-2.5 h-2.5 rounded-full border border-black/15"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg text-[#1C1C1A] font-medium leading-snug line-clamp-2 mb-2 group-hover:text-[#7A6B53] transition-colors">
            {product.title}
          </h3>

          {/* Sizes preview */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#807C73] mb-3">
            <span>Размеры:</span>
            <span className="text-[#33312E] font-medium">
              {product.sizes.join(', ')}
            </span>
          </div>
        </div>

        {/* Price and Cart Action */}
        <div className="pt-3 border-t border-[#F0EEE9]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-base sm:text-lg text-[#1C1C1A]">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-[#9E9B93] line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            {product.stock <= 0 ? (
              <span className="text-[11px] text-[#A3432B] font-medium uppercase tracking-wider">
                Под заказ
              </span>
            ) : (
              <span className="text-[11px] text-[#4F6D48] font-medium">В наличии</span>
            )}
          </div>

          {/* Size picker dropdown when direct add clicked */}
          {showSizePicker ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F8F7F4] p-2.5 rounded-xs border border-[#E3DFD5] mb-2 animate-fadeIn"
            >
              <div className="text-[10px] uppercase tracking-wider text-[#736F66] mb-1.5 font-medium">
                Выберите размер:
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-2 py-1 text-xs font-medium border transition-colors ${
                      selectedSize === sz
                        ? 'border-black bg-black text-white'
                        : 'border-[#D9D6CE] bg-white text-[#33312E] hover:border-black'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddDirect}
                className="w-full py-1.5 bg-[#1C1C1A] text-white text-[11px] uppercase tracking-widest font-medium hover:bg-black transition-colors"
              >
                Подтвердить ({selectedSize})
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddDirect}
              className="w-full py-2.5 bg-[#FAF9F6] border border-[#DDD9D0] text-[#1C1C1A] text-[11px] uppercase tracking-[0.16em] font-medium hover:bg-[#1C1C1A] hover:text-white hover:border-[#1C1C1A] transition-all flex items-center justify-center gap-1.5 rounded-xs"
            >
              <ShoppingBag size={14} />
              <span>В корзину</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
