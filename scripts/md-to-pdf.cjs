const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FILES = [
  { input: 'docs/business/business-plan.md',       output: 'docs/business/business-plan.pdf',       title: 'Business Plan' },
  { input: 'docs/business/marketing-strategy.md',  output: 'docs/business/marketing-strategy.pdf',  title: 'Marketing Strategy' },
  { input: 'docs/business/pricing-menu.md',         output: 'docs/business/pricing-menu.pdf',         title: 'Product Menu & Pricing' },
  { input: 'docs/business/sales-forecast.md',      output: 'docs/business/sales-forecast.pdf',      title: 'Sales Forecast' },
];

const BRAND_GREEN = '#39FF14';
const DARK       = '#0a0a0a';
const MID_GRAY   = '#888888';
const LIGHT      = '#cccccc';
const WHITE      = '#ffffff';
const TABLE_HEAD = '#1a1a1a';
const TABLE_ROW  = '#111111';
const TABLE_ALT  = '#141414';

function renderFile({ input, output, title }) {
  const raw = fs.readFileSync(input, 'utf8');
  const lines = raw.split('\n');

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: { Title: `LiftIQ AI — ${title}`, Author: 'LiftIQ AI', Creator: 'LiftIQ AI' },
  });

  doc.pipe(fs.createWriteStream(output));

  // ── Background ──────────────────────────────────────
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK);

  // ── Header bar ──────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 48).fill('#111111');
  doc.fontSize(9).font('Helvetica-Bold').fillColor(BRAND_GREEN)
     .text('LIFTIQ AI', 60, 17, { continued: true })
     .fillColor(MID_GRAY).font('Helvetica')
     .text(`  ·  ${title.toUpperCase()}`, { align: 'left' });
  doc.moveTo(0, 48).lineTo(doc.page.width, 48).strokeColor(BRAND_GREEN).lineWidth(1).stroke();

  let y = 72;
  const LEFT   = 60;
  const RIGHT  = doc.page.width - 60;
  const WIDTH  = RIGHT - LEFT;

  function checkPage(needed = 20) {
    if (y + needed > doc.page.height - 60) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK);
      doc.rect(0, 0, doc.page.width, 48).fill('#111111');
      doc.fontSize(9).font('Helvetica-Bold').fillColor(BRAND_GREEN)
         .text('LIFTIQ AI', 60, 17, { continued: true })
         .fillColor(MID_GRAY).font('Helvetica')
         .text(`  ·  ${title.toUpperCase()}`);
      doc.moveTo(0, 48).lineTo(doc.page.width, 48).strokeColor(BRAND_GREEN).lineWidth(1).stroke();
      y = 72;
    }
  }

  // Accumulate table rows between separator lines
  let tableRows = [];
  let inTable = false;

  function flushTable() {
    if (!tableRows.length) return;

    // Determine column widths
    const cols = tableRows[0].map((_, ci) => {
      const max = Math.max(...tableRows.map(r => (r[ci] || '').length));
      return Math.max(max, 4);
    });
    const totalChars = cols.reduce((a, b) => a + b, 0) + cols.length;
    const colWidths  = cols.map(c => (c / totalChars) * WIDTH);
    const ROW_H      = 20;

    checkPage(ROW_H * (tableRows.length + 1) + 10);

    tableRows.forEach((row, ri) => {
      const isHeader = ri === 0;
      const bg       = isHeader ? TABLE_HEAD : ri % 2 === 0 ? TABLE_ROW : TABLE_ALT;
      let x = LEFT;

      colWidths.forEach((cw, ci) => {
        doc.rect(x, y, cw, ROW_H).fill(bg);
        const cell  = (row[ci] || '').replace(/\*\*/g, '').trim();
        const color = isHeader ? BRAND_GREEN : LIGHT;
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
           .fontSize(isHeader ? 8 : 7.5)
           .fillColor(color)
           .text(cell, x + 5, y + 6, { width: cw - 10, lineBreak: false });
        x += cw;
      });

      y += ROW_H;
    });

    tableRows = [];
    inTable   = false;
    y += 8;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table separator row (|---|---|) — skip but mark table active
    if (/^\|[\s\-|]+\|$/.test(trimmed)) {
      inTable = true;
      continue;
    }

    // Table data row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
      tableRows.push(cells);
      continue;
    }

    // Non-table line — flush any pending table first
    if (tableRows.length) flushTable();

    // Blank line
    if (!trimmed) { y += 6; continue; }

    // H1
    if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2);
      checkPage(60);
      // Green accent line
      doc.rect(LEFT, y, 3, 36).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(22).fillColor(WHITE)
         .text(text, LEFT + 12, y, { width: WIDTH - 12 });
      y += 44;
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      checkPage(40);
      y += 6;
      doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND_GREEN)
         .text(text.toUpperCase(), LEFT, y, { width: WIDTH });
      y += 20;
      doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor('#222').lineWidth(0.5).stroke();
      y += 8;
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      checkPage(28);
      y += 4;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(LIGHT)
         .text(text, LEFT, y, { width: WIDTH });
      y += 16;
      continue;
    }

    // Horizontal rule
    if (trimmed === '---') {
      checkPage(16);
      y += 4;
      doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor('#333').lineWidth(0.5).stroke();
      y += 12;
      continue;
    }

    // Bold label lines (e.g. **Confidential | ...**)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes(' — ')) {
      const text = trimmed.slice(2, -2);
      checkPage(16);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(MID_GRAY)
         .text(text, LEFT, y, { width: WIDTH });
      y += 14;
      continue;
    }

    // List items
    if (trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^-\s/, '• ').replace(/\*\*/g, '');
      checkPage(16);
      doc.font('Helvetica').fontSize(9).fillColor(LIGHT)
         .text(text, LEFT + 10, y, { width: WIDTH - 10 });
      y += doc.heightOfString(text, { width: WIDTH - 10, fontSize: 9 }) + 4;
      continue;
    }

    // Normal paragraph — strip inline markdown
    const plain = trimmed
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1');

    checkPage(14);
    doc.font('Helvetica').fontSize(9).fillColor(LIGHT)
       .text(plain, LEFT, y, { width: WIDTH });
    y += doc.heightOfString(plain, { width: WIDTH, fontSize: 9 }) + 5;
  }

  // Flush any trailing table
  if (tableRows.length) flushTable();

  // Footer on last page
  const footerY = doc.page.height - 40;
  doc.moveTo(0, footerY).lineTo(doc.page.width, footerY).strokeColor('#222').lineWidth(0.5).stroke();
  doc.font('Helvetica').fontSize(8).fillColor(MID_GRAY)
     .text(`LiftIQ AI  ·  ${title}  ·  Confidential`, LEFT, footerY + 10, { width: WIDTH, align: 'center' });

  doc.end();
  console.log(`✓ ${output}`);
}

FILES.forEach(renderFile);
