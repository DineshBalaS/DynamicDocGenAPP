import React, { useState } from 'react';
import Stepper from '../components/common/Stepper';
import PlaceholderTag from '../components/templates/PlaceholderTag';
import Modal from '../components/ui/Modal'; // Import Modal
import { useNavigationBlocker } from '../hooks/useNavigationBlocker'; // Import the hook

// --- (Icon components remain the same) ---
const UploadCloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
    </svg>
);

const steps = [
  { name: 'Upload Template' },
  { name: 'Review Placeholders' },
  { name: 'Save Template' },
];

function UploadWorkflowPage() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // --- Navigation Blocker Integration ---
  // The blocker is active whenever we are past the first step.
  const { showModal, handleConfirmNavigation, handleCancelNavigation } = useNavigationBlocker(currentStep > 0);

  // --- (Mock Data and other handlers remain the same) ---
  const [placeholders, setPlaceholders] = useState([
    { name: 'client_name', type: 'text' }, { name: 'project_title', type: 'text' },
    { name: 'report_date', type: 'text' }, { name: 'company_logo', type: 'image' },
  ]);
  const [newPlaceholder, setNewPlaceholder] = useState('');

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleAddPlaceholder = () => {
    if (newPlaceholder && !placeholders.find(p => p.name === newPlaceholder)) {
      setPlaceholders([...placeholders, { name: newPlaceholder, type: 'text' }]);
      setNewPlaceholder('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddPlaceholder();
    }
  };

  const handleRemovePlaceholder = (nameToRemove) => {
    setPlaceholders(placeholders.filter(p => p.name !== nameToRemove));
  };
  
  // --- (Render functions remain the same) ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Step 1: Upload
        return (
          <div className="text-center">
             <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100"><UploadCloudIcon /></div>
             <h2 className="mt-4 text-2xl font-semibold text-gray-900">Upload your .pptx template</h2>
             <p className="mt-2 text-gray-600">Drag and drop your file here or click to browse.</p>
             <button onClick={handleNext} className="mt-6 inline-flex items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition-colors">Select File</button>
          </div>
        );
      case 1: // Step 2: Review
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Review Placeholders</h2>
            <p className="mt-2 text-gray-600">We found the following placeholders. Add any that we missed.</p>
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4"><div className="flex flex-wrap gap-2">{placeholders.map((p) => (<PlaceholderTag key={p.name} name={p.name} onRemove={() => handleRemovePlaceholder(p.name)} />))}</div></div>
            <div className="mt-4 flex gap-2">
                <input type="text" value={newPlaceholder} onChange={(e) => setNewPlaceholder(e.target.value)} onKeyDown={handleKeyDown} placeholder="Add missing placeholder..." className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6" />
                <button onClick={handleAddPlaceholder} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Add</button>
            </div>
            <div className="mt-8 flex justify-end gap-4">
                <button onClick={handleBack} className="font-semibold text-gray-600 hover:text-gray-800">Back</button>
                <button onClick={handleNext} className="rounded-md bg-teal-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-600">Confirm & Continue</button>
            </div>
          </div>
        );
      case 2: // Step 3: Save
        return (
           <div>
            <h2 className="text-2xl font-semibold text-gray-900">Save Your Template</h2>
            <p className="mt-2 text-gray-600">Give your new template a name to save it for future use.</p>
            <div className="mt-4">
                <label htmlFor="templateName" className="block text-sm font-medium leading-6 text-gray-900">Template Name</label>
                <div className="mt-2"><input type="text" name="templateName" id="templateName" className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6" placeholder="e.g., Monthly Business Review" /></div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
                <button onClick={handleBack} className="font-semibold text-gray-600 hover:text-gray-800">Back</button>
                <button className="rounded-md bg-white px-4 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Generate Now</button>
                <button className="rounded-md bg-teal-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-600">Save Template</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* --- Render the Modal when needed --- */}
      <Modal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        title="Leave Page?"
      >
        You have unsaved changes. Are you sure you want to leave? Your progress in the upload process will be lost.
      </Modal>

      <div className="mb-12">
        <Stepper currentStep={currentStep} steps={steps} />
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        {renderStepContent()}
      </div>
    </div>
  );
}

export default UploadWorkflowPage;
