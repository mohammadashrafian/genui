"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean | null;
}

export function JsonEditor({ value, onChange, isValid }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  const updateLineCount = useCallback((text: string) => {
    const count = text.split("\n").length;
    setLineCount(count);
  }, []);

  useEffect(() => {
    updateLineCount(value);
  }, [value, updateLineCount]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 300)}px`;
  }, [value]);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange]
  );

  const validationIcon =
    isValid === null ? null : isValid ? (
      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5 8.5L7 10.5L11 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Valid JSON
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M6 6L10 10M10 6L6 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Invalid JSON
      </div>
    );

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-border rounded-t-lg">
        <span className="text-xs text-text-secondary font-mono">
          LLM Output JSON
        </span>
        {validationIcon}
      </div>
      <div className="flex flex-1 min-h-0 bg-[#0d1117] rounded-b-lg overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="select-none py-3 pr-2 text-right font-mono text-xs leading-[1.65rem] text-text-secondary/40 overflow-hidden shrink-0"
          style={{ width: "3rem" }}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          className="flex-1 bg-transparent text-text-primary font-mono text-sm leading-[1.65rem] p-3 pl-1 resize-none outline-none min-h-[300px] overflow-auto"
          style={{
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
