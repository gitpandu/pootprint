import React, { useState, useEffect } from 'react';
import { usePoopEntries } from './hooks/usePoopEntries';
import TrackerForm from './components/TrackerForm';
import TrackerChart from './components/TrackerChart';
import EntryList from './components/EntryList';
import { Sun, Moon } from 'lucide-react';
import { translations } from './i18n';

function App() {
  const { entries, addEntry, updateEntry, deleteEntry } = usePoopEntries();

  // Editing State
  const [editingEntry, setEditingEntry] = useState(null);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Language State
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'id' : 'en');
  };

  // Chart View State
  const [chartView, setChartView] = useState('weekly');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>{t.title}</h1>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
          <button
            className="theme-toggle"
            onClick={toggleLang}
            aria-label="Toggle Language"
            title={lang === 'en' ? 'Switch to Indonesia' : 'Switch to English'}
          >
            {lang.toUpperCase()}
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="tracker-section">
          <div className="card">
            <h2>{editingEntry ? 'Edit Entry' : t.newEntry}</h2>
            <TrackerForm
              onAddEntry={addEntry}
              onUpdateEntry={updateEntry}
              editingEntry={editingEntry}
              setEditingEntry={setEditingEntry}
              t={t}
            />
          </div>
        </section>

        <section className="stats-section">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{t.views[chartView]}</h2>
              <div className="view-selector" style={{ display: 'flex', border: '1px solid var(--color-border)' }}>
                {['weekly', 'yearly'].map(v => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className="view-btn"
                    style={{
                      flex: 1,
                      backgroundColor: chartView === v ? 'var(--color-primary)' : 'transparent',
                      color: chartView === v ? 'var(--color-bg)' : 'var(--color-text)',
                      border: 'none',
                      padding: '6px 16px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t.views[v]}
                  </button>
                ))}
              </div>
            </div>
            <TrackerChart entries={entries} theme={theme} t={t} lang={lang} view={chartView} />
          </div>
        </section>

        <section className="history-section">
          <div className="card">
            <h2>{t.history} ({entries.length})</h2>
            <EntryList
              entries={entries}
              onDelete={deleteEntry}
              onEdit={setEditingEntry}
              t={t}
              lang={lang}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
