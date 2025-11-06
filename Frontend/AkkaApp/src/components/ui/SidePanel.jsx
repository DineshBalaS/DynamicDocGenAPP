import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * A reusable "X" icon for the close button.
 */
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

/**
 * Animation variants for the backdrop overlay.
 */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Animation variants for the side panel itself.
 */
const panelVariants = {
  hidden: { x: "100%" }, // Start off-screen to the right
  visible: { x: 0 }, // Animate to on-screen
};

/**
 * A generic, animated side panel component that slides in from the right.
 *
 * @param {boolean} isOpen - Controls if the panel is open or closed.
 * @param {function} onClose - Function to call when the panel should close (called by backdrop click or close button).
 * @param {string} title - The text to display in the panel's header.
 * @param {React.ReactNode} children - The content to display in the main body of the panel.
 * @param {React.ReactNode} [footer] - Optional content to display in a fixed footer (e.g., action buttons).
 */
const SidePanel = ({ isOpen, onClose, title, children, footer }) => {
    console.log("DEBUG: SidePanel.jsx (v2 - blur-none, max-w-2xl) is rendering.");
  // Use a portal to render the modal at the top of the DOM tree (document.body).
  // This prevents z-index issues with other components.
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-none"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Side Panel Container */}
          <motion.div
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="side-panel-title"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2
                id="side-panel-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Close panel"
              >
                <XIcon />
              </button>
            </div>

            {/* Panel Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {/* Panel Footer (Fixed) */}
            {footer && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SidePanel;
