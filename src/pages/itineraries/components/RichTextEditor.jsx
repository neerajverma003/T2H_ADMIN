import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const RichTextEditor = ({
    name,
    value = "",
    onChange,
    disabled = false,
    placeholder = "Enter details here...",
    variant = "default", // "default" for DayInfoSection, "embedded" for DiscriptionDetailsSection
    minHeight = "min-h-[140px]",
    hideImage = false,
}) => {
    const editorRef = useRef(null);
    const isUserTypingRef = useRef(false);

    const [currentBlock, setCurrentBlock] = useState("p");
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        insertUnorderedList: false,
        insertOrderedList: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
    });

    const updateActiveFormats = () => {
        try {
            setActiveFormats({
                bold: document.queryCommandState("bold"),
                italic: document.queryCommandState("italic"),
                underline: document.queryCommandState("underline"),
                strikeThrough: document.queryCommandState("strikeThrough"),
                insertUnorderedList: document.queryCommandState("insertUnorderedList"),
                insertOrderedList: document.queryCommandState("insertOrderedList"),
                justifyLeft: document.queryCommandState("justifyLeft"),
                justifyCenter: document.queryCommandState("justifyCenter"),
                justifyRight: document.queryCommandState("justifyRight"),
            });

            // Detect current block type (p, h1, h2, h3)
            const selection = window.getSelection();
            if (selection && selection.anchorNode) {
                let node = selection.anchorNode.nodeType === 3
                    ? selection.anchorNode.parentNode
                    : selection.anchorNode;
                while (node && node !== editorRef.current) {
                    const tag = node.tagName?.toLowerCase();
                    if (["h1", "h2", "h3", "p"].includes(tag)) {
                        setCurrentBlock(tag);
                        return;
                    }
                    node = node.parentNode;
                }
            }
            setCurrentBlock("p");
        } catch {
            // Ignore if queryCommandState fails
        }
    };

    const handleInput = () => {
        if (!editorRef.current) return;
        isUserTypingRef.current = true;

        let html = editorRef.current.innerHTML;
        const text = editorRef.current.textContent.trim();
        const hasMedia = html.includes("<img") || html.includes("<iframe");

        // Normalize empty editor content
        if (!text && !hasMedia) {
            html = "";
        }

        if (onChange) {
            onChange({
                target: {
                    name,
                    value: html,
                },
            });
        }

        updateActiveFormats();

        setTimeout(() => {
            isUserTypingRef.current = false;
        }, 50);
    };

    // Synchronize external value changes to innerHTML (e.g., initial load, reset)
    useEffect(() => {
        if (!editorRef.current) return;
        if (isUserTypingRef.current) return;

        const currentHtml = editorRef.current.innerHTML;
        const targetHtml = value || "";

        if (currentHtml !== targetHtml) {
            editorRef.current.innerHTML = targetHtml;
        }
    }, [value]);

    const executeCommand = (command, val = null) => {
        if (disabled || !editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, val);
        handleInput();
    };

    const handleFormatBlock = (tag) => {
        if (disabled || !editorRef.current) return;
        editorRef.current.focus();
        document.execCommand("formatBlock", false, `<${tag}>`);
        setCurrentBlock(tag);
        handleInput();
    };

    const handleInsertLink = () => {
        if (disabled || !editorRef.current) return;
        editorRef.current.focus();

        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : "";
        const url = window.prompt("Enter destination URL (e.g., https://trip2honeymoon.com):", "https://");

        if (!url || url.trim() === "" || url === "https://") return;

        if (selectedText) {
            document.execCommand("createLink", false, url.trim());
        } else {
            document.execCommand(
                "insertHTML",
                false,
                `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url.trim()}</a>`
            );
        }
        handleInput();
    };

    const handleInsertImage = () => {
        if (disabled || !editorRef.current) return;
        editorRef.current.focus();

        const url = window.prompt("Enter image URL (e.g., https://...):");
        if (!url || url.trim() === "") return;

        document.execCommand("insertImage", false, url.trim());
        handleInput();
    };

    const handleClearFormat = () => {
        if (disabled || !editorRef.current) return;
        editorRef.current.focus();
        document.execCommand("removeFormat", false, null);
        document.execCommand("formatBlock", false, "<p>");
        setCurrentBlock("p");
        handleInput();
    };

    const isEmpty = !value || value.trim() === "" || value === "<p><br></p>" || value === "<br>";

    const isEmbedded = variant === "embedded";

    return (
        <div className={`flex flex-col w-full ${isEmbedded ? "" : "min-h-[240px]"}`}>
            {/* EDITOR TOOLBAR */}
            {!disabled && (
                <div className={`flex flex-wrap items-center gap-1.5 border-b select-none ${
                    isEmbedded
                        ? "px-4 py-2 bg-slate-100/90 dark:bg-[#081226] border-slate-200 dark:border-slate-800 text-xs"
                        : "px-5 py-3 bg-slate-100/70 dark:bg-[#050A17]/40 border-slate-200 dark:border-slate-800/80 text-xs"
                }`}>
                    {/* Block Style Selector */}
                    <div className="flex items-center mr-1.5 pr-2 border-r border-slate-200 dark:border-slate-800">
                        <select
                            disabled={disabled}
                            value={currentBlock}
                            onChange={(e) => handleFormatBlock(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:text-blue-500 transition-colors py-0.5"
                        >
                            <option value="p" className="bg-white dark:bg-[#091126] text-slate-800 dark:text-slate-200">Normal</option>
                            <option value="h1" className="bg-white dark:bg-[#091126] text-slate-800 dark:text-slate-200">Heading 1</option>
                            <option value="h2" className="bg-white dark:bg-[#091126] text-slate-800 dark:text-slate-200">Heading 2</option>
                            <option value="h3" className="bg-white dark:bg-[#091126] text-slate-800 dark:text-slate-200">Heading 3</option>
                        </select>
                    </div>

                    {/* Inline Formats */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("bold")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.bold
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={13} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("italic")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.italic
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={13} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("underline")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.underline
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Underline (Ctrl+U)"
                    >
                        <Underline size={13} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("strikeThrough")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.strikeThrough
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Strikethrough"
                    >
                        <Strikethrough size={13} />
                    </button>

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Lists & Alignment */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("insertUnorderedList")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.insertUnorderedList
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Bullet List"
                    >
                        <List size={13} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("insertOrderedList")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.insertOrderedList
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Numbered List"
                    >
                        <ListOrdered size={13} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("justifyLeft")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.justifyLeft
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Align Left"
                    >
                        <AlignLeft size={13} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("justifyCenter")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.justifyCenter
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Align Center"
                    >
                        <AlignCenter size={13} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand("justifyRight")}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            activeFormats.justifyRight
                                ? "bg-blue-500/20 text-blue-500 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                        title="Align Right"
                    >
                        <AlignRight size={13} />
                    </button>

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Links, Media, Clear */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleInsertLink}
                        className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Insert Link"
                    >
                        <LinkIcon size={13} />
                    </button>

                    {!hideImage && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleInsertImage}
                            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Insert Image"
                        >
                            <ImageIcon size={13} />
                        </button>
                    )}

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleClearFormat}
                        className="px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer font-mono text-[11px] font-bold"
                        title="Clear Formatting"
                    >
                        Tx
                    </button>
                </div>
            )}

            {/* EDITOR CANVAS */}
            {isEmbedded ? (
                <div className="relative flex-1">
                    {isEmpty && (
                        <div
                            onClick={() => editorRef.current?.focus()}
                            className="absolute top-4 left-4 text-slate-400 dark:text-slate-500 text-sm font-semibold pointer-events-none select-none"
                        >
                            {placeholder}
                        </div>
                    )}
                    <div
                        ref={editorRef}
                        contentEditable={!disabled}
                        suppressContentEditableWarning
                        onInput={handleInput}
                        onKeyUp={updateActiveFormats}
                        onMouseUp={updateActiveFormats}
                        onFocus={updateActiveFormats}
                        className={`w-full ${minHeight} p-4 bg-transparent text-sm leading-relaxed text-slate-900 dark:text-white font-semibold outline-none resize-none no-scrollbar overflow-y-auto rich-text-content`}
                    />
                </div>
            ) : (
                <div className="relative flex-1 p-5">
                    {isEmpty && (
                        <div
                            onClick={() => editorRef.current?.focus()}
                            className="absolute top-9 left-9 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none select-none"
                        >
                            {placeholder}
                        </div>
                    )}
                    <div
                        ref={editorRef}
                        contentEditable={!disabled}
                        suppressContentEditableWarning
                        onInput={handleInput}
                        onKeyUp={updateActiveFormats}
                        onMouseUp={updateActiveFormats}
                        onFocus={updateActiveFormats}
                        className={`w-full min-h-[176px] max-h-[460px] overflow-y-auto p-4 border border-slate-200 dark:border-slate-800/90 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white text-sm leading-relaxed bg-slate-50/80 dark:bg-[#050A17] font-medium outline-none transition-all rich-text-content`}
                    />
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
