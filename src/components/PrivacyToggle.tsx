'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PrivacyToggle() {
  const [privacyMode, setPrivacyMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('privacyMode') === 'true';
    }
    return false;
  });

  const toggle = () => {
    const newValue = !privacyMode;
    setPrivacyMode(newValue);
    localStorage.setItem('privacyMode', String(newValue));
  };

  useEffect(() => {
    document.body.classList.toggle('privacy-mode', privacyMode);
  }, [privacyMode]);

  return (
    <button
      onClick={toggle}
      className="p-2 text-[#8B95A8] hover:text-[#C9A24B] transition-colors"
      aria-label={privacyMode ? 'Show amounts' : 'Hide amounts'}
      title={privacyMode ? 'Show amounts' : 'Hide amounts'}
    >
      {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );
}
