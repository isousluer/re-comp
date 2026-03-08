# Tech Context

## Teknoloji Yığını
- **Build Tool**: Vite 6.x (vanilla template)
- **Dil**: Vanilla JavaScript (ES Modules)
- **Styling**: Vanilla CSS
- **Görsel İşleme**: Canvas API (tarayıcı yerleşik)
- **Font**: Inter (Google Fonts)

## Bağımlılıklar
- `vite` — sadece geliştirme bağımlılığı
- Harici kütüphane yok

## Geliştirme
```bash
npm install
npm run dev    # localhost:3000
npm run build  # production build
```

## Teknik Kısıtlar
- Tamamen client-side, sunucu tarafı işlem yok
- Tarayıcı Canvas API limitleri (çok büyük görsellerde bellek kısıtı)
- Çıktı formatları: JPEG, WebP
