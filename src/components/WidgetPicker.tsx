import { useState } from 'react';
import type { WidgetType } from '../types/workspace';
import { WIDGET_DEFINITIONS, WIDGET_CATEGORIES } from '../types/workspace';

interface WidgetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType) => void;
  existingWidgetTypes: WidgetType[];
}

export function WidgetPicker({ isOpen, onClose, onAddWidget, existingWidgetTypes }: WidgetPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('analysis');

  if (!isOpen) return null;

  const filteredWidgets = WIDGET_DEFINITIONS.filter(w => w.category === activeCategory);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bg-secondary border border-border rounded-lg shadow-2xl w-[600px] max-h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-text-primary">Add Widget</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar */}
          <div className="w-40 border-r border-border bg-bg-tertiary/50 py-2">
            {WIDGET_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  w-full text-left px-4 py-2 text-xs transition-colors
                  ${activeCategory === cat.id
                    ? 'bg-accent-blue/20 text-accent-blue border-r-2 border-accent-blue'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Widget grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {filteredWidgets.map(widget => {
                const isActive = existingWidgetTypes.includes(widget.type);
                return (
                  <button
                    key={widget.type}
                    onClick={() => {
                      onAddWidget(widget.type);
                      onClose();
                    }}
                    className={`
                      text-left p-3 rounded border transition-all
                      ${isActive
                        ? 'bg-accent-green/10 border-accent-green/30 hover:bg-accent-green/20'
                        : 'bg-bg-tertiary border-border hover:border-accent-blue/50 hover:bg-bg-tertiary/80'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-text-primary">{widget.label}</span>
                      {isActive && (
                        <span className="text-[10px] text-accent-green">Active</span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-secondary">
                      {widget.defaultSize.width}×{widget.defaultSize.height}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-bg-tertiary/30">
          <p className="text-[10px] text-text-secondary">
            Click a widget to add it to your current board. You can add multiple instances of the same widget.
          </p>
        </div>
      </div>
    </div>
  );
}
