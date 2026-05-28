import { heatmapGrid } from "@/lib/analytics";
import type { Task } from "@/lib/analytics";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const INTENSITY_CLASSES = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

type Props = { tasks: Task[] };

export function Heatmap({ tasks }: Props) {
  const grid = heatmapGrid(tasks);
  const numCols = grid[0]?.length ?? 0;

  const getDayLabel = (col: number) => {
    const d = new Date();
    d.setDate(d.getDate() - (numCols - 1 - col) * 7 + 0);
    return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            <div className="h-3" />
            {DAYS.map((d) => (
              <div key={d} className="h-3 text-[9px] text-muted-foreground leading-none flex items-center">
                {d[0]}
              </div>
            ))}
          </div>

          {/* Grid columns */}
          {grid[0]?.map((_, col) => (
            <div key={col} className="flex flex-col gap-1">
              <div className="h-3" />
              {grid.map((row, rowIdx) => {
                const val = row[col];
                return (
                  <Tooltip key={rowIdx} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div
                        className={`size-3 rounded-[2px] transition-colors cursor-default ${INTENSITY_CLASSES[val]}`}
                        data-testid={`heatmap-cell-${rowIdx}-${col}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {val > 0 ? `${val} task${val === 1 ? "" : "s"} — ${getDayLabel(col)}` : `No tasks — ${getDayLabel(col)}`}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
