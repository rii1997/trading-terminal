import { useState, useCallback, type ReactNode } from 'react';
import { StockDescription } from './components/StockDescription';
import { Financials } from './components/Financials';
import { News } from './components/News';
import { WorldEquityIndex } from './components/WorldEquityIndex';
import { Commodities } from './components/Commodities';
import { EquityScreener } from './components/EquityScreener';
import { Compare } from './components/Compare';
import { Ratios } from './components/Ratios';
import { Earnings } from './components/Earnings';
import { Dividends } from './components/Dividends';
import { EarningsMatrix } from './components/EarningsMatrix';
import { InsiderTrades } from './components/InsiderTrades';
import { CongressTrades } from './components/CongressTrades';
import { EarningsCalendar } from './components/EarningsCalendar';
import { IPOCalendar } from './components/IPOCalendar';
import { SplitCalendar } from './components/SplitCalendar';
import { DividendCalendar } from './components/DividendCalendar';
import { SectorPerformance } from './components/SectorPerformance';
import { MarketMovers } from './components/MarketMovers';
import { IndexHoldings } from './components/IndexHoldings';
import { EconomicCalendar } from './components/EconomicCalendar';
import { PressReleases } from './components/PressReleases';
import { AnalystRatings } from './components/AnalystRatings';
import { SECFilings } from './components/SECFilings';
import { DraggableWindow } from './components/DraggableWindow';
import { BoardTabBar } from './components/BoardTabBar';
import { WidgetPicker } from './components/WidgetPicker';
import { useWorkspace } from './hooks/useWorkspace';
import type { Widget, WidgetType } from './types/workspace';
import { WIDGET_DEFINITIONS } from './types/workspace';

