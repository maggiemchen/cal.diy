"use client";

import { Fragment, type ReactNode, useState, useCallback } from "react";

import classNames from "@calcom/ui/classNames";
import { PanelCard } from "@calcom/ui/components/card";
import { Tooltip } from "@calcom/ui/components/tooltip";

type LegendItem = {
  label: string;
  color: string; // hex format
};

export type LegendVisibilityState = Record<string, boolean>;

export type LegendSize = "sm" | "default";

export function ChartCard({
  title,
  subtitle,
  cta,
  legend,
  legendSize,
  children,
  className,
  titleTooltip,
  onLegendToggle,
}: {
  title: string | ReactNode;
  subtitle?: string;
  cta?: { label: string; onClick: () => void };
  legend?: Array<LegendItem>;
  legendSize?: LegendSize;
  className?: string;
  titleTooltip?: string;
  children: ReactNode;
  onLegendToggle?: (visibilityState: LegendVisibilityState) => void;
}) {
  // Initialize visibility state for all legend items as true (visible by default)
  const [visibilityState, setVisibilityState] = useState<LegendVisibilityState>(() => {
    if (!legend) return {};
    return legend.reduce((acc, item) => {
      acc[item.label] = true;
      return acc;
    }, {} as LegendVisibilityState);
  });

  const handleLegendItemToggle = useCallback((label: string) => {
    setVisibilityState(prev => {
      const newState = { ...prev, [label]: !prev[label] };
      onLegendToggle?.(newState);
      return newState;
    });
  }, [onLegendToggle]);

  const legendComponent = legend && legend.length > 0 ? 
    <Legend 
      items={legend} 
      size={legendSize} 
      visibilityState={visibilityState}
      onItemToggle={handleLegendItemToggle}
    /> : null;

  return (
    <PanelCard
      title={title}
      subtitle={subtitle}
      cta={cta}
      headerContent={legendComponent}
      className={className}
      titleTooltip={titleTooltip}>
      {children}
    </PanelCard>
  );
}

export function ChartCardItem({
  count,
  className,
  children,
}: {
  count?: number | string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={classNames(
        "text-default border-muted flex items-center justify-between border-b px-3 py-3.5 last:border-b-0",
        className
      )}>
      <div className="grow text-sm font-medium">{children}</div>
      {count !== undefined && <div className="text-sm font-medium">{count}</div>}
    </div>
  );
}

function Legend({ 
  items, 
  size = "default", 
  visibilityState,
  onItemToggle 
}: { 
  items: LegendItem[]; 
  size?: LegendSize;
  visibilityState: LegendVisibilityState;
  onItemToggle: (label: string) => void;
}) {
  return (
    <div className="bg-default flex items-center gap-2 rounded-lg px-1.5 py-1">
      {items.map((item, index) => {
        const isVisible = visibilityState[item.label] ?? true;
        return (
          <Fragment key={item.label}>
            <button
              type="button"
              onClick={() => onItemToggle(item.label)}
              className={classNames(
                "relative flex items-center gap-2 rounded-md px-1.5 py-0.5 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
                isVisible 
                  ? "cursor-pointer" 
                  : "cursor-pointer opacity-40"
              )}
              style={{ 
                backgroundColor: isVisible ? `${item.color}33` : `${item.color}10` 
              }}
              title={`${isVisible ? 'Hide' : 'Show'} ${item.label}`}>
              <div 
                className={classNames(
                  "h-2 w-2 rounded-full transition-opacity duration-200",
                  isVisible ? "opacity-100" : "opacity-50"
                )}
                style={{ backgroundColor: item.color }} 
              />
              <Tooltip content={`${isVisible ? 'Click to hide' : 'Click to show'} ${item.label}`}>
                <p
                  className={classNames(
                    "truncate py-0.5 text-sm font-medium leading-none transition-colors duration-200",
                    isVisible ? "text-default" : "text-muted",
                    size === "sm" ? "w-16" : ""
                  )}>
                  {item.label}
                </p>
              </Tooltip>
            </button>
            {index < items.length - 1 && <div className="bg-muted h-5 w-[1px]" />}
          </Fragment>
        );
      })}
    </div>
  );
}
