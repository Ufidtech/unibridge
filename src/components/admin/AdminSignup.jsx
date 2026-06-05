import { useState } from "react";
import { registerAdmin } from "../../lib/api/auth";
import toast from "react-hot-toast";

export default function AdminSignup({ onSignupSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", title: "Admin" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await registerAdmin(form);
      toast.success("Admin registered and logged in.");
      if (onSignupSuccess) onSignupSuccess(data.user);
    } catch (err) {
      toast.error(err.message || "Failed to register admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Admin Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-slate-800 text-white"
          />
        </div>
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
        <div>
          <label className="block text-sm font-medium text-white mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
