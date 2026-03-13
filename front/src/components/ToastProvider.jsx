import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

let _globalAddToast = null;

const ICONS = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
};

const COLORS = {
  error: "border-red-500/40 bg-red-500/10 text-red-300",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  info: "border-blue-500/40 bg-blue-500/10 text-blue-300",
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function toast(message, type = "error") {
  _globalAddToast?.(message, type);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "error") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  _globalAddToast = addToast;

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || ICONS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl shadow-lg ${COLORS[t.type] || COLORS.info}`}
              >
                <Icon size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm flex-1 break-words">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 opacity-60 hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
