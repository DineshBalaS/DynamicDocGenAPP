// src/components/common/ImageUploader.jsx

import React, { useState, useRef } from 'react';
import { uploadAsset } from '../../api/templateService';

// Icon components for different states
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
const LoadingSpinner = () => (
    <svg className="animate-spin h-6 w-6 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);
const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);


function ImageUploader({ onUploadSuccess, placeholderName }) {
    const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Basic validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setErrorMessage('Invalid file type. Please use JPG, PNG, or GIF.');
            setStatus('error');
            return;
        }

        // Set state for immediate feedback
        setStatus('uploading');
        setErrorMessage('');
        
        // Create a temporary URL for the preview
        const localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);

        try {
            const result = await uploadAsset(file);
            onUploadSuccess(placeholderName, result.s3_key);
            setStatus('success');
        } catch (error) {
            setErrorMessage(error.message || 'Upload failed. Please try again.');
            setStatus('error');
            // Clean up the failed preview
            URL.revokeObjectURL(localPreviewUrl); 
            setPreviewUrl(null);
        }
    };
    
    // Allows clicking the whole container to trigger file input
    const handleClick = () => {
        if (status !== 'uploading') {
            fileInputRef.current.click();
        }
    };
    
    // Clean up object URL when component unmounts
    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    return (
        <div 
            onClick={handleClick}
            className={`relative w-full h-32 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors
                ${status === 'idle' && 'border-gray-300 hover:border-teal-400 bg-gray-50'}
                ${status === 'uploading' && 'border-teal-400 bg-teal-50'}
                ${status === 'success' && 'border-green-400 bg-green-50'}
                ${status === 'error' && 'border-red-400 bg-red-50'}`
            }
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                disabled={status === 'uploading'}
            />

            {status === 'success' && previewUrl && (
                <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
            )}

            <div className="z-10 text-center p-2 bg-white/80 rounded-md backdrop-blur-sm">
                {status === 'idle' && <><UploadIcon /><p className="text-xs text-gray-500 mt-1">Click to upload image</p></>}
                {status === 'uploading' && <><LoadingSpinner /><p className="text-xs text-teal-600 mt-2">Uploading...</p></>}
                {status === 'error' && <><ErrorIcon /><p className="text-xs text-red-600 mt-1">{errorMessage}</p></>}
                {status === 'success' && <p className="text-xs font-semibold text-green-700">Upload Complete</p>}
            </div>
        </div>
    );
}

export default ImageUploader;
