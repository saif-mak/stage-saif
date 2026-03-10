'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from '../../../ClientDashboard.module.css';

interface Office {
    id: string; title: string; city: string; surface: number; basePrice: number;
    description: string; extractedDetails: string; planUrl: string;
}
interface Renovation { id: string; category: string; name: string; pricePerM2: number; }
interface CustomRenovation { itemName: string; estimatedPrice: number; }
interface ClientData { companyName: string; email: string; phone: string; description: string; employees: string; }

export default function CustomizePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [office, setOffice] = useState<Office | null>(null);
    const [renovations, setRenovations] = useState<Renovation[]>([]);
    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Selections
    const [selectedRenovations, setSelectedRenovations] = useState<string[]>([]);
    const [customRenovations, setCustomRenovations] = useState<CustomRenovation[]>([]);

    // Chat
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "Bonjour ! Je suis votre assistant aménagement. Parlez-moi de vos envies spécifiques (ex: 'Je veux ajouter une cloison pour une salle de réunion', 'Peinture écologique bleue'). Je vous ferai une estimation instantanée pour votre bureau." }
    ]);
    const [isChatting, setIsChatting] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    useEffect(() => {
        const data = localStorage.getItem(`clientData_${id}`);
        if (!data) {
            alert("Aucune information client trouvée, veuillez reprendre à l'étape 1.");
            router.push(`/office/${id}/apply`);
            return;
        }
        setClientData(JSON.parse(data));

        Promise.all([
            fetch(`/api/offices/${id}`).then(res => res.json()),
            fetch('/api/renovations').then(res => res.json())
        ]).then(([officeData, renosData]) => {
            if (officeData.error) { router.push('/'); return; }
            setOffice(officeData);
            setRenovations(renosData);
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, [id, router]);

    const handleToggleRenovation = (renoId: string) => {
        setSelectedRenovations(prev =>
            prev.includes(renoId) ? prev.filter(item => item !== renoId) : [...prev, renoId]
        );
    };

    const handleSendChat = async () => {
        if (!chatMessage.trim() || !office) return;
        const userMsg = chatMessage;
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatMessage('');
        setIsChatting(true);

        try {
            const res = await fetch('/api/chat/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    officeSurface: office.surface,
                    officeCity: office.city,
                    extractedDetails: office.extractedDetails,
                    history: chatHistory // Send full conversation history for context
                })
            });
            const data = await res.json();

            if (data.reply) {
                setChatHistory(prev => [...prev, { role: 'ai', text: data.reply }]);
            }
            if (data.itemName && data.estimatedPrice > 0) {
                setCustomRenovations(prev => [...prev, { itemName: data.itemName, estimatedPrice: data.estimatedPrice }]);
                setChatHistory(prev => [...prev, { role: 'ai', text: `✅ L'estimation a été ajoutée à votre devis : "${data.itemName}" pour ${data.estimatedPrice}€ HT.` }]);
            }
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'ai', text: 'Désolé, une erreur technique est survenue.' }]);
        } finally {
            setIsChatting(false);
        }
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

    const generatePDF = async () => {
        if (!office || !clientData) return;
        setIsGeneratingPDF(true);

        try {
            const doc = new jsPDF();
            const dateStr = new Date().toLocaleDateString('fr-FR');

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
            doc.text(`Devis expiré le : ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}`, 14, 55);

            // Client Block (Right aligned manually)
            doc.setFont("", "bold");
            doc.text("CLIENT :", 120, 50);
            doc.setFont("", "normal");
            doc.text(`Entreprise : ${clientData.companyName}`, 120, 56);
            doc.text(`Email : ${clientData.email}`, 120, 62);
            if (clientData.phone) doc.text(`Tél : ${clientData.phone}`, 120, 68);
            if (clientData.employees) doc.text(`Effectif : ${clientData.employees} pers.`, 120, 74);

            doc.setDrawColor(200, 200, 200);
            doc.line(14, 85, 196, 85);

            // Office Subject
            doc.setFontSize(14);
            doc.setFont("", "bold");
            doc.text(`Objet : Aménagement du bien '${office.title}'`, 14, 95);
            doc.setFontSize(10);
            doc.setFont("", "normal");
            doc.text(`Localisation : ${office.city} | Surface : ${office.surface} m²`, 14, 102);

            // Prepare Table Data
            const tableRows = [];
            let totalHT = 0;

            // 1. Base Rent (1st month) or setup fee represented as Base Price
            tableRows.push(["Loyer de base (mensuel)", "-", "-", `${office.basePrice} €`]);
            totalHT += office.basePrice;

            // 2. Standard Renovations
            const selectedStandard = renovations.filter(r => selectedRenovations.includes(r.id));
            selectedStandard.forEach(r => {
                const cost = r.pricePerM2 * office.surface;
                tableRows.push([`Aménagement ${r.category}: ${r.name}`, `Surface totale (${office.surface}m²)`, `${r.pricePerM2}€/m²`, `${cost} €`]);
                totalHT += cost;
            });

            // 3. Custom AI Renovations
            customRenovations.forEach(r => {
                tableRows.push([`Travaux sur-mesure (IA): ${r.itemName}`, "Forfait estimé", "-", `${r.estimatedPrice} €`]);
                totalHT += r.estimatedPrice;
            });

            const tva20 = totalHT * 0.20;
            const totalTTC = totalHT + tva20;

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
            doc.text(`${totalTTC.toFixed(2)} €`, 196, finalY + 16, { align: 'right' });

            // Terms
            doc.setFontSize(9);
            doc.setFont("", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Ce devis est une estimation générée assistée par IA sur la base des surfaces déclarées.", 14, finalY + 30);
            doc.text("Les prix finaux nécessitent l'intervention et la validation technique de nos artisans.", 14, finalY + 35);

            // PAGE 2 : Floor Plan & Details
            if (office.planUrl) {
                doc.addPage();
                doc.setFontSize(16);
                doc.setTextColor(33, 37, 41);
                doc.text("Annexe 1 : Plan du Bureau & Relevés Techniques", 14, 20);

                // Embed image
                const base64Img = await loadImgAsBase64(office.planUrl);
                if (base64Img) {
                    try {
                        doc.addImage(base64Img, 'JPEG', 14, 30, 180, 120);
                    } catch (e) { console.error("Could not append image to PDF", e); }
                } else {
                    doc.setFontSize(10);
                    doc.text("[Erreur de chargement du plan visuel]", 14, 30);
                }

                // AI Extracted Details
                if (office.extractedDetails) {
                    doc.setFontSize(12);
                    doc.setFont("", "bold");
                    doc.text("Détails des surfaces extraites :", 14, 160);
                    doc.setFontSize(10);
                    doc.setFont("", "normal");

                    const splitText = doc.splitTextToSize(office.extractedDetails, 180);
                    doc.text(splitText, 14, 170);
                }
            }

            const safeName = `Devis_${clientData.companyName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.pdf`;

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

            // Save quote to DB using the clientId stored in apply step
            const clientId = (clientData as any).clientId;
            if (clientId) {
                await fetch('/api/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId,
                        officeId: office.id,
                        renovationsJson: JSON.stringify({ standard: selectedStandard, custom: customRenovations }),
                        totalPrice: totalTTC
                    })
                });
            }

            setShowSuccess(true);
            setChatHistory(prev => [...prev, { role: 'ai', text: "✅ Votre demande a été soumise avec succès ! Un conseiller vous recontactera prochainement." }]);

        } catch (err) {
            console.error(err);
            alert("Erreur lors de la soumission de la demande.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!office || !clientData) return;
        setIsSubmitting(true);

        try {
            const selectedStandard = renovations.filter(r => selectedRenovations.includes(r.id));
            const subtotalHT = office.basePrice + standardCost + customCost;
            const totalTTC = subtotalHT * 1.2;

            const clientId = (clientData as any).clientId;
            if (clientId) {
                await fetch('/api/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId,
                        officeId: office.id,
                        renovationsJson: JSON.stringify({ standard: selectedStandard, custom: customRenovations }),
                        totalPrice: totalTTC
                    })
                });
            }

            setShowSuccess(true);
            setChatHistory(prev => [...prev, { role: 'ai', text: "✅ Votre demande a été transmise à nos équipes ! Nous reviendrons vers vous très prochainement." }]);

        } catch (err) {
            console.error(err);
            alert("Erreur lors de la transmission de la demande.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !office || !clientData) return <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement de l'espace de personnalisation...</div>;

    // Costs for current preview
    const surfaceMultiplier = office.surface;
    const standardCost = renovations.filter(r => selectedRenovations.includes(r.id)).reduce((acc, curr) => acc + (curr.pricePerM2 * surfaceMultiplier), 0);
    const customCost = customRenovations.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
    const totalCostHT = office.basePrice + standardCost + customCost;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
            <Link href={`/office/${id}/apply`} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', fontWeight: 600 }}>
                ← Retour
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '1px' }}>ÉTAPE 2 SUR 2</div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Personnaliser mon entreprise</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Secteur {office.city} • Surface {office.surface}m² • Pour {clientData.companyName}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>

                {/* Left: Standard Options & Recap */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🔧 Aménagements Standards
                            {selectedRenovations.length > 0 && (
                                <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.9rem', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                                    {selectedRenovations.length} sélectionné(s)
                                </span>
                            )}
                        </h2>

                        {renovations.length === 0 ? <p>Aucune option standard définie.</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {renovations.map(reno => {
                                    const isSelected = selectedRenovations.includes(reno.id);
                                    return (
                                        <div
                                            key={reno.id}
                                            onClick={() => handleToggleRenovation(reno.id)}
                                            style={{
                                                position: 'relative',
                                                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                                borderRadius: '12px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                                                backgroundColor: isSelected ? '#f0f4ff' : '#ffffff',
                                                boxShadow: isSelected ? '0 4px 12px rgba(67, 97, 238, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                        >
                                            {isSelected && (
                                                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#10b981', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' }}>
                                                    ✓ Ajouté
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{reno.category}</div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0.25rem 0' }}>{reno.name}</div>
                                            <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Prix au m² : {reno.pricePerM2} €</div>
                                            <div style={{ color: 'var(--primary)', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                                Total ({office.surface}m²) : {reno.pricePerM2 * office.surface} €
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📊 Votre Devis (Aperçu HT)</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Loyer Base</span> <strong>{office.basePrice} €</strong></div>
                            {selectedRenovations.length > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Options Standards</span> <strong>+ {standardCost} €</strong></div>}
                            {customCost > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Options Sur-Mesure (IA)</span> <strong>+ {customCost} €</strong></div>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                            <span>Total HT estimé</span>
                            <span>{totalCostHT} €</span>
                        </div>
                    </div>
                </div>

                {/* Right: AI Chatbot & Export */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>

                    <div className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '500px', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🤖</span> Architecte IA
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#fafbfc' }}>
                            {chatHistory.map((msg, i) => (
                                <div key={i} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'white',
                                    color: msg.role === 'user' ? '#000000' : '#000000',
                                    padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '85%',
                                    border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', lineHeight: 1.5, fontSize: '0.95rem'
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                            {isChatting && (
                                <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem' }}>L'IA réfléchit...</div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid var(--border)', outline: 'none' }}
                                placeholder="Je voudrais un éclairage chaleureux..."
                                value={chatMessage}
                                onChange={e => setChatMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                                disabled={isChatting}
                            />
                            <button
                                onClick={handleSendChat}
                                disabled={isChatting}
                                style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', padding: '0 1.25rem', fontWeight: 600, cursor: isChatting ? 'not-allowed' : 'pointer' }}
                            >
                                ↑
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={isGeneratingPDF || isSubmitting}
                        className="btn-primary"
                        style={{ padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center', width: '100%', boxShadow: '0 4px 12px rgba(67, 97, 238, 0.3)', backgroundColor: '#6c757d' }}
                    >
                        {isGeneratingPDF ? '⏳ Génération...' : '📄 Télécharger mon devis'}
                    </button>

                    <button
                        onClick={handleSubmitRequest}
                        disabled={isSubmitting || showSuccess}
                        className="btn-primary"
                        style={{
                            padding: '1.25rem',
                            fontSize: '1.1rem',
                            justifyContent: 'center',
                            width: '100%',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            backgroundColor: showSuccess ? '#10b981' : 'var(--primary)',
                            cursor: (isSubmitting || showSuccess) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitting ? '⏳ Envoi en cours...' : showSuccess ? '✅ Demande Envoyée !' : '🚀 Soumettre ma demande'}
                    </button>

                    {showSuccess && (
                        <div style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            padding: '1rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            fontWeight: 600,
                            border: '1px solid #10b981'
                        }}>
                            Votre demande a été bien reçue par l'administrateur.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
