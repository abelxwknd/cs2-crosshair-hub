"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Crosshair = {
  id: number;
  name: string;
  code: string;
  image: string | null;
  player: string | null;
  team: string | null;
  likes: number;
  views?: number;
  copies?: number;
  created_at?: string;
};

export default function Home() {
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [likedCrosshairs, setLikedCrosshairs] = useState<number[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCrosshairs();
    const savedFavs = localStorage.getItem("fav_crosshairs");
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }

    const savedLikes = localStorage.getItem("liked_crosshairs");
    if (savedLikes) {
      try { setLikedCrosshairs(JSON.parse(savedLikes)); } catch (e) {}
    }
  }, []);

  async function fetchCrosshairs() {
    const { data } = await supabase
      .from("approved_crosshairs")
      .select("*")
      .eq("status", "approved") // SADECE ONAYLANANLAR GÖZÜKSÜN
      .order("id", { ascending: false });
    if (data) setCrosshairs(data);
  }

  const toggleFavorite = (id: number) => {
    let updated = [...favorites];
    if (updated.includes(id)) {
      updated = updated.filter((item) => item !== id);
    } else {
      updated.push(id);
    }
    setFavorites(updated);
    localStorage.setItem("fav_crosshairs", JSON.stringify(updated));
  };

  const handleLike = async (id: number, currentLikes: number) => {
    if (processingId === id) return;
    setProcessingId(id);

    const isAlreadyLiked = likedCrosshairs.includes(id);
    let updatedLikes = [...likedCrosshairs];
    let newCount = currentLikes;

    if (isAlreadyLiked) {
      updatedLikes = updatedLikes.filter((item) => item !== id);
      newCount = Math.max(0, currentLikes - 1);
    } else {
      updatedLikes.push(id);
      newCount = currentLikes + 1;
    }

    setLikedCrosshairs(updatedLikes);
    localStorage.setItem("liked_crosshairs", JSON.stringify(updatedLikes));

    const { error } = await supabase
      .from("approved_crosshairs")
      .update({ likes: newCount })
      .eq("id", id);
    
    if (error) {
      console.error("Beğeni güncellenemedi:", error.message);
      fetchCrosshairs();
    } else {
      await fetchCrosshairs();
    }

    setProcessingId(null);
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    alert("Crosshair kodu kopyalandı!");
  };

  // İstatistikler
  const totalCrosshairs = crosshairs.length;
  const totalLikes = crosshairs.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalPros = crosshairs.filter((c) => c.player).length;

  // Filtreleme
  const filteredCrosshairs = crosshairs.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.player && item.player.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "favorites") return favorites.includes(item.id);
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-red-500 selection:text-white pb-20 relative overflow-hidden">
      {/* Arka Plan Glow Efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-600/20 via-red-900/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {/* HERO HEADER */}
        <section className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3 backdrop-blur-md">
            <span>🎯</span> CS2 Nişangah Kütüphanesi
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            CS2 <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Crosshair</span> Hub
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Profesyonel oyuncuların ve topluluğun en çok tercih ettiği Counter-Strike 2 nişangah kodlarını keşfet.
          </p>
        </section>

        {/* İSTATİSTİK KARTLARI */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-lg">
              🎯
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">TOPLAM CROSSHAIR</p>
              <p className="text-xl font-extrabold">{totalCrosshairs}</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-lg">
              ❤️
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">TOPLAM BEĞENİ</p>
              <p className="text-xl font-extrabold">{totalLikes}</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg">
              👑
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">PRO OYUNCU</p>
              <p className="text-xl font-extrabold">{totalPros}</p>
            </div>
          </div>
        </section>

        {/* AKSİYON BUTONLARI */}
        <section className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link
            href="/generator"
            className="px-5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-sm font-semibold transition flex items-center gap-2 hover:border-zinc-700"
          >
            🎨 Crosshair Generator
          </Link>
          <Link
            href="/compare"
            className="px-5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-sm font-semibold transition flex items-center gap-2 hover:border-zinc-700"
          >
            ⚔️ Karşılaştır
          </Link>
          <Link
            href="/submit"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition shadow-lg shadow-red-600/20 flex items-center gap-2"
          >
            ➕ Crosshair Gönder
          </Link>
        </section>

        {/* ARAMA VE FİLTRE BARI */}
        <section className="space-y-4 mb-8">
          <div className="relative max-w-xl mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            <input
              type="text"
              placeholder="Oyuncu veya nişangah ara... (donk, m0NESY, s1mple)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-red-500/80 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition backdrop-blur-md placeholder:text-zinc-600"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "Tümü", emoji: "🌐" },
              { id: "favorites", label: "Favorilerim", emoji: "⭐" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  filter === f.id
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80"
                }`}
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* CROSSHAIR GRID LISTESI */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrosshairs.map((item, index) => {
            const isFav = favorites.includes(item.id);
            const isLiked = likedCrosshairs.includes(item.id);
            const isProcessing = processingId === item.id;

            return (
              <div
                key={item.id}
                className="group relative bg-zinc-900/40 border border-zinc-800/80 hover:border-red-500/40 rounded-3xl p-4 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  {/* Kart Üst Bilgi Barı */}
                  <div className="flex items-center justify-between mb-3 text-xs text-zinc-500">
                    <span className="font-mono bg-zinc-800/80 px-2 py-0.5 rounded-md text-zinc-400 font-semibold">
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleLike(item.id, item.likes)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition border ${
                          isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        } ${
                          isLiked
                            ? "bg-red-500/20 border-red-500/50 text-red-400 font-bold"
                            : "bg-zinc-800/50 border-zinc-700/30 text-zinc-400 hover:text-red-400"
                        }`}
                      >
                        ❤️ {item.likes}
                      </button>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          isFav
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-zinc-800/40 border-zinc-700/30 text-zinc-500 hover:text-white"
                        }`}
                      >
                        ★
                      </button>
                    </div>
                  </div>

                  {/* Görsel Alanı */}
                  <div className="w-full h-40 bg-black/60 rounded-2xl border border-zinc-800/80 p-2 mb-3 flex items-center justify-center overflow-hidden group-hover:border-zinc-700 transition">
                    <img
                      src={item.image || "/crosshairs/default.png"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/crosshairs/default.png";
                      }}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Oyuncu & Takım İsmi */}
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-bold group-hover:text-red-400 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {item.player ? `👤 ${item.player}` : "Topluluk Nişangahı"} • {item.team || "Takımsız"}
                    </p>
                  </div>
                </div>

                {/* Alt Kısım / Kopyalama Butonu */}
                <div className="space-y-2 pt-3 border-t border-zinc-800/60">
                  <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-2 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="truncate pr-2">{item.code}</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(item.code)}
                    className="w-full py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition shadow-md shadow-red-600/10 flex items-center justify-center gap-1.5"
                  >
                    📋 Kodu Kopyala
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        <section className="max-w-4xl mx-auto mt-20 py-10 px-6 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl backdrop-blur-md">
          <h2 className="text-2xl font-black text-center mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Sistem Nasıl Çalışır?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-red-400 flex items-center gap-2">
                <span>⚙️</span> Nişangah Aktarımı
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Valve, güvenlik politikaları gereği oyun içi verilerin dışarıdan otomatik olarak çekilmesine veya siteye doğrudan aktarılmasına izin vermemektedir. 
                Bu nedenle, beğendiğiniz bir nişangahı kullanmak için <strong>"Kodu Kopyala"</strong> butonunu kullanarak kodu kopyalamanız ve oyun içerisindeki "Crosshair" ayarları kısmına yapıştırmanız gerekmektedir.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-bold text-red-400 flex items-center gap-2">
                <span>🛡️</span> Moderasyon Süreci
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Sitemize gönderilen her nişangah doğrudan yayınlanmaz. "Crosshair Gönder" formunu kullanarak eklediğiniz kodlar, uygunluk ve doğruluk açısından <strong>admin onayından</strong> geçer. Onaylanan nişangahlar kısa süre içerisinde kütüphanemize eklenerek diğer oyuncularla paylaşılır.
              </p>
            </div>
          </div>
        </section>

        {filteredCrosshairs.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            Aradığınız kriterlere uygun nişangah bulunamadı.
          </div>
        )}
      </div>
    </main>
  );
}