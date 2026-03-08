/* ============================================
   Re-Comp — Image Resizer & Compressor
   ============================================ */
import initWasm, { ImageQuantizer, encode_palette_to_png } from 'libimagequant-wasm/wasm/libimagequant_wasm.js';

let wasmReady = false;
async function ensureWasm() {
  if (!wasmReady) {
    await initWasm();
    wasmReady = true;
  }
}

// ---------- DOM Elements ----------
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const uploadSection = document.getElementById('upload-section');
const editorSection = document.getElementById('editor-section');

const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const lockRatioBtn = document.getElementById('lock-ratio');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const formatBtns = document.querySelectorAll('.format-btn');

const processBtn = document.getElementById('process-btn');
const downloadBtn = document.getElementById('download-btn');

const originalDimensions = document.getElementById('original-dimensions');
const originalSize = document.getElementById('original-size');
const resultDimensions = document.getElementById('result-dimensions');
const resultSize = document.getElementById('result-size');
const resultSavings = document.getElementById('result-savings');
const resultInfo = document.getElementById('result-info');

const previewCanvas = document.getElementById('preview-canvas');
const previewPlaceholder = document.getElementById('preview-placeholder');

// ---------- State ----------
let state = {
  originalImage: null,     // HTMLImageElement
  originalFile: null,      // File object
  aspectRatio: 1,
  lockRatio: true,
  outputFormat: 'image/jpeg',
  processedBlob: null,     // Blob after processing
  isProcessing: false,
  lastChangedDimension: 'width',  // Track which dimension was last changed
};

// ---------- Utilities ----------
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileExtension(format) {
  const map = {
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/png': 'png',
  };
  return map[format] || 'jpg';
}

// ---------- File Upload ----------
browseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

dropZone.addEventListener('click', () => {
  fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    loadImage(file);
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    loadImage(file);
  }
});

function loadImage(file) {
  state.originalFile = file;
  state.processedBlob = null;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.originalImage = img;
      state.aspectRatio = img.naturalWidth / img.naturalHeight;

      // Update UI
      originalDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
      originalSize.textContent = formatFileSize(file.size);

      // Set default values
      widthInput.value = img.naturalWidth;
      heightInput.value = img.naturalHeight;

      // Show upload thumbnail
      showUploadThumbnail(file, img);

      // Show editor
      editorSection.classList.remove('hidden');

      // Reset results
      downloadBtn.classList.add('hidden');
      resultInfo.classList.add('hidden');
      previewCanvas.classList.add('hidden');
      previewPlaceholder.classList.remove('hidden');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function showUploadThumbnail(file, img) {
  uploadSection.classList.add('has-image');
  const dropContent = dropZone.querySelector('.drop-zone-content');
  dropContent.innerHTML = `
    <div class="upload-thumbnail-wrapper">
      <img class="upload-thumbnail" src="${img.src}" alt="Yüklenen görsel" />
      <div class="upload-file-info">
        <span class="upload-file-name">${file.name}</span>
        <span class="upload-file-meta">${img.naturalWidth} × ${img.naturalHeight} · ${formatFileSize(file.size)}</span>
        <button class="upload-change-btn" type="button">Değiştir</button>
      </div>
    </div>
  `;
  dropContent.querySelector('.upload-change-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });
}

// ---------- Dimension Controls ----------
widthInput.addEventListener('input', () => {
  state.lastChangedDimension = 'width';
  if (state.lockRatio && state.originalImage) {
    const w = parseInt(widthInput.value) || 0;
    heightInput.value = Math.round(w / state.aspectRatio);
  }
  scheduleAutoProcess();
});

heightInput.addEventListener('input', () => {
  state.lastChangedDimension = 'height';
  if (state.lockRatio && state.originalImage) {
    const h = parseInt(heightInput.value) || 0;
    widthInput.value = Math.round(h * state.aspectRatio);
  }
  scheduleAutoProcess();
});

lockRatioBtn.addEventListener('click', () => {
  state.lockRatio = !state.lockRatio;
  lockRatioBtn.classList.toggle('active', state.lockRatio);

  // When locking, recalculate based on last changed dimension
  if (state.lockRatio && state.originalImage) {
    if (state.lastChangedDimension === 'width') {
      const w = parseInt(widthInput.value) || 0;
      heightInput.value = Math.round(w / state.aspectRatio);
    } else {
      const h = parseInt(heightInput.value) || 0;
      widthInput.value = Math.round(h * state.aspectRatio);
    }
  }
});

// ---------- Quality Slider ----------
let autoProcessTimer = null;

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = `${qualitySlider.value}%`;
  updateSliderTrack();
  scheduleAutoProcess();
});

function updateSliderTrack() {
  const val = qualitySlider.value;
  const pct = ((val - 1) / 99) * 100;
  qualitySlider.style.background = `linear-gradient(to right, var(--accent-1) 0%, var(--accent-2) ${pct}%, var(--bg-input) ${pct}%)`;
}
updateSliderTrack();

// ---------- Format Selection ----------
const pngWarning = document.getElementById('png-warning');

formatBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    formatBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.outputFormat = btn.dataset.format;
    updateQualityState();
    scheduleAutoProcess();
  });
});

