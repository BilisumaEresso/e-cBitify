import { Dialog } from "@headlessui/react";
import { CheckCircle, MapPin, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const OrderConfirmModal = ({
  open,
  onClose,
  addresses = [],
  defaultAddress,
  onConfirm,
}) => {
  const [selectedAddress, setSelectedAddress] = useState(
    defaultAddress?._id || ""
  );
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    setLoading(true);

    // fake payment delay
    setTimeout(async () => {
      await onConfirm(selectedAddress);
      toast.success("Payment successful");
      setLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6">
          <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            Confirm Your Order
          </Dialog.Title>

          {/* Address list */}
          <div className="mt-4 space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr._id}
                className={`flex gap-3 p-3 border rounded-lg cursor-pointer ${
                  selectedAddress === addr._id
                    ? "border-blue-600 bg-blue-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  checked={selectedAddress === addr._id}
                  onChange={() => setSelectedAddress(addr._id)}
                />
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin size={14} />
                    {addr.city}, {addr.state}
                  </p>
                  <p className="text-sm text-gray-500">{addr.phoneNumber}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
            >
              <CreditCard size={16} />
              {loading ? "Processing..." : "Pay & Place Order"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default OrderConfirmModal;
