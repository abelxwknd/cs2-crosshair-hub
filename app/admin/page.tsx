"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const login = () => {
    if (password === "XO2026") {
      setLoggedIn(true);
    } else {
      alert("Şifre yanlış");
    }
  };

  if (loggedIn) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-bold mb-4">
          Admin Panel
        </h1>

        <p>Giriş başarılı.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-xl w-96">
        <h1 className="text-3xl font-bold mb-6">
          Admin Panel
        </h1>

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-zinc-800 mb-4"
        />

        <button
          onClick={login}
          className="w-full bg-red-600 py-3 rounded"
        >
          Giriş Yap
        </button>
      </div>
    </main>
  );
}