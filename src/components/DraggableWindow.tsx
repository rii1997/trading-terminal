import { useState, useRef, type ReactNode } from 'react';
import { Rnd, type RndDragCallback, type RndResizeCallback } from 'react-rnd';

interface DraggableWindowProps {
  children: ReactNode;
  title: string;
  headerContent?: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
  minWidth?: number;
  minHeight?: number;
  zIndex?: number;
  onClose?: () => void;
  onDragStop?: RndDragCallback;
  onResizeStop?: RndResizeCallback;
}

export function DraggableWindow({
  children,
  title,
  headerContent,
  defaultWidth = 1000,
  defaultHeight = 700,
  defaultX = 50,
  defaultY = 50,
  minWidth = 400,
  minHeight = 300,
  zIndex = 100,
  onClose,
  onDragStop,
  onResizeStop,
}: DraggableWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevState, setPrevState] = useState({ x: defaultX, y: defaultY, width: defaultWidth, height: defaultHeight });
  const rndRef = useRef<Rnd>(null);

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore
      rndRef.current?.updatePosition({ x: prevState.x, y: prevState.y });
      rndRef.current?.updateSize({ width: prevState.width, height: prevState.height });
      setIsMaximized(false);
    } else {
      // Save current state and maximize
      const currentPos = rndRef.current?.getDraggablePosition();
      const currentSize = rndRef.current?.getSelfElement()?.getBoundingClientRect();
      if (currentPos && currentSize) {
        setPrevState({
          x: currentPos.x,
          y: currentPos.y,
          width: currentSize.width,
          height: currentSize.height,
        });
      }
      rndRef.current?.updatePosition({ x: 0, y: 0 });
      rndRef.current?.updateSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMaximized(true);
    }
  };

  return (
    <Rnd
      ref={rndRef}
      default={{
        x: defaultX,
        y: defaultY,
        width: defaultWidth,
        height: defaultHeight,
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      bounds="window"
      dragHandleClassName="window-drag-handle"
      enableResizing={!isMaximized}
      disableDragging={isMaximized}
      className="shadow-2xl"
      style={{ zIndex }}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
    >
      <div className="bg-bg-secondary border border-border rounded overflow-hidden flex flex-col h-full">
        {/* Window Title Bar - Drag Handle */}
        <div className="window-drag-handle flex items-center justify-between px-2 py-1 bg-bg-tertiary border-b border-border cursor-move select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-text-primary text-xs font-medium">{title}</span>
            <span className="text-accent-green text-xs">⌘</span>
            {headerContent && (
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                {headerContent}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
              className="text-text-primary hover:text-accent-blue p-1 text-xs"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? '⧉' : '□'}
            </button>
            {onClose && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="text-text-primary hover:text-accent-red p-1 text-xs"
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Resize indicator */}
        {!isMaximized && (
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-text-secondary text-xs opacity-50">
            ⋮⋮
          </div>
        )}
      </div>
    </Rnd>
  );
}
