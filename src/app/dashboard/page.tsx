import { StatsCards } from "@/components/dashboard/StatsCards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ReservationsTable } from "@/components/dashboard/ReservationsTable";
import { PromotionsPanel } from "@/components/dashboard/PromotionsPanel";
import { AiSuggestions } from "@/components/dashboard/AiSuggestions";

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <StatsCards />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <PromotionsPanel />
          <AiSuggestions />
        </div>
      </div>
      <ReservationsTable />
    </div>
  );
}
