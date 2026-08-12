import sharp from "sharp";

const ROI_SIZE = 100;
const MAX_COMPONENT_DIAMETER = 40; // crosshair parçası bundan büyük olamaz (px)
const MIN_COMPONENT_AREA = 3;
const MAX_COMPONENT_AREA = 400;
const CROP_SIZE = 80;
const OUTPUT_SIZE = 600;

function rgbToHsv(r: number, g: number, b: number) {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rf) h = ((gf - bf) / d) % 6;
    else if (max === gf) h = (bf - rf) / d + 2;
    else h = (rf - gf) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function isCrosshairColor(r: number, g: number, b: number): boolean {
  const { h, s, v } = rgbToHsv(r, g, b);

  // Beyaz: düşük doygunluk, çok yüksek parlaklık, kanallar birbirine çok yakın.
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  const isWhite = v > 0.85 && s < 0.15 && maxc - minc < 12;
  if (isWhite) return true;

  // Diğer crosshair renkleri: YÜKSEK doygunluk şart.
  // Harita dokuları (kum, taş, çim, gölge) neredeyse hiçbir zaman bu kadar
  // doygun olmaz, bu yüzden bu eşik en önemli filtre.
  if (s < 0.45 || v < 0.35) return false;

  const isGreen = h >= 80 && h <= 170;
  const isCyan = h > 170 && h <= 200;
  const isYellow = h >= 40 && h < 80;
  const isRed = h < 15 || h > 345;

  return isGreen || isCyan || isYellow || isRed;
}

interface Component {
  pixels: { x: number; y: number }[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function findComponents(mask: Uint8Array, size: number): Component[] {
  const visited = new Uint8Array(size * size);
  const components: Component[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      if (!mask[idx] || visited[idx]) continue;

      // Flood fill (4 yönlü komşuluk) ile bağlantılı bileşeni bul
      const stack: { x: number; y: number }[] = [{ x, y }];
      visited[idx] = 1;
      const pixels: { x: number; y: number }[] = [];
      let minX = x, maxX = x, minY = y, maxY = y;

      while (stack.length) {
        const p = stack.pop()!;
        pixels.push(p);
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;

        const neighbors = [
          { x: p.x + 1, y: p.y },
          { x: p.x - 1, y: p.y },
          { x: p.x, y: p.y + 1 },
          { x: p.x, y: p.y - 1 },
        ];
        for (const n of neighbors) {
          if (n.x < 0 || n.x >= size || n.y < 0 || n.y >= size) continue;
          const nIdx = n.y * size + n.x;
          if (mask[nIdx] && !visited[nIdx]) {
            visited[nIdx] = 1;
            stack.push(n);
          }
        }
      }

      components.push({ pixels, minX, maxX, minY, maxY });
    }
  }

  return components;
}

/**
 * CS2 Ekran görüntüsünden Crosshair'in kendisini dinamik tespit eder ve merkeze kilitler.
 * HSV doygunluk eşiği + bağlantılı bileşen (connected component) analizi kullanır,
 * bu sayede kum/taş/çim gibi geniş arkaplan dokularının merkezi yanlış yöne çekmesi engellenir.
 */
export async function processCrosshair(inputBuffer: Buffer): Promise<Buffer> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 1280;
  const height = metadata.height || 1024;

  const roiLeft = Math.round((width - ROI_SIZE) / 2);
  const roiTop = Math.round((height - ROI_SIZE) / 2);

  const { data, info } = await sharp(inputBuffer)
    .extract({ left: roiLeft, top: roiTop, width: ROI_SIZE, height: ROI_SIZE })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 1. HSV eşiğine uyan pikselleri maskeye işaretle
  const mask = new Uint8Array(info.width * info.height);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      if (isCrosshairColor(data[idx], data[idx + 1], data[idx + 2])) {
        mask[y * info.width + x] = 1;
      }
    }
  }

  // 2. Bağlantılı bileşenleri bul
  const components = findComponents(mask, info.width);

  const roiCenterX = info.width / 2;
  const roiCenterY = info.height / 2;

  // 3. Crosshair'e uygun boyuttaki (ne çok küçük ne çok büyük) bileşenler arasından
  // ROI merkezine EN YAKIN olanı seç. Arkaplan dokuları genelde ya çok büyük bir
  // alan kaplar ya da merkeze yeterince yakın bir küme oluşturmaz; bu filtre onları eler.
  let best: Component | null = null;
  let bestDist = Infinity;

  for (const c of components) {
    const w = c.maxX - c.minX + 1;
    const h = c.maxY - c.minY + 1;
    const area = c.pixels.length;

    if (w > MAX_COMPONENT_DIAMETER || h > MAX_COMPONENT_DIAMETER) continue;
    if (area < MIN_COMPONENT_AREA || area > MAX_COMPONENT_AREA) continue;

    let sumX = 0, sumY = 0;
    for (const p of c.pixels) {
      sumX += p.x;
      sumY += p.y;
    }
    const cx = sumX / c.pixels.length;
    const cy = sumY / c.pixels.length;

    const dist = Math.hypot(cx - roiCenterX, cy - roiCenterY);
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }

  let centerXInRoi = roiCenterX;
  let centerYInRoi = roiCenterY;

  // Bulunan en iyi bileşen, ROI merkezine makul mesafede mi? Değilse geometrik merkeze güven.
  if (best && bestDist <= MAX_COMPONENT_DIAMETER) {
    let sumX = 0, sumY = 0;
    for (const p of best.pixels) {
      sumX += p.x;
      sumY += p.y;
    }
    centerXInRoi = sumX / best.pixels.length;
    centerYInRoi = sumY / best.pixels.length;
  }

  const crosshairCenterX = Math.round(roiLeft + centerXInRoi);
  const crosshairCenterY = Math.round(roiTop + centerYInRoi);

  // 4. Kırpma & Büyütme
  const cropLeft = Math.round(crosshairCenterX - CROP_SIZE / 2);
  const cropTop = Math.round(crosshairCenterY - CROP_SIZE / 2);

  return await sharp(inputBuffer)
    .extract({
      left: Math.max(0, Math.min(width - CROP_SIZE, cropLeft)),
      top: Math.max(0, Math.min(height - CROP_SIZE, cropTop)),
      width: CROP_SIZE,
      height: CROP_SIZE,
    })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      kernel: sharp.kernel.nearest,
    })
    .sharpen({ sigma: 1.0 })
    .toBuffer();
}