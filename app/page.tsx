export default function Home() {
  const crosshairs = [
    {
      id: 1,
      name: "Faceit",
      code: "CSGO-xxxxx-xxxxx-xxxxx",
    },
    {
      id: 2,
      name: "Premier",
      code: "CSGO-yyyyy-yyyyy-yyyyy",
    },
    {
      id: 3,
      name: "AWP",
      code: "CSGO-zzzzz-zzzzz-zzzzz",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold mb-2">CS2 Crosshairs</h1>
        <p className="text-gray-400 mb-8">
          My personal crosshair database
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
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}