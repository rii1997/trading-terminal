import { useState, useEffect, useCallback } from 'react';
import type { Board, Widget, WidgetType, Workspace } from '../types/workspace';
import { WIDGET_DEFINITIONS } from '../types/workspace';

const STORAGE_KEY = 'trading-terminal-workspace';

// Default template: Market Overview
const createDefaultBoard = (): Board => ({
  id: 'default',
  name: 'Market Overview',
  widgets: [
    {
      id: 'w1',
      type: 'description',
      position: { x: 10, y: 10 },
      size: { width: 680, height: 520 },
    },
    {
      id: 'w2',
      type: 'financials',
      position: { x: 700, y: 10 },
      size: { width: 750, height: 380 },
    },
    {
      id: 'w3',
      type: 'news',
      position: { x: 10, y: 540 },
      size: { width: 700, height: 320 },
    },
    {
      id: 'w4',
      type: 'worldIndex',
      position: { x: 720, y: 400 },
      size: { width: 580, height: 400 },
    },
    {
      id: 'w5',
      type: 'commodities',
      position: { x: 1310, y: 10 },
      size: { width: 520, height: 420 },
    },
  ],
  createdAt: Date.now(),
});

const createEmptyBoard = (name: string): Board => ({
  id: `board-${Date.now()}`,
  name,
  widgets: [],
  createdAt: Date.now(),
});

const generateWidgetId = () => `widget-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Workspace;
        if (parsed.boards && parsed.boards.length > 0) {
          return parsed;
        }
      }
    } catch {
      console.warn('Failed to load workspace from localStorage');
    }
    return {
      boards: [createDefaultBoard()],
      activeBoardId: 'default',
    };
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      console.warn('Failed to save workspace to localStorage');
    }
  }, [workspace]);

  const activeBoard = workspace.boards.find(b => b.id === workspace.activeBoardId) || workspace.boards[0];

  // Board operations
  const setActiveBoard = useCallback((boardId: string) => {
    setWorkspace(prev => ({ ...prev, activeBoardId: boardId }));
  }, []);

  const addBoard = useCallback((name: string = 'Untitled') => {
    const newBoard = createEmptyBoard(name);
    setWorkspace(prev => ({
      ...prev,
      boards: [...prev.boards, newBoard],
      activeBoardId: newBoard.id,
    }));
    return newBoard.id;
  }, []);

  const deleteBoard = useCallback((boardId: string) => {
    setWorkspace(prev => {
      if (prev.boards.length <= 1) return prev; // Can't delete last board
      const newBoards = prev.boards.filter(b => b.id !== boardId);
      const newActiveId = prev.activeBoardId === boardId ? newBoards[0].id : prev.activeBoardId;
      return { boards: newBoards, activeBoardId: newActiveId };
    });
  }, []);

  const renameBoard = useCallback((boardId: string, name: string) => {
    setWorkspace(prev => ({
      ...prev,
      boards: prev.boards.map(b => b.id === boardId ? { ...b, name } : b),
    }));
  }, []);

  const duplicateBoard = useCallback((boardId: string) => {
    setWorkspace(prev => {
      const board = prev.boards.find(b => b.id === boardId);
      if (!board) return prev;
      const newBoard: Board = {
        ...board,
        id: `board-${Date.now()}`,
        name: `${board.name} (Copy)`,
        widgets: board.widgets.map(w => ({ ...w, id: generateWidgetId() })),
        createdAt: Date.now(),
      };
      return {
        ...prev,
        boards: [...prev.boards, newBoard],
        activeBoardId: newBoard.id,
      };
    });
  }, []);

  // Widget operations
  const addWidget = useCallback((type: WidgetType) => {
    const def = WIDGET_DEFINITIONS.find(d => d.type === type);
    if (!def) return;

    // Find a good position (cascade from top-left)
    const existingCount = activeBoard.widgets.length;
    const offsetX = (existingCount % 5) * 30;
    const offsetY = (existingCount % 5) * 30;

    const newWidget: Widget = {
      id: generateWidgetId(),
      type,
      position: { x: 50 + offsetX, y: 50 + offsetY },
      size: { ...def.defaultSize },
    };

    setWorkspace(prev => ({
      ...prev,
      boards: prev.boards.map(b =>
        b.id === prev.activeBoardId
          ? { ...b, widgets: [...b.widgets, newWidget] }
          : b
      ),
    }));
  }, [activeBoard]);

  const removeWidget = useCallback((widgetId: string) => {
    setWorkspace(prev => ({
      ...prev,
      boards: prev.boards.map(b =>
        b.id === prev.activeBoardId
          ? { ...b, widgets: b.widgets.filter(w => w.id !== widgetId) }
          : b
      ),
    }));
  }, []);

  const updateWidget = useCallback((widgetId: string, updates: Partial<Omit<Widget, 'id' | 'type'>>) => {
    setWorkspace(prev => ({
      ...prev,
      boards: prev.boards.map(b =>
        b.id === prev.activeBoardId
          ? {
              ...b,
              widgets: b.widgets.map(w =>
                w.id === widgetId ? { ...w, ...updates } : w
              ),
            }
          : b
      ),
    }));
  }, []);

  const updateWidgetConfig = useCallback((widgetId: string, config: Partial<Widget['config']>) => {
    setWorkspace(prev => ({
      ...prev,
      boards: prev.boards.map(b =>
        b.id === prev.activeBoardId
          ? {
              ...b,
              widgets: b.widgets.map(w =>
                w.id === widgetId ? { ...w, config: { ...w.config, ...config } } : w
              ),
            }
          : b
      ),
    }));
  }, []);

  return {
    workspace,
    activeBoard,
    boards: workspace.boards,
    // Board operations
    setActiveBoard,
    addBoard,
    deleteBoard,
    renameBoard,
    duplicateBoard,
    // Widget operations
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetConfig,
  };
}
