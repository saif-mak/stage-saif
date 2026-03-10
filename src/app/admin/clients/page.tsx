'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    quotes: { id: string }[];
}

export default function AdminClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => {
                setClients(data);
                setIsLoading(false);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Clients</h1>
            <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Cliquez sur un client pour consulter tout son dossier (devis, bureaux, détails).</p>

            <div className="glass-card">
                {isLoading ? (
                    <p>Chargement des clients...</p>
                ) : clients.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Aucun client trouvé.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Client</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Email</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Téléphone</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'center' }}>Devis</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Inscrit le</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Détails</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(client => (
                                    <tr
                                        key={client.id}
                                        style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f8f9ff')}
                                        onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '38px', height: '38px', borderRadius: '50%',
                                                    backgroundColor: 'var(--primary)', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: '1rem', flexShrink: 0
                                                }}>
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{client.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{client.email}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{client.phone || '—'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                backgroundColor: (client.quotes?.length || 0) > 0 ? 'rgba(67, 97, 238, 0.1)' : '#f1f1f1',
                                                color: (client.quotes?.length || 0) > 0 ? 'var(--primary)' : 'var(--text-muted)',
                                                padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem'
                                            }}>
                                                {client.quotes?.length || 0} devis
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <Link
                                                href={`/admin/clients/${client.id}`}
                                                style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}
                                            >
                                                Voir le dossier →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
