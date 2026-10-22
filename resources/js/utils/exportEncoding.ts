export const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]!));

export const spreadsheetText = (value: unknown): string => {
  const text = String(value ?? '');
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(text) ? `'${text}` : text;
};

export const csvCell = (value: unknown): string => typeof value === 'number'
  ? String(value)
  : `"${spreadsheetText(value).replace(/"/g, '""')}"`;

export const csvRow = (values: unknown[]): string => values.map(csvCell).join(',');

export const downloadCsv = (name: string, rows: string[]): void => {
  const url = URL.createObjectURL(new Blob(['\uFEFF', rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
