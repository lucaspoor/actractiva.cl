import { SalesOverview } from '@/components/admin/widgets/SalesOverview'
import { SalesChart } from '@/components/admin/widgets/SalesChart'
import { RecentOrders } from '@/components/admin/widgets/RecentOrders'
import { TopProducts } from '@/components/admin/widgets/TopProducts'

export default function DashboardAnalytics() {
  return (
    <div className="mb-8 space-y-6">
      <SalesOverview />
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart />
        <TopProducts />
      </div>
      <RecentOrders />
    </div>
  )
}
