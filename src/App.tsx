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

function App() {
  const [showDescription, setShowDescription] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [showNews, setShowNews] = useState(true);
  const [showWorldIndex, setShowWorldIndex] = useState(true);
  const [showCommodities, setShowCommodities] = useState(true);
  const [showScreener, setShowScreener] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showRatios, setShowRatios] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);
  const [showDividends, setShowDividends] = useState(false);
  const [showEarningsMatrix, setShowEarningsMatrix] = useState(false);
  const [showInsiderTrades, setShowInsiderTrades] = useState(false);
  const [showCongressTrades, setShowCongressTrades] = useState(false);
  const [showEarningsCalendar, setShowEarningsCalendar] = useState(false);
  const [showIPOCalendar, setShowIPOCalendar] = useState(false);
  const [showSplitCalendar, setShowSplitCalendar] = useState(false);
  const [showDividendCalendar, setShowDividendCalendar] = useState(false);
  const [showSectorPerformance, setShowSectorPerformance] = useState(false);
  const [showMarketMovers, setShowMarketMovers] = useState(false);
  const [showIndexHoldings, setShowIndexHoldings] = useState(false);
  const [showEconomicCalendar, setShowEconomicCalendar] = useState(false);
  const [showPressReleases, setShowPressReleases] = useState(false);
  const [showAnalystRatings, setShowAnalystRatings] = useState(false);
  const [showSECFilings, setShowSECFilings] = useState(false);
  const [descriptionHeader, setDescriptionHeader] = useState<ReactNode>(null);
  const [financialsHeader, setFinancialsHeader] = useState<ReactNode>(null);
  const [newsHeader, setNewsHeader] = useState<ReactNode>(null);
  const [screenerHeader, setScreenerHeader] = useState<ReactNode>(null);
  const [compareHeader, setCompareHeader] = useState<ReactNode>(null);
  const [ratiosHeader, setRatiosHeader] = useState<ReactNode>(null);
  const [earningsHeader, setEarningsHeader] = useState<ReactNode>(null);
  const [dividendsHeader, setDividendsHeader] = useState<ReactNode>(null);
  const [earningsMatrixHeader, setEarningsMatrixHeader] = useState<ReactNode>(null);
  const [insiderTradesHeader, setInsiderTradesHeader] = useState<ReactNode>(null);
  const [congressTradesHeader, setCongressTradesHeader] = useState<ReactNode>(null);
  const [earningsCalendarHeader, setEarningsCalendarHeader] = useState<ReactNode>(null);
  const [ipoCalendarHeader, setIPOCalendarHeader] = useState<ReactNode>(null);
  const [splitCalendarHeader, setSplitCalendarHeader] = useState<ReactNode>(null);
  const [dividendCalendarHeader, setDividendCalendarHeader] = useState<ReactNode>(null);
  const [sectorPerformanceHeader, setSectorPerformanceHeader] = useState<ReactNode>(null);
  const [marketMoversHeader, setMarketMoversHeader] = useState<ReactNode>(null);
  const [indexHoldingsHeader, setIndexHoldingsHeader] = useState<ReactNode>(null);
  const [economicCalendarHeader, setEconomicCalendarHeader] = useState<ReactNode>(null);
  const [pressReleasesHeader, setPressReleasesHeader] = useState<ReactNode>(null);
  const [analystRatingsHeader, setAnalystRatingsHeader] = useState<ReactNode>(null);
  const [secFilingsHeader, setSECFilingsHeader] = useState<ReactNode>(null);

  // Track symbols for cross-window navigation
  const [descriptionSymbol, setDescriptionSymbol] = useState<string | undefined>(undefined);
  const [financialsSymbol, setFinancialsSymbol] = useState<string | undefined>(undefined);
  const [newsSymbol, setNewsSymbol] = useState<string | undefined>(undefined);
  const [insiderTradesSymbol, setInsiderTradesSymbol] = useState<string | undefined>(undefined);
  const [earningsMatrixSymbol, setEarningsMatrixSymbol] = useState<string | undefined>(undefined);
  const [ratiosSymbol, setRatiosSymbol] = useState<string | undefined>(undefined);
  const [congressTradesSymbol, setCongressTradesSymbol] = useState<string | undefined>(undefined);
  const [dividendsSymbol, setDividendsSymbol] = useState<string | undefined>(undefined);
  const [pressReleasesSymbol, setPressReleasesSymbol] = useState<string | undefined>(undefined);
  const [analystRatingsSymbol, setAnalystRatingsSymbol] = useState<string | undefined>(undefined);
  const [secFilingsSymbol, setSECFilingsSymbol] = useState<string | undefined>(undefined);

  // Stable callbacks to prevent re-render loops
  const handleDescriptionSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setDescriptionHeader(headerContent);
  }, []);

  const handleFinancialsSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setFinancialsHeader(headerContent);
  }, []);

  const handleNewsSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setNewsHeader(headerContent);
  }, []);

  const handleScreenerSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setScreenerHeader(headerContent);
  }, []);

  const handleCompareSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setCompareHeader(headerContent);
  }, []);

  const handleRatiosSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setRatiosHeader(headerContent);
  }, []);

  const handleEarningsSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setEarningsHeader(headerContent);
  }, []);

  const handleDividendsSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setDividendsHeader(headerContent);
  }, []);

  const handleEarningsMatrixSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setEarningsMatrixHeader(headerContent);
  }, []);

  const handleInsiderTradesSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setInsiderTradesHeader(headerContent);
  }, []);

  const handleCongressTradesSymbolChange = useCallback((_: string, headerContent: ReactNode) => {
    setCongressTradesHeader(headerContent);
  }, []);

  const handleEarningsCalendarChange = useCallback((_: string, headerContent: ReactNode) => {
    setEarningsCalendarHeader(headerContent);
  }, []);

  const handleIPOCalendarChange = useCallback((_: string, headerContent: ReactNode) => {
    setIPOCalendarHeader(headerContent);
  }, []);

  const handleSplitCalendarChange = useCallback((_: string, headerContent: ReactNode) => {
    setSplitCalendarHeader(headerContent);
  }, []);

  const handleDividendCalendarChange = useCallback((_: string, headerContent: ReactNode) => {
    setDividendCalendarHeader(headerContent);
  }, []);

  const handleSectorPerformanceChange = useCallback((_: string, headerContent: ReactNode) => {
    setSectorPerformanceHeader(headerContent);
  }, []);

  const handleMarketMoversChange = useCallback((_: string, headerContent: ReactNode) => {
    setMarketMoversHeader(headerContent);
  }, []);

  const handleIndexHoldingsChange = useCallback((_: string, headerContent: ReactNode) => {
    setIndexHoldingsHeader(headerContent);
  }, []);

  const handleEconomicCalendarChange = useCallback((_: string, headerContent: ReactNode) => {
    setEconomicCalendarHeader(headerContent);
  }, []);

  const handlePressReleasesChange = useCallback((_: string, headerContent: ReactNode) => {
    setPressReleasesHeader(headerContent);
  }, []);

  const handleAnalystRatingsChange = useCallback((_: string, headerContent: ReactNode) => {
    setAnalystRatingsHeader(headerContent);
  }, []);

  const handleSECFilingsChange = useCallback((_: string, headerContent: ReactNode) => {
    setSECFilingsHeader(headerContent);
  }, []);

  // Open Description with a specific ticker
  const handleOpenDescription = useCallback((symbol: string) => {
    setDescriptionSymbol(symbol);
    setShowDescription(true);
  }, []);

  // Open Financials with a specific ticker
  const handleOpenFinancials = useCallback((symbol: string) => {
    setFinancialsSymbol(symbol);
    setShowFinancials(true);
  }, []);

  // Open News with a specific ticker
  const handleOpenNews = useCallback((symbol: string) => {
    setNewsSymbol(symbol);
    setShowNews(true);
  }, []);

  // Open Insider Trades with a specific ticker
  const handleOpenInsiderTrades = useCallback((symbol: string) => {
    setInsiderTradesSymbol(symbol);
    setShowInsiderTrades(true);
  }, []);

  // Open Earnings Matrix with a specific ticker
  const handleOpenEarningsMatrix = useCallback((symbol: string) => {
    setEarningsMatrixSymbol(symbol);
    setShowEarningsMatrix(true);
  }, []);

  // Open Ratios with a specific ticker
  const handleOpenRatios = useCallback((symbol: string) => {
    setRatiosSymbol(symbol);
    setShowRatios(true);
  }, []);

  // Open Congress Trades with a specific ticker
  const handleOpenCongressTrades = useCallback((symbol: string) => {
    setCongressTradesSymbol(symbol);
    setShowCongressTrades(true);
  }, []);

  // Open Dividends with a specific ticker
  const handleOpenDividends = useCallback((symbol: string) => {
    setDividendsSymbol(symbol);
    setShowDividends(true);
  }, []);

  // Open Press Releases with a specific ticker
  const handleOpenPress = useCallback((symbol: string) => {
    setPressReleasesSymbol(symbol);
    setShowPressReleases(true);
  }, []);

  // Open Analyst Ratings with a specific ticker
  const handleOpenAnalystRatings = useCallback((symbol: string) => {
    setAnalystRatingsSymbol(symbol);
    setShowAnalystRatings(true);
  }, []);

  // Open SEC Filings with a specific ticker
  const handleOpenSECFilings = useCallback((symbol: string) => {
    setSECFilingsSymbol(symbol);
    setShowSECFilings(true);
  }, []);

  const closeDescription = useCallback(() => setShowDescription(false), []);
  const closeFinancials = useCallback(() => setShowFinancials(false), []);
  const closeNews = useCallback(() => setShowNews(false), []);
  const closeWorldIndex = useCallback(() => setShowWorldIndex(false), []);
  const closeCommodities = useCallback(() => setShowCommodities(false), []);
  const closeScreener = useCallback(() => setShowScreener(false), []);
  const closeCompare = useCallback(() => setShowCompare(false), []);
  const closeRatios = useCallback(() => setShowRatios(false), []);
  const closeEarnings = useCallback(() => setShowEarnings(false), []);
  const closeDividends = useCallback(() => setShowDividends(false), []);
  const closeEarningsMatrix = useCallback(() => setShowEarningsMatrix(false), []);
  const closeInsiderTrades = useCallback(() => setShowInsiderTrades(false), []);
  const closeCongressTrades = useCallback(() => setShowCongressTrades(false), []);
  const closeEarningsCalendar = useCallback(() => setShowEarningsCalendar(false), []);
  const closeIPOCalendar = useCallback(() => setShowIPOCalendar(false), []);
  const closeSplitCalendar = useCallback(() => setShowSplitCalendar(false), []);
  const closeDividendCalendar = useCallback(() => setShowDividendCalendar(false), []);
  const closeSectorPerformance = useCallback(() => setShowSectorPerformance(false), []);
  const closeMarketMovers = useCallback(() => setShowMarketMovers(false), []);
  const closeIndexHoldings = useCallback(() => setShowIndexHoldings(false), []);
  const closeEconomicCalendar = useCallback(() => setShowEconomicCalendar(false), []);
  const closePressReleases = useCallback(() => setShowPressReleases(false), []);
  const closeAnalystRatings = useCallback(() => setShowAnalystRatings(false), []);
  const closeSECFilings = useCallback(() => setShowSECFilings(false), []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-hidden">
      {showDescription && (
        <DraggableWindow
          key="description-window"
          title="Description"
          headerContent={descriptionHeader}
          defaultWidth={680}
          defaultHeight={520}
          defaultX={10}
          defaultY={10}
          minWidth={500}
          minHeight={350}
          onClose={closeDescription}
        >
          <StockDescription
            onSymbolChange={handleDescriptionSymbolChange}
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
            initialSymbol={descriptionSymbol}
          />
        </DraggableWindow>
      )}

      {showFinancials && (
        <DraggableWindow
          key="financials-window"
          title="Financials"
          headerContent={financialsHeader}
          defaultWidth={750}
          defaultHeight={380}
          defaultX={700}
          defaultY={10}
          minWidth={600}
          minHeight={300}
          onClose={closeFinancials}
        >
          <Financials
            onSymbolChange={handleFinancialsSymbolChange}
            initialSymbol={financialsSymbol}
          />
        </DraggableWindow>
      )}

      {showNews && (
        <DraggableWindow
          key="news-window"
          title="News"
          headerContent={newsHeader}
          defaultWidth={700}
          defaultHeight={320}
          defaultX={10}
          defaultY={540}
          minWidth={500}
          minHeight={200}
          onClose={closeNews}
        >
          <News
            onSymbolChange={handleNewsSymbolChange}
            initialSymbol={newsSymbol}
          />
        </DraggableWindow>
      )}

      {showWorldIndex && (
        <DraggableWindow
          key="world-index-window"
          title="World Index"
          defaultWidth={580}
          defaultHeight={400}
          defaultX={720}
          defaultY={400}
          minWidth={450}
          minHeight={250}
          onClose={closeWorldIndex}
        >
          <WorldEquityIndex />
        </DraggableWindow>
      )}

      {showCommodities && (
        <DraggableWindow
          key="commodities-window"
          title="Commodities"
          defaultWidth={520}
          defaultHeight={420}
          defaultX={1310}
          defaultY={10}
          minWidth={400}
          minHeight={250}
          onClose={closeCommodities}
        >
          <Commodities />
        </DraggableWindow>
      )}

      {showScreener && (
        <DraggableWindow
          key="screener-window"
          title="Equity Screener"
          headerContent={screenerHeader}
          defaultWidth={1100}
          defaultHeight={650}
          defaultX={100}
          defaultY={50}
          minWidth={900}
          minHeight={500}
          onClose={closeScreener}
        >
          <EquityScreener
            onSymbolChange={handleScreenerSymbolChange}
            onOpenDescription={handleOpenDescription}
            onOpenFinancials={handleOpenFinancials}
            onOpenNews={handleOpenNews}
          />
        </DraggableWindow>
      )}

      {showCompare && (
        <DraggableWindow
          key="compare-window"
          title="Compare"
          headerContent={compareHeader}
          defaultWidth={900}
          defaultHeight={600}
          defaultX={150}
          defaultY={80}
          minWidth={700}
          minHeight={450}
          onClose={closeCompare}
        >
          <Compare onSymbolChange={handleCompareSymbolChange} />
        </DraggableWindow>
      )}

      {showRatios && (
        <DraggableWindow
          key="ratios-window"
          title="Ratios"
          headerContent={ratiosHeader}
          defaultWidth={880}
          defaultHeight={600}
          defaultX={200}
          defaultY={60}
          minWidth={700}
          minHeight={400}
          onClose={closeRatios}
        >
          <Ratios onSymbolChange={handleRatiosSymbolChange} initialSymbol={ratiosSymbol} />
        </DraggableWindow>
      )}

      {showEarnings && (
        <DraggableWindow
          key="earnings-window"
          title="Earnings"
          headerContent={earningsHeader}
          defaultWidth={720}
          defaultHeight={600}
          defaultX={250}
          defaultY={80}
          minWidth={600}
          minHeight={400}
          onClose={closeEarnings}
        >
          <Earnings onSymbolChange={handleEarningsSymbolChange} />
        </DraggableWindow>
      )}

      {showDividends && (
        <DraggableWindow
          key="dividends-window"
          title="Dividend Yield"
          headerContent={dividendsHeader}
          defaultWidth={780}
          defaultHeight={550}
          defaultX={280}
          defaultY={100}
          minWidth={650}
          minHeight={400}
          onClose={closeDividends}
        >
          <Dividends onSymbolChange={handleDividendsSymbolChange} initialSymbol={dividendsSymbol} />
        </DraggableWindow>
      )}

      {showEarningsMatrix && (
        <DraggableWindow
          key="earnings-matrix-window"
          title="Earnings Matrix"
          headerContent={earningsMatrixHeader}
          defaultWidth={950}
          defaultHeight={550}
          defaultX={100}
          defaultY={50}
          minWidth={800}
          minHeight={450}
          onClose={closeEarningsMatrix}
        >
          <EarningsMatrix onSymbolChange={handleEarningsMatrixSymbolChange} initialSymbol={earningsMatrixSymbol} />
        </DraggableWindow>
      )}

      {showInsiderTrades && (
        <DraggableWindow
          key="insider-trades-window"
          title="Insider Trades"
          headerContent={insiderTradesHeader}
          defaultWidth={750}
          defaultHeight={550}
          defaultX={150}
          defaultY={70}
          minWidth={600}
          minHeight={400}
          onClose={closeInsiderTrades}
        >
          <InsiderTrades onSymbolChange={handleInsiderTradesSymbolChange} initialSymbol={insiderTradesSymbol} />
        </DraggableWindow>
      )}

      {showCongressTrades && (
        <DraggableWindow
          key="congress-trades-window"
          title="Congress Trades"
          headerContent={congressTradesHeader}
          defaultWidth={800}
          defaultHeight={550}
          defaultX={180}
          defaultY={90}
          minWidth={650}
          minHeight={400}
          onClose={closeCongressTrades}
        >
          <CongressTrades onSymbolChange={handleCongressTradesSymbolChange} initialSymbol={congressTradesSymbol} />
        </DraggableWindow>
      )}

      {showEarningsCalendar && (
        <DraggableWindow
          key="earnings-calendar-window"
          title="Earnings Calendar"
          headerContent={earningsCalendarHeader}
          defaultWidth={900}
          defaultHeight={500}
          defaultX={120}
          defaultY={60}
          minWidth={750}
          minHeight={400}
          onClose={closeEarningsCalendar}
        >
          <EarningsCalendar
            onSymbolChange={handleEarningsCalendarChange}
            onOpenDescription={handleOpenDescription}
          />
        </DraggableWindow>
      )}

      {showIPOCalendar && (
        <DraggableWindow
          key="ipo-calendar-window"
          title="IPO Calendar"
          headerContent={ipoCalendarHeader}
          defaultWidth={850}
          defaultHeight={550}
          defaultX={140}
          defaultY={70}
          minWidth={700}
          minHeight={400}
          onClose={closeIPOCalendar}
        >
          <IPOCalendar
            onSymbolChange={handleIPOCalendarChange}
            onOpenDescription={handleOpenDescription}
          />
        </DraggableWindow>
      )}

      {showSplitCalendar && (
        <DraggableWindow
          key="split-calendar-window"
          title="Stock Split Calendar"
          headerContent={splitCalendarHeader}
          defaultWidth={750}
          defaultHeight={500}
          defaultX={160}
          defaultY={80}
          minWidth={600}
          minHeight={400}
          onClose={closeSplitCalendar}
        >
          <SplitCalendar
            onSymbolChange={handleSplitCalendarChange}
            onOpenDescription={handleOpenDescription}
          />
        </DraggableWindow>
      )}

      {showDividendCalendar && (
        <DraggableWindow
          key="dividend-calendar-window"
          title="Dividend Calendar"
          headerContent={dividendCalendarHeader}
          defaultWidth={900}
          defaultHeight={550}
          defaultX={180}
          defaultY={90}
          minWidth={750}
          minHeight={400}
          onClose={closeDividendCalendar}
        >
          <DividendCalendar
            onSymbolChange={handleDividendCalendarChange}
            onOpenDescription={handleOpenDescription}
          />
        </DraggableWindow>
      )}

      {showSectorPerformance && (
        <DraggableWindow
          key="sector-performance-window"
          title="Sector Performance"
          headerContent={sectorPerformanceHeader}
          defaultWidth={650}
          defaultHeight={520}
          defaultX={200}
          defaultY={100}
          minWidth={550}
          minHeight={400}
          onClose={closeSectorPerformance}
        >
          <SectorPerformance onSymbolChange={handleSectorPerformanceChange} />
        </DraggableWindow>
      )}

      {showMarketMovers && (
        <DraggableWindow
          key="market-movers-window"
          title="Market Movers"
          headerContent={marketMoversHeader}
          defaultWidth={800}
          defaultHeight={550}
          defaultX={220}
          defaultY={110}
          minWidth={650}
          minHeight={400}
          onClose={closeMarketMovers}
        >
          <MarketMovers
            onSymbolChange={handleMarketMoversChange}
            onOpenDescription={handleOpenDescription}
          />
        </DraggableWindow>
      )}

      {showIndexHoldings && (
        <DraggableWindow
          key="index-holdings-window"
          title="Index Holdings"
          headerContent={indexHoldingsHeader}
          defaultWidth={850}
          defaultHeight={600}
          defaultX={240}
          defaultY={80}
          minWidth={700}
          minHeight={450}
          onClose={closeIndexHoldings}
        >
          <IndexHoldings
            onSymbolChange={handleIndexHoldingsChange}
            onOpenDescription={handleOpenDescription}
          />
        </DraggableWindow>
      )}

      {showEconomicCalendar && (
        <DraggableWindow
          key="economic-calendar-window"
          title="Economic Calendar"
          headerContent={economicCalendarHeader}
          defaultWidth={800}
          defaultHeight={600}
          defaultX={260}
          defaultY={60}
          minWidth={650}
          minHeight={450}
          onClose={closeEconomicCalendar}
        >
          <EconomicCalendar onSymbolChange={handleEconomicCalendarChange} />
        </DraggableWindow>
      )}

      {showPressReleases && (
        <DraggableWindow
          key="press-releases-window"
          title="Press Releases"
          headerContent={pressReleasesHeader}
          defaultWidth={700}
          defaultHeight={600}
          defaultX={280}
          defaultY={70}
          minWidth={550}
          minHeight={400}
          onClose={closePressReleases}
        >
          <PressReleases
            onSymbolChange={handlePressReleasesChange}
            onOpenDescription={handleOpenDescription}
            initialSymbol={pressReleasesSymbol}
          />
        </DraggableWindow>
      )}

      {showAnalystRatings && (
        <DraggableWindow
          key="analyst-ratings-window"
          title="Analyst Ratings"
          headerContent={analystRatingsHeader}
          defaultWidth={700}
          defaultHeight={550}
          defaultX={300}
          defaultY={80}
          minWidth={550}
          minHeight={400}
          onClose={closeAnalystRatings}
        >
          <AnalystRatings
            onSymbolChange={handleAnalystRatingsChange}
            initialSymbol={analystRatingsSymbol}
          />
        </DraggableWindow>
      )}

      {showSECFilings && (
        <DraggableWindow
          key="sec-filings-window"
          title="SEC Filings"
          headerContent={secFilingsHeader}
          defaultWidth={750}
          defaultHeight={550}
          defaultX={320}
          defaultY={90}
          minWidth={600}
          minHeight={400}
          onClose={closeSECFilings}
        >
          <SECFilings
            onSymbolChange={handleSECFilingsChange}
            initialSymbol={secFilingsSymbol}
          />
        </DraggableWindow>
      )}

      {/* Toolbar to reopen closed windows */}
      {(!showDescription || !showFinancials || !showNews || !showWorldIndex || !showCommodities || !showScreener || !showCompare || !showRatios || !showEarnings || !showDividends || !showEarningsMatrix || !showInsiderTrades || !showCongressTrades || !showEarningsCalendar || !showIPOCalendar || !showSplitCalendar || !showDividendCalendar || !showSectorPerformance || !showMarketMovers || !showIndexHoldings || !showEconomicCalendar || !showPressReleases || !showAnalystRatings || !showSECFilings) && (
        <div className="fixed bottom-2 right-2 flex gap-1">
          {!showDescription && (
            <button
              onClick={() => setShowDescription(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Desc
            </button>
          )}
          {!showFinancials && (
            <button
              onClick={() => setShowFinancials(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Fin
            </button>
          )}
          {!showNews && (
            <button
              onClick={() => setShowNews(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              News
            </button>
          )}
          {!showWorldIndex && (
            <button
              onClick={() => setShowWorldIndex(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Index
            </button>
          )}
          {!showCommodities && (
            <button
              onClick={() => setShowCommodities(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Cmdty
            </button>
          )}
          {!showScreener && (
            <button
              onClick={() => setShowScreener(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Screen
            </button>
          )}
          {!showCompare && (
            <button
              onClick={() => setShowCompare(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Compare
            </button>
          )}
          {!showRatios && (
            <button
              onClick={() => setShowRatios(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Ratios
            </button>
          )}
          {!showEarnings && (
            <button
              onClick={() => setShowEarnings(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Earnings
            </button>
          )}
          {!showDividends && (
            <button
              onClick={() => setShowDividends(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Dividends
            </button>
          )}
          {!showEarningsMatrix && (
            <button
              onClick={() => setShowEarningsMatrix(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              EMatrix
            </button>
          )}
          {!showInsiderTrades && (
            <button
              onClick={() => setShowInsiderTrades(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Insider
            </button>
          )}
          {!showCongressTrades && (
            <button
              onClick={() => setShowCongressTrades(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Congress
            </button>
          )}
          {!showEarningsCalendar && (
            <button
              onClick={() => setShowEarningsCalendar(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              ECal
            </button>
          )}
          {!showIPOCalendar && (
            <button
              onClick={() => setShowIPOCalendar(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              IPO
            </button>
          )}
          {!showSplitCalendar && (
            <button
              onClick={() => setShowSplitCalendar(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Splits
            </button>
          )}
          {!showDividendCalendar && (
            <button
              onClick={() => setShowDividendCalendar(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              DivCal
            </button>
          )}
          {!showSectorPerformance && (
            <button
              onClick={() => setShowSectorPerformance(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Sectors
            </button>
          )}
          {!showMarketMovers && (
            <button
              onClick={() => setShowMarketMovers(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Movers
            </button>
          )}
          {!showIndexHoldings && (
            <button
              onClick={() => setShowIndexHoldings(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Holdings
            </button>
          )}
          {!showEconomicCalendar && (
            <button
              onClick={() => setShowEconomicCalendar(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Econ
            </button>
          )}
          {!showPressReleases && (
            <button
              onClick={() => setShowPressReleases(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              Press
            </button>
          )}
          {!showAnalystRatings && (
            <button
              onClick={() => setShowAnalystRatings(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              ANR
            </button>
          )}
          {!showSECFilings && (
            <button
              onClick={() => setShowSECFilings(true)}
              className="bg-bg-secondary border border-border text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary text-xs"
            >
              SEC
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
