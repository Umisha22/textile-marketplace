const fileToImage = async (file) => {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
};

export async function extractDominantColors(file, count = 3) {
  const img = await fileToImage(file);
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${r >> 5},${g >> 5},${b >> 5}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.n += 1;
    } else {
      buckets.set(key, { r, g, b, n: 1 });
    }
  }

  return [...buckets.values()]
    .filter((b) => b.n >= 4)
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((b) => {
      const r = Math.round(b.r / b.n);
      const g = Math.round(b.g / b.n);
      const bl = Math.round(b.b / b.n);
      return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    });
}
