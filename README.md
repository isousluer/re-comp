# Re-Comp

![Re-Comp](https://img.shields.io/badge/Re--Comp-Image_Optimizer-818cf8?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=for-the-badge)

**Re-Comp** is a fast, modern web app for resizing and compressing images entirely in your browser — no uploads, no servers, 100% private.

## ✨ Features

- **100% Client-Side** — Images never leave your browser
- **Resize** — Set width or height with aspect ratio lock
- **JPEG & WebP Compression** — Adjustable quality via Canvas API
- **PNG Quantization** — Lossy PNG optimization using `libimagequant-wasm` (WebAssembly), with dithering support
- **Live Preview** — See file size difference instantly
- **Persistent Settings** — Quality, format and aspect ratio lock saved to localStorage
- **Custom Filename** — Edit the output filename before downloading
- **Premium UI** — Dark theme with glassmorphism details

## 🛠 Tech Stack

- **Architecture**: Vanilla JavaScript + HTML5 + CSS3 (Zero Framework)
- **Build Tool**: Vite.js
- **Image Engines**: Browser Canvas API (`toDataURL`), WebAssembly-powered `libimagequant-wasm`
- **Fonts**: Inter (Google Fonts)

## 🚀 Getting Started

Node.js is required.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens http://localhost:3000

# Build for production
npm run build
```

## 📄 License

This project is open for personal and commercial use. Feel free to fork and customize.
