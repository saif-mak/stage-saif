'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Office {
    id: string;
    title: string;
    city: string;
    surface: number;
    basePrice: number;
    planUrl?: string;
    extractedDetails?: string;
}
interface Quote {
    id: string;
    totalPrice: number;
    createdAt: string;
    office: Office;
    renovationsJson: string;
}
interface Client {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    client: { id: string; name: string; email: string; };
    quotes: Quote[];
}

export default function ClientDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/clients/${id}`)
            .then(res => res.json())
            .then(data => {
                setClient(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div style={{ padding: '2rem' }}>Chargement...</div>;
    if (!client) return <div style={{ padding: '2rem' }}>Client introuvable.</div>;

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
            doc.text(`Entreprise : ${client.name}`, 120, 56);
            doc.text(`Email : ${client.email}`, 120, 62);

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

            const safeName = `Devis_${client.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.pdf`;

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
        <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
            <Link href="/admin/clients" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '1.5rem' }}>
                ← Retour aux clients
            </Link>

            {/* Client Header */}
            <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    backgroundColor: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 800, flexShrink: 0
                }}>
                    {client.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{client.name}</h1>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        <span>✉️ {client.email}</span>
                        {client.phone && <span>📞 {client.phone}</span>}
                        <span>📅 Client depuis {new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{client.quotes.length}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Devis générés</div>
                </div>
            </div>

            {/* Quotes Section */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>📄 Devis & Bureaux Consultés</h2>

            {client.quotes.length === 0 ? (
                <div className="glass-card" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
                    Ce client n'a pas encore généré de devis.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {client.quotes.map((quote) => {
                        let renovations = { standard: [], custom: [] } as any;
                        try { renovations = JSON.parse(quote.renovationsJson); } catch (e) { }

                        return (
                            <div key={quote.id} className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                            🏢 {quote.office?.title || 'Bureau supprimé'}
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            📍 {quote.office?.city} • {quote.office?.surface}m²
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                            Devis du {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                                            {quote.totalPrice.toFixed(2)} €
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total TTC</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {/* Standard Options */}
                                    <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '1rem' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aménagements Standards</div>
                                        {(renovations.standard || []).length === 0
                                            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucun</p>
                                            : (renovations.standard).map((r: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.25rem 0', borderBottom: '1px solid #eee' }}>
                                                    <span>{r.name} ({r.category})</span>
                                                    <strong>{(r.pricePerM2 * (quote.office?.surface || 0)).toFixed(0)} €</strong>
                                                </div>
                                            ))}
                                    </div>

                                    {/* AI Custom Options */}
                                    <div style={{ backgroundColor: '#f0f4ff', borderRadius: '8px', padding: '1rem' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Ajouts IA Sur-Mesure</div>
                                        {(renovations.custom || []).length === 0
                                            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucun</p>
                                            : (renovations.custom).map((r: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.25rem 0', borderBottom: '1px solid #dde7ff' }}>
                                                    <span>{r.itemName}</span>
                                                    <strong>{r.estimatedPrice} €</strong>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {quote.office && (
                                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                        <Link href={`/office/${quote.office.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                                            Voir le bureau →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
