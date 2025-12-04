import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const PWAInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-bounce">
      <button
        onClick={handleInstallClick}
        className="bg-taxi-500 hover:bg-taxi-600 text-white p-3 rounded-full shadow-lg flex items-center gap-2 font-bold"
      >
        <Download size={20} />
        <span className="hidden sm:inline">Install App</span>
      </button>
    </div>
  );
};

export default PWAInstall;
