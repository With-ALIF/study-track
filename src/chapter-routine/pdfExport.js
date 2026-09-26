const A4_W = 595
const A4_H = 842
const MARGIN = 24
const USABLE_W = A4_W - MARGIN * 2
const USABLE_H = A4_H - MARGIN * 2

function rowBoundaries(el) {
  const top = el.getBoundingClientRect().top
  const tops = new Set([0])
  for (const tr of el.querySelectorAll('tr')) {
    const t = tr.getBoundingClientRect().top - top
    tops.add(Math.round(Math.min(Math.max(t, 0), el.getBoundingClientRect().height) * 100) / 100)
  }
  return [...tops].sort((a, b) => a - b)
}

function makeSlices(tops, total, pagePx) {
  const slices = []
  let start = 0
  while (start < total - 0.5) {
    const limit = start + pagePx
    let cut = start
    for (const t of tops) {
      if (t > start + 0.5 && t <= limit + 0.5) cut = t
    }
    if (cut <= start + 0.5) cut = Math.min(limit, total)
    slices.push([start, cut])
    start = cut
  }
  return slices
}

export async function exportChapterPdf(elementId, filename) {
  const el = document.getElementById(elementId)
  if (!el) return

  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ])

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const rect = el.getBoundingClientRect()
  const ptPerPx = USABLE_W / rect.width
  const pagePx = USABLE_H / ptPerPx
  const sy = canvas.height / rect.height
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })

  const slices = makeSlices(rowBoundaries(el), rect.height, pagePx)
  slices.forEach(([a, b], i) => {
    const y = Math.round(a * sy)
    const h = Math.max(1, Math.round(b * sy) - y)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = h
    const ctx = slice.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, slice.width, h)
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h)
    if (i > 0) pdf.addPage()
    pdf.addImage(
      slice.toDataURL('image/jpeg', 0.96),
      'JPEG',
      MARGIN,
      MARGIN,
      USABLE_W,
      (b - a) * ptPerPx,
    )
  })

  pdf.save(filename)
}
