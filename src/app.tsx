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
import { ClientPage } from '@/pages/clients/ClientPage'
import { HostingPage } from '@/pages/hosting/HostingPage'
import { EventsPage } from '@/pages/events/EventsPage'
import { EventDetailPage } from '@/pages/events/EventDetailPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { LaunchChecklistPage } from '@/pages/settings/LaunchChecklistPage'
import { InviteBuilderPage } from '@/pages/invites/InviteBuilderPage'
import { InviteEditPage } from '@/pages/invites/InviteEditPage'
import { PublicInvitePage } from '@/pages/public/PublicInvitePage'
import { RsvpTrackPage } from '@/pages/public/RsvpTrackPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <ErrorBoundary>
            <CommandPalette />
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
                <Route path="clients/:id" element={<ClientPage />} />
                <Route path="domains-hosting" element={<HostingPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="settings/launch-checklist" element={<LaunchChecklistPage />} />
                <Route path="invites" element={<InviteBuilderPage />} />
                <Route path="invites/:id" element={<InviteEditPage />} />
                <Route path="/invite/:slug" element={<PublicInvitePage />} />
                <Route path="/rsvp-track/:token" element={<RsvpTrackPage />} />
                <Route path="settings" element={<SettingsPage />} />

                <Route path="*" element={<Placeholder />} />
              </Route>

            </Route>
            </Routes>
          </ErrorBoundary>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
