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
  resolution?: string;
  dpi?: number;
  sensitivity?: number;
};

export default function ComparePage() {
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [leftId, setLeftId] = useState<number | null>(null);
  const [rightId, setRightId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from("approved_crosshairs").select("*");
      if (data && data.length > 0) {
        setCrosshairs(data);
        setLeftId(data[0].id);
        if (data.length > 1) setRightId(data[1].id);
      }
    }
    loadData();
  }, []);

  const leftItem = crosshairs.find((c) => c.id === leftId);
  const rightItem = crosshairs.find((c) => c.id === rightId);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-zinc-400 hover:text-white mb-6 inline-block">
          ← Ana Sayfaya Dön
        </Link>

        <h1 className="text-4xl font-black mb-2">⚔️ Crosshair Karşılaştırma</h1>
        <p className="text-zinc-400 mb-8">
          İki farklı pro oyuncunun nişangahını ve ayarlarını yan yana kıyasla!
        </p>

        {/* Seçim Seçenekleri */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="text-xs text-zinc-400 block mb-2">Sol Nişangah Seç</label>
            <select
              value={leftId || ""}
              onChange={(e) => setLeftId(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-red-500"
            >
              {crosshairs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.player || "Oyuncu"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-2">Sağ Nişangah Seç</label>
            <select
              value={rightId || ""}
              onChange={(e) => setRightId(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-red-500"
            >
              {crosshairs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.player || "Oyuncu"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KARŞILAŞTIRMA KARTLARI */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sol Kart */}
          {leftItem && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center">
              <img
                src={`/crosshairs/${leftItem.name.toLowerCase()}.png`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/crosshairs/default.png";
                }}
                alt={leftItem.name}
                className="h-40 object-contain bg-black border border-zinc-800 rounded-2xl p-4 w-full mb-4"
              />
              <h3 className="text-2xl font-bold">{leftItem.name}</h3>
              <p className="text-zinc-400 text-sm mb-4">{leftItem.team || "Takım Yok"}</p>

              <div className="w-full space-y-2 text-sm border-t border-zinc-800 pt-4">
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Oyuncu</span>
                  <span className="font-bold">{leftItem.player || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Çözünürlük</span>
                  <span className="font-bold">{leftItem.resolution || "1280x960"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">DPI</span>
                  <span className="font-bold">{leftItem.dpi || 800}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Sens</span>
                  <span className="font-bold">{leftItem.sensitivity || 1.2}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sağ Kart */}
          {rightItem && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center">
              <img
                src={`/crosshairs/${rightItem.name.toLowerCase()}.png`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/crosshairs/default.png";
                }}
                alt={rightItem.name}
                className="h-40 object-contain bg-black border border-zinc-800 rounded-2xl p-4 w-full mb-4"
              />
              <h3 className="text-2xl font-bold">{rightItem.name}</h3>
              <p className="text-zinc-400 text-sm mb-4">{rightItem.team || "Takım Yok"}</p>

              <div className="w-full space-y-2 text-sm border-t border-zinc-800 pt-4">
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Oyuncu</span>
                  <span className="font-bold">{rightItem.player || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Çözünürlük</span>
                  <span className="font-bold">{rightItem.resolution || "1280x960"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">DPI</span>
                  <span className="font-bold">{rightItem.dpi || 800}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Sens</span>
                  <span className="font-bold">{rightItem.sensitivity || 1.2}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}