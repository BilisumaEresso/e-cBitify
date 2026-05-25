import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User, Mail, Phone, MapPin, Package, Settings, LogOut,
  Edit, CreditCard, Heart, History, Shield, Lock,
  CheckCircle, ShoppingBag, Store, ShieldCheck, Calendar,
} from "lucide-react";

const ROLE_CONFIG = {
  1: { name: "Buyer",       color: "bg-green-100 text-green-800",  icon: ShoppingBag, badgeColor: "from-green-400 to-emerald-500" },
  2: { name: "Seller",      color: "bg-blue-100 text-blue-800",    icon: Store,       badgeColor: "from-blue-400 to-cyan-500" },
  3: { name: "Super Admin", color: "bg-purple-100 text-purple-800",icon: ShieldCheck, badgeColor: "from-purple-400 to-pink-500" },
};

export default function ProfilePage() {
  const { user, updateProfile, changePassword, fetchUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditingProfile,    setIsEditingProfile]    = useState(false);
  const [isChangingPassword,  setIsChangingPassword]  = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const userRole  = ROLE_CONFIG[user?.role] || ROLE_CONFIG[1];
  const RoleIcon  = userRole.icon;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) : "N/A";

  const handleProfileSave = async () => {
    if (!profileData.name.trim() && !profileData.email.trim()) {
      setMessage({ type: "error", text: "At least one field must be filled" }); return;
    }
    setLoading(true);
    try {
      const result = await updateProfile({ name: profileData.name.trim() || undefined, email: profileData.email.trim() || undefined });
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setIsEditingProfile(false);
        await fetchUserProfile();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else { setMessage({ type: "error", text: result.message }); }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" }); return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" }); return;
    }
    setLoading(true);
    try {
      const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setIsChangingPassword(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else { setMessage({ type: "error", text: result.message }); }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to change password" });
    } finally { setLoading(false); }
  };

  const handleCancel = () => {
    setIsEditingProfile(false); setIsChangingPassword(false);
    setProfileData({ name: user?.name || "", email: user?.email || "" });
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
            <p className="text-gray-600 mt-2">Manage your profile, orders, and settings</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${userRole.color}`}>
            <RoleIcon size={20} />
            <span className="font-semibold">{userRole.name}</span>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {message.type === "success" && <CheckCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className={`w-24 h-24 bg-gradient-to-br ${userRole.badgeColor} rounded-full flex items-center justify-center`}>
                    <span className="text-3xl font-bold text-white">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${userRole.color} rounded-full flex items-center justify-center border-2 border-white`}>
                      <RoleIcon size={14} />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${userRole.color}`}>{userRole.name}</span>
                <p className="text-gray-600 mt-2">{user?.email}</p>
                <button onClick={() => setIsEditingProfile(true)} disabled={loading}
                  className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-800 disabled:opacity-50">
                  <Edit size={16} /> Edit Profile
                </button>
              </div>

              <div className="space-y-1 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Calendar size={16} /><span>Member since: {formatDate(user?.createdAt)}</span></div>
              </div>

              <nav className="space-y-1">
                {user?.role === 1 && (
                  <button onClick={() => navigate("/my-orders")} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
                    <Package size={20} /><span>My Orders</span>
                  </button>
                )}
                {user?.role === 2 && (
                  <>
                    <button onClick={() => navigate("/seller")} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                      <Store size={20} /><span>Seller Dashboard</span>
                    </button>
                    <button onClick={() => navigate("/seller/products")} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                      <Package size={20} /><span>My Products</span>
                    </button>
                    <button onClick={() => navigate("/seller/orders")} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                      <ShoppingBag size={20} /><span>My Orders</span>
                    </button>
                  </>
                )}
                {user?.role === 3 && (
                  <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
                    <ShieldCheck size={20} /><span>Admin Dashboard</span>
                  </button>
                )}
                <button onClick={() => setIsChangingPassword(true)} disabled={loading}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 disabled:opacity-50">
                  <Lock size={20} /><span>Change Password</span>
                </button>
                <button onClick={() => { logout(); navigate("/login"); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-700">
                  <LogOut size={20} /><span>Log Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2">
            {/* Edit Profile */}
            {isEditingProfile && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Edit Profile</h3>
                <div className="space-y-4">
                  {[["Full Name","name","text"],["Email","email","email"]].map(([label, key, type]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type} value={profileData[key]}
                        onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        disabled={loading} />
                    </div>
                  ))}
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleProfileSave} disabled={loading}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">
                      {loading ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={handleCancel} disabled={loading}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password */}
            {isChangingPassword && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Change Password</h3>
                <div className="space-y-4">
                  {[["Current Password","oldPassword"],["New Password","newPassword"],["Confirm New Password","confirmPassword"]].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type="password" value={passwordData[key]}
                        onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        disabled={loading} />
                    </div>
                  ))}
                  <div className="flex gap-3 mt-6">
                    <button onClick={handlePasswordChange} disabled={loading}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">
                      {loading ? "Changing…" : "Change Password"}
                    </button>
                    <button onClick={handleCancel} disabled={loading}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Info */}
            {!isEditingProfile && !isChangingPassword && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Account Information</h3>
                    <div className={`px-3 py-1 rounded-lg ${userRole.color} font-medium`}>{userRole.name} Account</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      [User, "Full Name",     user?.name],
                      [Mail, "Email Address", user?.email],
                      [Calendar, "Member Since", formatDate(user?.createdAt)],
                      [Phone, "Phone Number", user?.address?.phoneNumber || "Not provided"],
                      [MapPin, "Address",     user?.address?.street ? `${user.address.street}, ${user.address.city}` : "No address provided"],
                      [RoleIcon, "Account Type", userRole.name],
                    ].map(([Icon, label, value]) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{label}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {user?.role === 1 && (
                      <button onClick={() => navigate("/my-orders")}
                        className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition text-gray-700">
                        <Package size={20} className="text-purple-600" /><span>View Orders</span>
                      </button>
                    )}
                    {user?.role === 2 && (
                      <button onClick={() => navigate("/add-product")}
                        className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition text-gray-700">
                        <Store size={20} className="text-blue-600" /><span>Add Product</span>
                      </button>
                    )}
                    {user?.role === 3 && (
                      <button onClick={() => navigate("/admin/users")}
                        className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition text-gray-700">
                        <ShieldCheck size={20} className="text-purple-600" /><span>Manage Users</span>
                      </button>
                    )}
                    <button onClick={() => setIsChangingPassword(true)}
                      className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-700">
                      <Lock size={20} className="text-gray-500" /><span>Change Password</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
