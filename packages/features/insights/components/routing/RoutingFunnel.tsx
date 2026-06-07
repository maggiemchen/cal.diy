"use client";

import { useState } from "react";

import { useInsightsRoutingParameters } from "@calcom/features/insights/hooks/useInsightsRoutingParameters";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";

import { ChartCard, type LegendVisibilityState } from "../ChartCard";
import { RoutingFunnelContent, legend } from "./RoutingFunnelContent";
import { RoutingFunnelSkeleton } from "./RoutingFunnelSkeleton";

export function RoutingFunnel() {
  const { t } = useLocale();
  const insightsRoutingParams = useInsightsRoutingParameters();
  const [legendVisibility, setLegendVisibility] = useState<LegendVisibilityState>({});

  const { data, isSuccess, isLoading } = trpc.viewer.insights.getRoutingFunnelData.useQuery(
    insightsRoutingParams,
    {
      staleTime: 30000,
      trpc: {
        context: { skipBatch: true },
      },
    }
  );

  const handleLegendToggle = (visibilityState: LegendVisibilityState) => {
    setLegendVisibility(visibilityState);
  };

  if (isLoading || !isSuccess || !data) {
    return (
      <ChartCard title={t("routing_funnel")} legend={legend} onLegendToggle={handleLegendToggle}>
        <RoutingFunnelSkeleton />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={t("routing_funnel")} legend={legend} onLegendToggle={handleLegendToggle}>
      <RoutingFunnelContent data={data} legendVisibility={legendVisibility} />
    </ChartCard>
  );
}
