/* ============================================
   Re-Comp — Image Resizer & Compressor
   ============================================ */
import initWasm, { ImageQuantizer, encode_palette_to_png } from 'libimagequant-wasm/wasm/libimagequant_wasm.js';
import { zip } from 'fflate';

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
const downloadZipBtn = document.getElementById('download-zip-btn');
const filenameRow = document.getElementById('filename-row');
const filenameInput = document.getElementById('filename-input');
const filenameExt = document.getElementById('filename-ext');
const batchList = document.getElementById('batch-list');

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
  files: [],               // File[]
  originalImage: null,     // HTMLImageElement (tek modda)
  originalFile: null,      // File (tek modda)
  aspectRatio: 1,
  lockRatio: true,
  outputFormat: 'image/jpeg',
  processedBlob: null,
  isProcessing: false,
  lastChangedDimension: 'width',
  isBatch: false,
};

// ---------- Utilities ----------
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileExtension(format) {
  return { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' }[format] || 'jpg';
}

// ---------- File Upload ----------
browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
  if (files.length) handleFiles(files);
});

fileInput.addEventListener('change', () => {
  const files = [...fileInput.files];
  if (files.length) handleFiles(files);
});

function handleFiles(files) {
  state.files = files;
  state.isBatch = files.length > 1;
  state.processedBlob = null;

  if (state.isBatch) {
    loadBatch(files);
  } else {
    loadImage(files[0]);
  }
}

// ---------- Batch Mode ----------
function loadBatch(files) {
  // Show upload thumbnail with file count
  uploadSection.classList.add('has-image');
  const dropContent = dropZone.querySelector('.drop-zone-content');
  const totalSize = files.reduce((s, f) => s + f.size, 0);
  dropContent.innerHTML = `
    <div class="upload-thumbnail-wrapper">
      <div class="batch-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
          <rect x="6" y="12" width="28" height="30" rx="3" stroke="currentColor" stroke-width="2.5"/>
          <rect x="12" y="6" width="28" height="30" rx="3" stroke="currentColor" stroke-width="2.5"/>
        </svg>
      </div>
      <div class="upload-file-info">
        <span class="upload-file-name">${files.length} görsel seçildi</span>
        <span class="upload-file-meta">Toplam: ${formatFileSize(totalSize)}</span>
        <button class="upload-change-btn" type="button">Değiştir</button>
      </div>
    </div>
  `;
  dropContent.querySelector('.upload-change-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  // Reset single-mode info
  originalDimensions.textContent = `${files.length} görsel`;
  originalSize.textContent = formatFileSize(files.reduce((s, f) => s + f.size, 0));

  // Clear width/height (batch uses original dimensions per file)
  widthInput.value = '';
  heightInput.value = '';

  editorSection.classList.remove('hidden');
  downloadBtn.classList.add('hidden');
  downloadZipBtn.classList.add('hidden');
  resultInfo.classList.add('hidden');
  previewCanvas.classList.add('hidden');
  previewPlaceholder.classList.remove('hidden');
  filenameRow.classList.add('hidden');
  batchList.classList.add('hidden');
  batchList.innerHTML = '';
}

// ---------- Single Mode ----------
function loadImage(file) {
  state.originalFile = file;
  state.processedBlob = null;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.originalImage = img;
      state.aspectRatio = img.naturalWidth / img.naturalHeight;

      originalDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
      originalSize.textContent = formatFileSize(file.size);
      widthInput.value = img.naturalWidth;
      heightInput.value = img.naturalHeight;

      showUploadThumbnail(file, img);

      editorSection.classList.remove('hidden');
      downloadBtn.classList.add('hidden');
      downloadZipBtn.classList.add('hidden');
      resultInfo.classList.add('hidden');
      previewCanvas.classList.add('hidden');
      previewPlaceholder.classList.remove('hidden');
      filenameRow.classList.add('hidden');
      batchList.classList.add('hidden');
      batchList.innerHTML = '';
      filenameInput.value = '';
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
  if (state.lockRatio && state.originalImage && !state.isBatch) {
    const w = parseInt(widthInput.value) || 0;
    heightInput.value = Math.round(w / state.aspectRatio);
  }
  scheduleAutoProcess();
});

heightInput.addEventListener('input', () => {
  state.lastChangedDimension = 'height';
  if (state.lockRatio && state.originalImage && !state.isBatch) {
    const h = parseInt(heightInput.value) || 0;
    widthInput.value = Math.round(h * state.aspectRatio);
  }
  scheduleAutoProcess();
});

