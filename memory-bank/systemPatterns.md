# System Patterns

## Mimari
Tek sayfa uygulaması (SPA), tamamen client-side.

```
index.html → style.css + main.js
                           ↓
             FileReader API → Image → Canvas → Blob → Download
                                         ↓
                              PNG: libimagequant-wasm (WASM, ana thread)
                              JPEG/WebP: Canvas toDataURL
```

## Tasarım Kalıpları
- **Event-driven**: Dosya yükleme, input değişiklikleri, buton tıklamaları
- **Pipeline**: Upload → Resize → Compress → Preview → Download
- **State management**: Basit modül düzeyinde değişkenler (framework yok)
- **Lazy WASM init**: `ensureWasm()` ile WASM bir kez init edilir, sonraki çağrılarda tekrar yüklenmez

## Bileşen İlişkileri
- Upload bölümü → orijinal görseli yükler
- Controls bölümü → genişlik/yükseklik/kalite/format parametrelerini alır
- Preview bölümü → işlenmiş görseli canvas üzerinde gösterir
- Download bölümü → blob'u indirir

## Önemli Kararlar
- `libimagequant-wasm` wrapper'ı (`LibImageQuant`) bypass edildi — Worker WASM path sorunu nedeniyle
- PNG output için `result.pngBytes` (indexed PNG) direkt Blob'a çevriliyor, canvas round-trip yok
