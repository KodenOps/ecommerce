"use client";

import React, { useId } from "react";
import { FiPlus } from "react-icons/fi";
import { formatNaira } from "@/lib/money";

const emptyOption = (isFirst) => ({
  value: "",
  label: "",
  price: 0,
  stock: 25,
  is_default: isFirst,
});

/**
 * Edits one product's variant group: a title ("Colour", "Size", "Flavour"...)
 * and the variations under it, each with its own price (red: 5000).
 */
export default function VariantEditor({
  title = "",
  options = [],
  onTitleChange,
  onChange,
}) {
  const titleId = useId();
  const defaultGroup = `${titleId}-default`;

  const updateOption = (index, field, value) => {
    onChange(
      options.map((option, position) =>
        position === index ? { ...option, [field]: value } : option
      )
    );
  };

  const addOption = () => {
    onChange([...options, emptyOption(options.length === 0)]);
  };

  const removeOption = (index) => {
    const next = options.filter((_, position) => position !== index);
    if (next.length && !next.some((option) => option.is_default)) {
      next[0] = { ...next[0], is_default: true };
    }
    onChange(next);
  };

  const setDefaultOption = (index) => {
    onChange(
      options.map((option, position) => ({
        ...option,
        is_default: position === index,
      }))
    );
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="label">Variants</p>
          <p className="text-[11px] text-muted">
            Name the attribute, then list each variation with its price.
          </p>
        </div>
        <button
          type="button"
          onClick={addOption}
          className="btn-secondary px-2.5 py-1 text-[10px]"
        >
          <FiPlus size={10} /> Add option
        </button>
      </div>

      <div className="mt-3">
        <label htmlFor={titleId} className="label">
          Variant title
        </label>
        <input
          id={titleId}
          value={title}
          onChange={(event) => onTitleChange?.(event.target.value)}
          className="field mt-1.5"
          placeholder="Colour, size, flavour…"
        />
      </div>

      <div className="mt-3 space-y-2">
        {options.length === 0 && (
          <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-[11px] text-muted">
            No variations yet. The product will sell as a single item at its own
            price.
          </p>
        )}

        {options.map((option, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-surface p-2"
          >
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_110px_90px]">
              <input
                value={option.label || ""}
                onChange={(event) =>
                  updateOption(index, "label", event.target.value)
                }
                className="field"
                placeholder="Variation, e.g. Red"
                aria-label={`Variation ${index + 1} name`}
              />
              <input
                type="number"
                min="0"
                value={option.price ?? 0}
                onChange={(event) =>
                  updateOption(index, "price", Number(event.target.value || 0))
                }
                className="field"
                placeholder="₦"
                aria-label={`Variation ${index + 1} price`}
              />
              <input
                type="number"
                min="0"
                value={option.stock ?? 0}
                onChange={(event) =>
                  updateOption(index, "stock", Number(event.target.value || 0))
                }
                className="field"
                placeholder="Stock"
                aria-label={`Variation ${index + 1} stock`}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                <input
                  type="radio"
                  name={defaultGroup}
                  checked={Boolean(option.is_default)}
                  onChange={() => setDefaultOption(index)}
                  className="h-3.5 w-3.5 accent-accent"
                />
                Default
              </label>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted">
                  {formatNaira(Number(option.price || 0))}
                </span>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-[11px] font-medium text-muted transition-colors hover:text-accent"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