lockRatioBtn.addEventListener('click', () => {
  state.lockRatio = !state.lockRatio;
  lockRatioBtn.classList.toggle('active', state.lockRatio);
  saveSettings();

  if (state.lockRatio && state.originalImage && !state.isBatch) {
    if (state.lastChangedDimension === 'width') {
      const w = parseInt(widthInput.value) || 0;
      heightInput.value = Math.round(w / state.aspectRatio);
    } else {
      const h = parseInt(heightInput.value) || 0;
      widthInput.value = Math.round(h * state.aspectRatio);
    }
  }
});

// ---------- Settings (localStorage) ----------
const SETTINGS_KEY = 'recomp-settings';

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    quality: qualitySlider.value,
    format: state.outputFormat,
    lockRatio: state.lockRatio,
  }));
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
  if (!saved) return;

  qualitySlider.value = saved.quality;
  qualityValue.textContent = `${saved.quality}%`;
  updateSliderTrack();

  if (saved.format) {
    state.outputFormat = saved.format;
    formatBtns.forEach((b) => b.classList.toggle('active', b.dataset.format === saved.format));
    updateQualityState();
  }

  state.lockRatio = saved.lockRatio ?? true;
  lockRatioBtn.classList.toggle('active', state.lockRatio);
}

// ---------- Quality Slider ----------
let autoProcessTimer = null;

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = `${qualitySlider.value}%`;
  updateSliderTrack();
  scheduleAutoProcess();
  saveSettings();
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
    saveSettings();
    if (filenameRow && !filenameRow.classList.contains('hidden')) {
      filenameExt.textContent = `.${getFileExtension(state.outputFormat)}`;
    }
  });
});

function updateQualityState() {
  const isPng = state.outputFormat === 'image/png';
  if (pngWarning) {
    if (isPng) {
      pngWarning.innerHTML = 'PNG sıkıştırması kayıplıdır (quantization). Renk doğruluğu kritikse WebP veya JPEG tercih edin.';
      pngWarning.classList.remove('hidden');
    } else {
      pngWarning.classList.add('hidden');
    }
  }
  qualitySlider.disabled = false;
  qualityValue.classList.remove('disabled');
}

// ---------- Auto Process ----------
function scheduleAutoProcess() {
  if (!state.originalImage || !state.processedBlob || state.isBatch) return;
  clearTimeout(autoProcessTimer);
  autoProcessTimer = setTimeout(() => triggerProcess(), 300);
}

function triggerProcess() {
  if (state.isProcessing) return;

  if (state.isBatch) {
    triggerBatchProcess();
    return;
  }

  if (!state.originalImage) return;

  const targetWidth = parseInt(widthInput.value);
  const targetHeight = parseInt(heightInput.value);
  if (!targetWidth || !targetHeight || targetWidth < 1 || targetHeight < 1) return;

  state.isProcessing = true;
  processBtn.classList.add('processing');
  requestAnimationFrame(() => processImage(targetWidth, targetHeight));
}

processBtn.addEventListener('click', () => triggerProcess());

// ---------- Core Compress Function ----------
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

async function compressImage(img, targetWidth, targetHeight, format, quality) {
  const offscreen = document.createElement('canvas');
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const ctx = offscreen.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  if (format === 'image/png') {
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

      return new Blob([pngBytes], { type: 'image/png' });
    } catch {
      return dataURLtoBlob(offscreen.toDataURL('image/png'));
    }
  } else {
    return dataURLtoBlob(offscreen.toDataURL(format, quality));
  }
}

// ---------- Single Process ----------
async function processImage(targetWidth, targetHeight) {
  const quality = parseInt(qualitySlider.value) / 100;
  const format = state.outputFormat;

  const blob = await compressImage(state.originalImage, targetWidth, targetHeight, format, quality);

  state.processedBlob = blob;
  state.isProcessing = false;
  processBtn.classList.remove('processing');

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
  downloadZipBtn.classList.add('hidden');
  filenameRow.classList.remove('hidden');
  const baseName = state.originalFile.name.replace(/\.[^.]+$/, '');
  filenameInput.value = `${baseName}_recomp`;
  filenameExt.textContent = `.${getFileExtension(format)}`;
}

