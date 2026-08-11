"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Crosshair = {
  id: number;
  name: string;
  code: string;
};

export default function Home() {
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);

  useEffect(() => {
    loadCrosshairs();
  }, []);

  async function loadCrosshairs() {
    const { data, error } = await supabase
      .from("approved_crosshairs")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setCrosshairs(data);
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Crosshair kodu kopyalandı!");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold mb-2">
          CS2 Crosshairs
        </h1>

        <p className="text-gray-400 mb-8">
          Community Crosshair Database
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {crosshairs.map((crosshair) => (
            <div
              key={crosshair.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <h2 className="text-xl font-semibold">
                {crosshair.name}
              </h2>

              <div className="mt-4 bg-black rounded-lg p-6 flex items-center justify-center">
                <span className="text-red-500 text-3xl">+</span>
              </div>

              <p className="text-gray-400 text-sm mt-4 break-all">
                {crosshair.code}
              </p>

              <button
                onClick={() => copyCode(crosshair.code)}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg"
              >
                Copy Code
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}