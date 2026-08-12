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

    // Dosyayı Vercel Blob'a yükle
    const blob = await put(`crosshairs/${playerSlug}.png`, file, {
      access: 'public',
    });

    return NextResponse.json({
      success: true,
      message: "Görsel başarıyla buluta yüklendi.",
      url: blob.url, // Yüklenen dosyanın internet adresi
    });
  } catch (error) {
    console.error("Vercel Blob yükleme hatası:", error);
    return NextResponse.json({ error: "Görsel kaydedilemedi." }, { status: 500 });
  }
}