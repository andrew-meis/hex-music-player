import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import 'styles/index.scss';
import DragLayer from './core/DragLayer';
import Theme from './core/Theme';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Theme>
          <DndProvider backend={HTML5Backend}>
            <DragLayer />
            <App />
          </DndProvider>
        </Theme>
      </HashRouter>
      <ReactQueryDevtools initialIsOpen={false} panelProps={{ style: { top: 0 } }} />
    </QueryClientProvider>
  </React.StrictMode>,
);
