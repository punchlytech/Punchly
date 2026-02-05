import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface SnagLocation {
  location: string;
  description: string;
  photos: { preview: string }[];
}

interface InspectionData {
  projectName: string;
  unitNumber: string;
  clientName: string;
  inspectionDate: string;
  engineerName: string;
  locations: SnagLocation[];
}

export async function generateSnagPDF(data: InspectionData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Generate QR Code - Use deployment URL or localhost
  const baseUrl = window.location.hostname === 'localhost'
    ? 'https://punchly.vercel.app'  // Use your actual deployment URL here
    : window.location.origin;

  const reportId = `${data.projectName.replace(/\s+/g, '-')}_${data.unitNumber}_${Date.now()}`;
  const reportUrl = `${baseUrl}/reports/${reportId}`;

  const qrCodeDataUrl = await QRCode.toDataURL(reportUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: '#18181B',
      light: '#FFFFFF',
    },
  });

  // ===== HELPER FUNCTIONS =====

  const addHeader = (isFirstPage = false) => {
    if (!isFirstPage) {
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 0, pageWidth, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("PUNCHLY", margin, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.projectName} - ${data.unitNumber}`, margin, 23);

      doc.setFontSize(8);
      doc.text(`${data.inspectionDate}`, pageWidth - margin, 23, { align: "right" });

      return 45;
    }
    return yPosition;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = addHeader(false);
      return true;
    }
    return false;
  };

  // ===== COVER PAGE =====

  // Header - Company Branding
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("PUNCHLY", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Snagging Platform", pageWidth / 2, 38, { align: "center" });

  // Report Title
  yPosition = 75;
  doc.setTextColor(24, 24, 27);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("SNAG INSPECTION REPORT", pageWidth / 2, yPosition, { align: "center" });

  // Decorative Line
  yPosition += 12;
  doc.setDrawColor(161, 161, 170);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Project Information Box
  yPosition += 18;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, yPosition, contentWidth, 75, 3, 3, "F");
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPosition, contentWidth, 75, 3, 3, "S");

  yPosition += 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(63, 63, 70);

  const infoX = margin + 12;
  doc.text("Project Name:", infoX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(24, 24, 27);
  doc.text(data.projectName, infoX + 50, yPosition);

  yPosition += 14;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(63, 63, 70);
  doc.text("Unit Number:", infoX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(24, 24, 27);
  doc.text(data.unitNumber, infoX + 50, yPosition);

  yPosition += 14;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(63, 63, 70);
  doc.text("Client Name:", infoX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(24, 24, 27);
  doc.text(data.clientName, infoX + 50, yPosition);

  yPosition += 14;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(63, 63, 70);
  doc.text("Inspection Date:", infoX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(24, 24, 27);
  doc.text(data.inspectionDate, infoX + 50, yPosition);

  yPosition += 14;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(63, 63, 70);
  doc.text("Inspector:", infoX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(24, 24, 27);
  doc.text(data.engineerName, infoX + 50, yPosition);

  // QR Code Section
  yPosition += 28;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(63, 63, 70);
  doc.text("SCAN FOR DIGITAL VERSION", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 6;
  const qrSize = 45;
  const qrX = (pageWidth - qrSize) / 2;
  doc.addImage(qrCodeDataUrl, "PNG", qrX, yPosition, qrSize, qrSize);

  // Footer on cover page
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  doc.text(
    `Report generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pageHeight - 18,
    { align: "center" }
  );
  doc.text("Powered by Punchly", pageWidth / 2, pageHeight - 12, { align: "center" });

  // ===== SNAG DETAILS PAGES =====

  doc.addPage();
  yPosition = addHeader(false);

  // Page Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 24, 27);
  doc.text("Snag Details", margin, yPosition);
  yPosition += 15;

  // Separator line
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Iterate through locations
  for (let i = 0; i < data.locations.length; i++) {
    const location = data.locations[i];

    // Check if we need a new page for this section
    checkPageBreak(50);

    // Location Number Badge
    doc.setFillColor(24, 24, 27);
    doc.circle(margin + 6, yPosition + 4, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}`, margin + 6, yPosition + 6, { align: "center" });

    // Location Name - BIGGER, BOLD, UNDERLINED
    doc.setTextColor(24, 24, 27);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const locationY = yPosition + 5;
    doc.text(location.location, margin + 16, locationY);

    // Underline the location
    const locationWidth = doc.getTextWidth(location.location);
    doc.setDrawColor(24, 24, 27);
    doc.setLineWidth(0.8);
    doc.line(margin + 16, locationY + 2, margin + 16 + locationWidth, locationY + 2);

    yPosition += 18;

    // Description Section - LARGER FONT
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);

    const descriptionLines = doc.splitTextToSize(location.description, contentWidth - 5);

    // Check if description fits on current page
    const descriptionHeight = descriptionLines.length * 7;
    checkPageBreak(descriptionHeight + 20);

    doc.text(descriptionLines, margin + 5, yPosition);
    yPosition += descriptionHeight + 10;

    // Photos Section
    if (location.photos.length > 0) {
      checkPageBreak(80);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(63, 63, 70);
      doc.text("Photos:", margin + 5, yPosition);
      yPosition += 8;

      const photoSize = 65;
      const photosPerRow = 2;
      const photoSpacing = 12;

      for (let j = 0; j < location.photos.length; j++) {
        const photo = location.photos[j];
        const row = Math.floor(j / photosPerRow);
        const col = j % photosPerRow;

        const photoX = margin + 5 + col * (photoSize + photoSpacing);
        const photoY = yPosition + row * (photoSize + photoSpacing);

        // Check if photo fits on current page
        if (photoY + photoSize > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = addHeader(false);

          // Recalculate photo position on new page
          const newRow = 0;
          const newPhotoY = yPosition + newRow * (photoSize + photoSpacing);

          doc.setDrawColor(228, 228, 231);
          doc.setLineWidth(0.5);
          doc.roundedRect(photoX, newPhotoY, photoSize, photoSize, 2, 2, "S");

          try {
            doc.addImage(photo.preview, "JPEG", photoX + 1, newPhotoY + 1, photoSize - 2, photoSize - 2);
          } catch (error) {
            console.error("Error adding image to PDF:", error);
          }

          yPosition = newPhotoY + photoSize + photoSpacing;
        } else {
          doc.setDrawColor(228, 228, 231);
          doc.setLineWidth(0.5);
          doc.roundedRect(photoX, photoY, photoSize, photoSize, 2, 2, "S");

          try {
            doc.addImage(photo.preview, "JPEG", photoX + 1, photoY + 1, photoSize - 2, photoSize - 2);
          } catch (error) {
            console.error("Error adding image to PDF:", error);
          }
        }
      }

      // Update yPosition after all photos
      const lastRow = Math.floor((location.photos.length - 1) / photosPerRow);
      yPosition += (lastRow + 1) * (photoSize + photoSpacing) + 5;
    }

    // Separator between locations (if not last)
    if (i < data.locations.length - 1) {
      yPosition += 10;
      checkPageBreak(20);

      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }
  }

  // Open PDF in new tab instead of downloading
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
}
