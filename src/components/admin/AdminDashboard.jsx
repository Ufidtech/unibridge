import AdminSidebar from "./AdminSidebar";
import AdminPayoutDashboard from "./AdminPayoutDashboard";

export default function AdminDashboard({ onNavigate }) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar onNavigate={onNavigate} />
      <div className="flex-1 p-6">
        <AdminPayoutDashboard />
      </div>
    </div>
  );
}
