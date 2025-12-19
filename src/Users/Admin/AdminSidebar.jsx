import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  LifeBuoy,
  UserCircle2,
  CheckCircle2,
} from "lucide-react";

const primaryNav = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
  },
    {
    label: "CSOs",
    to: "/admin/cso",
    icon: UserCircle2,
  },
  {
    label: "Loans",
    to: "/admin/cso-loans",
    icon: Briefcase,
  },
  {
    label: "New Loan",
    to: "/admin/loans",
    icon: FileText,
  },
  {
    label: "Customers",
    to: "/admin/customers",
    icon: Users,
  },
  {
    label: "Disbursements",
    to: "/admin/disbursements",
    icon: CheckCircle2,
  },
  {
    label: "Branch",
    to: "/admin/branch",
    icon: Users,
  },

];

const secondaryNav = [
  {
    label: "Support",
    to: "/admin/support",
    icon: LifeBuoy,
  },
  {
    label: "Settings",
    to: "/admin/settings",
    icon: Settings,
  },
];

const linkBaseClasses =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

const linkActiveClasses = "bg-primary/10 text-primary";
const linkInactiveClasses = "text-slate-500 hover:bg-slate-100 hover:text-slate-900";

function SidebarSection({ title, items, onNavigate }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end
            className={({ isActive }) =>
              [linkBaseClasses, isActive ? linkActiveClasses : linkInactiveClasses].join(" ")
            }
            onClick={onNavigate}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function AdminSidebar({ isOpen = false, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white shadow-xl transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-5">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                LS
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">LoanSphere</p>
                <p className="text-xs text-slate-500">Admin Console</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 md:hidden"
            >
              Close
            </button>
          </div>

          <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-4 py-6">
            <SidebarSection title="Overview" items={primaryNav} onNavigate={onClose} />
            <SidebarSection title="Workspace" items={secondaryNav} onNavigate={onClose} />
          </div>

          <div className="border-t border-slate-200 px-4 py-5">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Upgrade Insights</p>
              <p className="mt-1 text-xs text-slate-500">
                Unlock deeper analytics and automation with the Pro plan.
              </p>
              <button
                type="button"
                className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Explore Plans
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
