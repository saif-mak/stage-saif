'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RenovationItem {
    id: string;
    name: string;
    category: string;
    pricePerM2: number;
}

interface CustomRenovation {
    itemName: string;
    estimatedPrice: number;
}

interface Quote {
    id: string;
    totalPrice: number;
    renovationsJson: string;
    createdAt: string;
    client: { id: string; name: string; email: string; };
    office: { id: string; title: string; city: string; surface: number; basePrice: number; planUrl?: string; extractedDetails?: string; };
}

export default function AdminQuotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/quotes')
            .then(res => res.json())
            .then(data => {
                setQuotes(data);
                setIsLoading(false);
            })
            .catch(console.error);
    }, []);

    const toggleDetails = (id: string) => {
        setExpandedQuote(expandedQuote === id ? null : id);
    };

    const loadImgAsBase64 = async (url: string): Promise<string> => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Failed to load image as base64", url);
            return "";
        }
    };

    const generateQuotePDF = async (quote: Quote) => {
        setIsGeneratingPDF(quote.id);
        try {
            const doc = new jsPDF();
            const dateStr = new Date(quote.createdAt).toLocaleDateString('fr-FR');
            const renovations = JSON.parse(quote.renovationsJson || '{"standard":[], "custom":[]}');

            // Header Styles (Luxury/Professional Look)
            doc.setFillColor(33, 37, 41); // Dark bg
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("", "bold");
            doc.text("DEVIS D'AMÉNAGEMENT PRO", 14, 25);

            // Subheader Data
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont("", "normal");
            doc.text(`Date d'émission : ${dateStr}`, 14, 50);

            // Client Block (Right aligned manually)
            doc.setFont("", "bold");
            doc.text("CLIENT :", 120, 50);
            doc.setFont("", "normal");
            doc.text(`Entreprise : ${quote.client.name}`, 120, 56);
            doc.text(`Email : ${quote.client.email}`, 120, 62);

            doc.setDrawColor(200, 200, 200);
            doc.line(14, 85, 196, 85);

            // Office Subject
            doc.setFontSize(14);
            doc.setFont("", "bold");
            doc.text(`Objet : Aménagement du bien '${quote.office?.title || 'Unknown'}'`, 14, 95);
            doc.setFontSize(10);
            doc.setFont("", "normal");
            doc.text(`Localisation : ${quote.office?.city || 'Unknown'} | Surface : ${quote.office?.surface || 0} m²`, 14, 102);

            // Prepare Table Data
            const tableRows = [];
            let totalHT = 0;

            const basePrice = quote.office?.basePrice || 0;
            const surface = quote.office?.surface || 0;

            // 1. Base Rent (1st month)
            tableRows.push(["Loyer de base (mensuel)", "-", "-", `${basePrice} €`]);
            totalHT += basePrice;

            // 2. Standard Renovations
            if (renovations.standard && renovations.standard.length > 0) {
                renovations.standard.forEach((r: any) => {
                    const cost = r.pricePerM2 * surface;
                    tableRows.push([`Aménagement ${r.category}: ${r.name}`, `Surface totale (${surface}m²)`, `${r.pricePerM2}€/m²`, `${cost.toFixed(2)} €`]);
                    totalHT += cost;
                });
            }

            // 3. Custom AI Renovations
            if (renovations.custom && renovations.custom.length > 0) {
                renovations.custom.forEach((r: any) => {
                    tableRows.push([`Travaux sur-mesure (IA): ${r.itemName}`, "Forfait estimé", "-", `${r.estimatedPrice.toFixed(2)} €`]);
                    totalHT += r.estimatedPrice;
                });
            }

            const tva20 = totalHT * 0.20;

            // Generate autotable
            autoTable(doc, {
                startY: 110,
                head: [['Désignation', 'Quantité', 'Prix Unitaire HT', 'Total HT']],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 5 },
                columnStyles: {
                    0: { cellWidth: 80 },
                    3: { halign: 'right', fontStyle: 'bold' }
                }
            });

            // Totals
            const finalY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFont("", "normal");
            doc.text("Total HT :", 140, finalY);
            doc.text(`${totalHT.toFixed(2)} €`, 196, finalY, { align: 'right' });

            doc.text("TVA (20%) :", 140, finalY + 7);
            doc.text(`${tva20.toFixed(2)} €`, 196, finalY + 7, { align: 'right' });

            doc.setFont("", "bold");
            doc.setFontSize(12);
            doc.text("TOTAL TTC :", 140, finalY + 16);
            doc.text(`${quote.totalPrice.toFixed(2)} €`, 196, finalY + 16, { align: 'right' });

            // Terms
            doc.setFontSize(9);
            doc.setFont("", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Ce devis est une estimation générée assistée par IA sur la base des surfaces déclarées.", 14, finalY + 30);
            doc.text("Les prix finaux nécessitent l'intervention et la validation technique de nos artisans.", 14, finalY + 35);

            // PAGE 2 : Floor Plan & Details
            if (quote.office?.planUrl) {
                doc.addPage();
                doc.setFontSize(16);
                doc.setTextColor(33, 37, 41);
                doc.text("Annexe 1 : Plan du Bureau & Relevés Techniques", 14, 20);

                // Embed image
                const base64Img = await loadImgAsBase64(quote.office.planUrl);
                if (base64Img) {
                    try {
                        doc.addImage(base64Img, 'JPEG', 14, 30, 180, 120);
                    } catch (e) { console.error("Could not append image to PDF", e); }
                } else {
                    doc.setFontSize(10);
                    doc.text("[Erreur de chargement du plan visuel]", 14, 30);
                }

                // AI Extracted Details
                if (quote.office?.extractedDetails) {
                    doc.setFontSize(12);
                    doc.setFont("", "bold");
                    doc.text("Détails des surfaces extraites :", 14, 160);
                    doc.setFontSize(10);
                    doc.setFont("", "normal");

                    const splitText = doc.splitTextToSize(quote.office.extractedDetails, 180);
                    doc.text(splitText, 14, 170);
                }
            }

            const safeName = `Devis_${quote.client.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.pdf`;

            // Generate Blob and download via anchor tag
            const pdfBlob = doc.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = safeName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object to avoid memory leaks
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);

        } catch (error) {
            console.error("Error generating PDF", error);
            alert("Erreur lors de la génération du PDF");
        } finally {
            setIsGeneratingPDF(null);
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Manage Quotes</h1>
            <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Détails complets des devis et personnalisations clients.</p>

            <div className="glass-card">
                {isLoading ? (
                    <p>Chargement des devis...</p>
                ) : quotes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Aucun devis généré pour le moment.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Date</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Client</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Office</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Total Amount</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map(quote => {
                                    const renovations = JSON.parse(quote.renovationsJson || '{"standard":[], "custom":[]}');
                                    const isExpanded = expandedQuote === quote.id;

                                    return (
                                        <React.Fragment key={quote.id}>
                                            <tr
                                                style={{ borderBottom: isExpanded ? 'none' : '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                                onMouseOver={e => !isExpanded && (e.currentTarget.style.backgroundColor = '#f8f9ff')}
                                                onMouseOut={e => !isExpanded && (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {new Date(quote.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            backgroundColor: 'var(--primary)', color: 'white',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, fontSize: '0.85rem'
                                                        }}>
                                                            {quote.client.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{quote.client.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.client.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 500 }}>{quote.office?.title || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.office?.city || 'Unknown'}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                                                        color: 'var(--primary)',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {quote.totalPrice.toFixed(2)} €
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button
                                                        onClick={() => toggleDetails(quote.id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            backgroundColor: isExpanded ? '#6c757d' : '#4361ee',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {isExpanded ? 'Fermer' : 'Voir Devis ↓'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '0 1rem 2rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                                        <div className="animate-slide-in" style={{ backgroundColor: '#fcfcff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                                                <div>
                                                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        🛠 Aménagements Standards
                                                                    </h4>
                                                                    {renovations.standard?.length > 0 ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                            {renovations.standard.map((s: RenovationItem, idx: number) => (
                                                                                <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                    <div>
                                                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.category}</div>
                                                                                    </div>
                                                                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                                                                        {(s.pricePerM2 * (quote.office?.surface || 0)).toFixed(2)} €
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Aucun aménagement standard sélectionné.</p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        ✨ Demandes IA Sur-Mesure
                                                                    </h4>
                                                                    {renovations.custom?.length > 0 ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                            {renovations.custom.map((c: CustomRenovation, idx: number) => (
                                                                                <div key={idx} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                                        <span style={{ fontWeight: 700, color: '#10b981' }}>{c.itemName}</span>
                                                                                        <span style={{ fontWeight: 700 }}>{c.estimatedPrice.toFixed(2)} €</span>
                                                                                    </div>
                                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                                        Estimation du forfait IA
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Aucune personnalisation IA ajoutée.</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                                    Bureau: {quote.office?.title} ({quote.office?.surface} m²)
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                                    <button
                                                                        onClick={() => generateQuotePDF(quote)}
                                                                        disabled={isGeneratingPDF === quote.id}
                                                                        style={{
                                                                            padding: '0.5rem 1rem',
                                                                            backgroundColor: '#ffffff',
                                                                            color: '#000000',
                                                                            border: '2px solid #000000',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: 600,
                                                                            cursor: isGeneratingPDF === quote.id ? 'not-allowed' : 'pointer',
                                                                            opacity: isGeneratingPDF === quote.id ? 0.7 : 1
                                                                        }}
                                                                    >
                                                                        {isGeneratingPDF === quote.id ? 'Génération...' : 'Télécharger le devis'}
                                                                    </button>
                                                                    <Link href={`/admin/clients/${quote.client.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                                                                        Voir Dossier Client Complet →
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
