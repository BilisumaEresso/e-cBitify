import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { adminAPI } from "../../../services/apiHelpers";
import toast from "react-hot-toast";

export default function AddAdminPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name:"", email:"", password:"", phoneNumber:"", street:"", city:"", state:"", kebele:"", postalCode:"" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      await adminAPI.createAdmin(form);
      toast.success("Admin added successfully!");
      navigate("/admin/admins");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add admin");
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        required={["name","email","password"].includes(name)}
      />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate("/admin/admins")} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={18} /> Back to Admins
        </button>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><UserPlus size={24} /> Add New Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {field("name", "Full Name")}
              {field("email", "Email", "email")}
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {field("phoneNumber", "Phone Number")}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Address</p>
            <div className="grid grid-cols-2 gap-4">
              {field("street", "Street")}
              {field("city", "City")}
              {field("state", "State / Region")}
              {field("kebele", "Kebele")}
              {field("postalCode", "Postal Code")}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Adding…" : "Add Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