function App() {
  const {
    activeBoard,
    boards,
    setActiveBoard,
    addBoard,
    deleteBoard,
    renameBoard,
    duplicateBoard,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetConfig,
  } = useWorkspace();

  const [widgetPickerOpen, setWidgetPickerOpen] = useState(false);
  const [headerContents, setHeaderContents] = useState<Record<string, ReactNode>>({});
  const [widgetSymbols, setWidgetSymbols] = useState<Record<string, string>>({});

  // Generic header change handler
  const createHeaderHandler = useCallback((widgetId: string) => {
    return (_symbol: string, headerContent: ReactNode) => {
      setHeaderContents(prev => ({ ...prev, [widgetId]: headerContent }));
    };
  }, []);

  // Open widget with specific symbol
  const openWidgetWithSymbol = useCallback((type: WidgetType, symbol: string) => {
    // Check if widget already exists on the board
    const existingWidget = activeBoard.widgets.find(w => w.type === type);
    if (existingWidget) {
      // Update symbol for existing widget
      setWidgetSymbols(prev => ({ ...prev, [existingWidget.id]: symbol }));
      updateWidgetConfig(existingWidget.id, { symbol });
    } else {
      // Add new widget and set symbol
      const def = WIDGET_DEFINITIONS.find(d => d.type === type);
      if (def) {
        addWidget(type);
        // Note: The new widget's symbol will be set via initialSymbol once it renders
        // We store it temporarily to be picked up
        setTimeout(() => {
          const newWidget = activeBoard.widgets.find(w => w.type === type);
          if (newWidget) {
            setWidgetSymbols(prev => ({ ...prev, [newWidget.id]: symbol }));
          }
        }, 0);
      }
    }
  }, [activeBoard.widgets, addWidget, updateWidgetConfig]);

  // Cross-window navigation handlers
  const handleOpenDescription = useCallback((symbol: string) => openWidgetWithSymbol('description', symbol), [openWidgetWithSymbol]);
  const handleOpenFinancials = useCallback((symbol: string) => openWidgetWithSymbol('financials', symbol), [openWidgetWithSymbol]);
  const handleOpenNews = useCallback((symbol: string) => openWidgetWithSymbol('news', symbol), [openWidgetWithSymbol]);
  const handleOpenInsiderTrades = useCallback((symbol: string) => openWidgetWithSymbol('insiderTrades', symbol), [openWidgetWithSymbol]);
  const handleOpenEarningsMatrix = useCallback((symbol: string) => openWidgetWithSymbol('earningsMatrix', symbol), [openWidgetWithSymbol]);
  const handleOpenRatios = useCallback((symbol: string) => openWidgetWithSymbol('ratios', symbol), [openWidgetWithSymbol]);
  const handleOpenCongressTrades = useCallback((symbol: string) => openWidgetWithSymbol('congressTrades', symbol), [openWidgetWithSymbol]);
  const handleOpenDividends = useCallback((symbol: string) => openWidgetWithSymbol('dividends', symbol), [openWidgetWithSymbol]);
  const handleOpenPress = useCallback((symbol: string) => openWidgetWithSymbol('pressReleases', symbol), [openWidgetWithSymbol]);
  const handleOpenAnalystRatings = useCallback((symbol: string) => openWidgetWithSymbol('analystRatings', symbol), [openWidgetWithSymbol]);
  const handleOpenSECFilings = useCallback((symbol: string) => openWidgetWithSymbol('secFilings', symbol), [openWidgetWithSymbol]);

  // Render a widget based on its type
  const renderWidget = (widget: Widget) => {
    const def = WIDGET_DEFINITIONS.find(d => d.type === widget.type);
    if (!def) return null;

    const headerContent = headerContents[widget.id];
    const symbolFromState = widgetSymbols[widget.id] || widget.config?.symbol;

    const handleClose = () => removeWidget(widget.id);
    const handleSymbolChange = createHeaderHandler(widget.id);

    const commonProps = {
      key: widget.id,
      title: def.label,
      headerContent,
      defaultWidth: widget.size.width,
      defaultHeight: widget.size.height,
      defaultX: widget.position.x,
      defaultY: widget.position.y,
      minWidth: def.minSize.width,
      minHeight: def.minSize.height,
      onClose: handleClose,
      onDragStop: (_e: unknown, d: { x: number; y: number }) => {
        updateWidget(widget.id, { position: { x: d.x, y: d.y } });
      },
      onResizeStop: (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, position: { x: number; y: number }) => {
        updateWidget(widget.id, {
          size: { width: ref.offsetWidth, height: ref.offsetHeight },
          position: { x: position.x, y: position.y },
        });
      },
    };

    switch (widget.type) {
      case 'description':
        return (
          <DraggableWindow {...commonProps}>
            <StockDescription
              onSymbolChange={handleSymbolChange}
              onOpenFinancials={handleOpenFinancials}
              onOpenNews={handleOpenNews}
              onOpenInsiderTrades={handleOpenInsiderTrades}
              onOpenEarningsMatrix={handleOpenEarningsMatrix}
              onOpenRatios={handleOpenRatios}
              onOpenCongressTrades={handleOpenCongressTrades}
              onOpenDividends={handleOpenDividends}
              onOpenPress={handleOpenPress}
              onOpenAnalystRatings={handleOpenAnalystRatings}
              onOpenSECFilings={handleOpenSECFilings}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'financials':
        return (
          <DraggableWindow {...commonProps}>
            <Financials
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'news':
        return (
          <DraggableWindow {...commonProps}>
            <News
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'worldIndex':
        return (
          <DraggableWindow {...commonProps}>
            <WorldEquityIndex />
          </DraggableWindow>
        );

      case 'commodities':
        return (
          <DraggableWindow {...commonProps}>
            <Commodities />
          </DraggableWindow>
        );

      case 'screener':
        return (
          <DraggableWindow {...commonProps}>
            <EquityScreener
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
              onOpenFinancials={handleOpenFinancials}
              onOpenNews={handleOpenNews}
            />
          </DraggableWindow>
        );

      case 'compare':
        return (
          <DraggableWindow {...commonProps}>
            <Compare onSymbolChange={handleSymbolChange} />
          </DraggableWindow>
        );

      case 'ratios':
        return (
          <DraggableWindow {...commonProps}>
            <Ratios
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'earnings':
        return (
          <DraggableWindow {...commonProps}>
            <Earnings onSymbolChange={handleSymbolChange} />
          </DraggableWindow>
        );

      case 'dividends':
        return (
          <DraggableWindow {...commonProps}>
            <Dividends
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'earningsMatrix':
        return (
          <DraggableWindow {...commonProps}>
            <EarningsMatrix
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'insiderTrades':
        return (
          <DraggableWindow {...commonProps}>
            <InsiderTrades
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'congressTrades':
        return (
          <DraggableWindow {...commonProps}>
            <CongressTrades
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'earningsCalendar':
        return (
          <DraggableWindow {...commonProps}>
            <EarningsCalendar
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
            />
          </DraggableWindow>
        );

      case 'ipoCalendar':
        return (
          <DraggableWindow {...commonProps}>
            <IPOCalendar
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
            />
          </DraggableWindow>
        );

      case 'splitCalendar':
        return (
          <DraggableWindow {...commonProps}>
            <SplitCalendar
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
            />
          </DraggableWindow>
        );

      case 'dividendCalendar':
        return (
          <DraggableWindow {...commonProps}>
            <DividendCalendar
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
            />
          </DraggableWindow>
        );

      case 'sectorPerformance':
        return (
          <DraggableWindow {...commonProps}>
            <SectorPerformance onSymbolChange={handleSymbolChange} />
          </DraggableWindow>
        );

      case 'marketMovers':
        return (
          <DraggableWindow {...commonProps}>
            <MarketMovers
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
            />
          </DraggableWindow>
        );

      case 'indexHoldings':
        return (
          <DraggableWindow {...commonProps}>
            <IndexHoldings
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
            />
          </DraggableWindow>
        );

      case 'economicCalendar':
        return (
          <DraggableWindow {...commonProps}>
            <EconomicCalendar onSymbolChange={handleSymbolChange} />
          </DraggableWindow>
        );

      case 'pressReleases':
        return (
          <DraggableWindow {...commonProps}>
            <PressReleases
              onSymbolChange={handleSymbolChange}
              onOpenDescription={handleOpenDescription}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'analystRatings':
        return (
          <DraggableWindow {...commonProps}>
            <AnalystRatings
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      case 'secFilings':
        return (
          <DraggableWindow {...commonProps}>
            <SECFilings
              onSymbolChange={handleSymbolChange}
              initialSymbol={symbolFromState}
            />
          </DraggableWindow>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden">
      {/* Board Tab Bar */}
      <BoardTabBar
        boards={boards}
        activeBoardId={activeBoard.id}
        onSelectBoard={setActiveBoard}
        onAddBoard={() => addBoard('Untitled')}
        onRenameBoard={renameBoard}
        onDeleteBoard={deleteBoard}
        onDuplicateBoard={duplicateBoard}
        onOpenWidgetPicker={() => setWidgetPickerOpen(true)}
      />

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {activeBoard.widgets.map(widget => renderWidget(widget))}

        {/* Empty state */}
        {activeBoard.widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-secondary text-sm mb-3">This board is empty</p>
              <button
                onClick={() => setWidgetPickerOpen(true)}
                className="px-4 py-2 bg-accent-blue/20 text-accent-blue rounded hover:bg-accent-blue/30 transition-colors text-sm"
              >
                Add your first widget
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Widget Picker Modal */}
      <WidgetPicker
        isOpen={widgetPickerOpen}
        onClose={() => setWidgetPickerOpen(false)}
        onAddWidget={addWidget}
        existingWidgetTypes={activeBoard.widgets.map(w => w.type)}
      />
    </div>
  );
}

export default App;
