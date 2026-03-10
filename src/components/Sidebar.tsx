'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Offices', path: '/admin/offices', icon: '🏢' },
        { name: 'Clients', path: '/admin/clients', icon: '👥' },
        { name: 'Quotes', path: '/admin/quotes', icon: '📄' },
        { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>RE</div>
                <h1 className={styles.logoText}>RealEstate Pro</h1>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
                        return (
                            <li key={item.path} className={styles.navItem}>
                                <Link
                                    href={item.path}
                                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navText}>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className={styles.sidebarFooter}>
                <Link href="/" className={styles.clientLink}>
                    <span>🌐</span>
                    <span>View Client Site</span>
                </Link>
            </div>
        </aside>
    );
}
