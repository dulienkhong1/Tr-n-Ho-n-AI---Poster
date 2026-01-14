
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploadBoxProps {
    title: string;
    label: string;
    onUpload: (file: string | null) => void;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ title, label, onUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);
                onUpload(base64String);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
            onUpload(null);
        }
    };
    
    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div 
          className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-yellow-400 hover:bg-gray-700 transition-all duration-300 flex flex-col items-center justify-between aspect-[3/4]"
          onClick={handleClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-md"/>
            ) : (
                <>
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <h3 className="font-bold text-sm">{title}</h3>
                        <p className={`text-xs ${label === 'Bắt buộc' ? 'text-yellow-400' : 'text-gray-400'}`}>({label})</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <UploadIcon />
                        <span className="text-xs mt-2 font-semibold">Tải ảnh lên</span>
                    </div>
                </>
            )}
        </div>
    );
};
