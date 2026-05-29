import {
  Bell,
  Database,
  Globe,
  Loader2,
  Save,
  Settings,
  Shield,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    security: {
      requireStrongPassword: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
    notifications: {
      emailAlerts: true,
      orderNotifications: true,
      userRegistrationAlerts: true,
      systemAlerts: true,
    },
    database: {
      autoBackup: true,
      backupFrequency: "daily",
      retentionDays: 30,
    },
    platform: {
      currency: "USD",
      timezone: "UTC",
      maintenanceMode: false,
    },
  });

  const handleToggle = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  };

  const handleChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Password Policy
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.requireStrongPassword}
              onChange={() => handleToggle("security", "requireStrongPassword")}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <span className="text-gray-700">
              Require strong passwords (min 8 chars, uppercase, numbers,
              symbols)
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={() => handleToggle("security", "twoFactorAuth")}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <span className="text-gray-700">
              Enable 2-Factor Authentication
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Session Management
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) =>
                handleChange(
                  "security",
                  "sessionTimeout",
                  parseInt(e.target.value),
                )
              }
              min="5"
              max="240"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Users will be logged out after this duration of inactivity
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Login Attempts
            </label>
            <input
              type="number"
              value={settings.security.maxLoginAttempts}
              onChange={(e) =>
                handleChange(
                  "security",
                  "maxLoginAttempts",
                  parseInt(e.target.value),
                )
              }
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Account will be locked after exceeding failed attempts
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Email Notifications
      </h3>
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.notifications.emailAlerts}
            onChange={() => handleToggle("notifications", "emailAlerts")}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <span className="text-gray-700">
            Send email alerts for important events
          </span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.notifications.orderNotifications}
            onChange={() => handleToggle("notifications", "orderNotifications")}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <span className="text-gray-700">
            Notify on new orders and order status changes
          </span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.notifications.userRegistrationAlerts}
            onChange={() =>
              handleToggle("notifications", "userRegistrationAlerts")
            }
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <span className="text-gray-700">Alert on new user registrations</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.notifications.systemAlerts}
            onChange={() => handleToggle("notifications", "systemAlerts")}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <span className="text-gray-700">Send system and error alerts</span>
        </label>
      </div>
    </div>
  );

  const renderDatabaseTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Backup Settings
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.database.autoBackup}
              onChange={() => handleToggle("database", "autoBackup")}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <span className="text-gray-700">Enable automatic backups</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={settings.database.backupFrequency}
              onChange={(e) =>
                handleChange("database", "backupFrequency", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Retention (days)
            </label>
            <input
              type="number"
              value={settings.database.retentionDays}
              onChange={(e) =>
                handleChange(
                  "database",
                  "retentionDays",
                  parseInt(e.target.value),
                )
              }
              min="7"
              max="365"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Older backups will be automatically deleted
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlatformTab = () => (
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
            value={settings.platform.currency}
            onChange={(e) =>
              handleChange("platform", "currency", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="ETB">ETB - Ethiopian Birr</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.platform.timezone}
            onChange={(e) =>
              handleChange("platform", "timezone", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="UTC">UTC</option>
            <option value="EST">EST - Eastern</option>
            <option value="CST">CST - Central</option>
            <option value="MST">MST - Mountain</option>
            <option value="PST">PST - Pacific</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.platform.maintenanceMode}
            onChange={() => handleToggle("platform", "maintenanceMode")}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <span className="text-gray-700">
            Maintenance mode (disables user access)
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Settings size={28} /> Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Platform configuration and management
          </p>
        </div>

        <div className="flex gap-6">
          <div className="w-48">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {[
                { id: "security", label: "Security", icon: Shield },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "database", label: "Database", icon: Database },
                { id: "platform", label: "Platform", icon: Globe },
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
            {activeTab === "security" && renderSecurityTab()}
            {activeTab === "notifications" && renderNotificationsTab()}
            {activeTab === "database" && renderDatabaseTab()}
            {activeTab === "platform" && renderPlatformTab()}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? (
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
