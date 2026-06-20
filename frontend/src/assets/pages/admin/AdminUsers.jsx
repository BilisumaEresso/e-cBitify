import { Ban, ChevronDown, Loader2, Search, Trash2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../../../services/apiHelpers";

const ROLE_LABEL = { 1: "Buyer", 2: "Seller", 3: "Super Admin" };
const ROLE_COLOR = {
  1: "bg-green-100 text-green-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-purple-100 text-purple-800",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setExpandedMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, currentBanStatus) => {
    try {
      setActionLoading(`ban-${userId}`);
      await adminAPI.banUser(userId, !currentBanStatus);
      toast.success(currentBanStatus ? "User unbanned" : "User banned");
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, banned: !currentBanStatus } : u,
        ),
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update user ban status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete "${userName}"? This action cannot be undone.`))
      return;
    try {
      setActionLoading(`delete-${userId}`);
      await adminAPI.deleteUser(userId);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      setActionLoading(`role-${userId}`);
      await adminAPI.changeRole(userId, newRole);
      toast.success("User role updated");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user role");
    } finally {
      setActionLoading(null);
      setExpandedMenu(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={28} /> Users
            </h1>
            <p className="text-gray-500 mt-1">
              {users.length} registered users
            </p>
          </div>
        </div>
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Name", "Email", "Role", "Status", "Joined", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 font-semibold text-gray-600"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <div className="relative" ref={expandedMenu === u._id ? menuRef : null}>
                      <button
                        onClick={() =>
                          setExpandedMenu(expandedMenu === u._id ? null : u._id)
                        }
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition ${ROLE_COLOR[u.role] || "bg-gray-100 text-gray-700"}`}
                      >
                        {ROLE_LABEL[u.role] || "Unknown"}
                        <ChevronDown size={14} />
                      </button>
                      {expandedMenu === u._id && u.role !== 3 && (
                        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          {[1, 2]
                            .filter((r) => r !== u.role)
                            .map((role) => (
                              <button
                                key={role}
                                onClick={() => handleChangeRole(u._id, role)}
                                disabled={actionLoading?.startsWith("role")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
                              >
                                {ROLE_LABEL[role]}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${u.banned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                    >
                      {u.banned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {u.role !== 3 && (
                        <button
                          onClick={() => handleBanUser(u._id, u.banned)}
                          disabled={actionLoading?.startsWith("ban")}
                          className={`p-1.5 rounded-lg transition disabled:opacity-50 ${u.banned ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"}`}
                          title={u.banned ? "Unban user" : "Ban user"}
                        >
                          {actionLoading === `ban-${u._id}` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Ban size={16} />
                          )}
                        </button>
                      )}
                      {u.role !== 3 && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={actionLoading?.startsWith("delete")}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                          title="Delete user"
                        >
                          {actionLoading === `delete-${u._id}` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
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
