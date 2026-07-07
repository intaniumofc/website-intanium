"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  EllipsisIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

const crownColorMap = {
  1: "text-yellow-500",
  2: "text-slate-400",
  3: "text-amber-700",
};

const pageSizeOptions = [10, 25, 50, 100];

function formatLeaderboardValue(value) {
  return value.toLocaleString('id-ID');
}

const LeaderboardRankings = React.forwardRef(
  (
    {
      className,
      rankings = [],
      onUserClick,
      currentUserId,
      showPagination = false,
      defaultPageSize = 10,
      ...props
    },
    ref
  ) => {
    const [pageSize, setPageSize] = React.useState(defaultPageSize);
    const [currentPage, setCurrentPage] = React.useState(1);

    const totalPages = Math.max(1, Math.ceil(rankings.length / pageSize));

    React.useEffect(() => {
      setCurrentPage(1);
    }, [pageSize]);

    React.useEffect(() => {
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }, [currentPage, totalPages]);

    const pagedRankings = showPagination
      ? rankings.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : rankings;

    const rows = React.useMemo(() => {
      const nextRows = [];
      let hiddenRunCount = 0;

      pagedRankings.forEach((ranking, index) => {
        const isDisplayed = ranking.displayed !== false;
        if (!isDisplayed) {
          hiddenRunCount += 1;
          return;
        }

        if (hiddenRunCount > 0) {
          nextRows.push({ type: "ellipsis", key: `ellipsis-${index}` });
          hiddenRunCount = 0;
        }

        nextRows.push({ type: "ranking", ranking });
      });

      if (hiddenRunCount > 0) {
        nextRows.push({ type: "ellipsis", key: "ellipsis-tail" });
      }

      return nextRows;
    }, [pagedRankings]);

    return (
      <div
        ref={ref}
        className={cn("bg-card w-full rounded-xl border border-border", className)}
        {...props}
      >
        <div
          role="list"
          aria-label="Leaderboard rankings"
          className="divide-border divide-y text-left"
        >
          {rows.map((row) => {
            if (row.type === "ellipsis") {
              return (
                <div
                  key={row.key}
                  role="listitem"
                  aria-label="Collapsed leaderboard rows"
                  className="text-muted-foreground flex items-center justify-center px-4 py-2"
                >
                  <EllipsisIcon className="h-5 w-5" />
                </div>
              );
            }

            const ranking = row.ranking;
            const displayName =
              ranking.userName || (ranking.userId ? `User ${ranking.userId.slice(0, 6)}` : "Guest");
            const showCrown = ranking.rank <= 3;
            const crownColor = crownColorMap[ranking.rank];
            const isCurrentUser = currentUserId === ranking.userId;

            return (
              <div
                key={ranking.userId || ranking.userName}
                role="listitem"
                tabIndex={onUserClick ? 0 : undefined}
                onClick={() => onUserClick?.(ranking)}
                onKeyDown={
                  onUserClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onUserClick(ranking);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-3.5 transition-colors duration-200",
                  isCurrentUser &&
                    "border-primary bg-[#170C79]/5 border-2 rounded-md",
                  onUserClick &&
                    "hover:bg-[#170C79]/5 cursor-pointer"
                )}
              >
                <div className="flex w-12 items-center gap-1 shrink-0">
                  <span className="w-5 text-sm font-semibold tabular-nums text-foreground">
                    {ranking.rank}
                  </span>
                  {showCrown ? (
                    <Crown
                      className={cn("h-4.5 w-4.5", crownColor)}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>

                {ranking.avatarUrl ? (
                  <img
                    src={ranking.avatarUrl}
                    alt={`${displayName} avatar`}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="bg-[#170C79]/5 text-[#170C79] border border-[#170C79]/10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-semibold">
                    {displayName}
                  </p>
                  {ranking.byline ? (
                    <p className="text-slate-400 truncate text-xs font-medium">
                      {ranking.byline}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-right shrink-0">
                  {typeof ranking.rankChange === "number" &&
                  ranking.rankChange !== 0 ? (
                    <p
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-bold",
                        ranking.rankChange > 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      )}
                    >
                      {ranking.rankChange > 0 ? (
                        <TrendingUp
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <TrendingDown
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      )}
                      {Math.abs(ranking.rankChange)}
                    </p>
                  ) : null}
                  <p className="leading-none font-bold tabular-nums text-foreground">
                    {formatLeaderboardValue(ranking.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {showPagination ? (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 bg-[#170C79]/2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="leaderboard-page-size"
                className="text-slate-400 text-xs font-semibold"
              >
                Show
              </label>
              <select
                id="leaderboard-page-size"
                value={pageSize}
                onChange={(e) =>
                  setPageSize(Number(e.target.value))
                }
                className="bg-white text-[#170C79] font-bold rounded-md border border-[#170C79]/10 px-2 py-1 text-xs cursor-pointer focus:outline-none"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="hover:bg-[#170C79]/5 rounded-md border border-border px-2 py-1 h-8 w-8 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-slate-400 text-xs font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next page"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="hover:bg-[#170C79]/5 rounded-md border border-border px-2 py-1 h-8 w-8 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

LeaderboardRankings.displayName = "LeaderboardRankings";

export { LeaderboardRankings };
