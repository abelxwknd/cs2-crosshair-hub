'use client';

import React, { useState } from 'react';

interface CrosshairPreviewProps {
  crosshair?: {
    name?: string;
    category?: string;
    code?: string;
    isDot?: boolean;
    color?: string;
  };
  onCopy?: (code: string) => void;
}

const backgrounds = [
  { name: 'Dust2 / Mirage', bgClass: 'bg-[#C2B290]', border: 'border-[#A39373]' },
  { name: 'Inferno / Bina', bgClass: 'bg-[#4A5D4E]', border: 'border-[#3B4A3E]' },
  { name: 'Nuke / Endüstri', bgClass: 'bg-[#A3ABB2]', border: 'border-[#8A9299]' },
  { name: 'Gece Modu', bgClass: 'bg-[#1E2229]', border: 'border-[#15181E]' },
];

export default function CrosshairPreview({ crosshair, onCopy }: CrosshairPreviewProps) {
  const [bgIndex, setBgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentBg = backgrounds[bgIndex];
  
  const safeCrosshair = crosshair || {
    name: 'CS2 Nişangahı',
    category: 'CS2',
    code: 'CSGO-5eOTF-7OnKP-xmYXt-KcnyG-DavvE',
  };

  const handleThemeChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBgIndex((prev) => (prev + 1) % backgrounds.length);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const codeToCopy = safeCrosshair.code || 'CSGO-5eOTF-7OnKP-xmYXt-KcnyG-DavvE';
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = codeToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {}
      document.body.removeChild(textArea);
    }

    if (onCopy) {
      onCopy(codeToCopy);
    }
  };

  return (
    <div className="bg-[#12141C] border border-[#1E222D] rounded-2xl p-5 w-[320px] flex flex-col items-center shadow-2xl">
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-medium text-gray-400 bg-[#1A1E29] px-2.5 py-1 rounded-md border border-white/5">
          {currentBg.name}
        </span>
        <button
          onClick={handleThemeChange}
          className="text-xs bg-[#1A1E29] hover:bg-[#252A38] text-gray-200 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>🎨</span> Tema
        </button>
      </div>

      <div className={`relative w-full h-[180px] rounded-xl ${currentBg.bgClass} border ${currentBg.border} flex items-center justify-center overflow-hidden shadow-inner`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Canlı Sarı Nokta Nişangah */}
        <div className="relative flex items-center justify-center">
          <div className="w-[4px] h-[4px] bg-[#F1C40F] border border-black/90 shadow-[0_0_2px_rgba(0,0,0,0.9)]"></div>
        </div>
      </div>

      <div className="w-full mt-4 flex flex-col items-center gap-1">
        <h3 className="text-white font-bold text-base tracking-wide">{safeCrosshair.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{safeCrosshair.category || 'CS2 Topluluk'}</p>

        <button
          onClick={handleCopyClick}
          type="button"
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-[#1C212E] hover:bg-[#252B3B] text-gray-200 border border-white/5'
          }`}
        >
          <span>📋</span>
          {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
        </button>
      </div>
    </div>
  );
}