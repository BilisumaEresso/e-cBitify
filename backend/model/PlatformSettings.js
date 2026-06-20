const { default: mongoose } = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    currency: { type: String, default: "USD" },
    timezone: { type: String, default: "UTC" },
    emailAlerts: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    userRegistrationAlerts: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PlatformSettings = mongoose.model("platformSettings", platformSettingsSchema);

module.exports = PlatformSettings;
