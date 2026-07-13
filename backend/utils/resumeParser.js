const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractResumeText(buffer, mimetype, originalName) {
  const lowerName = (originalName || '').toLowerCase();

  if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === 'text/plain' || lowerName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT resume.');
}

module.exports = { extractResumeText };
