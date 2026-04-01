import type { useContributorPage } from "@/hooks/useContributorPage";

type PageState = ReturnType<typeof useContributorPage>;

export function buildFilterSidebarProps(state: PageState) {
  const {
    filters,
    searchQuery,
    handleFilterChange,
    handleSearchChange,
    handleReset,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    scrollToContributors,
  } = state;

  return {
    filters,
    searchQuery,
    onReset: handleReset,
    isMobileOpen: isMobileFilterOpen,
    onMobileToggle: () => setIsMobileFilterOpen((v) => !v),
    onFilterChange: (partial: Parameters<typeof handleFilterChange>[0]) => {
      handleFilterChange(partial);
      scrollToContributors();
    },
    onSearchChange: (value: string) => {
      handleSearchChange(value);
      scrollToContributors();
    },
  };
}
