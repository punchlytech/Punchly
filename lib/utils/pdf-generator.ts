import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { colors } from "@/lib/constants/colors";

interface SnagLocation {
  location: string;
  description: string;
  photos: { preview: string; annotatedPreview?: string }[];
}

interface InspectionData {
  projectName: string;
  unitNumber: string;
  clientName: string;
  inspectionDate: string;
  engineerName: string;
  locations: SnagLocation[];
}

/**
 * Generates a branded PDF snag report.
 * Returns the PDF blob for optional Supabase upload.
 */
export async function generateSnagPDF(data: InspectionData): Promise<Blob> {
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

  // Brand color RGB values
  const navy = hexToRgb(colors.primaryNavy);
  const blue = hexToRgb(colors.primaryBlue);

  // Generate QR Code
  const baseUrl =
    window.location.hostname === "localhost"
      ? "https://punchly.vercel.app"
      : window.location.origin;

  const reportId = `${data.projectName.replace(/\s+/g, "-")}_${data.unitNumber}_${Date.now()}`;
  const reportUrl = `${baseUrl}/reports/${reportId}`;

  const qrCodeDataUrl = await QRCode.toDataURL(reportUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: colors.primaryNavy,
      light: "#FFFFFF",
    },
  });

  // ===== HELPER FUNCTIONS =====

  const addHeader = (isFirstPage = false) => {
    if (!isFirstPage) {
      doc.setFillColor(navy.r, navy.g, navy.b);
      doc.rect(0, 0, pageWidth, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("PUNCHLY", margin, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.projectName} - ${data.unitNumber}`, margin, 23);

      doc.setFontSize(8);
      doc.text(`${data.inspectionDate}`, pageWidth - margin, 23, {
        align: "right",
      });

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

  // Header — Navy branding
  doc.setFillColor(navy.r, navy.g, navy.b);
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("PUNCHLY", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Snagging Platform", pageWidth / 2, 38, {
    align: "center",
  });

  // Report Title
  yPosition = 75;
  doc.setTextColor(navy.r, navy.g, navy.b);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("SNAG INSPECTION REPORT", pageWidth / 2, yPosition, {
    align: "center",
  });

  // Decorative Line — Blue accent
  yPosition += 12;
  doc.setDrawColor(blue.r, blue.g, blue.b);
  doc.setLineWidth(0.8);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Project Information Box
  yPosition += 18;
  doc.setFillColor(247, 249, 251); // punchly-bg
  doc.roundedRect(margin, yPosition, contentWidth, 75, 3, 3, "F");
  doc.setDrawColor(225, 230, 235); // punchly-border
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPosition, contentWidth, 75, 3, 3, "S");

  yPosition += 12;
  doc.setFontSize(12);

  const infoX = margin + 12;
  const labelColor = hexToRgb(colors.secondaryText);
  const valueColor = hexToRgb(colors.primaryText);

  const addInfoRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(labelColor.r, labelColor.g, labelColor.b);
    doc.text(label, infoX, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(valueColor.r, valueColor.g, valueColor.b);
    doc.text(value, infoX + 50, yPosition);
    yPosition += 14;
  };

  addInfoRow("Project Name:", data.projectName);
  addInfoRow("Unit Number:", data.unitNumber);
  addInfoRow("Client Name:", data.clientName);
  addInfoRow("Inspection Date:", data.inspectionDate);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(labelColor.r, labelColor.g, labelColor.b);
  doc.text("Inspector:", infoX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(valueColor.r, valueColor.g, valueColor.b);
  doc.text(data.engineerName, infoX + 50, yPosition);

  // QR Code Section
  yPosition += 28;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(labelColor.r, labelColor.g, labelColor.b);
  doc.text("SCAN FOR DIGITAL VERSION", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 6;
  const qrSize = 45;
  const qrX = (pageWidth - qrSize) / 2;
  doc.addImage(qrCodeDataUrl, "PNG", qrX, yPosition, qrSize, qrSize);

  // Footer on cover page
  doc.setFontSize(9);
  doc.setTextColor(labelColor.r, labelColor.g, labelColor.b);
  doc.text(
    `Report generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pageHeight - 18,
    { align: "center" }
  );
  doc.text(
    "Generated by Punchly \u00B7 v3.0.0",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  // ===== SNAG DETAILS PAGES =====

  doc.addPage();
  yPosition = addHeader(false);

  // Page Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(navy.r, navy.g, navy.b);
  doc.text("Snag Details", margin, yPosition);
  yPosition += 15;

  // Separator line
  doc.setDrawColor(225, 230, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Iterate through locations
  for (let i = 0; i < data.locations.length; i++) {
    const location = data.locations[i];

    checkPageBreak(50);

    // Location Number Badge — Navy circle
    doc.setFillColor(navy.r, navy.g, navy.b);
    doc.circle(margin + 6, yPosition + 4, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}`, margin + 6, yPosition + 6, { align: "center" });

    // Location Name
    doc.setTextColor(navy.r, navy.g, navy.b);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const locationY = yPosition + 5;
    doc.text(location.location, margin + 16, locationY);

    // Underline — Blue accent
    const locationWidth = doc.getTextWidth(location.location);
    doc.setDrawColor(blue.r, blue.g, blue.b);
    doc.setLineWidth(0.8);
    doc.line(
      margin + 16,
      locationY + 2,
      margin + 16 + locationWidth,
      locationY + 2
    );

    yPosition += 18;

    // Description
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(valueColor.r, valueColor.g, valueColor.b);

    const descriptionLines = doc.splitTextToSize(
      location.description,
      contentWidth - 5
    );

    const descriptionHeight = descriptionLines.length * 7;
    checkPageBreak(descriptionHeight + 20);

    doc.text(descriptionLines, margin + 5, yPosition);
    yPosition += descriptionHeight + 10;

    // Photos Section — prefer annotatedPreview over preview
    if (location.photos.length > 0) {
      checkPageBreak(80);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(labelColor.r, labelColor.g, labelColor.b);
      doc.text("Photos:", margin + 5, yPosition);
      yPosition += 8;

      const photoSize = 65;
      const photosPerRow = 2;
      const photoSpacing = 12;

      for (let j = 0; j < location.photos.length; j++) {
        const photo = location.photos[j];
        const photoSrc = photo.annotatedPreview || photo.preview;
        const row = Math.floor(j / photosPerRow);
        const col = j % photosPerRow;

        const photoX = margin + 5 + col * (photoSize + photoSpacing);
        const photoY = yPosition + row * (photoSize + photoSpacing);

        if (photoY + photoSize > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = addHeader(false);

          const newPhotoY = yPosition;

          doc.setDrawColor(225, 230, 235);
          doc.setLineWidth(0.5);
          doc.roundedRect(photoX, newPhotoY, photoSize, photoSize, 2, 2, "S");

          try {
            doc.addImage(
              photoSrc,
              "JPEG",
              photoX + 1,
              newPhotoY + 1,
              photoSize - 2,
              photoSize - 2
            );
          } catch (error) {
            console.error("Error adding image to PDF:", error);
          }

          yPosition = newPhotoY + photoSize + photoSpacing;
        } else {
          doc.setDrawColor(225, 230, 235);
          doc.setLineWidth(0.5);
          doc.roundedRect(photoX, photoY, photoSize, photoSize, 2, 2, "S");

          try {
            doc.addImage(
              photoSrc,
              "JPEG",
              photoX + 1,
              photoY + 1,
              photoSize - 2,
              photoSize - 2
            );
          } catch (error) {
            console.error("Error adding image to PDF:", error);
          }
        }
      }

      const lastRow = Math.floor(
        (location.photos.length - 1) / photosPerRow
      );
      yPosition += (lastRow + 1) * (photoSize + photoSpacing) + 5;
    }

    // Separator between locations
    if (i < data.locations.length - 1) {
      yPosition += 10;
      checkPageBreak(20);

      doc.setDrawColor(225, 230, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }
  }

  // Return blob and also open in new tab
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");

  return pdfBlob;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
