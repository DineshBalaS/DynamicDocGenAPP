// src/pages/DataEntryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTemplateDetails, generatePresentation } from '../api/templateService';

// Reusable Components
import Spinner from '../components/ui/spinner';
import ErrorState from '../components/common/ErrorState';
import ImageUploader from '../components/common/ImageUploader';
import NoPlaceholdersFound from '../components/common/NoPlaceholdersFound';

function DataEntryPage() {
    const { templateId } = useParams();
    
    // State for fetching template details
    const [template, setTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for form data and generation process
    const [formData, setFormData] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [downloadLink, setDownloadLink] = useState(null);

    // Fetch template details on component mount
    const fetchDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // NOTE: This call assumes a GET /api/templates/:id endpoint exists.
            // If not, you might need to adjust this logic or your backend.
            const data = await getTemplateDetails(templateId);
            setTemplate(data);
            // Initialize form data with empty strings for each placeholder
            const initialData = data.placeholders.reduce((acc, ph) => {
                acc[ph.name] = '';
                return acc;
            }, {});
            setFormData(initialData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [templateId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    // Handler for text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for successful image uploads from the child component
    const handleImageUploadSuccess = (placeholderName, s3_key) => {
        setFormData(prev => ({ ...prev, [placeholderName]: s3_key }));
    };

    // Handler for the "Generate Presentation" button click
    const handleGenerate = async () => {
        setIsGenerating(true);
        setDownloadLink(null);
        setGenerationProgress(0);

        try {
            const { blob, filename } = await generatePresentation(
                templateId,
                formData,
                (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setGenerationProgress(percentCompleted);
                }
            );

            // Create a temporary URL and an anchor element to trigger the download
            const url = window.URL.createObjectURL(blob);
            setDownloadLink(url); // Set state for the fallback link

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Clean up by removing the link
            link.parentNode.removeChild(link);

        } catch (err) {
            alert(`Generation failed: ${err.message}`); // Replace with a better notification
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Render loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner />
            </div>
        );
    }
    
    // Render error state
    if (error) {
        return <ErrorState message={error} onRetry={fetchDetails} />;
    }

    // Render no placeholders found state
    if (!template || !template.placeholders || template.placeholders.length === 0) {
        return <NoPlaceholdersFound />;
    }
    
    // Render the main form
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Link to="/" className="text-sm text-teal-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-gray-800">{template.name}</h1>
            <p className="text-gray-500 mt-1">Fill in the data below to generate your presentation.</p>

            <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-200">
                {template.placeholders.map(ph => (
                    <div key={ph.name}>
                        <label className="block text-sm font-medium text-gray-700 capitalize mb-2">
                            {ph.name.replace(/_/g, ' ')}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        {ph.type === 'text' ? (
                            <input
                                type="text"
                                name={ph.name}
                                value={formData[ph.name] || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                placeholder={`Enter value for ${ph.name}...`}
                            />
                        ) : (
                            <ImageUploader
                                placeholderName={ph.name}
                                onUploadSuccess={handleImageUploadSuccess}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex justify-center items-center"
                >
                    {isGenerating ? 'Generating...' : 'Generate Presentation'}
                </button>
                {isGenerating && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${generationProgress}%` }}></div>
                    </div>
                )}
                {downloadLink && (
                     <div className="text-center mt-4 text-sm text-gray-600">
                        Download should start automatically. If not,{' '}
                        <a href={downloadLink} download={template.name + '.pptx'} className="text-teal-600 hover:underline font-semibold">
                            click here
                        </a>.
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataEntryPage;
