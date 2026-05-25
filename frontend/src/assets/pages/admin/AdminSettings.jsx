import { Settings, Shield, Bell, Database, Globe } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Settings size={28} /> Settings</h1>
          <p className="text-gray-500 mt-1">Platform configuration</p>
        </div>

        <div className="space-y-6">
          {[
            { icon: Shield, title: "Security", desc: "Manage authentication rules and access policies", color: "text-purple-600 bg-purple-100" },
            { icon: Bell,   title: "Notifications", desc: "Configure system alerts and email notifications", color: "text-blue-600 bg-blue-100" },
            { icon: Database, title: "Database", desc: "Backup schedules and storage settings", color: "text-orange-600 bg-orange-100" },
            { icon: Globe,  title: "Platform", desc: "Currency, locale, and general platform options", color: "text-green-600 bg-green-100" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Coming soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
