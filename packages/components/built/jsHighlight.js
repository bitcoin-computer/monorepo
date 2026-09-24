import { jsx as _jsx } from "react/jsx-runtime";
import { languages, tokenize } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
function tokenClassName(type, alias) {
    const aliases = alias == null ? [] : Array.isArray(alias) ? alias : [alias];
    return ['token', type, ...aliases].filter(Boolean).join(' ');
}
function renderStream(stream, prefix) {
    const parts = Array.isArray(stream) ? stream : [stream];
    return parts.map((part, i) => {
        const key = `${prefix}${i}`;
        if (typeof part === 'string') {
            return _jsx("span", { children: part }, key);
        }
        return (_jsx("span", { className: tokenClassName(part.type, part.alias), children: renderStream(part.content, `${key}-`) }, key));
    });
}
/**
 * Read-only JS highlighting via Prism.tokenize → React spans with Prism token classes.
 * Falls back to plain text if highlighting fails.
 */
export function highlightJs(source) {
    if (!source)
        return source;
    try {
        const grammar = languages.javascript;
        if (!grammar)
            return source;
        return renderStream(tokenize(source, grammar), '');
    }
    catch {
        return source;
    }
}
