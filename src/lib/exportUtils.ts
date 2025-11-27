import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { saveAs } from 'file-saver';

export type ExportFormat = 'pdf' | 'docx' | 'txt';

export const exportContentAsPDF = (content: string, filename: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxLineWidth = pageWidth - 2 * margin;
  const lineHeight = 7;
  
  // Split content into lines that fit the page width
  const lines = doc.splitTextToSize(content, maxLineWidth);
  
  let y = margin;
  
  lines.forEach((line: string) => {
    // Check if we need a new page
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(line, margin, y);
    y += lineHeight;
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportContentAsDOCX = async (content: string, filename: string) => {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').map(para => 
    new Paragraph({
      children: [new TextRun(para)],
      spacing: {
        after: 200,
      },
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

export const exportContentAsTXT = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${filename}.txt`);
};

export const exportContent = async (
  content: string,
  format: ExportFormat,
  filename: string
) => {
  try {
    switch (format) {
      case 'pdf':
        exportContentAsPDF(content, filename);
        break;
      case 'docx':
        await exportContentAsDOCX(content, filename);
        break;
      case 'txt':
        exportContentAsTXT(content, filename);
        break;
      default:
        throw new Error('Unsupported format');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};
