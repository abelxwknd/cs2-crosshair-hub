import { NextResponse } from "next/server";
import { processCrosshair } from "@/lib/crosshairDetector";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "Resim bulunamadı." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uploadedImageBuffer = Buffer.from(arrayBuffer);

    // Görseli işle
    const croppedImageBuffer = await processCrosshair(uploadedImageBuffer);

    // Buffer'ı Uint8Array'e dönüştürerek TypeScript tip hatasını çözüyoruz:
    return new NextResponse(new Uint8Array(croppedImageBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error: any) {
    console.error("Görsel İşleme Hatası:", error);
    return NextResponse.json(
      { error: error?.message || "Görsel işlenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}