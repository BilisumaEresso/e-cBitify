import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";

export default function ClearCartModal({
  isOpen,
  onClose,
  onConfirm,
  updating,
}) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      toast.success("Cart cleared successfully!");
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to clear cart");
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-50"
          leave="ease-in duration-200"
          leaveFrom="opacity-50"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Clear Cart?
              </Dialog.Title>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to remove all items from your cart? This
                action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  disabled={updating}
                >
                  {updating ? "Clearing..." : "Clear Cart"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
