import { useState, useEffect } from 'react';
import { usePoopEntries, PoopEntry } from './hooks/usePoopEntries';
import TrackerForm from './components/TrackerForm';
import TrackerChart from './components/TrackerChart';
import EntryList from './components/EntryList';
import { Sun, Moon } from 'lucide-react';
import { translations, Translation } from './i18n';

function App() {
  const { entries, addEntry, updateEntry, deleteEntry } = usePoopEntries();
  const [editingEntry, setEditingEntry] = useState<PoopEntry | null>(null);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState<string>(() => localStorage.getItem('lang') || 'en');
  const t: Translation = translations[lang] || translations.en;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const [chartView, setChartView] = useState<'weekly' | 'yearly'>('weekly');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');

        :root {
          --ink: #0a0a0a;
          --ink-60: rgba(10,10,10,0.55);
          --ink-30: rgba(10,10,10,0.28);
          --ink-10: rgba(10,10,10,0.08);
          --ink-5: rgba(10,10,10,0.04);
          --paper: #f5f3ef;
          --surface: #faf9f6;
          --hairline: rgba(10,10,10,0.11);
          --hairline-strong: rgba(10,10,10,0.22);
          --font-mono: 'DM Mono', monospace;
          --font-sans: 'DM Sans', sans-serif;
          --font-serif: 'Instrument Serif', serif;
          --ease: cubic-bezier(0.16, 1, 0.3, 1);
        }

        [data-theme="dark"] {
          --ink: #ede9e3;
          --ink-60: rgba(237,233,227,0.55);
          --ink-30: rgba(237,233,227,0.28);
          --ink-10: rgba(237,233,227,0.08);
          --ink-5: rgba(237,233,227,0.04);
          --paper: #100f0d;
          --surface: #141310;
          --hairline: rgba(237,233,227,0.11);
          --hairline-strong: rgba(237,233,227,0.22);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.6;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          transition: background 0.35s var(--ease), color 0.35s var(--ease);
        }

        body::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          opacity: 0.6;
        }

        #root { position: relative; z-index: 1; }

        .shell {
          max-width: 840px;
          margin: 0 auto;
          padding: 0 28px 96px;
        }

        .app-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 52px 0 28px;
          border-bottom: 1px solid var(--hairline);
          margin-bottom: 44px;
        }

        .title-group {}

        .eyebrow {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-30);
          margin-bottom: 8px;
        }

        .app-title {
          font-family: var(--font-sans);
          font-size: clamp(20px, 3.5vw, 30px);
          font-weight: 300;
          letter-spacing: -0.035em;
          line-height: 1;
          color: var(--ink);
        }

        .app-title em {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
        }

        .controls {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .ctrl-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--hairline);
          color: var(--ink-60);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.08em;
        }

        .ctrl-btn:hover {
          border-color: var(--hairline-strong);
          color: var(--ink);
          background: var(--ink-5);
        }

        .card {
          background: var(--surface);
          border: 1px solid var(--hairline);
          padding: 28px 32px;
          margin-bottom: 10px;
          transition: background 0.35s var(--ease), border-color 0.2s;
          animation: rise 0.45s var(--ease) both;
        }

        .card:nth-child(1) { animation-delay: 0.04s; }
        .card:nth-child(2) { animation-delay: 0.1s; }
        .card:nth-child(3) { animation-delay: 0.16s; }

        .card:hover { border-color: var(--hairline-strong); }

        @keyframes rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .card-label {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-60);
        }

        .card-meta {
          font-family: var(--font-mono);
          font-size: 9.5px;
          color: var(--ink-30);
        }

        .seg-ctrl {
          display: flex;
          border: 1px solid var(--hairline);
        }

        .seg-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 5px 18px;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-60);
          cursor: pointer;
          transition: all 0.15s;
        }

        .seg-btn + .seg-btn { border-left: 1px solid var(--hairline); }

        .seg-btn.on {
          background: var(--ink);
          color: var(--paper);
        }

        @media (max-width: 560px) {
          .shell { padding: 0 16px 64px; }
          .card { padding: 20px; }
          .app-header { padding: 36px 0 20px; margin-bottom: 28px; }
        }
      `}</style>

      <div className="shell">
        <header className="app-header">
          <div className="title-group">
            <div className="eyebrow">Poop Tracker — Personal Log</div>
            <h1 className="app-title">
              {t.title.split(' ').slice(0, 1).join(' ')}{' '}
            </h1>
          </div>
          <div className="controls">
            <button className="ctrl-btn" onClick={() => setLang(p => p === 'en' ? 'id' : 'en')} title="Toggle Language">
              {lang.toUpperCase()}
            </button>
            <button className="ctrl-btn" onClick={() => setTheme(p => p === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>
        </header>

        <main>
          <div className="card">
            <div className="card-head">
              <span className="card-label">{editingEntry ? 'Edit Entry' : t.newEntry}</span>
              {editingEntry && <span className="card-meta">id: {editingEntry.id.slice(-6)}</span>}
            </div>
            <TrackerForm
              onAddEntry={addEntry}
              onUpdateEntry={updateEntry}
              editingEntry={editingEntry}
              setEditingEntry={setEditingEntry}
              t={t}
            />
          </div>

          <div className="card">
            <div className="card-head">
              <span className="card-label">{t.views[chartView]}</span>
              <div className="seg-ctrl">
                {(['weekly', 'yearly'] as const).map(v => (
                  <button
                    key={v}
                    className={`seg-btn${chartView === v ? ' on' : ''}`}
                    onClick={() => setChartView(v)}
                  >
                    {t.views[v]}
                  </button>
                ))}
              </div>
            </div>
            <TrackerChart
              key={`${chartView}-${lang}`}
              entries={entries}
              theme={theme}
              t={t}
              lang={lang}
              view={chartView}
            />
          </div>

          <div className="card">
            <div className="card-head">
              <span className="card-label">{t.history}</span>
              <span className="card-meta">{entries.length} total</span>
            </div>
            <EntryList
              entries={entries}
              onDelete={deleteEntry}
              onEdit={setEditingEntry}
              t={t}
              lang={lang}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;