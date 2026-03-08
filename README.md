# Re-Comp

![Re-Comp Icon/Logo](https://img.shields.io/badge/Re--Comp-Image_Optimizer-818cf8?style=for-the-badge)

Re-Comp, kullanıcıların blog ve web siteleri için görsellerini yerel olarak (istemci tarafında) yeniden boyutlandırabilmesini ve sıkıştırabilmesini sağlayan hızlı ve modern bir web uygulamasıdır. Tüm işlemler tarayıcınızın içinde gerçekleşir, böylece görselleriniz hiçbir zaman harici bir sunucuya yüklenmez (100% Gizlilik).

## 🚀 Özellikler

- **Bölgesel ve Yerel (Local) İşlem:** Görseller sadece tarayıcınızda işlenir, sunucuya yüklenmez.
- **Yeniden Boyutlandırma:** İster genişlik ister yükseklik ayarlayarak ölçüleri küçültün veya büyütün. En-boy (aspect ratio) kilit desteği dahildir.
- **Gelişmiş Sıkıştırma (Compression):** 
  - **JPEG ve WebP:** Dahili Canvas API'si kullanılarak ayarlanabilir kalite ile yüksek oranda kayıplı sıkıştırma (Lossy Compression).
  - **PNG Quantization:** `libimagequant-wasm` tabanlı yeni nesil renk paleti daraltma (Lossy PNG Optimization) algoritması ile şeffaflığı koruyan sıkıştırma.
- **Anında Önizleme:** Ayarlarla oynadıkça yeni ve eski boyut farkını, kaliteyi anında görün.
- **Premium Tasarım:** Dark-mode tabanlı, Glassmorphism detaylara sahip pürüzsüz arayüz ve kullanıcı deneyimi.

## 🛠 Kullanılan Teknolojiler

- **Mimari:** Vanilla JavaScript + HTML5 + CSS3 (Zero Framework)
- **Geliştirme Ortamı:** Vite.js
- **Görsel İşleme Motorları:** Tarayıcı Dahili Canvas API (`toDataURL`), WebAssembly destekli `libimagequant-wasm`
- **Tasarım / Fontlar:** Google Fonts (Inter)

## 📦 Kurulum ve Çalıştırma

Geliştirme makinenizde projeyi çalıştırmak için Node.js'in bilgisayarınızda kurulu olması gerekmektedir.

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   *Tarayıcınızda otomatik olarak `http://localhost:3000` adresi açılacaktır.*

3. **Production (Üretim) Ortamına Derleme:**
   ```bash
   npm run build
   ```
   *`dist/` klasörü içinde statik ve optimize dosyalar yer alacaktır.*

## 📖 Memory Bank (Dokümantasyon)
Projedeki mimari, alınan kararlar ve teknik detaylarla ilgili daha fazla bilgi edinmek için projenin kök dizinindeki `memory-bank` klasörüne göz atabilirsiniz.

## 📄 Lisans
Bu proje geliştirilmeye açıktır. Kaynak kodlarına herhangi bir ticari veya özel amaca göre şekillendirme yapabilirsiniz.
