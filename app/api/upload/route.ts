import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Fotoğraf yok" },
        { status: 400 }
      );
    }


    const buffer = Buffer.from(
      await file.arrayBuffer()
    );


    const image = sharp(buffer);

    const metadata = await image.metadata();


    const width = metadata.width!;
    const height = metadata.height!;


    // Kare crop için küçük olanı al
    const size = Math.min(width, height);


    const output = await image
      .extract({
        left: Math.floor((width - size) / 2),
        top: Math.floor((height - size) / 2),
        width: size,
        height: size,
      })
      .resize(512, 512)
      .png()
      .toBuffer();



    return new NextResponse(output, {
      headers: {
        "Content-Type": "image/png",
      },
    });


  } catch (error) {

    console.log(error);

    return NextResponse.json(
      { error: "Hata oluştu" },
      { status: 500 }
    );

  }
}