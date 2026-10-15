import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, X, Eye, EyeOff, ShieldAlert, ArrowRight, Check } from 'lucide-react';

export const AdminPinModal: React.FC = () => {
  const { isAdminPinModalOpen, setIsAdminPinModalOpen, loginAdmin } = useStore();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminPinModalOpen) {
      setPin('');
      setError(null);
      setIsSuccess(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAdminPinModalOpen]);

  if (!isAdminPinModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Por favor, informe o PIN.');
      return;
    }

    const success = loginAdmin(pin);
    if (success) {
      setIsSuccess(true);
      setError(null);
      setTimeout(() => {
        setIsSuccess(false);
      }, 500);
    } else {
      setError('PIN incorreto. Tente novamente.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleClose = () => {
    setIsAdminPinModalOpen(false);
    setPin('');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-pin-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center mb-4 text-rose-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h3 id="admin-pin-title" className="text-xl font-extrabold text-white tracking-tight">
            Acesso Restrito
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
            Informe o PIN de 4 dígitos para gerenciar pedidos, produtos e configurações.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••"
              autoComplete="off"
              className="w-full h-14 bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-2xl text-center text-2xl font-mono tracking-widest text-white placeholder-neutral-600 outline-none transition-all px-12"
            />

            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1 rounded-md transition-colors"
              title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium py-1 animate-in fade-in">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSuccess}
              className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-neutral-100 text-neutral-900 active:scale-98 shadow-sm'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Acesso Autorizado!</span>
                </>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Voltar ao Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
