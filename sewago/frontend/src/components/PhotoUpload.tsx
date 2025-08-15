'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  CameraIcon, 
  XMarkIcon, 
  PhotoIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  className?: string;
}

interface PhotoPreview {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  error?: string;
}

export default function PhotoUpload({ 
  onPhotosChange, 
  maxPhotos = 5, 
  className = '' 
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPhotos: PhotoPreview[] = [];
    const remainingSlots = maxPhotos - photos.length;

    Array.from(files).slice(0, remainingSlots).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);

      newPhotos.push({
        id,
        file,
        preview,
        uploading: false,
        progress: 0
      });
    });

    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos.map(p => p.file));
    }
  }, [photos, maxPhotos, onPhotosChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removePhoto = useCallback((id: string) => {
    const updatedPhotos = photos.filter(p => p.id !== id);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos.map(p => p.file));
  }, [photos, onPhotosChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP up to 5MB each
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              className="mt-2"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Select Photos
            </Button>
          </div>
        </div>
      )}

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Selected Photos ({photos.length}/{maxPhotos})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={photo.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>

                {/* Upload Progress */}
                {photo.uploading && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                    <div className="flex items-center space-x-2">
                      <ArrowUpTrayIcon className="h-4 w-4 animate-pulse" />
                      <span className="text-xs">Uploading...</span>
                    </div>
                    <Progress value={photo.progress} className="mt-1 h-1" />
                  </div>
                )}

                {/* Error State */}
                {photo.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span className="text-xs">{photo.error}</span>
                    </div>
                  </div>
                )}

                {/* File Info */}
                <div className="mt-2 text-xs text-gray-500">
                  <p className="truncate">{photo.file.name}</p>
                  <p>{(photo.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {photos.length === 0 && (
        <p className="text-xs text-gray-500 text-center">
          Add photos to your review to help other customers make informed decisions
        </p>
      )}
    </div>
  );
}
