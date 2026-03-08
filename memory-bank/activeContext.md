# Active Context

## Mevcut Odak
Uygulama stabil, tüm core özellikler çalışıyor.

## Son Değişiklikler
- `libimagequant-wasm` PNG quantization düzeltildi: Worker/WASM path sorunu nedeniyle sıkıştırma çalışmıyordu. `LibImageQuant` wrapper bypass edilerek WASM modülü (`ImageQuantizer`, `encode_palette_to_png`) doğrudan ana thread'de import edildi.
- PNG quantization'a `setDithering(1.0)` eklendi — renk kayması hissi azaltıldı.
- PNG format uyarı mesajı güncellendi: lossy işlem olduğu ve renk doğruluğu kritikse WebP/JPEG tercih edilmesi gerektiği belirtiliyor.
- Watermark silme özelliği (LaMa + ONNX Runtime Web) denendi, tarayıcıda CPU üzerinde çok yavaş çalıştığı için projeden kaldırıldı.

## Sonraki Adımlar
- Kod optimizasyonları ve ileriki sürüm planları
- İsteğe bağlı olarak ek filtre veya ayarlar eklenebilir
