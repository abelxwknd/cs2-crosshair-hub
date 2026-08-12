"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface CrosshairItem {
  id: number;
  name: string;
  player?: string;
  team?: string;
  code: string;
  likes?: number;
}

interface ModeratorItem {
  id: number;
  username: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  
  const [pendingCrosshairs, setPendingCrosshairs] = useState<CrosshairItem[]>([]);
  const [approvedCrosshairs, setApprovedCrosshairs] = useState<CrosshairItem[]>([]);
  const [moderatorsList, setModeratorsList] = useState<ModeratorItem[]>([]);
  
  const [name, setName] = useState("");
  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [newModUsername, setNewModUsername] = useState("");
  const [newModPassword, setNewModPassword] = useState("");
  const [modLoading, setModLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) return alert("Kullanıcı adı ve şifre giriniz!");

    const { data, error } = await supabase
      .from("moderators")
      .select("*")
      .eq("username", usernameInput)
      .eq("password", passwordInput)
      .single();

    if (error || !data) {
      alert("Hatalı kullanıcı adı veya şifre!");
    } else {
      setIsAuthenticated(true);
      setCurrentUsername(data.username);
      fetchData();
    }
  };

  const fetchData = async () => {
    // Bekleyen nişangahlar
    const { data: pending } = await supabase
      .from("approved_crosshairs")
      .select("*")
      .eq("status", "pending")
      .order("id", { ascending: false });

    if (pending) setPendingCrosshairs(pending);

    // Yayındaki nişangahlar
    const { data: approved } = await supabase
      .from("approved_crosshairs")
      .select("*")
      .eq("status", "approved")
      .order("id", { ascending: false });

    if (approved) setApprovedCrosshairs(approved);

    // Moderatör listesi (Sadece admin görecek ama veri her zaman çekilebilir)
    const { data: mods } = await supabase
      .from("moderators")
      .select("id, username")
      .order("id", { ascending: true });

    if (mods) setModeratorsList(mods);
  };

  const handleAddDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return alert("Nişangah adı ve kodu zorunludur!");

    setLoading(true);
    const { error } = await supabase
      .from("approved_crosshairs")
      .insert([{ 
        name, 
        player: player || null, 
        team: team || null, 
        code, 
        status: "approved",
        likes: 0 
      }]);

    setLoading(false);

    if (!error) {
      alert("Nişangah başarıyla doğrudan yayınlandı!");
      setName("");
      setPlayer("");
      setTeam("");
      setCode("");
      fetchData();
    } else {
      alert("Bir hata oluştu: " + error.message);
    }
  };

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModUsername || !newModPassword) return alert("Tüm alanları doldurun!");

    setModLoading(true);
    const { error } = await supabase
      .from("moderators")
      .insert([{ username: newModUsername, password: newModPassword }]);

    setModLoading(false);

    if (!error) {
      alert(`Moderatör başarıyla oluşturuldu: ${newModUsername}`);
      setNewModUsername("");
      setNewModPassword("");
      fetchData();
    } else {
      alert("Hata oluştu (Bu kullanıcı adı zaten alınmış olabilir): " + error.message);
    }
  };

  const handleDeleteModerator = async (modId: number, modName: string) => {
    if (modName === "watson") {
      return alert("Ana admin hesabını buradan silemezsin!");
    }
    if (!confirm(`"${modName}" adlı moderatörün yetkisini kaldırmak istediğinize emin misiniz?`)) return;

    const { error } = await supabase
      .from("moderators")
      .delete()
      .eq("id", modId);

    if (!error) {
      fetchData();
    } else {
      alert("Moderatör silinirken hata oluştu: " + error.message);
    }
  };

  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from("approved_crosshairs")
      .update({ status: "approved" })
      .eq("id", id);

    if (!error) fetchData();
  };

  const handleDeletePending = async (id: number) => {
    if (!confirm("Bu nişangahı reddetmek istediğinize emin misiniz?")) return;

    const { error } = await supabase
      .from("approved_crosshairs")
      .delete()
      .eq("id", id);

    if (!error) fetchData();
  };

  // Hem senin hem moderatörlerin yayındakileri silebilmesi için ortak fonksiyon
  const handleDeleteApproved = async (id: number) => {
    if (!confirm("Bu nişangahı tamamen siteden kaldırmak istediğinize emin misiniz?")) return;

    const { error } = await supabase
      .from("approved_crosshairs")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchData();
    } else {
      alert("Kaldırılırken hata oluştu: " + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />
        
        <form onSubmit={handleLogin} className="relative z-10 bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-xl">
              🛡️
            </div>
            <h1 className="text-2xl font-black">Yönetim Paneli Girişi</h1>
            <p className="text-xs text-zinc-400">Devam etmek için bilgilerinizi girin.</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition"
            />
            <input
              type="password"
              placeholder="Şifre"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition"
            />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 font-bold py-3 rounded-2xl transition shadow-lg shadow-red-600/20 text-sm">
              Giriş Yap
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-6 sm:p-10 pb-20">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Üst Bar */}
        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">🛡️ Yönetim Paneli</h1>
            <p className="text-xs text-zinc-400 mt-1">Hoş geldin, <span className="text-red-400 font-bold">{currentUsername}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition border border-zinc-800"
            >
              Ana Sayfa
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-semibold transition border border-red-500/20"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* SADECE SENİN (watson) GÖREBİLECEĞİN MODERATÖR YÖNETİMİ ALANI */}
        {currentUsername === "watson" && (
          <div className="bg-zinc-900/60 border border-red-500/30 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 shadow-lg shadow-red-500/5">
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>👑</span> Moderatör Yönetimi
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Arkadaşın için yeni hesap oluşturabilir veya mevcut moderatörleri silebilirsin.</p>
            </div>

            {/* Yeni Ekleme Formu */}
            <form onSubmit={handleAddModerator} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Moderatör Kullanıcı Adı"
                value={newModUsername}
                onChange={(e) => setNewModUsername(e.target.value)}
                className="bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition"
              />
              <input
                type="password"
                placeholder="Moderatör Şifresi"
                value={newModPassword}
                onChange={(e) => setNewModPassword(e.target.value)}
                className="bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition"
              />
              <button
                type="submit"
                disabled={modLoading}
                className="sm:col-span-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-2xl transition text-sm flex items-center justify-center gap-2 border border-zinc-700"
              >
                <span>{modLoading ? "Oluşturuluyor..." : "👤 Yeni Moderatör Hesabı Oluştur"}</span>
              </button>
            </form>

            {/* Mevcut Moderatörler Listesi */}
            <div className="border-t border-zinc-800 pt-5 space-y-3">
              <h3 className="text-sm font-bold text-zinc-300">Kayıtlı Hesaplar ({moderatorsList.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {moderatorsList.map((mod) => (
                  <div key={mod.id} className="bg-black/40 border border-zinc-800/80 p-3 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      👤 {mod.username} {mod.username === "watson" && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-1">Admin</span>}
                    </span>
                    {mod.username !== "watson" && (
                      <button
                        onClick={() => handleDeleteModerator(mod.id, mod.username)}
                        className="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-bold transition"
                      >
                        Yetkiyi Kaldır ❌
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nişangah Ekleme Formu */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-5">
          <div>
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <span>⚡</span> Yeni Nişangah Ekle (Direkt Yayınla)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Bu alandan eklediğiniz nişangahlar doğrudan anasayfada yayınlanır.</p>
          </div>

          <form onSubmit={handleAddDirect} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nişangah İsmi (Örn: Donk Style)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition"
            />
            <input
              type="text"
              placeholder="Oyuncu (İsteğe bağlı, Örn: donk)"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition"
            />
            <input
              type="text"
              placeholder="Takım (İsteğe bağlı, Örn: Team Spirit)"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition"
            />
            <input
              type="text"
              placeholder="CS2 Nişangah Kodu (CSGO-...)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/80 transition font-mono text-xs"
            />
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-red-600/20 text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? "Ekleniyor..." : "➕ Nişangahı Yayınla"}</span>
            </button>
          </form>
        </div>

        {/* Onay Bekleyenler */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>⏳</span> Onay Bekleyenler 
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                {pendingCrosshairs.length}
              </span>
            </h2>
          </div>

          {pendingCrosshairs.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl text-zinc-500 text-sm">
              Şu an onay bekleyen nişangah bulunmuyor. 🎉
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingCrosshairs.map((item) => (
                <div key={item.id} className="bg-zinc-900/50 border border-zinc-800/80 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{item.name}</h3>
                      <span className="text-xs text-zinc-500 font-mono">#{item.id}</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {item.player ? `👤 ${item.player}` : "Topluluk"} {item.team ? `• ${item.team}` : ""}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono bg-black/40 border border-zinc-800/60 p-2 rounded-xl mt-2 max-w-xl truncate">
                      {item.code}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
                    >
                      Onayla ✅
                    </button>
                    <button
                      onClick={() => handleDeletePending(item.id)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition"
                    >
                      Reddet ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yayındaki Nişangahlar (Hem Admin hem Moderatörler Silebilir) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>🌐</span> Yayındaki Nişangahlar 
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full">
                {approvedCrosshairs.length}
              </span>
            </h2>
          </div>

          {approvedCrosshairs.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl text-zinc-500 text-sm">
              Yayında hiç nişangah yok.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {approvedCrosshairs.map((item) => (
                <div key={item.id} className="bg-zinc-900/30 border border-zinc-800/60 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base">{item.name}</h3>
                    <p className="text-xs text-zinc-400">
                      {item.player ? `👤 ${item.player}` : "Topluluk"} {item.team ? `• ${item.team}` : ""}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono bg-black/40 border border-zinc-800/60 p-2 rounded-xl mt-2 max-w-xl truncate">
                      {item.code}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-semibold">
                      Yayında 🟢
                    </span>
                    
                    <button
                      onClick={() => handleDeleteApproved(item.id)}
                      className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition"
                    >
                      Siteden Kaldır 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}