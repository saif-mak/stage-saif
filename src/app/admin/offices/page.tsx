'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './OfficesAdmin.module.css';

interface Office {
    id: string;
    title: string | null;
    city: string;
    surface: number;
    basePrice: number;
    description: string | null;
    availability: boolean;
    imageUrls: string | null;
}

export default function AdminOffices() {
    const [offices, setOffices] = useState<Office[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOffices = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/offices');
            if (res.ok) setOffices(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffices();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce bureau ?')) return;
        await fetch(`/api/offices/${id}`, { method: 'DELETE' });
        fetchOffices();
    };

    return (
        <div className="animate-fade-in">
            <div className={styles.header}>
                <div>
                    <h1 className="page-title">Gestion des Bureaux</h1>
                    <p className="page-subtitle">Créez et gérez toutes vos annonces immobilières.</p>
                </div>
                <Link href="/admin/offices/new" className="btn-primary">+ Créer une annonce</Link>
            </div>

            <div className="glass-card">
                {isLoading ? (
                    <p>Chargement des bureaux...</p>
                ) : offices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Aucun bureau trouvé. Créez votre première annonce !</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link href="/admin/offices/new" className="btn-primary">+ Créer une annonce</Link>
                            <button className="btn-secondary" onClick={() => fetch('/api/seed', { method: 'POST' }).then(() => fetchOffices())}>
                                Insérer des données de démo
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Titre</th>
                                    <th>Ville</th>
                                    <th>Surface</th>
                                    <th>Prix / mois</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offices.map((office) => {
                                    let firstImage: string | null = null;
                                    try {
                                        const urls = JSON.parse(office.imageUrls || '[]');
                                        firstImage = urls?.[0] || null;
                                    } catch { }

                                    return (
                                        <tr key={office.id}>
                                            <td>
                                                {firstImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={firstImage} alt="office" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                                                ) : (
                                                    <div style={{ width: 64, height: 48, background: '#e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏢</div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{office.title || 'Sans titre'}</td>
                                            <td>{office.city}</td>
                                            <td>{office.surface} m²</td>
                                            <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{office.basePrice} €</td>
                                            <td>
                                                <span className={office.availability ? styles.tagActive : styles.tagInactive}>
                                                    {office.availability ? 'Disponible' : 'Loué'}
                                                </span>
                                            </td>
                                            <td style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', height: '100%' }}>
                                                <Link
                                                    href={`/admin/offices/${office.id}/edit`}
                                                    style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}
                                                >
                                                    Éditer
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(office.id)}
                                                    style={{ color: 'var(--danger-color)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', font: 'inherit', padding: '0.25rem 0.5rem' }}
                                                >
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
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

