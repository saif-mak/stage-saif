'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats { offices: number; clients: number; quotes: number; }

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ offices: 0, clients: 0, quotes: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/offices').then(r => r.json()),
            fetch('/api/clients').then(r => r.json()),
            fetch('/api/quotes').then(r => r.json()),
        ]).then(([offices, clients, quotes]) => {
            setStats({
                offices: Array.isArray(offices) ? offices.length : 0,
                clients: Array.isArray(clients) ? clients.length : 0,
                quotes: Array.isArray(quotes) ? quotes.length : 0,
            });
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, []);

    const statCards = [
        { icon: '🏢', label: 'Total Bureaux', value: stats.offices, href: '/admin/offices', color: '#4f46e5' },
        { icon: '👥', label: 'Clients', value: stats.clients, href: '/admin/clients', color: '#10b981' },
        { icon: '📄', label: 'Devis générés', value: stats.quotes, href: '/admin/quotes', color: '#f59e0b' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Bienvenue dans votre panneau d'administration RealEstate Pro.</p>
                </div>
                <Link href="/admin/offices/new" className="btn-primary">+ Créer une Annonce</Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {statCards.map(card => (
                    <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: card.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                                {card.icon}
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{card.label}</p>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: card.color }}>
                                    {isLoading ? '…' : card.value}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card">
                <h2 style={{ marginBottom: '1.5rem' }}>Accès Rapide</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link href="/admin/offices/new" className="btn-primary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                        🏢 Créer une annonce
                    </Link>
                    <Link href="/admin/offices" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        📋 Gérer les bureaux
                    </Link>
                    <Link href="/admin/clients" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        👥 Voir les clients
                    </Link>
                    <Link href="/admin/quotes" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        📄 Voir les devis
                    </Link>
                </div>
                {stats.offices === 0 && !isLoading && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', border: '1px solid #fbbf24' }}>
                        <p style={{ fontWeight: 500, color: '#92400e' }}>⚠️ Aucun bureau dans la base de données.</p>
                        <p style={{ color: '#92400e', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                            Cliquez sur le bouton{' '}
                            <button
                                onClick={() => fetch('/api/seed', { method: 'POST' }).then(() => window.location.reload())}
                                style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                            >
                                Remplir la base de données
                            </button>{' '}
                            pour insérer des données de démonstration.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
