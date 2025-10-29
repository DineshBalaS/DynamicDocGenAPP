// src/components/ui/Toast.jsx

import React, { useState, useEffect } from 'react';

function Toast({ message, type = 'success', duration = 3000, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  const baseClasses = "fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse rounded-lg shadow";
  const typeClasses = {
    success: "text-green-500 bg-green-100",
    error: "text-red-500 bg-red-100",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <div className="text-sm font-normal">{message}</div>
    </div>
  );
}

export default Toast;