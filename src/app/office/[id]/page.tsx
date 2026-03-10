'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Office {
    id: string;
    title: string;
    city: string;
    surface: number;
    basePrice: number;
    description: string;
    extractedDetails: string;
    imageUrls: string; // stringified array
    planUrl: string;
    availability: boolean;
}

export default function OfficeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [office, setOffice] = useState<Office | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/offices/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Bureau introuvable');
                return res.json();
            })
            .then(data => {
                setOffice(data);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement des détails...</div>;
    }

    if (!office) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Bureau introuvable</h1>
                <Link href="/" className="btn-secondary">Retour à l'accueil</Link>
            </div>
        );
    }

    let images: string[] = [];
    if (office.imageUrls) {
        try {
            images = JSON.parse(office.imageUrls);
        } catch (e) { }
    }
    const mainImage = images.length > 0 ? images[0] : '/placeholder-office.jpg';
    const hasMoreImages = images.length > 1;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', fontWeight: 600 }}>
                ← Retour au catalogue
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Header: Title and Price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
                            {office.title}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                            📍 {office.city} • 📏 {office.surface} m²
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {office.basePrice} €<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> / mois</span>
                        </div>
                        <div style={{ marginTop: '0.25rem' }}>
                            {office.availability
                                ? <span style={{ background: '#e0f2f1', color: '#00695c', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>Disponible</span>
                                : <span style={{ background: '#ffebee', color: '#c62828', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>Indisponible</span>
                            }
                        </div>
                    </div>
                </div>

                {/* Main Image Gallery */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f0f0f0', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mainImage} alt={office.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                </div>

                {hasMoreImages && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        {images.slice(1).map((img, idx) => (
                            <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', height: '100px', backgroundColor: '#f0f0f0' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={`Vue ${idx + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '1rem', alignItems: 'start' }}>

                    {/* Left Column: Descriptions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {office.extractedDetails && (
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                                    📏 Détails Techniques & Surfaces
                                </h2>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-main)' }}>
                                    {office.extractedDetails}
                                </div>
                            </div>
                        )}

                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                                📖 Description du bien
                            </h2>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-main)' }}>
                                {office.description || "Aucune description fournie pour ce bureau."}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Actions */}
                    <div className="glass-card" style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', textAlign: 'center' }}>Intéressé par ce bureau ?</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5 }}>
                            Pré-remplissez vos informations d'entreprise et accédez à notre outil de personnalisation IA pour obtenir un devis pro instantané.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                onClick={() => router.push(`/office/${office.id}/apply`)}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
                                disabled={!office.availability}
                            >
                                ✨ Suivre la procédure
                            </button>

                            <a
                                href="mailto:contact@realestatepro.com"
                                className="btn-secondary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center', textAlign: 'center', backgroundColor: 'transparent', border: '1px solid var(--border)' }}
                            >
                                ✉️ Nous Contacter
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
