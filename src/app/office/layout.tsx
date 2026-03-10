import Link from 'next/link';
import React from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
            <main style={{ flex: 1 }}>
                {children}
            </main>
        </div>
    );
}
