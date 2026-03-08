# Changelog

All notable changes to Re-Comp will be documented here.

## [1.1.0] - 2025-03-08

### Added
- Persistent settings via localStorage (quality, format, aspect ratio lock)
- Custom filename input before downloading
- PNG quantization using `libimagequant-wasm` directly in the main thread (bypassing Worker wrapper)
- Dithering support for PNG quantization to reduce color banding

### Fixed
- PNG compression was silently falling back to uncompressed output due to Worker WASM path resolution failure
- Incorrect output range mapping for PNG quantization results

## [1.0.0] - 2025-02-01

### Added
- Initial release
- Image resizing with aspect ratio lock
- JPEG and WebP compression via Canvas API
- Drag & drop and file picker upload
- Live preview with file size comparison
- Dark theme UI
