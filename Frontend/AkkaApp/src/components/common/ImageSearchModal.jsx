// src/components/common/ImageSearchModal.jsx

import React, { useState } from 'react';
import { searchImages, uploadImageFromUrl } from '../../api/templateService';
import Modal from '../ui/Modal'; // Assuming a generic modal component exists
import Spinner from '../ui/spinner';

// --- Helper Components for different states ---

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-10">
        <p className="text-gray-500">{message}</p>
    </div>
);

const ImageGridSkeleton = () => (
    <div className="grid grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-md"></div>
        ))}
    </div>
);


// --- Main Component ---

function ImageSearchModal({ isOpen, onClose, onImageSelect }) {
    const [query, setQuery] = useState('');
    const [images, setImages] = useState([]);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    
    const [searchStatus, setSearchStatus] = useState('idle'); // idle, loading, success, error
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearchStatus('loading');
        setError('');
        setImages([]);
        setSelectedImageUrl(null);

        try {
            const results = await searchImages(query);
            setImages(results);
            setSearchStatus(results.length > 0 ? 'success' : 'empty');
        } catch (err) {
            setError(err.message || 'Failed to fetch images.');
            setSearchStatus('error');
        }
    };

    const handleConfirmAndUpload = async () => {
        if (!selectedImageUrl) return;

        setUploadStatus('uploading');
        setError('');

        try {
            // 1. Upload the image via URL to our backend
            const uploadResult = await uploadImageFromUrl(selectedImageUrl);
            
            // 2. Pass the s3_key and the original URL (for preview) back to the parent
            onImageSelect(uploadResult.s3_key, selectedImageUrl);
            
            setUploadStatus('success');
            handleClose(); // Close modal on success
        } catch (err) {
            setError(err.message || 'Failed to upload the selected image.');
            setUploadStatus('error');
        }
    };
    
    // Reset state when the modal is closed to ensure it's clean for the next open
    const handleClose = () => {
        setQuery('');
        setImages([]);
        setSelectedImageUrl(null);
        setSearchStatus('idle');
        setUploadStatus('idle');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Search for an Image">
            {/* Modal Content */}
            <div className="space-y-4 p-6" style={{ minHeight: '60vh' }}>
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Modern office building"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button type="submit" disabled={searchStatus === 'loading'} className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400">
                        <SearchIcon />
                    </button>
                </form>

                {/* Image Display Area */}
                <div className="overflow-y-auto" style={{ height: '45vh' }}>
                    {searchStatus === 'loading' && <ImageGridSkeleton />}
                    {searchStatus === 'idle' && <EmptyState message="Search for images to get started." />}
                    {searchStatus === 'empty' && <EmptyState message={`No images found for "${query}".`} />}
                    {searchStatus === 'error' && <EmptyState message={error} />}
                    {searchStatus === 'success' && (
                        <div className="grid grid-cols-3 gap-4">
                            {images.map(img => (
                                <div
                                    key={img.id}
                                    className={`relative aspect-square rounded-md overflow-hidden cursor-pointer group transition-all
                                        ${selectedImageUrl === img.url ? 'ring-4 ring-offset-2 ring-teal-500' : ''}`
                                    }
                                    onClick={() => setSelectedImageUrl(img.url)}
                                >
                                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-3">
                {uploadStatus === 'error' && <p className="text-sm text-red-600 mr-auto">{error}</p>}
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConfirmAndUpload}
                    disabled={!selectedImageUrl || uploadStatus === 'uploading'}
                    className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex items-center"
                >
                    {uploadStatus === 'uploading' && <Spinner />}
                    Confirm and Upload
                </button>
            </div>
        </Modal>
    );
}

export default ImageSearchModal;