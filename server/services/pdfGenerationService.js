import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generateFichePDF(candidateInfo, callId, customData) {
    try {
        const fileName = `fiche-${callId}-` + Math.random().toString(36).substring(2, 9) + '.pdf'
        const pdfPath = path.join(__dirname, '../fiche', fileName);
        
        // PATHS FOR ASSETS
        const fontRegular = path.join(__dirname, 'fonts', 'OpenSans-Regular.ttf');
        const fontBold = path.join(__dirname, 'fonts', 'OpenSans-Bold.ttf');
        const logoPath = path.join(__dirname, 'assets', 'ia-bot.png');
        
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        // REGISTER CUSTOM FONTS
        doc.registerFont('OpenSans-Regular', fontRegular);
        doc.registerFont('OpenSans-Bold', fontBold);

        // HEADER WITH LOGO
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 30, { width: 40 }); // Logo at top left
        }
        
        doc.font(fontBold).fontSize(20).text('FICHE CANDIDAT', 100, 50);
           
        doc.font(fontRegular).fontSize(12).text('Riviera Connection - Directrice de casting: Sherine', 100, 80);
           
        doc.moveTo(100, 100).lineTo(500, 100).stroke();

        let yPosition = 120;

        // INDENTITÉ
        doc.font(fontBold).fontSize(14).text('IDENTITÉ', 100, yPosition);
        yPosition += 25;
        doc.font(fontRegular).fontSize(10).text(`Nom: ${candidateInfo.identite?.nom || 'Non renseigné'}`, 120, yPosition);
        yPosition += 15;
        doc.text(`Prénom: ${candidateInfo.identite?.prenom || 'Non renseigné'}`, 120, yPosition);
        yPosition += 15;
        doc.text(`Âge: ${candidateInfo.identite?.age || 'Non renseigné'}`, 120, yPosition);
        yPosition += 30;

        // CONTACT
        doc.font(fontBold).fontSize(14).text('CONTACT', 100, yPosition);
        yPosition += 25;
        doc.font(fontRegular).fontSize(10).text(`Téléphone: ${candidateInfo.contact?.telephone || 'Non renseigné'}`, 120, yPosition);
        yPosition += 15;
        doc.text(`Email: ${candidateInfo.contact?.email || 'Non renseigné'}`, 120, yPosition);
        yPosition += 30;

        // EXPÉRIENCE
        doc.font(fontBold).fontSize(14).text('EXPÉRIENCE', 100, yPosition);
        yPosition += 25;
        doc.font(fontRegular);
        if (candidateInfo.experience?.postes?.length > 0) {
            candidateInfo.experience.postes.forEach((poste, index) => {
                const duree = candidateInfo.experience.durees?.[index] || '';
                doc.fontSize(10).text(`• ${poste} ${duree ? `(${duree})` : ''}`, 120, yPosition);
                yPosition += 15;
            });
        } else {
            doc.fontSize(10).text('Non renseigné', 120, yPosition);
            yPosition += 15;
        }
        yPosition += 15;

        // COMPÉTENCES
        doc.font(fontBold).fontSize(14).text('COMPÉTENCES', 100, yPosition);
        yPosition += 25;
        doc.font(fontRegular).fontSize(12).text('Techniques:', 120, yPosition);
        yPosition += 15;
        doc.font(fontRegular);
        if (candidateInfo.competences?.techniques?.length > 0) {
            candidateInfo.competences.techniques.forEach(comp => {
                doc.fontSize(10).text(`• ${comp}`, 140, yPosition);
                yPosition += 12;
            });
        } else {
            doc.fontSize(10).text('Non renseigné', 140, yPosition);
            yPosition += 12;
        }
        
        yPosition += 10;
        doc.font(fontBold).fontSize(12).text('Soft Skills:', 120, yPosition);
        yPosition += 15;
        doc.font(fontRegular);
        if (candidateInfo.competences?.soft_skills?.length > 0) {
            candidateInfo.competences.soft_skills.forEach(skill => {
                doc.fontSize(10).text(`• ${skill}`, 140, yPosition);
                yPosition += 12;
            });
        } else {
            doc.fontSize(10).text('Non renseigné', 140, yPosition);
            yPosition += 12;
        }
        yPosition += 20;

        // DISPONIBILITÉ
        doc.font(fontBold).fontSize(14).text('DISPONIBILITÉ', 100, yPosition);
        yPosition += 25;
        doc.font(fontRegular).fontSize(10).text(`Date: ${candidateInfo.disponibilite?.date || 'Non renseigné'}`, 120, yPosition);
        yPosition += 15;
        doc.text(`Contraintes: ${candidateInfo.disponibilite?.contraintes || 'Aucune'}`, 120, yPosition);
        yPosition += 30;

        // PRÉTENTIONS
        doc.font(fontBold).fontSize(14).text('PRÉTENTIONS SALARIALES', 100, yPosition);
        yPosition += 25;
        doc.font(fontRegular).fontSize(10).text(`Salaire: ${candidateInfo.pretentions?.salaire || 'Non renseigné'}`, 120, yPosition);
        yPosition += 15;
        doc.text(`Conditions: ${candidateInfo.pretentions?.conditions || 'Standard'}`, 120, yPosition);
        yPosition += 30;

        // MOTICATION
        doc.font(fontBold).fontSize(14).text('MOTIVATION', 100, yPosition);
        yPosition += 25;
        doc.font(fontRegular).fontSize(10).text(candidateInfo.motivation || 'Non renseigné', 120, yPosition, {
            width: 350,
            align: 'justify'
        });

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 480, 750, { width: 30 }); 
        }

        doc.end();

        return fileName;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}