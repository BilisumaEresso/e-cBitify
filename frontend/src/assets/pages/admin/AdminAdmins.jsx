import { useState, useEffect } from "react";
import { Shield, Search, Loader2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../../services/apiHelpers";
import toast from "react-hot-toast";

export default function AdminAdmins() {
  const navigate = useNavigate();
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await adminAPI.getAdmins();
      setAdmins(res.data.admins || []);
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const filtered = admins.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Shield size={28} /> Administrators</h1>
            <p className="text-gray-500 mt-1">{admins.length} admin accounts</p>
          </div>
          <button onClick={() => navigate("/admin/add-admin")}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            <UserPlus size={18} /> Add Admin
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 font-bold">{a.name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{a.name}</p>
                  <p className="text-sm text-gray-500">{a.email}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Super Admin</span>
                <p className="mt-1">Joined {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-500 py-12">No admins found.</p>}
        </div>
      </div>
    </div>
  );
}
