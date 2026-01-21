// src/core/registry.ts
import type { LexicalEditor } from 'lexical';
import { EditorSDK } from './sdk';

export interface EditorPlugin {
    name: string;
    // Every plugin gets the SDK instance to set itself up
    init: (sdk: EditorSDK) => void;
}

export class PluginRegistry {
    private plugins: Map<string, EditorPlugin> = new Map();
    private sdk: EditorSDK;

    constructor(editor: LexicalEditor) {
        this.sdk = new EditorSDK(editor);
    }

    register(plugin: EditorPlugin) {
        if (!this.plugins.has(plugin.name)) {
            try {
                plugin.init(this.sdk);
                this.plugins.set(plugin.name, plugin);
                console.log(`Plugin [${plugin.name}] loaded successfully via SDK.`);
            } catch (error) {
                console.error(`Failed to load plugin [${plugin.name}]:`, error);
            }
        }
    }

    getSDK(): EditorSDK {
        return this.sdk;
    }
}