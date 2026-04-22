import { useState, useEffect } from 'react';
import { usePoopEntries, PoopEntry } from './hooks/usePoopEntries';
import TrackerForm from './components/TrackerForm';
import TrackerChart from './components/TrackerChart';
import EntryList from './components/EntryList';
import { Sun, Moon } from 'lucide-react';
import { translations, Translation } from './i18n';

function App() {
  const { entries, addEntry, updateEntry, deleteEntry } = usePoopEntries();

  // Editing State
  const [editingEntry, setEditingEntry] = useState<PoopEntry | null>(null);

  // Theme State
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Language State
  const [lang, setLang] = useState<string>(() => {
    return localStorage.getItem('lang') || 'en';
  });

  const t: Translation = translations[lang] || translations.en;

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
  const [chartView, setChartView] = useState<'weekly' | 'yearly'>('weekly');

  return (
    <div className="max-w-[900px] mx-auto px-4 py-10 sm:px-5">
      <header className="mb-7 pb-5 border-b border-border flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-[2rem] font-semibold m-0 text-text">{t.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-transparent border border-border text-text p-2 cursor-pointer flex items-center justify-center transition-all duration-200 min-w-[40px] h-10 font-semibold text-[0.8rem] hover:bg-border"
            onClick={toggleLang}
            aria-label="Toggle Language"
            title={lang === 'en' ? 'Switch to Indonesia' : 'Switch to English'}
          >
            {lang.toUpperCase()}
          </button>
          <button
            className="bg-transparent border border-border text-text p-2 cursor-pointer flex items-center justify-center transition-all duration-200 min-w-[40px] h-10 font-semibold text-[0.8rem] hover:bg-border"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section>
          <div className="bg-card-bg p-6 border border-border mb-6 transition-colors duration-300">
            <h2 className="text-[1.1rem] font-semibold mt-0 mb-5 text-text uppercase tracking-wider">
              {editingEntry ? 'Edit Entry' : t.newEntry}
            </h2>
            <TrackerForm
              onAddEntry={addEntry}
              onUpdateEntry={updateEntry}
              editingEntry={editingEntry}
              setEditingEntry={setEditingEntry}
              t={t}
            />
          </div>
        </section>

        <section>
          <div className="bg-card-bg p-6 border border-border mb-6 transition-colors duration-300">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[1.1rem] font-semibold m-0 text-text uppercase tracking-wider">
                {t.views[chartView]}
              </h2>
              <div className="flex border border-border">
                {(['weekly', 'yearly'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`flex-1 border-none py-1.5 px-4 text-[0.8rem] font-medium cursor-pointer transition-all duration-200 ${
                      chartView === v 
                        ? 'bg-primary text-bg' 
                        : 'bg-transparent text-text'
                    }`}
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
        </section>

        <section>
          <div className="bg-card-bg p-6 border border-border mb-6 transition-colors duration-300">
            <h2 className="text-[1.1rem] font-semibold mt-0 mb-5 text-text uppercase tracking-wider">
              {t.history} ({entries.length})
            </h2>
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
