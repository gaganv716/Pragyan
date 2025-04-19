import React, { createContext, useContext, useState } from "react";
import "../../public/css/Miscellaneous/Toast.css";

const ToastContext = createContext();

export const useCustomToast = () => useContext(ToastContext);

export const Toast = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ title, description, status, duration = 5000, isClosable = true, position = "bottom-left" }) => {
    const id = Date.now();
    const newToast = { id, title, description, status, isClosable, position };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.status} ${toast.position}`}>
            <div className="toast-title">{toast.title}</div>
            {toast.description && <div className="toast-desc">{toast.description}</div>}
            {toast.isClosable && (
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                ✖
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
