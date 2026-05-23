"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/employees", label: "Employees", icon: "👥" },
  { href: "/insights", label: "Insights", icon: "📊" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-bold text-indigo-600">SalaryMgr</h1>
        <p className="text-xs text-gray-500 mt-0.5">HR Management</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-400">
        10,000 employees
      </div>
    </aside>
  );
}
