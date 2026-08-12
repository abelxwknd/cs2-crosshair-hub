import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const playerSlug = (formData.get("playerSlug") as string) || "custom-crosshair";

    if (!file) {
      return NextResponse.json({ error: "Görsel dosyası bulunamadı." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Kaydedilecek klasör: public/crosshairs
    const targetDir = path.join(process.cwd(), "public", "crosshairs");

    // Klasör yoksa otomatik oluştur
    await fs.mkdir(targetDir, { recursive: true });

    // Dosyayı diske yaz
    const filePath = path.join(targetDir, `${playerSlug}.png`);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: "Görsel başarıyla kaydedildi.",
      path: `/crosshairs/${playerSlug}.png`,
    });
  } catch (error) {
    console.error("Kaydetme sırasında sunucu hatası:", error);
    return NextResponse.json({ error: "Görsel kaydedilemedi." }, { status: 500 });
  }
}