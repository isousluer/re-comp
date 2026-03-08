# Progress

## ✅ Tamamlanan
- Proje yapısı oluşturuldu (Vite)
- Memory Bank dosyaları oluşturuldu
- Premium UI (Dark theme, drag & drop)
- Canvas API ile görsel yeniden boyutlandırma
- JPEG ve WebP sıkıştırma (toDataURL ile kalite kontrolü)
- PNG quantization desteği (libimagequant-wasm — WASM doğrudan kullanılıyor)
- PNG quantization dithering desteği
- Otomatik yeniden işleme (debounce ile)
- localStorage ayar kaydı (kalite, format, lockRatio)
- Dosya adı özelleştirme
- Vercel deploy (`recomp.usluer.net`)

## 🔄 Devam Eden
- Mevcut sürüm stabil.

## 📋 Yapılacaklar
- Çoklu görsel yükleme
- Önce/sonra karşılaştırma slider'ı
- AVIF format desteği
- Görsel metadata temizleme (EXIF)

## Bilinen Sorunlar
- PNG quantization lossy bir işlemdir, orijinalle birebir renk elde edilemez.

## ❌ Denendi, Kaldırıldı
- **Watermark silme (LaMa + ONNX Runtime Web)**: Tarayıcıda CPU üzerinde çok yavaş, WebGPU modelle uyumsuz.
- **Dark/light mode toggle**: Projenin dark-only tasarımı korundu.