// ---------- Batch Process ----------
async function triggerBatchProcess() {
  state.isProcessing = true;
  processBtn.classList.add('processing');

  const quality = parseInt(qualitySlider.value) / 100;
  const format = state.outputFormat;
  const ext = getFileExtension(format);
  const targetWidth = parseInt(widthInput.value) || null;
  const targetHeight = parseInt(heightInput.value) || null;

  batchList.classList.remove('hidden');
  batchList.innerHTML = '';

  const results = [];

  for (const file of state.files) {
    const item = document.createElement('div');
    item.className = 'batch-item';
    item.innerHTML = `<span class="batch-item-name">${file.name}</span><span class="batch-item-status processing">İşleniyor…</span>`;
    batchList.appendChild(item);

    try {
      const blob = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = async () => {
            const ratio = img.naturalWidth / img.naturalHeight;
            let w = targetWidth || img.naturalWidth;
            let h = targetHeight || img.naturalHeight;

            if (targetWidth && !targetHeight) h = Math.round(w / ratio);
            else if (targetHeight && !targetWidth) w = Math.round(h * ratio);

            try {
              resolve(await compressImage(img, w, h, format, quality));
            } catch (err) { reject(err); }
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const savings = ((1 - blob.size / file.size) * 100).toFixed(1);
      const savingsText = savings > 0 ? `↓${savings}%` : `↑${Math.abs(savings)}%`;
      const statusEl = item.querySelector('.batch-item-status');
      statusEl.className = 'batch-item-status done';
      statusEl.textContent = `${formatFileSize(blob.size)} (${savingsText})`;
      item.classList.add('clickable');

      const outName = `${file.name.replace(/\.[^.]+$/, '')}_recomp.${ext}`;
      const result = { name: outName, blob, originalSize: file.size };
      results.push(result);

      item.addEventListener('click', () => showBatchPreview(result, item));
    } catch {
      item.querySelector('.batch-item-status').className = 'batch-item-status error';
      item.querySelector('.batch-item-status').textContent = 'Hata';
    }
  }

  state.isProcessing = false;
  processBtn.classList.remove('processing');

  if (results.length === 0) return;

  // Toplam tasarruf
  const totalOrig = state.files.reduce((s, f) => s + f.size, 0);
  const totalNew = results.reduce((s, r) => s + r.blob.size, 0);
  const totalSavings = ((1 - totalNew / totalOrig) * 100).toFixed(1);
  resultDimensions.textContent = `${results.length} görsel`;
  resultSize.textContent = formatFileSize(totalNew);
  resultSavings.textContent = totalSavings > 0 ? `${totalSavings}% küçültüldü` : `${Math.abs(totalSavings)}% büyüdü`;
  resultSavings.style.color = totalSavings > 0 ? '' : 'var(--warning)';
  resultInfo.classList.remove('hidden');

  downloadBtn.classList.add('hidden');
  filenameRow.classList.add('hidden');
  downloadZipBtn.classList.remove('hidden');

  downloadZipBtn.onclick = () => downloadAsZip(results);

  if (results.length) showBatchPreview(results[0], batchList.children[0]);
}

// ---------- Batch Preview ----------
function showBatchPreview({ blob }, activeItem) {
  document.querySelectorAll('.batch-item.active').forEach(el => el.classList.remove('active'));
  activeItem.classList.add('active');

  const img = new Image();
  img.onload = () => {
    previewCanvas.width = img.naturalWidth;
    previewCanvas.height = img.naturalHeight;
    previewCanvas.getContext('2d').drawImage(img, 0, 0);
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(blob);
  previewCanvas.classList.remove('hidden');
  previewPlaceholder.classList.add('hidden');
}

// ---------- ZIP Download ----------
function downloadAsZip(results) {
  const files = {};
  const pending = results.length;
  let done = 0;

  results.forEach(({ name, blob }) => {
    blob.arrayBuffer().then((buf) => {
      files[name] = new Uint8Array(buf);
      done++;
      if (done === pending) {
        zip(files, (err, data) => {
          if (err) return;
          const url = URL.createObjectURL(new Blob([data], { type: 'application/zip' }));
          const a = document.createElement('a');
          a.href = url;
          a.download = 'recomp.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      }
    });
  });
}

// ---------- Single Download ----------
downloadBtn.addEventListener('click', () => {
  if (!state.processedBlob) return;
  const ext = getFileExtension(state.outputFormat);
  const filename = `${(filenameInput.value.trim() || 'recomp')}.${ext}`;
  const url = URL.createObjectURL(state.processedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

loadSettings();
