import { Dialog } from "@headlessui/react";
import {
  Loader2,
  Shield,
  CheckCircle,
  CreditCard,
  Smartphone,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ChapaPaymentModal({ open, onClose, onPay, orderId }) {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("telebirr");

  const METHODS = [
    {
      id: "telebirr",
      label: "Telebirr",
      icon: Smartphone,
      color: "text-green-600",
    },
    { id: "cbe", label: "CBE Birr", icon: Building2, color: "text-yellow-600" },
    {
      id: "card",
      label: "Visa / Mastercard",
      icon: CreditCard,
      color: "text-blue-600",
    },
  ];

  const handleFakePay = async () => {
    if (!orderId) {
      toast.error("No order found. Please try again.");
      return;
    }
    try {
      setLoading(true);
      // Simulate network delay like a real payment
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Payment successful!");
      onPay(); // tells CartPage to clear cart and navigate
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? () => {} : onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          {/* Header */}
          <Dialog.Title className="text-lg font-bold text-gray-800 mb-1">
            Complete Payment
          </Dialog.Title>
          <p className="text-sm text-gray-500 mb-5">
            Select a payment method to continue.{" "}
            <span className="text-blue-500 font-medium">(Demo mode)</span>
          </p>

          {/* Payment method selector */}
          <div className="space-y-2 mb-5">
            {METHODS.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setSelectedMethod(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                  selectedMethod === id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ${color}`}
                >
                  <Icon size={18} />
                </div>
                <span className="font-medium text-gray-700">{label}</span>
                {selectedMethod === id && (
                  <CheckCircle size={18} className="text-blue-500 ml-auto" />
                )}
              </button>
            ))}
          </div>

          {/* Amount display */}
          <div className="bg-gray-50 rounded-xl p-3 mb-5 flex justify-between items-center">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="font-bold text-gray-800 text-lg">ETB —</span>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <Shield size={13} className="text-green-500 flex-shrink-0" />
            <span>Secured by Chapa · 256-bit SSL · PCI-DSS compliant</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleFakePay}
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Processing…
                </>
              ) : (
                "Confirm Payment"
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
