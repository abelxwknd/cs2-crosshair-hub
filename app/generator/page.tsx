"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function GeneratorPage() {
  // Crosshair Ayarları
  const [size, setSize] = useState(3);
  const [thickness, setThickness] = useState(1);
  const [gap, setGap] = useState(-2);
  const [dot, setDot] = useState(false);
  const [color, setColor] = useState("#00ff00"); // Yeşil
  const [outline, setOutline] = useState(true);

  // Kodu Dinamik Oluştur
  const generateCS2Code = () => {
    // Hex rengini RGB'ye çevirelim
    const r = parseInt(color.slice(1, 3), 16) || 0;
    const g = parseInt(color.slice(3, 5), 16) || 255;
    const b = parseInt(color.slice(5, 7), 16) || 0;

    return `cl_crosshairsize ${size}; cl_crosshairthickness ${thickness}; cl_crosshairgap ${gap}; cl_crosshairdot ${dot ? 1 : 0}; cl_crosshairdrawoutline ${outline ? 1 : 0}; cl_crosshaircolor 5; cl_crosshaircolor_r ${r}; cl_crosshaircolor_g ${g}; cl_crosshaircolor_b ${b};`;
  };

  const copyGeneratedCode = () => {
    navigator.clipboard.writeText(generateCS2Code());
    toast.success("Oluşturulan crosshair kodu kopyalandı!");
  };

  // SVG Hesaplamaları (Ortası 50,50 olan piksel hizalamalı sistem)
  const lineLength = size * 3;
  const gapOffset = gap < 0 ? 0 : gap * 1.5;

  return (
    <>
      <Toaster position="top-center" />
      <main className="min-h-screen bg-black text-white p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-zinc-400 hover:text-white mb-6 inline-block">
            ← Ana Sayfaya Dön
          </Link>

          <h1 className="text-4xl font-black mb-2">🎨 CS2 Crosshair Generator</h1>
          <p className="text-zinc-400 mb-8">
            Kendi özel nişangahını canlı olarak tasarla ve CS2 kodunu anında al!
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* CANLI ÖNİZLEME PANANOSU */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden">
              <span className="absolute top-4 left-4 text-xs font-mono text-zinc-500">CANLI PREVIEW</span>

              {/* Tuval / Crosshair Çizimi (SVG) */}
              <div className="w-48 h-48 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center relative shadow-inner">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Katman 1: Siyah Anahat (Outline) */}
                  {outline && (
                    <g stroke="black" strokeWidth={thickness + 1.5} strokeLinecap="square">
                      {/* Üst */}
                      <line x1="50" y1={50 - gapOffset} x2="50" y2={50 - gapOffset - lineLength} />
                      {/* Alt */}
                      <line x1="50" y1={50 + gapOffset} x2="50" y2={50 + gapOffset + lineLength} />
                      {/* Sol */}
                      <line x1={50 - gapOffset} y1="50" x2={50 - gapOffset - lineLength} y2="50" />
                      {/* Sağ */}
                      <line x1={50 + gapOffset} y1="50" x2={50 + gapOffset + lineLength} y2="50" />
                      {/* Dot Outline */}
                      {dot && <rect x={50 - (thickness + 1.5) / 2} y={50 - (thickness + 1.5) / 2} width={thickness + 1.5} height={thickness + 1.5} fill="black" />}
                    </g>
                  )}

                  {/* Katman 2: Renkli Çizgiler */}
                  <g stroke={color} strokeWidth={thickness} strokeLinecap="square">
                    {/* Üst Çizgi */}
                    <line x1="50" y1={50 - gapOffset} x2="50" y2={50 - gapOffset - lineLength} />
                    {/* Alt Çizgi */}
                    <line x1="50" y1={50 + gapOffset} x2="50" y2={50 + gapOffset + lineLength} />
                    {/* Sol Çizgi */}
                    <line x1={50 - gapOffset} y1="50" x2={50 - gapOffset - lineLength} y2="50" />
                    {/* Sağ Çizgi */}
                    <line x1={50 + gapOffset} y1="50" x2={50 + gapOffset + lineLength} y2="50" />
                  </g>

                  {/* Merkez Noktası (Dot) */}
                  {dot && (
                    <rect
                      x={50 - thickness / 2}
                      y={50 - thickness / 2}
                      width={thickness}
                      height={thickness}
                      fill={color}
                    />
                  )}
                </svg>
              </div>

              {/* Kod Çıktısı */}
              <div className="w-full bg-black border border-zinc-800 rounded-xl p-3 mt-6 text-xs font-mono text-zinc-400 break-all">
                {generateCS2Code()}
              </div>

              <button
                onClick={copyGeneratedCode}
                className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold mt-4 transition"
              >
                📋 Kodu Kopyala
              </button>
            </div>

            {/* KONTROL PANELİ */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-6">
              <h3 className="text-xl font-bold border-b border-zinc-800 pb-3">⚙️ Nişangah Ayarları</h3>

              {/* Boyut (Size) */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Boyut (Size)</span>
                  <span className="text-red-500 font-bold">{size}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              {/* Kalınlık (Thickness) */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Çizgi Kalınlığı (Thickness)</span>
                  <span className="text-red-500 font-bold">{thickness}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={thickness}
                  onChange={(e) => setThickness(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              {/* Aralık (Gap) */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Aralık (Gap)</span>
                  <span className="text-red-500 font-bold">{gap}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="10"
                  step="1"
                  value={gap}
                  onChange={(e) => setGap(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              {/* Renk (Color) */}
              <div>
                <label className="text-sm block mb-2">Nişangah Rengi</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded bg-transparent cursor-pointer border border-zinc-700"
                  />
                  <span className="font-mono text-sm uppercase">{color}</span>
                </div>
              </div>

              {/* Switchler (Dot & Outline) */}
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                <label className="text-sm cursor-pointer" htmlFor="dot-check">
                  Merkez Noktası (Dot)
                </label>
                <input
                  id="dot-check"
                  type="checkbox"
                  checked={dot}
                  onChange={(e) => setDot(e.target.checked)}
                  className="w-5 h-5 accent-red-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="text-sm cursor-pointer" htmlFor="outline-check">
                  Siyah Anahat (Outline)
                </label>
                <input
                  id="outline-check"
                  type="checkbox"
                  checked={outline}
                  onChange={(e) => setOutline(e.target.checked)}
                  className="w-5 h-5 accent-red-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}