import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-noir md:flex-row">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden px-6 py-10 md:px-12 md:py-12">{children}</div>
    </div>
  );
}
