import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminUsers, updateAdminUserRole } from "../../lib/api/auth";
import AdminSidebar from "./AdminSidebar";

export default function AdminUserManagement({ onNavigate = () => {} }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar onNavigate={onNavigate} />
      <div className="flex-1 p-4 sm:p-6 min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin User Management</h1>
            <p className="text-slate-400">
              Review users and assign platform roles.
            </p>
          </div>
          <button
            onClick={loadUsers}
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="min-w-[700px] w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {user.email || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        defaultValue={user.role || "MENTEE"}
                        onChange={async (e) => {
                          const role = e.target.value;
                          setSavingId(user.id);
                          try {
                            await updateAdminUserRole(user.id, role);
                            toast.success("Role updated");
                            await loadUsers();
                          } catch (err) {
                            toast.error(err.message || "Unable to update role");
                          } finally {
                            setSavingId(null);
                          }
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                      >
                        <option value="MENTEE">MENTEE</option>
                        <option value="MENTOR">MENTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {savingId === user.id ? "Saving..." : "Ready"}
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
