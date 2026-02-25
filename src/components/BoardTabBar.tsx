import { useState, useRef, useEffect } from 'react';
import type { Board } from '../types/workspace';

interface BoardTabBarProps {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onAddBoard: () => void;
  onRenameBoard: (boardId: string, name: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onDuplicateBoard: (boardId: string) => void;
  onOpenWidgetPicker: () => void;
}

export function BoardTabBar({
  boards,
  activeBoardId,
  onSelectBoard,
  onAddBoard,
  onRenameBoard,
  onDeleteBoard,
  onDuplicateBoard,
  onOpenWidgetPicker,
}: BoardTabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ boardId: string; x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleDoubleClick = (board: Board) => {
    setEditingId(board.id);
    setEditValue(board.name);
  };

  const handleRenameSubmit = () => {
    if (editingId && editValue.trim()) {
      onRenameBoard(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleContextMenu = (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    setContextMenu({ boardId, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="h-10 bg-bg-secondary border-b border-border flex items-center px-2 gap-1">
      {/* Board tabs */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {boards.map(board => (
          <div
            key={board.id}
            onClick={() => onSelectBoard(board.id)}
            onDoubleClick={() => handleDoubleClick(board)}
            onContextMenu={(e) => handleContextMenu(e, board.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer select-none
              transition-colors min-w-[100px] max-w-[200px]
              ${board.id === activeBoardId
                ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80 hover:text-text-primary border border-transparent'
              }
            `}
          >
            {editingId === board.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') {
                    setEditingId(null);
                    setEditValue('');
                  }
                }}
                className="bg-transparent border-none outline-none text-xs w-full text-text-primary"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-xs truncate">{board.name}</span>
            )}
          </div>
        ))}

        {/* Add board button */}
        <button
          onClick={onAddBoard}
          className="flex items-center justify-center w-7 h-7 rounded bg-bg-tertiary hover:bg-accent-blue/20 text-text-secondary hover:text-accent-blue transition-colors"
          title="New board"
        >
          <span className="text-sm">+</span>
        </button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onOpenWidgetPicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 transition-colors text-xs font-medium"
        >
          <span>+</span>
          <span>Add Widget</span>
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed bg-bg-secondary border border-border rounded shadow-lg py-1 z-[9999]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const board = boards.find(b => b.id === contextMenu.boardId);
              if (board) handleDoubleClick(board);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-bg-tertiary"
          >
            Rename
          </button>
          <button
            onClick={() => {
              onDuplicateBoard(contextMenu.boardId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-bg-tertiary"
          >
            Duplicate
          </button>
          {boards.length > 1 && (
            <button
              onClick={() => {
                onDeleteBoard(contextMenu.boardId);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-accent-red hover:bg-bg-tertiary"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
