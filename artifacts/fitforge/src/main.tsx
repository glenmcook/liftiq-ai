import { createRoot } from 'react-dom/client';

import App from './App';
import { applyStoredTheme } from './hooks/useTheme';

import './index.css';

// Apply the user's saved theme before React renders — prevents any color flash
applyStoredTheme();

createRoot(document.getElementById('root')!).render(<App />);
