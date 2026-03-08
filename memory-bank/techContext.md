# Tech Context

## Teknoloji Yığını
- **Build Tool**: Vite 6.x (vanilla template)
- **Dil**: Vanilla JavaScript (ES Modules)
- **Styling**: Vanilla CSS
- **Görsel İşleme**: Canvas API (tarayıcı yerleşik)
- **PNG Quantization**: `libimagequant-wasm` — WASM modülü doğrudan ana thread'de kullanılıyor
- **Font**: Inter (Google Fonts)

## Bağımlılıklar
- `vite` — sadece geliştirme bağımlılığı
- `libimagequant-wasm` — PNG quantization için runtime bağımlılığı

## PNG Quantization Detayı
`libimagequant-wasm` paketi Worker tabanlı bir wrapper (`LibImageQuant`) sunuyor ancak Worker içindeki WASM path'i `data:` URL context'inde resolve edilemiyor. Bu nedenle wrapper bypass edilerek paketin WASM modülü doğrudan import ediliyor:
```js
import initWasm, { ImageQuantizer, encode_palette_to_png } from 'libimagequant-wasm/wasm/libimagequant_wasm.js';
```

## Geliştirme
```bash
npm install
npm run dev    # localhost:3000
npm run build  # production build
```

## Teknik Kısıtlar
- Tamamen client-side, sunucu tarafı işlem yok
- Tarayıcı Canvas API limitleri (çok büyük görsellerde bellek kısıtı)
- Çıktı formatları: JPEG, WebP, PNG
- Tarayıcıda AI tabanlı inpainting (LaMa vb.) CPU üzerinde çok yavaş — WebGPU desteği modele göre değişiyor
