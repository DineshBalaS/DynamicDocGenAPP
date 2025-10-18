import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadForAnalysis, saveTemplate } from "../api/templateService";

// Import Components
import Stepper from "../components/common/Stepper";
import PlaceholderTag from "../components/templates/PlaceholderTag";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/spinner";
import Toast from "../components/ui/Toast";
import ProgressBar from "../components/common/ProgressBar";
import { useNavigationBlocker } from "../hooks/useNavigationBlocker";

// Icon Component
const UploadCloudIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const steps = [
  { name: "Upload Template" },
  { name: "Review Placeholders" },
  { name: "Save Template" },
];

// --- Sub-components for each step for better organization ---

const Step1Upload = ({ onFileSelect, status }) => {
  const fileInputRef = useRef(null);
  return (
    <div className="text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onFileSelect(e.target.files[0])}
        accept=".pptx"
        style={{ display: "none" }}
        disabled={status !== "idle"}
      />
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <UploadCloudIcon />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">
        Upload your .pptx template
      </h2>
      <p className="mt-2 text-gray-600">
        Drag and drop your file here or click to browse.
      </p>
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={status !== "idle"}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 disabled:bg-gray-400"
      >
        {status === "analyzing" ? "Analyzing..." : "Select File"}
      </button>
    </div>
  );
};

const Step2Review = ({ placeholders, onAdd, onRemove, onBack, onNext }) => {
  const [newPlaceholder, setNewPlaceholder] = useState("");

  const handleAdd = () => {
    onAdd(newPlaceholder);
    setNewPlaceholder("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">
        Review Placeholders
      </h2>
      <p className="mt-2 text-gray-600">
        We found the following placeholders. Add any that we missed.
      </p>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 min-h-[80px]">
        <div className="flex flex-wrap gap-2">
          {placeholders.map((p) => (
            <PlaceholderTag
              key={p.name}
              name={p.name}
              onRemove={() => onRemove(p.name)}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newPlaceholder}
          onChange={(e) => setNewPlaceholder(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add missing placeholder..."
          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600"
        />
        <button
          onClick={handleAdd}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Add
        </button>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={onBack}
          className="font-semibold text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="rounded-md bg-teal-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-600"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

const Step3Save = ({
  templateName,
  setTemplateName,
  onBack,
  onSave,
  status,
  uploadProgress,
}) => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">Save Your Template</h2>
    <p className="mt-2 text-gray-600">
      Give your new template a name to save it for future use.
    </p>
    <div className="mt-4">
      <label
        htmlFor="templateName"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Template Name
      </label>
      <div className="mt-2">
        <input
          type="text"
          name="templateName"
          id="templateName"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600"
          placeholder="e.g., Monthly Business Review"
        />
      </div>
    </div>
    {status === "saving" && (
      <div className="mt-4">
        <ProgressBar progress={uploadProgress} />
      </div>
    )}
    <div className="mt-8 flex justify-end gap-4">
      <button
        onClick={onBack}
        disabled={status === "saving"}
        className="font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-50"
      >
        Back
      </button>
      <button
        onClick={onSave}
        disabled={status === "saving"}
        className="rounded-md bg-teal-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-600 disabled:bg-teal-300"
      >
        {status === "saving" ? "Saving..." : "Save Template"}
      </button>
    </div>
  </div>
);

// --- Main Page Component ---

function UploadWorkflowPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [originalFile, setOriginalFile] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [placeholders, setPlaceholders] = useState([]);

  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();
  const { showModal, handleConfirmNavigation, handleCancelNavigation } = useNavigationBlocker(currentStep > 0 && status !== 'success');

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".pptx")) {
      setError("Invalid file type. Please upload a .pptx file.");
      return;
    }
    setOriginalFile(file);
    setStatus("analyzing");
    setError(null);
    try {
      const detectedPlaceholders = await uploadForAnalysis(file);
      setPlaceholders(detectedPlaceholders);
      setCurrentStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError("Template name cannot be empty.");
      return;
    }
    setStatus("saving");
    setError(null);
    setUploadProgress(0);
    try {
      await saveTemplate(originalFile, templateName, placeholders, (event) => {
        setUploadProgress(Math.round((100 * event.loaded) / event.total));
      });
      setShowToast(true);
      setStatus('success');
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const handleAddPlaceholder = (name) => {
    if (name && !placeholders.find((p) => p.name === name)) {
      setPlaceholders([...placeholders, { name, type: "text" }]);
    }
  };

  const handleRemovePlaceholder = (nameToRemove) => {
    setPlaceholders(placeholders.filter((p) => p.name !== nameToRemove));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step1Upload onFileSelect={handleFileSelect} status={status} />;
      case 1:
        return (
          <Step2Review
            placeholders={placeholders}
            onAdd={handleAddPlaceholder}
            onRemove={handleRemovePlaceholder}
            onBack={() => setCurrentStep(0)}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <Step3Save
            templateName={templateName}
            setTemplateName={setTemplateName}
            onBack={() => setCurrentStep(1)}
            onSave={handleSaveTemplate}
            status={status}
            uploadProgress={uploadProgress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {showToast && (
        <Toast
          message="Template saved successfully!"
          onDismiss={() => setShowToast(false)}
        />
      )}
      <Modal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        title="Leave Page?"
        confirmText="Leave Page"
        cancelText="Stay"        
        confirmButtonVariant="danger"
      >
        You have unsaved changes. Are you sure you want to leave? Your progress
        in the upload process will be lost.
      </Modal>

      <div className="mb-12">
        <Stepper currentStep={currentStep} steps={steps} />
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg relative">
        {status === "analyzing" && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-xl">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-center">
            <p>{error}</p>
          </div>
        )}
        {renderStepContent()}
      </div>
    </div>
  );
}

export default UploadWorkflowPage;
