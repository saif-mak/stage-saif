'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Office {
  id: string;
  title: string;
  city: string;
  surface: number;
  basePrice: number;
  imageUrls: string; // stringified JSON
}

export default function Home() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offices')
      .then(res => res.json())
      .then(data => {
        setOffices(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement des bureaux...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        backgroundColor: 'var(--sidebar-bg, #1e1b4b)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.5px' }}>
          demo_SAIF-MAKOUAR
        </div>
        <div>
          <Link href="/admin" style={{
            backgroundColor: 'var(--primary-color, #4f46e5)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'background-color 0.2s',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Espace Administrateur →
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Découvrez nos Espaces</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Trouvez le bureau idéal pour votre entreprise, découvrez ses caractéristiques et personnalisez vos aménagements sur-mesure.
          </p>
        </div>

        {offices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: '12px' }}>
            <p>Aucun bureau n'est disponible pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {offices.map(office => {
              let mainImageUrl = '/placeholder-office.jpg'; // fallback
              if (office.imageUrls) {
                try {
                  const urls = JSON.parse(office.imageUrls);
                  if (urls && urls.length > 0) mainImageUrl = urls[0];
                } catch (e) { console.error('Error parsing image URLs'); }
              }

              return (
                <Link href={`/office/${office.id}`} key={office.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ height: '220px', width: '100%', backgroundColor: '#f0f0f0', position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mainImageUrl} alt={office.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {office.city}
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{office.title}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Surface : {office.surface} m²
                      </div>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                          À partir de {office.basePrice} € / mois
                        </div>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
