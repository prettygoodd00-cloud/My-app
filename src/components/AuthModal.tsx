import React, { useState } from 'react';
import { X, Lock, User as UserIcon, Mail, Phone, Check, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPanel,
}) => {
  const { login, register, error, clearError } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+7 ');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    const result = await login(loginInput, loginPassword);
    setIsLoading(false);

    if (result.success) {
      if (result.isAdmin && onOpenAdminPanel) {
        setSuccessMessage('Успешный вход в аккаунт администратора');
        setTimeout(() => {
          onClose();
          onOpenAdminPanel();
        }, 800);
      } else {
        setSuccessMessage('Добро пожаловать в VELORA');
        setTimeout(() => {
          onClose();
        }, 700);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    const result = await register({
      name: regName,
      username: regUsername,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Регистрация прошла успешно!');
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-md rounded-sm shadow-2xl border border-[#E3DFD5] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7A766F] hover:text-black rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 bg-[#FAF9F6] border-b border-[#E8E6E0] text-center">
          <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#111111] uppercase block">
            VELORA
          </span>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#807C73] mt-1 font-sans">
            Персональный доступ
          </p>

          {/* Tabs */}
          <div className="flex border-b border-[#E0DDD5] mt-5">
            <button
              onClick={() => {
                setTab('login');
                clearError();
              }}
              className={`flex-1 pb-3 text-xs uppercase tracking-widest font-medium transition-colors relative ${
                tab === 'login'
                  ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                  : 'text-[#807C73] hover:text-black'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => {
                setTab('register');
                clearError();
              }}
              className={`flex-1 pb-3 text-xs uppercase tracking-widest font-medium transition-colors relative ${
                tab === 'register'
                  ? 'text-[#1C1C1A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1C1C1A]'
                  : 'text-[#807C73] hover:text-black'
              }`}
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#FDF2F0] border border-[#F3C5BC] text-[#8C2D19] text-xs rounded-xs">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-[#EEF7ED] border border-[#C5E1C3] text-[#2E7D32] text-xs rounded-xs flex items-center gap-2">
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Логин
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3 text-[#99968F]" />
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Введите ваш логин"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] pl-9 pr-3 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Пароль
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-[#99968F]" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] pl-9 pr-3 py-2.5 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors rounded-xs disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Проверка...' : 'Войти'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-xs text-[#7A766F] hover:text-black underline underline-offset-2"
                >
                  Нет аккаунта? Зарегистрироваться
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Екатерина Романова"
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Логин для входа *
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="ekaterina_r"
                  className="w-full bg-[#FAF9F6] border border-[#DDD9D2] px-3 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-[#99968F]" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] pl-9 pr-3 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Телефон
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-2.5 text-[#99968F]" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] pl-9 pr-3 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#706C64] mb-1 font-medium">
                  Пароль (от 6 символов) *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-2.5 text-[#99968F]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF9F6] border border-[#DDD9D2] pl-9 pr-3 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-black rounded-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#1C1C1A] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors rounded-xs disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Создание...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