function updateQualityState() {
  const isPng = state.outputFormat === 'image/png';
  if (pngWarning) {
    if (isPng) {
      pngWarning.innerHTML = 'PNG sıkıştırması kayıplıdır (quantization). Renk doğruluğu kritikse WebP veya JPEG tercih edin.';
      pngWarning.classList.remove('hidden');
      pngWarning.style.color = 'var(--warning)';
      pngWarning.style.borderLeftColor = 'var(--warning)';
    } else {
      pngWarning.classList.add('hidden');
    }
  }
  qualitySlider.disabled = false;
  qualityValue.classList.remove('disabled');
}

// ---------- Auto Process (debounced) ----------
function scheduleAutoProcess() {
  // Yalnızca daha önce en az bir kez işlendiyse otomatik yeniden işle
  if (!state.originalImage || !state.processedBlob) return;
  clearTimeout(autoProcessTimer);
  autoProcessTimer = setTimeout(() => {
    triggerProcess();
  }, 300);
}

function triggerProcess() {
  if (!state.originalImage || state.isProcessing) return;

  const targetWidth = parseInt(widthInput.value);
  const targetHeight = parseInt(heightInput.value);

  if (!targetWidth || !targetHeight || targetWidth < 1 || targetHeight < 1) {
    return;
  }

  state.isProcessing = true;
  processBtn.classList.add('processing');

  // Use requestAnimationFrame to let the UI update first
  requestAnimationFrame(() => {
    processImage(targetWidth, targetHeight);
  });
}

// ---------- Process Image ----------
processBtn.addEventListener('click', () => {
  triggerProcess();
});

/**
 * dataURL'den Blob oluşturur — toBlob'dan daha güvenilir kalite kontrolü sağlar
 */
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

async function processImage(targetWidth, targetHeight) {
  const quality = parseInt(qualitySlider.value) / 100;

  // Create offscreen canvas for processing
  const offscreen = document.createElement('canvas');
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const ctx = offscreen.getContext('2d');

  // High quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw resized image
  ctx.drawImage(state.originalImage, 0, 0, targetWidth, targetHeight);

  const format = state.outputFormat;
  let blob;

  if (format === 'image/png') {
    // libimagequant-wasm ile PNG quantization
    try {
      await ensureWasm();
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const targetQuality = Math.max(10, Math.round(quality * 100));
      const minQuality = Math.max(0, targetQuality - 20);

      const quantizer = new ImageQuantizer();
      quantizer.setSpeed(3);
      quantizer.setQuality(minQuality, targetQuality);
      quantizer.setMaxColors(256);

      const quantResult = quantizer.quantizeImage(imageData.data, targetWidth, targetHeight);
      quantResult.setDithering(1.0);
      const paletteIndices = quantResult.getPaletteIndices(imageData.data, targetWidth, targetHeight);
      const palette = quantResult.getPalette();
      const pngBytes = encode_palette_to_png(paletteIndices, palette, targetWidth, targetHeight);

      quantResult.free();
      quantizer.free();

      blob = new Blob([pngBytes], { type: 'image/png' });
    } catch (err) {
      console.error("PNG Quantization Error:", err);
      const dataURL = offscreen.toDataURL('image/png');
      blob = dataURLtoBlob(dataURL);
    }
  } else {
    // JPEG ve WebP — kalite parametresi (0.0 - 1.0) uygulanır
    const dataURL = offscreen.toDataURL(format, quality);
    blob = dataURLtoBlob(dataURL);
  }

  state.processedBlob = blob;
  state.isProcessing = false;
  processBtn.classList.remove('processing');

  // Draw preview — blob'dan oluşturulan görseli önizlemeye çiz
  const previewImg = new Image();
  previewImg.onload = () => {
    const previewCtx = previewCanvas.getContext('2d');
    previewCanvas.width = targetWidth;
    previewCanvas.height = targetHeight;
    previewCtx.drawImage(previewImg, 0, 0);
    URL.revokeObjectURL(previewImg.src);
  };
  previewImg.src = URL.createObjectURL(blob);

  previewCanvas.classList.remove('hidden');
  previewPlaceholder.classList.add('hidden');

  // Update result info
  resultDimensions.textContent = `${targetWidth} × ${targetHeight}`;
  resultSize.textContent = formatFileSize(blob.size);

  const savings = ((1 - blob.size / state.originalFile.size) * 100).toFixed(1);
  if (savings > 0) {
    resultSavings.textContent = `${savings}% küçültüldü`;
    resultSavings.style.color = '';
  } else {
    resultSavings.textContent = `${Math.abs(savings)}% büyüdü`;
    resultSavings.style.color = 'var(--warning)';
  }

  resultInfo.classList.remove('hidden');
  downloadBtn.classList.remove('hidden');

  // Debug log
  console.log(`[Re-Comp] Format: ${format}, Kalite: ${(quality * 100).toFixed(0)}%, Orijinal: ${formatFileSize(state.originalFile.size)}, Yeni: ${formatFileSize(blob.size)}`);
}

// ---------- Download ----------
downloadBtn.addEventListener('click', () => {
  if (!state.processedBlob) return;

  const ext = getFileExtension(state.outputFormat);
  const originalName = state.originalFile.name.replace(/\.[^.]+$/, '');
  const filename = `${originalName}_recomp.${ext}`;

  const url = URL.createObjectURL(state.processedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
