import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PAGINATE_OPTIONS } from "../../constants";

export function PaginationControls({
  perPage,
  currentPage,
  totalPages,
  totalData,
  onPageChange,
  onPaginateChange,
}) {
  const [targetPage, setTargetPage] = useState(currentPage);

  useEffect(() => {
    setTargetPage(currentPage);
  }, [currentPage, totalPages]);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const rangeStart = totalData === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const rangeEnd = totalData === 0 ? 0 : Math.min(currentPage * perPage, totalData);

  const buildButtons = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, idx) => ({
        type: "page",
        value: idx + 1,
      }));
    }

    const buttons = [{ type: "page", value: currentPage }];
    const previousPage = Math.max(currentPage - 1, 1);
    if (!buttons.find((btn) => btn.value === previousPage)) {
      buttons.unshift({ type: "page", value: previousPage });
    }

    const nextPage = Math.min(currentPage + 1, totalPages);
    if (!buttons.find((btn) => btn.value === nextPage)) {
      buttons.push({ type: "page", value: nextPage });
    }

    if (nextPage + 1 < totalPages) {
      buttons.push({ type: "ellipsis" });
    }

    if (!buttons.find((btn) => btn.value === totalPages)) {
      buttons.push({ type: "page", value: totalPages });
    }

    return buttons;
  };

  return (
    <div className="flex items-center justify-between w-full mt-6">
      <DropdownMenu>
        <div className="w-1/5">
          <div className="flex w-full items-center">
            <span className="body text-gray-dark">Baris per halaman</span>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-navy body! w-[73px] h-10 flex items-center justify-between px-3 mx-2"
              >
                {perPage}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <div className="w-full body text-gray-dark mt-2">
            Menampilkan {rangeStart} - {rangeEnd} dari {totalData} data
          </div>
        </div>
        <DropdownMenuContent className="text-navy">
          <DropdownMenuRadioGroup
            value={String(perPage)}
            onValueChange={(value) => onPaginateChange(Number(value))}
          >
            {PAGINATE_OPTIONS.map((value) => (
              <DropdownMenuRadioItem
                key={value}
                value={String(value)}
                className="text-navy bg-gray-light focus:bg-gray-dark2"
              >
                {value}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              className="w-[38px] h-9 p-0"
              onClick={() => canGoPrev && onPageChange(currentPage - 1)}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="size-4" />
            </Button>
          </PaginationItem>
          {buildButtons().map((item, idx) =>
            item.type === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationLink
                  href="#"
                  className="w-[38px]! h-9! body!"
                  onClick={(event) => event.preventDefault()}
                >
                  ...
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={item.value}>
                <PaginationLink
                  href="#"
                  className="w-[38px]! h-9! body!"
                  isActive={item.value === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(item.value);
                  }}
                >
                  {item.value}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              className="w-[38px] h-9 p-0"
              onClick={() => canGoNext && onPageChange(currentPage + 1)}
              disabled={!canGoNext}
            >
              <ChevronRight className="size-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center gap-2">
        <span className="body text-gray-dark">Halaman</span>
        <div className="flex items-center gap-2">
          <input
            id="goto-page"
            type="number"
            min={1}
            max={totalPages}
            value={targetPage}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "") {
                setTargetPage("");
                return;
              }
              const next = Number(value);
              if (!Number.isNaN(next)) {
                setTargetPage(next);
              }
            }}
            className="w-16 rounded px-2 body text-navy bg-white border border-gray-300"
          />
          <Button
            type="button"
            className="h-10 px-4 body-medium"
            onClick={() => {
              const next =
                typeof targetPage === "number"
                  ? targetPage
                  : Number(targetPage);
              if (Number.isNaN(next)) return;
              const clamped = Math.min(Math.max(next, 1), totalPages);
              onPageChange(clamped);
              setTargetPage(clamped);
            }}
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
}
