import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/server/services/reservationService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string(),
});

async function generateTicketPdf(reservation: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Title
  page.drawText('Votre Billet Électronique', {
    x: 50,
    y: height - 70,
    font: boldFont,
    size: 24,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Reservation Details
  let yPosition = height - 150;
  const drawLine = (label: string, value: string) => {
    page.drawText(`${label}:`, { x: 50, y: yPosition, font: boldFont, size: 12 });
    page.drawText(value, { x: 200, y: yPosition, font, size: 12 });
    yPosition -= 25;
  };

  drawLine('Réservation #', reservation.id.toString());
  drawLine('Client', reservation.client);
  drawLine('Trajet', `${reservation.trajet.depart} → ${reservation.trajet.arrivee}`);
  drawLine('Date de départ', new Date(reservation.trajet.dateDepart).toLocaleString('fr-FR'));
  drawLine('Voyageurs', `${reservation.nbVoyageurs} (${reservation.adultCount} adultes, ${reservation.childrenCount} enfants)`);
  
  // QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(reservation.id.toString());
  const qrImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  page.drawImage(qrImage, {
    x: width - 200,
    y: height - 220,
    width: 150,
    height: 150,
  });

  // Footer
  page.drawText('Merci de voyager avec Oka Voyage. Présentez ce billet à l\'embarquement.', {
    x: 50,
    y: 50,
    font,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const validation = paramsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    const reservationIdAsNumber = parseInt(validation.data.id, 10);
    if (isNaN(reservationIdAsNumber)) {
      return NextResponse.json({ error: 'Invalid reservation ID format' }, { status: 400 });
    }

    const reservation = await reservationService.getById(reservationIdAsNumber);

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const pdfBytes = await generateTicketPdf(reservation);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="billet-${reservation.id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Ticket generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
