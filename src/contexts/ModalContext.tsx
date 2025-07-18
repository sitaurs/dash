import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalContextType {
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
}

interface ModalData {
  type: 'alert' | 'confirm';
  message: string;
  resolve: (value: any) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalData | null>(null);

  const alert = (message: string) => {
    return new Promise<void>((resolve) => {
      setModal({ type: 'alert', message, resolve });
      setTimeout(() => {
        setModal(null);
        resolve();
      }, 1800);
    });
  };

  const confirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      setModal({ type: 'confirm', message, resolve });
    });
  };

  const handleConfirm = (value: boolean) => {
    if (modal && modal.type === 'confirm') {
      modal.resolve(value);
      setModal(null);
    }
  };

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 text-center max-w-xs"
            >
              <p className="text-white mb-4 whitespace-pre-line">{modal.message}</p>
              {modal.type === 'confirm' && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleConfirm(false)}
                    className="glass-button px-4 py-2 text-white rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleConfirm(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white rounded-lg"
                  >
                    Ya
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
