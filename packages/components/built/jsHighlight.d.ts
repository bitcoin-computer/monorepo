import { type ReactNode } from 'react';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
/**
 * Read-only JS highlighting via Prism.tokenize → React spans with Prism token classes.
 * Falls back to plain text if highlighting fails.
 */
export declare function highlightJs(source: string): ReactNode;
