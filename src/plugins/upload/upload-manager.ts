export interface UploadResponse {
    url: string;
    filename?: string;
    size?: number;
}

export interface ImageUploadAdapter {
    name: string;
    upload: (file: File) => Promise<UploadResponse>;
}

/**
 * Manager to handle multiple upload adapters
 */
export class UploadManager {
    private static adapters: Map<string, ImageUploadAdapter> = new Map();
    private static currentAdapter: string = 'base64';

    static register(adapter: ImageUploadAdapter) {
        this.adapters.set(adapter.name, adapter);
        console.log(`Upload adapter [${adapter.name}] registered.`);
    }

    static setAdapter(name: string) {
        if (this.adapters.has(name)) {
            this.currentAdapter = name;
            console.log(`Current upload adapter set to: ${name}`);
        } else {
            console.error(`Upload adapter [${name}] not found.`);
        }
    }

    static async upload(file: File): Promise<UploadResponse> {
        const adapter = this.adapters.get(this.currentAdapter);
        if (!adapter) {
            throw new Error(`No upload adapter selected or found for: ${this.currentAdapter}`);
        }
        return adapter.upload(file);
    }

    static getAdapters(): string[] {
        return Array.from(this.adapters.keys());
    }
}
