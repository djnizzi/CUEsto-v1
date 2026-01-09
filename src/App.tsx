import { CueEditor } from './components/CueEditor';
import { BrowserShell } from './components/BrowserShell';

function App() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');

  if (mode === 'browser') {
    return <BrowserShell />;
  }

  return (
    <CueEditor />
  );
}

export default App;
