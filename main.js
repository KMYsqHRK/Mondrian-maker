// ─── Algorithm (ported from MondorianMaker.py) ───────────────────────────

const SIDE_MIN = 60;

function splitRectangle(rect) {
  const width  = rect.x2 - rect.x1;
  const height = rect.y2 - rect.y1;

  if (width < SIDE_MIN || height < SIDE_MIN) return [rect];

  if (width > height) {
    // Vertical split
    const sp = Math.floor(
      rect.x1 + SIDE_MIN / 2 +
      Math.random() * (width - SIDE_MIN)
    );
    return [
      { x1: rect.x1, y1: rect.y1, x2: sp,      y2: rect.y2 },
      { x1: sp,      y1: rect.y1, x2: rect.x2,  y2: rect.y2 },
    ];
  } else {
    // Horizontal split
    const sp = Math.floor(
      rect.y1 + SIDE_MIN / 2 +
      Math.random() * (height - SIDE_MIN)
    );
    return [
      { x1: rect.x1, y1: rect.y1, x2: rect.x2, y2: sp      },
      { x1: rect.x1, y1: sp,      x2: rect.x2, y2: rect.y2 },
    ];
  }
}

function mondrian(width, height, iterations) {
  const rects = [{ x1: 0, y1: 0, x2: width, y2: height }];

  for (let i = 0; i < iterations; i++) {
    const idx  = Math.floor(Math.random() * rects.length);
    const rect = rects.splice(idx, 1)[0];
    rects.push(...splitRectangle(rect));
  }

  return rects;
}

function drawMondrian(rects, canvas, colorRate, colors) {
  const ctx    = canvas.getContext('2d');
  const border = Math.max(4, Math.round(canvas.width / 200));

  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const r of rects) {
    ctx.fillStyle = Math.random() < colorRate / 100
      ? colors[Math.floor(Math.random() * colors.length)]
      : '#FAFAFA';
    ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);

    ctx.strokeStyle = '#111111';
    ctx.lineWidth   = border;
    ctx.strokeRect(
      r.x1 + border / 2,
      r.y1 + border / 2,
      r.x2 - r.x1 - border,
      r.y2 - r.y1 - border
    );
  }
}

// ─── State ───────────────────────────────────────────────────────────────

const CANVAS_SIZE    = 500;
let currentIter      = 30;
let currentColorRate = 30;
let selectedColors   = ['#E63946','#F7C31B','#1A53A0'];

// ─── DOM refs ────────────────────────────────────────────────────────────

const canvas      = document.getElementById('mondrian-canvas');
const iterSlider  = document.getElementById('iter-slider');
const iterVal     = document.getElementById('iter-val');
const colorSlider = document.getElementById('color-slider');
const colorVal    = document.getElementById('color-val');
const toast       = document.getElementById('toast');

// ─── Generate ────────────────────────────────────────────────────────────

function generate() {
  const colors = selectedColors.length > 0 ? selectedColors : ['#FAFAFA'];
  canvas.width  = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const rects = mondrian(CANVAS_SIZE, CANVAS_SIZE, currentIter);
  drawMondrian(rects, canvas, currentColorRate, colors);
}

// ─── Controls ────────────────────────────────────────────────────────────

iterSlider.addEventListener('input', () => {
  currentIter  = parseInt(iterSlider.value);
  iterVal.textContent = currentIter;
});

colorSlider.addEventListener('input', () => {
  currentColorRate = parseInt(colorSlider.value);
  colorVal.textContent = currentColorRate + '%';
});

document.querySelectorAll('.color-swatch').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    selectedColors = Array.from(document.querySelectorAll('.color-swatch.active'))
      .map(b => b.dataset.color);
  });
});

// ─── Generate button ─────────────────────────────────────────────────────

document.getElementById('btn-generate').addEventListener('click', generate);

// ─── Download ────────────────────────────────────────────────────────────

document.getElementById('btn-download').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `mondrian_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('画像を保存しました');
});

// ─── SNS Share ───────────────────────────────────────────────────────────

function shareText() {
  return 'モンドリアン風アートを生成しました 🎨 #MondorianMaker';
}

function pageUrl() {
  const href = window.location.href;
  if (href.startsWith('file://')) return '';
  return href;
}

document.getElementById('btn-twitter').addEventListener('click', () => {
  const text = shareText();
  const url  = pageUrl();
  const params = new URLSearchParams({ text });
  if (url) params.set('url', url);
  window.open(
    'https://twitter.com/intent/tweet?' + params.toString(),
    '_blank', 'width=550,height=420'
  );
});

document.getElementById('btn-line').addEventListener('click', () => {
  const url = pageUrl();
  if (!url) {
    showToast('まず画像を保存してLINEで共有してください');
    return;
  }
  const params = new URLSearchParams({ url });
  window.open(
    'https://social-plugins.line.me/lineit/share?' + params.toString(),
    '_blank', 'width=600,height=500'
  );
});

// ─── Toast ───────────────────────────────────────────────────────────────

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Init ────────────────────────────────────────────────────────────────

generate();
