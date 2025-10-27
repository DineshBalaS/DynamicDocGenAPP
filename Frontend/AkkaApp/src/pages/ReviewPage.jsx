// src/pages/ReviewPage.jsx

import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { generatePresentation } from '../api/templateService';
import Spinner from '../components/ui/spinner';

// Helper function or logic to create this map
 const getPlaceholderTypes = (placeholders) => {
   if (!placeholders) return {};
   return placeholders.reduce((acc, ph) => {
     acc[ph.name] = ph.type;
     return acc;
   }, {});
 };

function ReviewPage() {
    const location = useLocation();
    console.log("ReviewPage location.state:", location.state);

    // State is passed from DataEntryPage via the navigate function
    const { template, formData, imagePreviews } = location.state || {};

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [downloadLink, setDownloadLink] = useState(null);
    const [generationError, setGenerationError] = useState(null);

    // If a user navigates here directly without data, redirect them to the dashboard.
    if (!template || !formData) {
        console.log("Redirecting because template or formData is missing!");
        return <Navigate to="/" replace />;
    }

    const handleGenerate = async () => {
        setIsGenerating(true);
        setDownloadLink(null);
        setGenerationProgress(0);
        setGenerationError(null);

        try {
            const { blob, filename } = await generatePresentation(
                template.id,
                formData,
                (progressEvent) => {
                    const total = progressEvent.total || (progressEvent.loaded / 0.9); // Fallback if total is not provided
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                    setGenerationProgress(percentCompleted);
                }
            );
            
            setGenerationProgress(100); // Ensure it completes
            const url = window.URL.createObjectURL(blob);
            setDownloadLink(url);

            // Trigger download automatically
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        } catch (err) {
            setGenerationError(err.message || 'An unexpected error occurred during generation.');
        } finally {
            // Do not set isGenerating to false here, to allow the user to see the
            // final state (progress bar at 100%, download link, or error message).
        }
    };

    const placeholderTypes = template.placeholders.reduce((acc, ph) => {
        acc[ph.name] = ph.type;
        return acc;
    }, {});

    const placeholders = Object.keys(formData);

    return (
        <div className="max-w-7xl mx-auto">
            <nav className="text-sm mb-4" aria-label="Breadcrumb">
                <ol className="list-none p-0 inline-flex">
                    <li className="flex items-center">
                        <Link to="/" className="text-teal-600 hover:underline">Dashboard</Link>
                        <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                    </li>
                    <li className="flex items-center">
                        <span className="text-gray-500">{template.name}</span>
                         <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                    </li>
                     <li>
                        <span className="text-gray-500 font-semibold">Review Entries</span>
                    </li>
                </ol>
            </nav>

            <h1 className="text-3xl font-bold text-gray-800">Review Your Entries</h1>
            <p className="text-gray-500 mt-1">Confirm the details below before generating the final presentation.</p>

            <div className="mt-8 bg-white p-8 rounded-lg shadow-md border border-gray-200 divide-y divide-gray-200">
                 {placeholders.map(key => {
                     // Determine the type of the current placeholder
                     const placeholderType = placeholderTypes[key] || 'text';
                     const value = formData[key];

                     return (
                         <div key={key} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                             <dt className="text-sm font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}</dt>
                             <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">

                                 {/* --- Conditional Rendering based on Type --- */}
                                 {placeholderType === 'image' && imagePreviews[key] ? (
                                     <img src={imagePreviews[key]} alt={`${key} preview`} className="w-40 h-auto rounded-md border border-gray-300" />
                                 ) : placeholderType === 'list' ? (
                                     // Handle list type
                                     Array.isArray(value) && value.filter(item => String(item).trim() !== '').length > 0 ? (
                                         <ul className="list-disc list-inside space-y-1">
                                             {value.filter(item => String(item).trim() !== '').map((item, index) => (
                                                 <li key={index} className="break-words">{item}</li>
                                             ))}
                                         </ul>
                                     ) : (
                                         <i className="text-gray-400">None</i> // Display None if list is empty or invalid
                                     )
                                 ) : (
                                     // Handle text type (and fallback for others)
                                     (value && String(value).trim() !== '') ? (
                                         <span className="break-words">{String(value)}</span>
                                     ) : (
                                         <i className="text-gray-400">Not provided</i>
                                     )
                                 )}
                                {/* --- End Conditional Rendering --- */}

                            </dd>
                        </div>
                     );
                 })}
             </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0">
                 <Link
                    to={`/generate/${template.id}`}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 text-center"
                >
                    &larr; Back to Form
                </Link>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full sm:w-auto bg-teal-600 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex justify-center items-center"
                >
                    {isGenerating ? <Spinner /> : 'Generate Presentation'}
                </button>
            </div>

            {(isGenerating || downloadLink || generationError) && (
                <div className="mt-4">
                    {isGenerating && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
                        </div>
                    )}
                    {generationError && (
                        <div className="text-center mt-4 text-sm text-red-600 font-semibold">
                           <p>Generation Failed: {generationError}</p>
                        </div>
                    )}
                    {downloadLink && !generationError && (
                        <div className="text-center mt-4 text-sm text-gray-600">
                            Download should start automatically. If not,{' '}
                            <a href={downloadLink} download={`${template.name}.pptx`} className="text-teal-600 hover:underline font-semibold">
                                click here
                            </a>.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ReviewPage;