import { Dialog } from "@headlessui/react";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddressModal({
  open,
  onClose,
  addresses,
  defaultAddress,
  onContinue,
}) {
  const [selected, setSelected] = useState(defaultAddress?._id || "");
  const [newAddress, setNewAddress] = useState(null);

  const handleContinue = () => {
    if (!selected && !newAddress) {
      toast.error("Select or add an address");
      return;
    }
    onContinue(selected, newAddress);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white rounded-xl p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Choose Delivery Address
          </Dialog.Title>

          {/* Existing addresses */}
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr._id}
                className={`flex gap-3 p-3 border rounded-lg cursor-pointer ${
                  selected === addr._id && "border-blue-600 bg-blue-50"
                }`}
              >
                <input
                  type="radio"
                  checked={selected === addr._id}
                  onChange={() => {
                    setSelected(addr._id);
                    setNewAddress(null);
                  }}
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

          {/* Add new address */}
          <button
            onClick={() => {
              setSelected(null);
              setNewAddress({
                name: "",
                phoneNumber: "",
                city: "",
                state: "",
                postalCode: "",
              });
            }}
            className="mt-4 flex items-center gap-2 text-blue-600"
          >
            <Plus size={16} /> Add new address for this order
          </button>

          {newAddress && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              {Object.keys(newAddress).map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  className="border p-2 rounded"
                  value={newAddress[key]}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, [key]: e.target.value })
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Continue
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
