# Progress

## ✅ Tamamlanan
- Proje yapısı oluşturuldu (Vite)
- Memory Bank dosyaları oluşturuldu
- Premium UI (Dark theme, drag & drop)
- Canvas API ile görsel yeniden boyutlandırma
- JPEG ve WebP sıkıştırma (toDataURL ile kalite kontrolü)
- PNG quantization desteği (libimagequant-wasm ile) — Worker bypass edilerek WASM doğrudan kullanılıyor
- PNG quantization dithering desteği (renk kayması azaltıldı)
- Otomatik yeniden işleme (debounce ile)

## 🔄 Devam Eden
- Mevcut sürüm stabil.

## 📋 Yapılacaklar
- Gerekirse ekstra filtreleme veya format destekleri.

## Bilinen Sorunlar
- PNG quantization lossy bir işlemdir, orijinalle birebir renk elde edilemez. Renk doğruluğu kritikse WebP veya JPEG tercih edilmeli.

## ❌ Denendi, Kaldırıldı
- **Watermark silme (LaMa + ONNX Runtime Web)**: Tarayıcıda CPU üzerinde çalışması çok yavaş olduğu için kaldırıldı. WebGPU bu modelle uyumsuz çıktı. Sunucu taraflı bir çözüm olmadan tarayıcıda gerçek zamanlı inpainting mümkün değil.
