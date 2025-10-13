"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor;

    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    if (mobile && !standalone) {
      setIsAndroid(/Android/i.test(ua));
      setIsIOS(/iPhone|iPad|iPod/i.test(ua));
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xs z-50">
      <div 
        className="backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/10"
        style={{ backgroundColor: 'rgba(62, 0, 133, 0.85)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: '#4A04A5' }}
          >
            <img src="/appLogo-192.png" alt="Logo" className="w-10 h-10" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium mb-2" style={{ color: '#F6F3FF' }}>
              Baixe o app para uma melhor experiência!
            </p>
            
            {isAndroid && (
              <button
                onClick={() =>
                  (window.location.href =
                    "https://play.google.com/store/apps/details?id=com.avantar_indica&hl=pt_BR")
                }
                className="w-full text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#29F3DF', color: '#0F0124' }}
              >
                Google Play
              </button>
            )}

            {isIOS && (
              <button
                onClick={() =>
                  (window.location.href =
                    "https://apps.apple.com/br/app/avantar-indica/id6749894670?l=en-GB")
                }
                className="w-full text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#29F3DF', color: '#0F0124' }}
              >
                App Store
              </button>
            )}
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: '#CDCDCD' }}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}