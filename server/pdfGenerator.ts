import type { PortfolioData } from './types.ts';

function sanitizePdfText(input: string): string {
  // Normalize French accents to clean WinAnsi/ASCII equivalents for standard Helvetica PDF fonts
  const map: Record<string, string> = {
    à: 'a', â: 'a', ä: 'a', À: 'A', Â: 'A',
    é: 'e', è: 'e', ê: 'e', ë: 'e', É: 'E', È: 'E', Ê: 'E',
    î: 'i', ï: 'i', Î: 'I',
    ô: 'o', ö: 'o', Ô: 'O',
    ù: 'u', û: 'u', ü: 'u', Ù: 'U',
    ç: 'c', Ç: 'C',
    œ: 'oe', Œ: 'OE',
    '’': "'", '‘': "'", '“': '"', '”': '"', '«': '"', '»': '"', '–': '-', '—': '-',
  };
  return input
    .replace(/[^\x20-\x7E]/g, (ch) => map[ch] ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function generatePortfolioPdf(portfolio: PortfolioData): Buffer {
  const lines: Array<{ text: string; size: number; bold?: boolean; gap?: number }> = [];
  const push = (text: string, size = 10, bold = false, gap = 14) => {
    lines.push({ text: sanitizePdfText(text), size, bold, gap });
  };
  const pushWrapped = (text: string, maxChars = 88, size = 10) => {
    for (const line of wrapText(text, maxChars)) {
      push(line, size, false, 13);
    }
  };

  push(portfolio.profile.fullName.toUpperCase(), 20, true, 24);
  push(portfolio.profile.title, 12, true, 16);
  push(
    `${portfolio.profile.location} | ${portfolio.profile.email} | ${portfolio.profile.phone} | ${portfolio.profile.website}`,
    9,
    false,
    18
  );
  push(portfolio.profile.tagline, 10, false, 20);

  push('PROFIL', 11, true, 16);
  for (const p of portfolio.profile.aboutParagraphs.slice(0, 4)) {
    pushWrapped(p, 92, 9.5);
  }
  lines.push({ text: '', size: 10, gap: 8 });

  push('PARCOURS ACADEMIQUE', 11, true, 16);
  for (const edu of portfolio.education) {
    const suffix = edu.status === 'planned' ? ' (Formation envisagee)' : '';
    pushWrapped(`${edu.period} : ${edu.title} - ${edu.institution}${suffix}`, 90, 9.5);
  }
  lines.push({ text: '', size: 10, gap: 8 });

  push('EXPERIENCES PROFESSIONNELLES', 11, true, 16);
  for (const exp of portfolio.experiences) {
    push(`${exp.role} - ${exp.department} (${exp.location})`, 10, true, 14);
    for (const r of exp.responsibilities) {
      pushWrapped(`- ${r}`, 88, 9.5);
    }
    if (exp.softSkills.length > 0) {
      pushWrapped(`Qualites : ${exp.softSkills.join(', ')}`, 88, 9);
    }
  }
  lines.push({ text: '', size: 10, gap: 8 });

  push('COMPETENCES & OUTILS', 11, true, 16);
  const webSkills = portfolio.skills.filter((s) => s.category === 'web').map((s) => s.name);
  const mediaSkills = portfolio.skills.filter((s) => s.category === 'multimedia').map((s) => s.name);
  const toolSkills = portfolio.skills.filter((s) => s.category === 'tools').map((s) => s.name);
  if (webSkills.length) pushWrapped(`Developpement web : ${webSkills.join(', ')}`, 90, 9.5);
  if (mediaSkills.length) pushWrapped(`Multimedia : ${mediaSkills.join(', ')}`, 90, 9.5);
  if (toolSkills.length) pushWrapped(`Outils : ${toolSkills.join(', ')}`, 90, 9.5);
  lines.push({ text: '', size: 10, gap: 8 });

  push('LANGUES', 11, true, 16);
  pushWrapped(
    portfolio.languages.map((l) => `${l.name} (${l.proficiency})`).join(' | '),
    90,
    9.5
  );

  // Build PDF content stream across up to 2 pages cleanly
  const pagesStreams: string[] = [];
  let y = 785;
  let stream = 'BT\n';
  for (const item of lines) {
    if (y < 60) {
      stream += 'ET';
      pagesStreams.push(stream);
      y = 785;
      stream = 'BT\n';
    }
    if (item.text) {
      const font = item.bold ? '/F2' : '/F1';
      stream += `${font} ${item.size} Tf\n1 0 0 1 48 ${y} Tm\n(${item.text}) Tj\n`;
    }
    y -= item.gap ?? 14;
  }
  stream += 'ET';
  pagesStreams.push(stream);

  const objects: string[] = [];
  // 1: Catalog, 2: Pages, 3: F1 Helvetica, 4: F2 Helvetica-Bold
  const pageObjNums: number[] = [];
  let nextId = 5;
  const pageEntries: string[] = [];

  for (const pageStream of pagesStreams) {
    const contentId = nextId++;
    const pageId = nextId++;
    pageObjNums.push(pageId);
    pageEntries.push(
      `${contentId} 0 obj\n<< /Length ${Buffer.byteLength(pageStream, 'utf8')} >>\nstream\n${pageStream}\nendstream\nendobj`,
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj`
    );
  }

  objects.push(
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>\nendobj`,
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
    ...pageEntries
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${obj}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}
