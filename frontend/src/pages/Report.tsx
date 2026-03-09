import React, { useState, useEffect, useMemo } from 'react';
import {
    Link,
    useParams
} from 'react-router-dom';
import {
    Ticket as TicketIcon,
    Star,
    Clock,
    Plus,
    LayoutDashboard,
    Loader2,
    AlertCircle,
    Image as ImageIcon,
    X,
    Share,
    Download,
    ChevronDown,
    FileText,
    File,
    Presentation
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, PageOrientation, convertInchesToTwip, Table, TableRow, TableCell, WidthType } from 'docx';
import pptxgen from 'pptxgenjs';
import { toPng } from 'html-to-image';
import { RedmineIssue } from '../types/redmine';
import { StatCard } from '../components/ui/StatCard';
import { StatusChart } from '../components/dashboard/StatusChart';
import { PriorityGrid } from '../components/dashboard/PriorityGrid';
import { TypologyChart } from '../components/dashboard/TypologyChart';
import { StatusDetailCard } from '../components/dashboard/StatusDetailCard';
import { cn } from '../utils/cn';

export function Report() {
    const { id } = useParams();
    const [reportTicket, setReportTicket] = useState<RedmineIssue | null>(null);
    const [allIssues, setAllIssues] = useState<RedmineIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Période par défaut : les 6 derniers mois
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(sixMonthsAgoStr);
    const [endDate, setEndDate] = useState(today);
    const [refreshing, setRefreshing] = useState(false);

    // Logos personnalisables
    const [leftLogo, setLeftLogo] = useState<string | null>(null);
    const [rightLogo, setRightLogo] = useState<string | null>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (side === 'left') setLeftLogo(result);
                else setRightLogo(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const [exporting, setExporting] = useState(false);

    const exportToPPT = async () => {
        if (!reportTicket) return;
        setExporting(true);

        try {
            const pres = new pptxgen();
            pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches

            // Slide master: white background, subtle header bar
            pres.defineSlideMaster({
                title: 'CONTENT_MASTER',
                background: { fill: 'F8FAFC' },
                objects: [
                    // Blue top bar
                    { 'rect': { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: '1e40af' } } },
                    // Header text
                    { 'text': { text: `Rapport d'Activité — ${reportTicket.project.name}`, options: { x: 0.4, y: 0.1, w: 10, h: 0.35, fontSize: 10, bold: false, color: 'bfdbfe' } } },
                    // Bottom line
                    { 'line': { x: 0, y: 7.3, w: '100%', line: { color: 'e2e8f0', width: 1 } } },
                    // Footer text
                    { 'text': { text: `${new Date(startDate).toLocaleDateString('fr-FR')} — ${new Date(endDate).toLocaleDateString('fr-FR')}`, options: { x: 0.4, y: 7.3, w: 12, h: 0.2, fontSize: 8, color: '94a3b8' } } },
                ]
            });

            // Capture a DOM element and return { dataUrl, aspectRatio }
            const captureSection = async (elementId: string): Promise<{ dataUrl: string; ratio: number }> => {
                const el = document.getElementById(elementId);
                if (!el) return { dataUrl: '', ratio: 1 };
                const ratio = el.offsetWidth / el.offsetHeight;
                const dataUrl = await toPng(el, { quality: 1, backgroundColor: '#ffffff', cacheBust: true, pixelRatio: 2 });
                return { dataUrl, ratio };
            };

            // Add a content slide: title + image with correct proportions (no stretching)
            const addContentSlide = async (elementId: string, title: string) => {
                const { dataUrl, ratio } = await captureSection(elementId);
                if (!dataUrl) return;

                const slide = pres.addSlide({ masterName: 'CONTENT_MASTER' });
                // Title
                slide.addText(title, {
                    x: 0.5, y: 0.65, w: 12.3, h: 0.75,
                    fontSize: 20, bold: true, color: '1e293b'
                });

                // Image area: 12.3 wide × 5.8 tall max
                const maxW = 12.3;
                const maxH = 5.8;
                let imgW = maxW;
                let imgH = imgW / ratio;
                if (imgH > maxH) { imgH = maxH; imgW = imgH * ratio; }

                // Center image horizontally
                const imgX = 0.5 + (maxW - imgW) / 2;
                const imgY = 1.5;

                slide.addImage({ data: dataUrl, x: imgX, y: imgY, w: imgW, h: imgH });
            };

            // ─── SLIDE 1 : Cover page ───────────────────────────────────────────
            const cover = pres.addSlide();
            cover.background = { fill: 'FFFFFF' };

            // Top blue accent band
            cover.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.8, fill: { color: '1e40af' } });
            cover.addShape('rect', { x: 0, y: 1.8, w: '100%', h: 0.08, fill: { color: '3b82f6' } });

            // Logos in the blue band
            if (leftLogo) cover.addImage({ data: leftLogo, x: 0.5, y: 0.25, w: 2.2, h: 1.3, sizing: { type: 'contain', w: 2.2, h: 1.3 } });
            if (rightLogo) cover.addImage({ data: rightLogo, x: 10.63, y: 0.25, w: 2.2, h: 1.3, sizing: { type: 'contain', w: 2.2, h: 1.3 } });

            // Central title in blue band
            cover.addText("RAPPORT D'ACTIVITÉ", {
                x: 0, y: 0.4, w: '100%', h: 1, align: 'center',
                fontSize: 36, bold: true, color: 'FFFFFF'
            });

            // Project name below the band
            cover.addText(reportTicket.project.name, {
                x: 0.5, y: 2.2, w: 12.3, h: 0.85, align: 'center',
                fontSize: 30, bold: true, color: '1e40af'
            });

            // Subject
            cover.addText(reportTicket.subject, {
                x: 0.5, y: 3.05, w: 12.3, h: 0.55, align: 'center',
                fontSize: 15, color: '475569'
            });

            // Separator line
            cover.addShape('line', { x: 3, y: 3.8, w: 7.3, line: { color: 'e2e8f0', width: 1.5 } });

            // Period
            cover.addText('Période analysée', {
                x: 0.5, y: 4.0, w: 12.3, h: 0.4, align: 'center',
                fontSize: 11, color: '94a3b8', bold: true
            });
            cover.addText(
                `${new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} — ${new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
                { x: 0.5, y: 4.4, w: 12.3, h: 0.5, align: 'center', fontSize: 16, color: '1e293b', bold: true }
            );

            // Ticket count badge
            cover.addShape('rect', { x: 5.3, y: 5.2, w: 2.73, h: 0.8, fill: { color: 'eff6ff' }, line: { color: 'bfdbfe', width: 1 }, });
            cover.addText(`${allIssues.length} interventions`, {
                x: 5.3, y: 5.25, w: 2.73, h: 0.7, align: 'center',
                fontSize: 14, bold: true, color: '1d4ed8'
            });

            // Footer
            cover.addText('Généré automatiquement par le Portail de Reporting Redmine', {
                x: 0.5, y: 6.9, w: 12.3, h: 0.4, align: 'center',
                fontSize: 9, color: 'cbd5e1'
            });

            // ─── SLIDES DE CONTENU ──────────────────────────────────────────────
            await addContentSlide('report-summary-stats', "Vue d'ensemble de l'activité");
            await addContentSlide('report-charts-grid', "Analyse par Statut & Priorité");
            await addContentSlide('report-typology-section', "Répartition par Typologie");

            // Details
            const existingDetailPages: string[] = [];
            let pNum = 1;
            while (document.getElementById(`report-details-page-${pNum}`)) {
                existingDetailPages.push(`report-details-page-${pNum}`);
                pNum++;
            }
            for (let i = 0; i < existingDetailPages.length; i++) {
                await addContentSlide(existingDetailPages[i], `Détails de l'état d'avancement (Partie ${i + 1}/${existingDetailPages.length})`);
            }

            // Annex
            for (let gIdx = 0; gIdx < groupedAnnexIssues.length; gIdx++) {
                const group = groupedAnnexIssues[gIdx];
                let cIdx = 0;
                while (document.getElementById(`export-annex-group-${gIdx}-chunk-${cIdx}`)) {
                    await addContentSlide(`export-annex-group-${gIdx}-chunk-${cIdx}`, `Annexe : ${group.title} (${cIdx + 1})`);
                    cIdx++;
                }
            }

            await pres.writeFile({
                fileName: `Rapport_${reportTicket.project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`
            });

        } catch (err) {
            console.error("Erreur lors de l'export PPTX:", err);
            alert("Une erreur est survenue lors de la génération du PowerPoint.");
        } finally {
            setExporting(false);
        }
    };

    const [showExportMenu, setShowExportMenu] = useState(false);

    // ─── Shared capture helper ─────────────────────────────────────────────────
    const captureAsImage = async (elementId: string) => {
        const el = document.getElementById(elementId);
        if (!el) return null;
        const ratio = el.offsetWidth / el.offsetHeight;
        const dataUrl = await toPng(el, { quality: 1, backgroundColor: '#ffffff', cacheBust: true, pixelRatio: 2 });
        return { dataUrl, ratio, w: el.offsetWidth, h: el.offsetHeight };
    };

    // ─── PDF Paysage ───────────────────────────────────────────────────────────
    const exportToPDF = async () => {
        if (!reportTicket) return;
        setExporting(true);
        setShowExportMenu(false);
        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            // A4 landscape: 297 × 210 mm
            const pw = 297, ph = 210, margin = 12;

            const addPDFPage = async (elementId: string, title: string) => {
                pdf.addPage();
                const img = await captureAsImage(elementId);
                if (!img) return;

                // Gray header bar (slate-700)
                pdf.setFillColor(51, 65, 85);
                pdf.rect(0, 0, pw, 12, 'F');

                // Header text
                pdf.setFontSize(8);
                pdf.setTextColor(203, 213, 225);  // slate-300
                pdf.text(`Rapport d'Activité — ${reportTicket.project.name}`, margin, 8);
                const period = `${new Date(startDate).toLocaleDateString('fr-FR')} — ${new Date(endDate).toLocaleDateString('fr-FR')}`;
                pdf.text(period, pw - margin, 8, { align: 'right' });

                // Section title
                pdf.setFontSize(14);
                pdf.setTextColor(30, 41, 59);
                pdf.text(title, margin, 20);

                // Separator line under title
                pdf.setDrawColor(226, 232, 240);
                pdf.line(margin, 22, pw - margin, 22);

                // Content image — fit proportionally in the remaining space
                const maxW = pw - margin * 2;
                const maxH = ph - 38; // leave room for header (22) + footer (6)
                let imgW = maxW;
                let imgH = imgW / img.ratio;
                if (imgH > maxH) { imgH = maxH; imgW = imgH * img.ratio; }
                const imgX = margin + (maxW - imgW) / 2;

                pdf.addImage(img.dataUrl, 'PNG', imgX, 26, imgW, imgH);

                // Footer
                pdf.setFontSize(7);
                pdf.setTextColor(148, 163, 184);
                pdf.text('Généré automatiquement par le Portail de Reporting Redmine', pw / 2, ph - 3, { align: 'center' });
            };

            // Page de couverture
            // ── Bande grise (logos uniquement) ──
            // Gris ardoise foncé (slate-700)
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pw, 40, 'F');           // bande plus haute pour les logos
            pdf.setFillColor(245, 158, 11);        // slate-400 pour l'accent
            pdf.rect(0, 40, pw, 1.5, 'F');

            // Logos dans la bande — taille très réduite
            if (leftLogo) pdf.addImage(leftLogo, 'PNG', margin, 16, 25, 6, undefined, 'FAST');
            if (rightLogo) pdf.addImage(rightLogo, 'PNG', pw - margin - 25, 16, 25, 6, undefined, 'FAST');

            // ── Titre hors de la bande ──
            pdf.setFontSize(30);
            pdf.setTextColor(30, 41, 59);           // Presque noir
            pdf.text("RAPPORT D'ACTIVITÉ", pw / 2, 58, { align: 'center' });

            // Ligne décorative grise sous le titre
            pdf.setDrawColor(245, 158, 11);        // slate-400
            pdf.setLineWidth(0.8);
            pdf.line(pw / 3, 62, (pw * 2) / 3, 62);
            pdf.setLineWidth(0.2);

            // Nom du projet
            pdf.setFontSize(18);
            pdf.setTextColor(51, 65, 85);           // slate-700
            pdf.text(reportTicket.project.name, pw / 2, 74, { align: 'center' });

            // Sujet
            pdf.setFontSize(11);
            pdf.setTextColor(100, 116, 139);        // slate-500
            pdf.text(reportTicket.subject, pw / 2, 84, { align: 'center' });

            // Séparateur
            pdf.setDrawColor(226, 232, 240);        // slate-200
            pdf.line(pw / 4, 92, (pw * 3) / 4, 92);

            // Libellé période
            pdf.setFontSize(9);
            pdf.setTextColor(148, 163, 184);        // slate-400
            pdf.text('Période analysée', pw / 2, 100, { align: 'center' });

            // Dates de la période
            pdf.setFontSize(13);
            pdf.setTextColor(30, 41, 59);
            pdf.text(
                `${new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} — ${new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
                pw / 2, 109, { align: 'center' }
            );

            // Badge nombre d'interventions
            pdf.setFillColor(248, 250, 252);        // slate-50
            pdf.roundedRect(pw / 2 - 32, 120, 64, 14, 3, 3, 'F');
            pdf.setDrawColor(203, 213, 225);        // slate-300
            pdf.roundedRect(pw / 2 - 32, 120, 64, 14, 3, 3, 'S');
            pdf.setFontSize(12);
            pdf.setTextColor(51, 65, 85);           // slate-700
            pdf.text(`${allIssues.length} interventions`, pw / 2, 129, { align: 'center' });

            // Pied de page couverture
            pdf.setFontSize(7);
            pdf.setTextColor(203, 213, 225);
            pdf.text('Généré automatiquement par le Portail de Reporting Redmine', pw / 2, ph - 5, { align: 'center' });

            // Pages de contenu (always new pages after the cover)
            await addPDFPage('report-summary-stats', "Vue d'ensemble de l'activité");
            await addPDFPage('report-charts-grid', "Analyse par Statut & Priorité");
            await addPDFPage('report-typology-section', "Répartition par Typologie");
            // 5. Dynamic Detail Blocks (Two by two)
            const existingDetailPages: string[] = [];
            let pageNum = 1;
            while (document.getElementById(`report-details-page-${pageNum}`)) {
                existingDetailPages.push(`report-details-page-${pageNum}`);
                pageNum++;
            }

            // 6. Annex Pages (Paginated by 7 rows for maximum readability)
            for (let gIdx = 0; gIdx < groupedAnnexIssues.length; gIdx++) {
                const group = groupedAnnexIssues[gIdx];
                let chunkIdx = 0;
                while (document.getElementById(`export-annex-group-${gIdx}-chunk-${chunkIdx}`)) {
                    const elementId = `export-annex-group-${gIdx}-chunk-${chunkIdx}`;
                    const pageTitle = `Annexe : ${group.title} (Partie ${chunkIdx + 1})`;
                    await addPDFPage(elementId, pageTitle);
                    chunkIdx++;
                }
            }

            pdf.save(`Rapport_${reportTicket.project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (err) {
            console.error("Erreur PDF:", err);
            alert("Une erreur est survenue lors de la génération du PDF.");
        } finally {
            setExporting(false);
        }
    };

    // ─── Word (DOCX) ───────────────────────────────────────────────────────────
    const exportToWord = async () => {
        if (!reportTicket) return;
        setExporting(true);
        setShowExportMenu(false);
        try {
            const sections: any[] = [];
            const baseName = reportTicket.project.name;
            const periodStr = `${new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} — ${new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`;

            const fetchLogoAsBytes = async (dataUrl: string) => {
                const res = await fetch(dataUrl);
                return new Uint8Array(await res.arrayBuffer());
            };

            // Helper: capture section → Uint8Array PNG
            const captureSectionBytes = async (elementId: string) => {
                const img = await captureAsImage(elementId);
                if (!img) return null;
                const res = await fetch(img.dataUrl);
                return { bytes: new Uint8Array(await res.arrayBuffer()), ratio: img.ratio };
            };

            const sectionIds = [
                { id: 'report-summary-stats', title: "Vue d'ensemble de l'activité" },
                { id: 'report-charts-grid', title: 'Analyse par Statut & Priorité' },
                { id: 'report-typology-section', title: 'Répartition par Typologie' },
                { id: 'report-details-grid', title: "Détail de l'état d'avancement" },
            ];

            const sectionChildren: any[] = [];

            // Title section
            sectionChildren.push(
                new Paragraph({
                    children: [new TextRun({ text: "RAPPORT D'ACTIVITÉ", bold: true, size: 52, color: '1e40af' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: baseName, bold: true, size: 36, color: '1e293b' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 150 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: reportTicket.subject, size: 24, color: '475569' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: `Période : ${periodStr}`, bold: true, size: 22, color: '1d4ed8' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: `${allIssues.length} interventions`, bold: true, size: 24, color: '1e40af' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
            );

            // Content sections as images
            for (const section of sectionIds) {
                const cap = await captureSectionBytes(section.id);
                if (!cap) continue;
                // Max width in EMUs: A4 landscape usable ~ 22 cm = 8.66 inches
                const maxWidthEmu = convertInchesToTwip(8.5) * 914400 / 1440;
                const imgW = maxWidthEmu;
                const imgH = imgW / cap.ratio;
                sectionChildren.push(
                    new Paragraph({
                        children: [new TextRun({ text: section.title, bold: true, size: 32, color: '1e293b' })],
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400, after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: cap.bytes,
                                transformation: { width: Math.round(imgW / 914400 * 96), height: Math.round(imgH / 914400 * 96) },
                                type: 'png'
                            } as any)
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 }
                    })
                );
            }

            // Annex sections
            if (groupedAnnexIssues.length > 0) {
                sectionChildren.push(
                    new Paragraph({
                        children: [new TextRun({ text: "ANNEXE DÉTAILLÉE", bold: true, size: 40, color: '1e40af' })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 800, after: 400 },
                        pageBreakBefore: true
                    })
                );

                for (let i = 0; i < groupedAnnexIssues.length; i++) {
                    const group = groupedAnnexIssues[i];
                    sectionChildren.push(
                        new Paragraph({
                            children: [new TextRun({ text: group.title, bold: true, size: 28, color: '1e293b' })],
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 400, after: 200 }
                        })
                    );

                    // Create table for group
                    const rows = group.issues.map(issue =>
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `#${issue.id}`, bold: true, size: 18 })] })] }),
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: issue.tracker.name, size: 18 })] })] }),
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: issue.subject, size: 18 })] })] }),
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: issue.priority.name, size: 18 })] })] }),
                            ]
                        })
                    );

                    sectionChildren.push(
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "N°", bold: true, size: 18 })] })], shading: { fill: 'F1F5F9' } }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tracker", bold: true, size: 18 })] })], shading: { fill: 'F1F5F9' } }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sujet", bold: true, size: 18 })] })], shading: { fill: 'F1F5F9' } }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Priorité", bold: true, size: 18 })] })], shading: { fill: 'F1F5F9' } }),
                                    ]
                                }),
                                ...rows
                            ]
                        })
                    );
                }
            }

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            size: { orientation: PageOrientation.LANDSCAPE, width: convertInchesToTwip(11.69), height: convertInchesToTwip(8.27) },
                            margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.8), right: convertInchesToTwip(0.8) }
                        }
                    },
                    children: sectionChildren
                }]
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Rapport_${baseName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Erreur Word:", err);
            alert("Une erreur est survenue lors de la génération du fichier Word.");
        } finally {
            setExporting(false);
        }
    };


    useEffect(() => {
        const loadReportData = async (isRefresh = false) => {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            try {
                let currentProjectID = reportTicket?.project.id;

                if (!reportTicket || reportTicket.id.toString() !== id) {
                    const ticketRes = await fetch(`/api/redmine/tickets/${id}`);
                    if (!ticketRes.ok) throw new Error('Impossible de charger le ticket de rapport');
                    const ticketData = await ticketRes.json();
                    setReportTicket(ticketData.issue);
                    currentProjectID = ticketData.issue.project.id;
                }

                if (currentProjectID) {
                    const dateFilter = `><${startDate}|${endDate}`;
                    let allFetchedIssues: RedmineIssue[] = [];
                    let offset = 0;
                    let hasMore = true;
                    const limit = 100; // Utiliser une limite raisonnable par page

                    while (hasMore) {
                        const issuesRes = await fetch(
                            `/api/redmine/tickets?project_id=${currentProjectID}&limit=${limit}&offset=${offset}&status_id=*&created_on=${dateFilter}`
                        );
                        if (!issuesRes.ok) throw new Error('Impossible de charger les interventions du projet');
                        const issuesData = await issuesRes.json() as { issues: RedmineIssue[], total_count: number };

                        allFetchedIssues = [...allFetchedIssues, ...issuesData.issues];
                        offset += limit;

                        if (allFetchedIssues.length >= issuesData.total_count || issuesData.issues.length === 0) {
                            hasMore = false;
                        }
                    }

                    setAllIssues(allFetchedIssues);
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        if (id) loadReportData(allIssues.length > 0);
    }, [id, startDate, endDate]);

    const trackerColorMap = useMemo(() => {
        const map: Record<string, string> = {};
        const trackers = Array.from(new Set(allIssues.map(i => i.tracker.name))) as string[];
        trackers.forEach(name => {
            const low = name.toLowerCase();
            map[name] = low.includes('web') ? '#6366f1' :
                low.includes('bug') ? '#ef4444' :
                    low.includes('reunion') ? '#f59e0b' :
                        low.includes('doc') ? '#10b981' : '#8b5cf6';
        });
        return map;
    }, [allIssues]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium">Génération du rapport dynamique...</p>
                </div>
            </div>
        );
    }

    if (error || !reportTicket) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || "Rapport non trouvé"}</h2>
                    <Link to="/" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
                        Retour au portail
                    </Link>
                </div>
            </div>
        );
    }

    // Data processing
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const statusCounts = allIssues.reduce((acc: Record<string, number>, issue) => {
        const normName = normalize(issue.status.name);
        acc[normName] = (acc[normName] || 0) + 1;
        return acc;
    }, {});

    const getAggregatedStatusCount = (keywords: string[]) => {
        const normalizedKeywords = keywords.map(normalize);
        return Object.entries(statusCounts).reduce((total, [name, count]) => {
            if (normalizedKeywords.some(kw => name.includes(kw))) {
                return total + (count as number);
            }
            return total;
        }, 0);
    };

    const totalInterventions = allIssues.length;

    const statusData = Object.entries(statusCounts).map(([name, count]) => ({
        name,
        count: count as number,
        color: name.includes('clot') || name.includes('resol') ? '#10b981' :
            name.includes('pris') || name.includes('cours') ? '#3b82f6' :
                name.includes('bloq') ? '#ef4444' : '#f97316'
    }));

    const priorityCounts = allIssues.reduce((acc: any, issue) => {
        const name = issue.priority.name;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    const priorityData = Object.entries(priorityCounts).map(([name, count]) => {
        const styles: Record<string, any> = {
            'Critique': { time: '1h', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', bar: 'bg-rose-500' },
            'Majeure': { time: '4h', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', bar: 'bg-orange-500' },
            'Haute': { time: '4h', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', bar: 'bg-orange-500' },
            'Normale': { time: '8h', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', bar: 'bg-blue-500' },
            'Moyenne': { time: '8h', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', bar: 'bg-blue-500' },
            'Mineure': { time: '24h', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500' },
            'Basse': { time: '24h', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500' },
            'Urgent': { time: '2h', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', bar: 'bg-rose-500' },
        };
        const style = styles[name] || { time: '--', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', bar: 'bg-slate-500' };
        return {
            label: name,
            time: style.time,
            count: count as number,
            total: totalInterventions,
            ...style
        };
    }).sort((a, b) => {
        const order: Record<string, number> = { 'Critique': 0, 'Urgent': 1, 'Majeure': 2, 'Haute': 3, 'Normale': 4, 'Moyenne': 5, 'Haute ': 3, 'Normale ': 4, 'Mineure': 6, 'Basse': 7 };
        return (order[a.label] ?? 99) - (order[b.label] ?? 99);
    });

    const typologyCounts = allIssues.reduce((acc: any, issue) => {
        const name = issue.tracker.name;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    const typologyData = Object.entries(typologyCounts).map(([name, count]) => ({
        name,
        count: count as number,
        color: trackerColorMap[name] || '#8b5cf6'
    }));

    const getTypologyByStatus = (statusKeywords: string[]) => {
        const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedKeywords = statusKeywords.map(normalize);

        const filtered = allIssues.filter(issue => {
            const statusName = normalize(issue.status.name);
            return normalizedKeywords.some(kw => statusName.includes(kw));
        });

        return filtered.reduce((acc: any, issue) => {
            const name = issue.tracker.name;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
    };

    const closedTypology = getTypologyByStatus(['clot', 'resolu', 'ferm', 'termin']);
    const inProgressTypology = getTypologyByStatus(['pris en charge', 'en cours']);

    // Annex Data Processing
    const getGroupedIssuesForAnnex = () => {
        const groupsConfig = [
            { title: "Tickets Clôturés", keywords: ['clot', 'resol', 'ferm', 'termin', 'clos'], color: 'text-emerald-600', bg: 'bg-emerald-500' },
            { title: "Tickets Pris en charge", keywords: ['pris', 'cours'], color: 'text-blue-600', bg: 'bg-blue-500' },
            { title: "En cours de traitement", keywords: ['traitement'], color: 'text-indigo-600', bg: 'bg-indigo-500' },
            { title: "En cours de test", keywords: ['test', 'recette'], color: 'text-orange-600', bg: 'bg-orange-500' },
            { title: "En cours de validation", keywords: ['validation', 'approbation'], color: 'text-emerald-600', bg: 'bg-emerald-500' },
            { title: "Tickets Bloqués", keywords: ['bloq', 'attente'], color: 'text-rose-600', bg: 'bg-rose-500' },
            { title: "Tickets Ouverts", keywords: ['ouvert', 'nouveau'], color: 'text-orange-600', bg: 'bg-orange-500' },
            { title: "Tickets Annulés", keywords: ['annul', 'rejet', 'ignore'], color: 'text-rose-600', bg: 'bg-rose-500' },
        ];

        return groupsConfig.map(group => {
            const normalizedKeywords = group.keywords.map(normalize);
            const issues = allIssues.filter(issue => {
                const statusName = normalize(issue.status.name);
                return normalizedKeywords.some(kw => statusName.includes(kw));
            }).sort((a, b) => b.id - a.id);
            return { ...group, issues };
        }).filter(group => group.issues.length > 0);
    };

    const groupedAnnexIssues = getGroupedIssuesForAnnex();
    const processingTypology = getTypologyByStatus(['traitement']);
    const blockedTypology = getTypologyByStatus(['bloq', 'attente']);
    const openTypology = getTypologyByStatus(['ouvert', 'nouveau']);

    const topTypology = Object.entries(typologyCounts).sort((a: any, b: any) => b[1] - a[1])[0];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
                <nav className="mb-8 flex justify-between items-center">
                    <Link to="/" className="text-slate-400 hover:text-blue-600 font-bold text-sm flex items-center gap-2 transition-colors">
                        <LayoutDashboard size={16} />
                        Retour au portail
                    </Link>

                    {/* Export dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(v => !v)}
                            disabled={exporting}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {exporting ? 'Génération en cours…' : 'Exporter'}
                            {!exporting && <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />}
                        </button>

                        {showExportMenu && !exporting && (
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                                <button
                                    onClick={() => { setShowExportMenu(false); exportToPPT(); }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                                        <Presentation size={16} />
                                    </div>
                                    PowerPoint (.pptx)
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                                        <File size={16} />
                                    </div>
                                    PDF Paysage (.pdf)
                                </button>
                                <button
                                    onClick={exportToWord}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                        <FileText size={16} />
                                    </div>
                                    Word Paysage (.docx)
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Zones de logos personnalisables */}
                <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-10">
                    <div className="relative group w-56 h-24 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden hover:border-blue-200 hover:bg-slate-50 transition-all">
                        {leftLogo ? (
                            <>
                                <img src={leftLogo} alt="Logo Gauche" className="max-h-full max-w-full object-contain p-4" />
                                <button onClick={() => setLeftLogo(null)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-50">
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors w-full h-full justify-center">
                                <ImageIcon size={28} />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Logo Client / Gauche</span>
                                <input type="file" className="hidden" onChange={(e) => handleLogoUpload(e, 'left')} accept="image/*" />
                            </label>
                        )}
                    </div>

                    <div className="relative group w-56 h-24 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden hover:border-blue-200 hover:bg-slate-50 transition-all">
                        {rightLogo ? (
                            <>
                                <img src={rightLogo} alt="Logo Droite" className="max-h-full max-w-full object-contain p-4" />
                                <button onClick={() => setRightLogo(null)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-50">
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors w-full h-full justify-center">
                                <ImageIcon size={28} />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Logo Interne / Droit</span>
                                <input type="file" className="hidden" onChange={(e) => handleLogoUpload(e, 'right')} accept="image/*" />
                            </label>
                        )}
                    </div>
                </div>

                <header className="mb-8 border-b border-slate-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900">Rapport d'Activité</h2>
                        <p className="text-blue-600 font-semibold mt-1 text-lg">{reportTicket.project.name}</p>
                        <p className="text-slate-500 mt-1">{reportTicket.subject}</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <div className="flex flex-col px-3 border-r border-slate-200">
                                <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Du</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 p-0 outline-none cursor-pointer"
                                />
                            </div>
                            <div className="flex flex-col px-3">
                                <label className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Au</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 p-0 outline-none cursor-pointer"
                                />
                            </div>
                            {refreshing && <Loader2 size={16} className="animate-spin text-blue-600 mr-2" />}
                        </div>
                        <p className="text-lg font-semibold text-slate-700 bg-slate-100 px-4 py-1 rounded-lg border border-slate-200 inline-block">
                            #{reportTicket.id}
                        </p>
                    </div>
                </header>

                <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden">
                    <p className="text-slate-700 leading-relaxed text-lg relative z-10">
                        Ce rapport est élaboré dans le cadre du contrat de run services du site afin de présenter les interventions réalisées durant la période du <strong>{new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong> au <strong>{new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong> et qui sont en définitif au nombre de <strong>{totalInterventions}</strong>.
                    </p>
                </div>

                <div id="report-summary-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 bg-white">
                    <StatCard
                        title="Total des tickets"
                        value={totalInterventions.toString()}
                        icon={<TicketIcon className="text-blue-600" size={20} />}
                        iconBg="bg-blue-50"
                        progress={100}
                        progressColor="bg-blue-600"
                    />
                    <StatCard
                        title="Dernière mise à jour"
                        value={new Date(reportTicket.updated_on).toLocaleDateString()}
                        icon={<Clock className="text-orange-600" size={20} />}
                        iconBg="bg-orange-50"
                        subtitle="Données en temps réel"
                    />
                    {(() => {
                        const closureCount = getAggregatedStatusCount(['clot', 'resol']);
                        const closurePercentage = totalInterventions > 0 ? Math.round((closureCount / totalInterventions) * 100) : 0;
                        const ratingValue = Math.max(1, Math.ceil(closurePercentage / 20));

                        return (
                            <StatCard
                                title="Taux de clôture"
                                value={`${closurePercentage}%`}
                                icon={<Star className="text-yellow-500" size={20} />}
                                iconBg="bg-yellow-50"
                                rating={ratingValue}
                            />
                        );
                    })()}
                    <StatCard
                        title="Charge de Travail Active"
                        value={getAggregatedStatusCount(['pris', 'cours', 'traitement', 'test', 'validation', 'bloq', 'attente', 'ouvert', 'nouveau']).toString()}
                        trend="En cours"
                        trendUp={false}
                        icon={<LayoutDashboard className="text-indigo-600" size={20} />}
                        iconBg="bg-indigo-50"
                        subtitle="Tickets hors clôturés/annulés"
                    />
                </div>

                <div id="report-charts-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-4 rounded-3xl">
                    <StatusChart data={statusData} total={totalInterventions} />
                    <PriorityGrid data={priorityData} />
                </div>

                <div id="report-typology-section" className="bg-white p-4 rounded-3xl">
                    <TypologyChart data={typologyData} total={totalInterventions} />
                </div>

                {/* Dynamic Detail Blocks (Only if count > 0) */}
                <div className="mt-8 space-y-8">
                    {(() => {
                        interface DetailBlockConfig {
                            id: string;
                            title: string;
                            count: number;
                            typologyKeywords: string[];
                            icon: React.ReactNode;
                            themeColor: 'emerald' | 'blue' | 'rose' | 'orange' | 'indigo';
                            summary: React.ReactNode;
                            badge?: string;
                        }

                        const detailBlocks: DetailBlockConfig[] = [
                            {
                                id: 'closed',
                                title: "Tickets Clôturés",
                                count: getAggregatedStatusCount(['clot', 'resol', 'ferm', 'termin', 'clos']),
                                typologyKeywords: ['clot', 'resol', 'ferm', 'termin', 'clos'],
                                icon: <Plus size={24} />,
                                themeColor: 'emerald',
                                summary: topTypology ? (
                                    <>Les activités de <strong>{topTypology[0]}</strong> représentent la majeure partie des interventions clôturées.</>
                                ) : (
                                    <>Aucune donnée d'intervention disponible.</>
                                )
                            },
                            {
                                id: 'in_progress',
                                title: "Tickets Pris en charge",
                                count: getAggregatedStatusCount(['pris', 'cours']),
                                typologyKeywords: ['pris', 'cours'],
                                icon: <Clock size={24} />,
                                themeColor: 'blue',
                                summary: "Le flux de travail est optimisé pour garantir une résolution rapide des tâches en cours."
                            },
                            {
                                id: 'processing',
                                title: "Tickets En cours de traitement",
                                count: getAggregatedStatusCount(['traitement']),
                                typologyKeywords: ['traitement'],
                                icon: <Clock size={24} />,
                                themeColor: 'indigo',
                                summary: "Ces tickets sont actuellement en phase active de réalisation technique et nécessitent un suivi rapproché."
                            },
                            {
                                id: 'blocked',
                                title: "Tickets Bloqués",
                                count: getAggregatedStatusCount(['bloq', 'attente']),
                                typologyKeywords: ['bloq', 'attente'],
                                icon: <AlertCircle size={24} />,
                                themeColor: 'rose',
                                summary: "Les tickets bloqués font l'objet d'une attention particulière pour lever les obstacles rapidement."
                            },
                            {
                                id: 'testing',
                                title: "En cours de test",
                                count: getAggregatedStatusCount(['test', 'recette']),
                                typologyKeywords: ['test', 'recette'],
                                icon: <Clock size={24} />,
                                themeColor: 'orange',
                                badge: "Phase de Recette",
                                summary: "Les tickets dans cette phase subissent des tests de qualité avant livraison."
                            },
                            {
                                id: 'validation',
                                title: "En cours de validation",
                                count: getAggregatedStatusCount(['validation', 'approbation']),
                                typologyKeywords: ['validation', 'approbation'],
                                icon: <Star size={24} />,
                                themeColor: 'emerald',
                                summary: "Tickets en attente de la validation finale par les parties prenantes."
                            },
                            {
                                id: 'open',
                                title: "Tickets Ouverts",
                                count: getAggregatedStatusCount(['ouvert', 'nouveau']),
                                typologyKeywords: ['ouvert', 'nouveau'],
                                icon: <Plus size={24} />,
                                themeColor: 'orange',
                                summary: "Les nouveaux tickets sont qualifiés par l'équipe avant d'être pris en charge."
                            },
                            {
                                id: 'cancelled',
                                title: "Tickets Annulés",
                                count: getAggregatedStatusCount(['annul', 'rejet', 'ignore']),
                                typologyKeywords: ['annul', 'rejet', 'ignore'],
                                icon: <AlertCircle size={24} />,
                                themeColor: 'rose',
                                summary: "Tickets qui ont été annulés ou rejetés pour diverses raisons."
                            }
                        ];

                        const visibleBlocks = detailBlocks.filter(b => b.count > 0);
                        const pages = [];
                        for (let i = 0; i < visibleBlocks.length; i += 2) {
                            pages.push(visibleBlocks.slice(i, i + 2));
                        }

                        return pages.map((pageBlocks, pageIdx) => (
                            <div
                                key={`page-${pageIdx}`}
                                id={`report-details-page-${pageIdx + 1}`}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                            >
                                {pageBlocks.map(block => (
                                    <StatusDetailCard
                                        key={block.id}
                                        title={block.title}
                                        count={block.count}
                                        typologyData={getTypologyByStatus(block.typologyKeywords)}
                                        icon={block.icon}
                                        themeColor={block.themeColor}
                                        colorMap={trackerColorMap}
                                        badge={block.badge}
                                        summary={block.summary}
                                    />
                                ))}
                                {pageBlocks.length === 1 && (
                                    <div className="hidden md:flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl p-8 opacity-20">
                                        <p className="text-slate-400 font-bold italic tracking-widest text-sm uppercase">Espace réservé</p>
                                    </div>
                                )}
                            </div>
                        ));
                    })()}
                </div>

                {/* Web Annex Section (Scrollable and unified for UI) */}
                <div id="report-annex-section" className="mt-20 pt-20 border-t-2 border-slate-100">
                    <div className="flex items-center gap-6 mb-12">
                        {/* <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                            <Plus className="text-white" size={32} />
                        </div> */}
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Annexe Détaillée</h2>
                            <p className="text-slate-500 font-medium italic text-lg">Liste exhaustive des interventions classées par état d'avancement.</p>
                        </div>
                    </div>

                    <div className="space-y-16">
                        {groupedAnnexIssues.map((group, gIdx) => (
                            <div key={group.title} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className={cn("text-xl font-black uppercase tracking-tight flex items-center gap-4", group.color)}>
                                        <span className={cn("w-3 h-8 rounded-full shadow-sm", group.bg)} />
                                        {group.title}
                                    </h3>
                                    <span className="bg-white px-4 py-1.5 rounded-full text-xs font-black text-slate-500 border border-slate-200 shadow-sm">
                                        {group.issues.length} {group.issues.length > 1 ? 'INTERVENTIONS' : 'INTERVENTION'}
                                    </span>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                                <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Réf.</th>
                                                <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tracker</th>
                                                <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sujet de l'intervention</th>
                                                <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Priorité</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {group.issues.map(issue => {
                                                const prio = priorityData.find(p => p.label === issue.priority.name);
                                                return (
                                                    <tr key={issue.id} className="hover:bg-slate-50/50 transition-all duration-200 group text-sm">
                                                        <td className="px-10 py-5 font-black text-slate-900 italic opacity-60">#{issue.id}</td>
                                                        <td className="px-10 py-5">
                                                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-slate-200" style={{ color: trackerColorMap[issue.tracker.name] || '#6366f1' }}>
                                                                {issue.tracker.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 py-5 text-slate-700 font-semibold max-w-xl">
                                                            <div className="line-clamp-2 break-words">{issue.subject}</div>
                                                        </td>
                                                        <td className="px-10 py-5 text-xs font-black uppercase">{issue.priority.name}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hidden Export Pages (Paginated for PDF/PPTX capture) */}
                <div className="absolute left-[-9999px] top-0 pointer-events-none overflow-hidden" style={{ width: '1200px' }}>
                    {groupedAnnexIssues.map((group, gIdx) => {
                        const chunks = [];
                        for (let i = 0; i < group.issues.length; i += 7) {
                            chunks.push(group.issues.slice(i, i + 7));
                        }
                        return chunks.map((chunk, cIdx) => (
                            <div
                                key={`export-annex-${gIdx}-${cIdx}`}
                                id={`export-annex-group-${gIdx}-chunk-${cIdx}`}
                                className="bg-white p-12 rounded-[2.5rem] border border-slate-200 mb-10 w-full"
                            >
                                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200">
                                    <h3 className={cn("text-2xl font-black uppercase tracking-tight flex items-center gap-4", group.color)}>
                                        <span className={cn("w-4 h-10 rounded-full shadow-sm", group.bg)} />
                                        {group.title} {chunks.length > 1 ? `(${cIdx + 1}/${chunks.length})` : ''}
                                    </h3>
                                    <span className="text-slate-400 font-black text-sm uppercase italic">Document Annexe — {group.issues.length} {group.issues.length > 1 ? 'Items' : 'Item'}</span>
                                </div>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Réf.</th>
                                            <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Tracker</th>
                                            <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest w-[50%]">Sujet</th>
                                            <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Priorité</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {chunk.map(issue => {
                                            const prio = priorityData.find(p => p.label === issue.priority.name);
                                            return (
                                                <tr key={issue.id}>
                                                    <td className="px-8 py-6 font-black text-slate-900 italic text-base">#{issue.id}</td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-4 py-1.5 rounded-xl text-xs font-black border border-slate-200" style={{ color: trackerColorMap[issue.tracker.name] || '#6366f1' }}>
                                                            {issue.tracker.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-slate-700 text-sm font-bold leading-tight w-[50%]">
                                                        <div className="line-clamp-2 break-words">{issue.subject}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={cn("px-4 py-2 rounded-full text-[11px] font-black uppercase border", prio?.bg || 'bg-slate-50', prio?.color || 'text-slate-600', prio?.border || 'border-slate-100')}>
                                                            {issue.priority.name}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ));
                    })}
                </div>

                <footer className="mt-16 text-center text-slate-400 text-sm border-t border-slate-100 pt-8">
                    © 2026 Système de Support Technique Redmine — Rapport Généré Automatiquement
                </footer>
            </div>
        </div>
    );
}
