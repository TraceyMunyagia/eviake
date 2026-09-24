import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { BusinessProvider } from '@/context/BusinessContext'
import { RequireAuth } from '@/components/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Placeholder } from '@/pages/Placeholder'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { OrdersPage } from '@/pages/orders/OrdersPage'
import { PricingPage } from '@/pages/pricing/PricingPage'
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage'
import { PaymentsPage } from '@/pages/payments/PaymentsPage'
import { QuotationsPage } from '@/pages/quotes/QuotationsPage'
import { QuoteEditorPage } from '@/pages/quotes/QuoteEditorPage'
import { PublicQuotePage } from '@/pages/quotes/PublicQuotePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/q/:token" element={<PublicQuotePage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="pricing" element={<PricingPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="quotations" element={<QuotationsPage />} />
                <Route path="quotations/new" element={<QuoteEditorPage />} />
                <Route path="quotations/:id" element={<QuoteEditorPage />} />


                <Route path="*" element={<Placeholder />} />
              </Route>

            </Route>
          </Routes>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
