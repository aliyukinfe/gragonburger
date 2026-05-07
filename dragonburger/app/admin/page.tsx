const kpis = [
  { label: "Today's Orders", value: "148", change: "+12%" },
  { label: "Revenue", value: "$2,430", change: "+9%" },
  { label: "Pending Deliveries", value: "14", change: "-3%" },
  { label: "Low Stock Items", value: "6", change: "+2" },
];

const liveOrders = [
  { id: "#DB-4021", customer: "Amina R.", items: "2x Dragon Burger, Fries", status: "Preparing", eta: "12 min" },
  { id: "#DB-4022", customer: "Yousef M.", items: "1x Fire Chicken Burger", status: "Ready", eta: "Pickup" },
  { id: "#DB-4023", customer: "Lina K.", items: "3x Classic Burger Combo", status: "On the way", eta: "18 min" },
  { id: "#DB-4024", customer: "Karim T.", items: "2x Spicy Wings, Cola", status: "Placed", eta: "22 min" },
];

const inventoryAlerts = [
  { item: "Brioche Buns", left: "18 units", level: "Critical" },
  { item: "Cheddar Slices", left: "1.3 kg", level: "Low" },
  { item: "Chicken Fillet", left: "3.1 kg", level: "Low" },
];

const staffShift = [
  { name: "Nora", role: "Cashier", status: "On Shift" },
  { name: "Hamza", role: "Kitchen Lead", status: "On Shift" },
  { name: "Rashid", role: "Delivery", status: "Break" },
  { name: "Maya", role: "Pack Station", status: "On Shift" },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-full flex-1 bg-zinc-100 px-6 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Dragon Burger Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Restaurant Operations Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Real-time overview for orders, inventory, staff, and daily performance.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
              <p className="mt-2 text-3xl font-semibold">{kpi.value}</p>
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{kpi.change} vs yesterday</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="xl:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Live Orders</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {liveOrders.map((order) => (
                    <tr key={order.id} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="py-3 font-medium">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3">{order.items}</td>
                      <td className="py-3">{order.status}</td>
                      <td className="py-3">{order.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="flex flex-col gap-6">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold">Inventory Alerts</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {inventoryAlerts.map((alert) => (
                  <li key={alert.item} className="flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                    <span>{alert.item}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">{alert.left}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <div className="mt-4 grid gap-2 text-sm">
                <button className="rounded-lg bg-orange-600 px-4 py-2 text-left font-medium text-white transition hover:bg-orange-500">
                  Add New Menu Item
                </button>
                <button className="rounded-lg bg-zinc-200 px-4 py-2 text-left font-medium transition hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600">
                  Open End-of-Day Report
                </button>
                <button className="rounded-lg bg-zinc-200 px-4 py-2 text-left font-medium transition hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600">
                  Assign Delivery Orders
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Staff Shift Status</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {staffShift.map((member) => (
              <article key={member.name} className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.role}</p>
                <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{member.status}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
