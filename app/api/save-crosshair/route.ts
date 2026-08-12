import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const playerSlug = (formData.get("playerSlug") as string) || "custom-crosshair";

    if (!file) {
      return NextResponse.json({ error: "Görsel dosyası bulunamadı." }, { status: 400 });
    }

    // Doğrudan Vercel Blob depolama alanına yükler
    const blob = await put(`crosshairs/${playerSlug}.png`, file, {
      access: 'public',
      allowOutsidePublicDir: true,
      overwrite: true,
    });

    return NextResponse.json({
      success: true,
      message: "Görsel başarıyla buluta kaydedildi.",
      url: blob.url,
    });
  } catch (error) {
    console.error("Vercel Blob yükleme hatası:", error);
    return NextResponse.json({ error: "Görsel kaydedilemedi." }, { status: 500 });
  }
}