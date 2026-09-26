import {
  LayoutDashboard, ShoppingBag, Users, FileText, CreditCard, FolderKanban,
  MessageSquareMore, Globe, Search, MapPin, Tag, Settings, CalendarDays,
  Mail, UserCheck, QrCode, ScanLine, ListChecks, LayoutTemplate, type LucideIcon,
} from 'lucide-react'
import type { BusinessSlug } from '@/types/database'

export type NavItem = { label: string; path: string; icon: LucideIcon }
export type NavGroup = { title?: string; items: NavItem[] }

export const NAV: Record<BusinessSlug, NavGroup[]> = {
  evia_web: [
    {
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Orders', path: '/orders', icon: ShoppingBag },
        { label: 'Clients', path: '/clients', icon: Users },
        { label: 'Quotations', path: '/quotations', icon: FileText },
        { label: 'Payments', path: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'Delivery',
      items: [
        { label: 'Projects', path: '/projects', icon: FolderKanban },
        { label: 'Revisions', path: '/revisions', icon: MessageSquareMore },
        { label: 'Domains & Hosting', path: '/domains-hosting', icon: Globe },
      ],
    },
    {
      title: 'Growth',
      items: [
        { label: 'SEO', path: '/seo', icon: Search },
        { label: 'Google Business', path: '/google-business', icon: MapPin },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Pricing', path: '/pricing', icon: Tag },
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Launch Checklist', path: '/settings/launch-checklist', icon: ListChecks },
      ],
    },
  ],
  evia_invites: [
    {
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Orders', path: '/orders', icon: ShoppingBag },
        { label: 'Clients', path: '/clients', icon: Users },
        { label: 'Payments', path: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'Events',
      items: [
        { label: 'Events', path: '/events', icon: CalendarDays },
        { label: 'Invitations', path: '/invitations', icon: Mail },
        { label: 'Guests', path: '/guests', icon: UserCheck },
        { label: 'RSVPs', path: '/rsvps', icon: UserCheck },
        { label: 'QR Codes', path: '/qr-codes', icon: QrCode },
        { label: 'Check-ins', path: '/check-ins', icon: ScanLine },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Invite Builder', path: '/invites', icon: LayoutTemplate },
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Launch Checklist', path: '/settings/launch-checklist', icon: ListChecks },
      ],
    },
  ],
}
export const STAT_CARDS: Record<BusinessSlug, string[]> = {
  evia_web: [
    'Active websites', 'New orders', 'Pending quotes',
    'In development', 'Monthly revenue', 'Outstanding payments',
  ],
  evia_invites: [
    'Upcoming events', 'New orders', 'Invitations published',
    'RSVPs received', 'Monthly revenue', 'Outstanding payments',
  ],
}
