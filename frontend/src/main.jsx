import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from 'react-query';
import queryClient from './utils/QueryClient.jsx';
import App from './App.jsx'
import './output.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './utils/UserContext.jsx';
import Dashboard from './pages/Dashboard.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>
  },
  {
    path: '/dashboard',
    element: <Dashboard/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)
