import { CueEditor } from './components/CueEditor';
import { BrowserShell } from './components/BrowserShell';
import { CueViewer } from './components/CueViewer';
import { ThemeProvider } from './lib/themeContext';

function App() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');

  return (
    <ThemeProvider>
      {mode === 'browser' ? (
        <BrowserShell />
      ) : mode === 'viewer' ? (
        <CueViewer />
      ) : (
        <CueEditor />
      )}
    </ThemeProvider>
  );
}

export default App;
