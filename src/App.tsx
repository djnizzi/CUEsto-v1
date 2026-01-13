import { CueEditor } from './components/CueEditor';
import { BrowserShell } from './components/BrowserShell';
import { CueViewer } from './components/CueViewer';

function App() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');

  if (mode === 'browser') {
    return <BrowserShell />;
  }

  if (mode === 'viewer') {
    return <CueViewer />;
  }

  return (
    <CueEditor />
  );
}

export default App;
