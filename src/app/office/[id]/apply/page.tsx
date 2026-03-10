'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApplyPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [employees, setEmployees] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyName || !email) {
            alert('Veuillez remplir au moins le nom de votre entreprise et votre email.');
            return;
        }

        setIsSaving(true);
        try {
            // Save client to the database
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: companyName, email, phone: phone || null })
            });
            const savedClient = await res.json();

            if (!savedClient.id) throw new Error('Failed to save client');

            // Store client info + DB id for the customization step
            localStorage.setItem(`clientData_${id}`, JSON.stringify({
                clientId: savedClient.id,
                companyName,
                email,
                phone,
                description,
                employees
            }));

            router.push(`/office/${id}/customize`);
        } catch (err) {
            alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem' }}>
            <Link href={`/office/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', fontWeight: 600 }}>
                ← Retour au bureau
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '1px' }}>ÉTAPE 1 SUR 2</div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Parlez-nous de vous</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Afin de vous proposer le meilleur aménagement, dites-nous en plus sur votre entreprise et vos besoins.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nom de l'entreprise *</label>
                        <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
                            placeholder="ex: Tech Solutions Agency"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email de contact *</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
                            placeholder="contact@entreprise.com"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Numéro de téléphone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
                            placeholder="+33 6 12 34 56 78"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nombre d'employés</label>
                        <input
                            type="number"
                            min="1"
                            value={employees}
                            onChange={(e) => setEmployees(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
                            placeholder="ex: 15"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Description de votre activité / Besoins</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                        placeholder="Parlez-nous de votre secteur d'activité, si vous recevez du public, si vous avez besoin d'une salle de réunion isolée..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary"
                    style={{ marginTop: '1rem', padding: '1rem 2rem', fontSize: '1.1rem', justifyContent: 'center' }}
                >
                    {isSaving ? 'Enregistrement...' : 'Continuer vers la personnalisation →'}
                </button>
            </form>
        </div>
    );
}
