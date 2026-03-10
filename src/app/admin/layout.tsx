import Sidebar from '@/components/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard-layout animate-fade-in">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
