"use client";

import React, { useState, useRef } from "react";

export default function CrosshairCropperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dosya Seçimi veya Bırakılması
  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Lütfen geçerli bir resim dosyası (PNG, JPG) yükleyin.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setCroppedImageUrl(null);
    setCroppedBlob(null);
    setSaved(false);
  };

  // Drag & Drop Olayları
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Crosshair Kesme İsteği
  const handleProcessImage = async () => {
    if (!file) return;

    setLoading(true);
    setCroppedImageUrl(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/crop-crosshair", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Görsel işlenirken bir hata oluştu.");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setCroppedBlob(blob);
      setCroppedImageUrl(imageUrl);
    } catch (error) {
      console.error(error);
      alert("Crosshair kesilirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Görseli Bilgisayara İndirme
  const handleDownload = () => {
    if (!croppedImageUrl) return;
    const a = document.createElement("a");
    a.href = croppedImageUrl;
    a.download = `cs2-crosshair-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 📋 Görseli Doğrudan Panoya Kopyalama (Clipboard API)
  const handleCopyToClipboard = async () => {
    if (!croppedBlob) return;
    try {
      const item = new ClipboardItem({ "image/png": croppedBlob });
      await navigator.clipboard.write([item]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Panoya kopyalanamadı:", err);
      alert("Görsel panoya kopyalanamadı. Lütfen indirmeyi deneyin.");
    }
  };

  // 💾 Sunucuya / Veritabanına Kaydetme (İsteğe bağlı oyuncu profiline bağlama)
  const handleSaveToDatabase = async () => {
    if (!croppedBlob) return;
    const playerSlug = prompt("Bu crosshair hangi oyuncuya veya profile ait? (Örn: s1mple, m0NESY)", "custom-crosshair");
    if (!playerSlug) return;

    const formData = new FormData();
    formData.append("file", croppedBlob, `${playerSlug}.png`);
    formData.append("playerSlug", playerSlug);

    try {
      const res = await fetch("/api/save-crosshair", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSaved(true);
        alert(`Crosshair başarıyla kaydedildi! (/public/crosshairs/${playerSlug}.png)`);
      } else {
        alert("Kaydedilirken bir hata oluştu.");
      }
    } catch (e) {
      console.error(e);
      alert("Kayıt sırasında sunucu hatası oluştu.");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Başlık */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            CS2 Crosshair Kırpıcı
          </h1>
          <p className="mt-2 text-neutral-400 text-sm">
            Ekran görüntünü yükle, crosshair'ini otomatik algılayıp milimetrik ortalayarak kırpalım.
          </p>
        </div>

        {/* Sürükle & Bırak Yükleme Alanı ve Anlık Önizleme */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 overflow-hidden ${
            isDragging
              ? "border-green-500 bg-green-500/10 scale-[1.01]"
              : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          {previewUrl ? (
            /* Görsel Seçildiyse Anlık Önizleme (Image Preview) */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="relative w-full max-h-56 overflow-hidden rounded-xl border border-neutral-700 bg-black/60 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Seçilen Ekran Görüntüsü Önizlemesi"
                  className="max-h-52 object-contain rounded-lg"
                />
              </div>
              <p className="text-xs text-neutral-400">
                Seçilen Dosya: <span className="text-green-400 font-mono">{file?.name}</span> (Değiştirmek için tıkla)
              </p>
            </div>
          ) : (
            /* Henüz Dosya Seçilmediyse Varsayılan Yükleme Görünümü */
            <>
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 text-xl">
                📸
              </div>
              <div>
                <p className="text-base font-medium">
                  Ekran görüntüsünü buraya sürükleyin veya <span className="text-green-400 underline">dosya seçin</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">PNG, JPG veya WEBP (Örn: 1280x1024, 1920x1080)</p>
              </div>
            </>
          )}
        </div>

        {/* İşlem Butonu */}
        {file && !croppedImageUrl && (
          <button
            onClick={handleProcessImage}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Crosshair Taranıyor ve Kırpılıyor...</span>
              </>
            ) : (
              <span>Crosshair'i Kes ve Ortala</span>
            )}
          </button>
        )}

        {/* Sonuç Görseli, İndirme, Panoya Kopyalama ve Sunucuya Kaydetme */}
        {croppedImageUrl && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                Sonuç (Milimetrik Ortaladı)
              </span>
              <div className="relative overflow-hidden rounded-xl border-2 border-neutral-700 shadow-2xl bg-black">
                <img
                  src={croppedImageUrl}
                  alt="Kırpılmış CS2 Crosshair"
                  className="w-72 h-72 object-cover"
                />
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. İndir */}
              <button
                onClick={handleDownload}
                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
              >
                💾 İndir
              </button>

              {/* 2. Panoya Kopyala */}
              <button
                onClick={handleCopyToClipboard}
                className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-neutral-700"
              >
                {copied ? "✅ Kopyalandı!" : "📋 Panoya Kopyala"}
              </button>

              {/* 3. Projeye / Veritabanına Kaydet */}
              <button
                onClick={handleSaveToDatabase}
                className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-green-400 font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-neutral-700"
              >
                {saved ? "✅ Kaydedildi" : "📁 Projeye Kaydet"}
              </button>
            </div>

            {/* Yeni Fotoğraf Yükleme Butonu */}
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setCroppedImageUrl(null);
                setCroppedBlob(null);
              }}
              className="w-full py-2.5 px-4 bg-transparent hover:bg-neutral-900 text-neutral-400 hover:text-white font-medium rounded-xl transition-all text-xs"
            >
              🔄 Başka Bir Görsel Yükle
            </button>
          </div>
        )}
      </div>
    </main>
  );
}