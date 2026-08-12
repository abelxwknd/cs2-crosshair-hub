"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !code) {
      toast.error("Lütfen Crosshair Adı ve Kod alanlarını doldurun!");
      return;
    }

    setLoading(true);

    // KODU BURAYA YERLEŞTİRDİK:
    const slugValue = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const { error } = await supabase.from("approved_crosshairs").insert([
      {
        name: name,
        slug: slugValue,
        code: code,
        player: player || null,
        team: team || null,
        likes: 0,
        views: 0,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Gönderim Hatası:", error);
      toast.error("Gönderilemedi: " + error.message);
    } else {
      toast.success("Crosshair başarıyla gönderildi ve ana sayfaya eklendi!");
      setName("");
      setCode("");
      setPlayer("");
      setTeam("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      <Toaster position="top-center" />

      {/* HEADER */}
      <header className="border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-black text-red-500">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* FORM SECTION */}
      <div className="max-w-xl mx-auto pt-12 px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">Crosshair Paylaş</h1>
          <p className="text-xs text-zinc-400 mb-6">
            Kendi nişangahını veya bir pro oyuncunun nişangahını toplulukla paylaş.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Crosshair Adı / Başlık *
              </label>
              <input
                type="text"
                placeholder="Örn: s1mple CS2 Crosshair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-red-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Oyuncu (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: s1mple"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Takım (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: NAVI"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Crosshair Kodu *
              </label>
              <textarea
                rows={4}
                placeholder="CSGO-XXXXX-... veya cl_crosshair..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm font-mono text-white focus:border-red-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition mt-4"
            >
              {loading ? "Gönderiliyor..." : "Crosshair Gönder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}