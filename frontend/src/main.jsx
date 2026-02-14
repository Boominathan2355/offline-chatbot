import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'
import './styles/main.scss'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </Provider>
  </StrictMode>,
)
