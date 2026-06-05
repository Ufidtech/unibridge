import { useState } from "react";
import { loginAdmin } from "../../lib/api/auth";
import toast from "react-hot-toast";

export default function AdminLogin({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginAdmin(form.email, form.password);
      toast.success("Admin logged in.");
      if (onLoginSuccess) onLoginSuccess(data.user);
    } catch (err) {
      toast.error(err.message || "Failed to login admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-slate-800 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-slate-800 text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
