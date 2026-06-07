"use client";

import { useState } from "react";

import { Button } from "@calcom/ui/components/button";
import {
  Dropdown,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@calcom/ui/components/dropdown";
import { Icon } from "@calcom/ui/components/icon";

import { useInsightsTimestampSelection } from "../hooks/useInsightsTimestampSelection";

export function TimestampSelector() {
  const { selectedTimestamp, updateTimestamp, timestampOptions } = useInsightsTimestampSelection();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = timestampOptions.find((option) => option.value === selectedTimestamp);

  return (
    <Dropdown open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-default text-default hover:border-emphasis h-9"
          data-testid="timestamp-selector-trigger">
          <Icon name="calendar" className="mr-2 h-4 w-4" />
          <span className="max-w-32 truncate">{selectedOption?.label}</span>
          <Icon name="chevron-down" className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {timestampOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              updateTimestamp(option.value);
              setIsOpen(false);
            }}
            className="flex flex-col items-start gap-1 p-3"
            data-testid={`timestamp-option-${option.value}`}>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  selectedTimestamp === option.value ? "bg-brand-default" : "bg-subtle"
                }`}
              />
              <span className="font-medium">{option.label}</span>
            </div>
            <span className="text-subtle text-xs">{option.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </Dropdown>
  );
}
