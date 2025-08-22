"use client";

import React from "react";

type LocationInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
};

export default function LocationInput({ value, onChange, placeholder, name, required }: LocationInputProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<string[]>([]);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const controller = React.useRef<AbortController | null>(null);

  const fetchItems = React.useCallback(async (q: string) => {
    try {
      controller.current?.abort();
      controller.current = new AbortController();
      setLoading(true);
      const url = q.trim().length > 0 ? `/api/locations?q=${encodeURIComponent(q)}` : `/api/locations`;
      const res = await fetch(url, { signal: controller.current.signal });
      const data: Array<{ label?: string; value?: string }> = await res.json();
      const arr = Array.isArray(data) ? data.map((o) => String(o?.label ?? o?.value ?? "")).filter(Boolean) : [];
      setItems(arr);
      setOpen(true);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch suggestions with debounce (all when empty, filtered when typing)
  React.useEffect(() => {
    const handle = setTimeout(() => {
      fetchItems(value || "");
    }, 250);
    return () => clearTimeout(handle);
  }, [value, fetchItems]);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative w-[160px]" ref={ref}>
      <input
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 border rounded px-3 text-md bg-white"
        onFocus={() => {
          setOpen(true);
          if (items.length === 0) {
            fetchItems("");
          }
        }}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border bg-white shadow">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Chargement…</div>}
          {!loading && items.map((it: string) => (
            <button
              key={it}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                onChange(it);
                setOpen(false);
              }}
            >
              {it}
            </button>
          ))}
          {!loading && value.trim().length > 0 && !items.includes(value.trim()) && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-t"
              onClick={() => {
                onChange(value.trim());
                setOpen(false);
              }}
            >
              Utiliser « {value.trim()} »
            </button>
          )}
        </div>
      )}
    </div>
  );
}
