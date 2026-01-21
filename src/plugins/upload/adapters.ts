import type { ImageUploadAdapter, UploadResponse } from './upload-manager';

/**
 * Default adapter that converts images to Base64 strings.
 * Use for offline or small demo applications.
 */
export const Base64UploadAdapter: ImageUploadAdapter = {
    name: 'base64',
    upload: (file: File): Promise<UploadResponse> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    url: reader.result as string,
                    filename: file.name,
                    size: file.size
                });
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }
};

/**
 * Mock adapter for CKBox integration.
 * CKBox is CKEditor's file manager. In a real app, this would use the CKBox SDK.
 */
export const CKBoxUploadAdapter: ImageUploadAdapter = {
    name: 'ckbox',
    upload: async (file: File): Promise<UploadResponse> => {
        console.log(`[Mock] Uploading ${file.name} to CKBox...`);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1000));

        // In a real scenario, we'd use Base64 as a fallback or return a real cloud URL
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onload = () => {
                resolve({
                    url: reader.result as string, // Mocking cloud URL with b64 for demo
                    filename: `ckbox_${file.name}`,
                    size: file.size
                });
            };
            reader.readAsDataURL(file);
        });
    }
};

/**
 * Template for a Custom Adapter.
 * Developers can implement this to connect to their own S3 bucket or server.
 */
export const CustomUploadAdapter: ImageUploadAdapter = {
    name: 'custom',
    upload: async (file: File): Promise<UploadResponse> => {
        console.log(`[Custom] Uploading ${file.name} to custom endpoint...`);
        // Add your custom fetch logic here
        return {
            url: URL.createObjectURL(file), // Local URL as placeholder
            filename: file.name
        };
    }
};
