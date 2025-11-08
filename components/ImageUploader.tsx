import React, { useRef, useCallback } from 'react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  helpText: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, helpText }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Explicitly type 'file' as File to resolve the type error.
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      onImagesChange([...images, ...newFiles]);
    }
  };
  
  const removeImage = useCallback((indexToRemove: number) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  }, [images, onImagesChange]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Upload Reference Outfit(s) <span className="text-red-500">*</span>
      </label>
      <div 
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 hover:border-amber-500 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-amber-500">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-500">{helpText}</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img src={image.previewUrl} alt={`Reference ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;