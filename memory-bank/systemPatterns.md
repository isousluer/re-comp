# System Patterns

## Mimari
Tek sayfa uygulaması (SPA), tamamen client-side.

```
index.html → style.css + main.js
                           ↓
             FileReader API → Image → Canvas → Blob → Download
```

## Tasarım Kalıpları
- **Event-driven**: Dosya yükleme, input değişiklikleri, buton tıklamaları
- **Pipeline**: Upload → Resize → Compress → Preview → Download
- **State management**: Basit modül düzeyinde değişkenler (framework yok)

## Bileşen İlişkileri
- Upload bölümü → orijinal görseli yükler
- Controls bölümü → genişlik/yükseklik/kalite parametrelerini alır
- Preview bölümü → işlenmiş görseli gösterir
- Download bölümü → blob'u indirir
