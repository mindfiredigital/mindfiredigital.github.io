import { PageState } from "@/types";

/*
  Utility: buildFilterSidebarProps
  - Transforms page state into props for ContributorFilterSidebar
  - Keeps component clean by separating logic from UI
*/
export function buildFilterSidebarProps(state: PageState) {
  /*
    Destructure required state and handlers from page state
  */
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

  /*
    Return props object
    - Maps internal state to UI-friendly prop names
    - Wraps handlers to include additional behavior (scroll)
  */
  return {
    filters,
    searchQuery,

    /* Reset filters */
    onReset: handleReset,

    /* Mobile filter visibility state */
    isMobileOpen: isMobileFilterOpen,

    /*
      Toggle mobile filter panel
      - Uses functional update to avoid stale state
    */
    onMobileToggle: () => setIsMobileFilterOpen((v) => !v),

    /*
      Handle filter changes
      - Updates filters
      - Scrolls to contributors section
    */
    onFilterChange: (partial: Parameters<typeof handleFilterChange>[0]) => {
      handleFilterChange(partial);
      scrollToContributors();
    },

    /*
      Handle search input change
      - Updates search query
      - Scrolls to contributors section
    */
    onSearchChange: (value: string) => {
      handleSearchChange(value);
      scrollToContributors();
    },
  };
}
