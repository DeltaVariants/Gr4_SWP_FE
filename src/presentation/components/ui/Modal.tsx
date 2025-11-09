import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  overlayType?: "opaque" | "blur";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  overlayType = "blur",
}) => {
  if (!isOpen) return null;

  const overlayClasses =
    overlayType === "blur"
      ? "absolute inset-0 bg-black/30 backdrop-blur-sm"
      : "absolute inset-0 bg-black/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Backdrop with blur or opaque effect */}
      <div className={overlayClasses} onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 z-10 animate-scaleIn">
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Title */}
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        )}

        {/* Children */}
        <div>{children}</div>
      </div>
    </div>
  );
};
