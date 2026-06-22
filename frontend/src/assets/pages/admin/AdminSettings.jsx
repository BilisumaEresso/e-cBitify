import { Bell, Globe, Loader2, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminAPI, aiAPI } from "../../../services/apiHelpers";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("platform");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingTrends, setUpdatingTrends] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    currency: "USD",
    timezone: "UTC",
    emailAlerts: true,
    orderNotifications: true,
    userRegistrationAlerts: true,
    systemAlerts: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSettings();
      const s = res.data.settings || {};
      setSettings({
        maintenanceMode: s.maintenanceMode ?? false,
        currency: s.currency || "USD",
        timezone: s.timezone || "UTC",
        emailAlerts: s.emailAlerts ?? true,
        orderNotifications: s.orderNotifications ?? true,
        userRegistrationAlerts: s.userRegistrationAlerts ?? true,
        systemAlerts: s.systemAlerts ?? true,
      });
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTrends = async () => {
    try {
      setUpdatingTrends(true);
      const res = await aiAPI.generateTrends();
      const trendCount = res?.data?.count ?? 0;
      toast.success(
        `Trends updated successfully${trendCount ? ` (${trendCount})` : ""}`,
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update trends");
    } finally {
      setUpdatingTrends(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Settings size={28} /> Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Platform configuration — saved to the database
          </p>
        </div>

        <div className="flex gap-6">
          <div className="w-48">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {[
                { id: "platform", label: "Platform", icon: Globe },
                { id: "notifications", label: "Notifications", icon: Bell },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                    activeTab === id
                      ? "bg-purple-100 text-purple-700 border-l-4 border-purple-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {activeTab === "platform" && (
              <div>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleUpdateTrends}
                    disabled={updatingTrends}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingTrends ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Updating trends...
                      </>
                    ) : (
                      "Update Trends"
                    )}
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Platform Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) =>
                          handleChange("currency", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="ETB">ETB - Ethiopian Birr</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) =>
                          handleChange("timezone", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="UTC">UTC</option>
                        <option value="Africa/Addis_Ababa">
                          Africa/Addis Ababa
                        </option>
                        <option value="America/New_York">
                          America/New York
                        </option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={() => handleToggle("maintenanceMode")}
                        className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                      />
                      <span className="text-gray-700">
                        Maintenance mode (flag stored — enforce on login
                        separately)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Notification Preferences
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Stored for future email integration. Toggles are persisted to
                  the database.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      key: "emailAlerts",
                      label: "Send email alerts for important events",
                    },
                    {
                      key: "orderNotifications",
                      label: "Notify on new orders and status changes",
                    },
                    {
                      key: "userRegistrationAlerts",
                      label: "Alert on new user registrations",
                    },
                    {
                      key: "systemAlerts",
                      label: "Send system and error alerts",
                    },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={() => handleToggle(key)}
                        className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                      />
                      <span className="text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
