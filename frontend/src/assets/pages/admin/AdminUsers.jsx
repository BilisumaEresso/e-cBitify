import { useState, useEffect } from "react";
import { Users, Search, Shield, ShoppingBag, Store, Loader2, ChevronDown } from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

const ROLE_LABEL = { 1: "Buyer", 2: "Seller", 3: "Super Admin" };
const ROLE_COLOR = {
  1: "bg-green-100 text-green-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-purple-100 text-purple-800",
};

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Users size={28} /> Users</h1>
            <p className="text-gray-500 mt-1">{users.length} registered users</p>
          </div>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Name","Email","Role","Joined"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-800">{u.name}</td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLOR[u.role] || "bg-gray-100 text-gray-700"}`}>
                      {ROLE_LABEL[u.role] || "Unknown"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-12">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
