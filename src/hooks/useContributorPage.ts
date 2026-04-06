import { useState, useRef } from "react";
import { TopScorer } from "@/types";
import { useContributorFilters } from "@/hooks";
import type { Contributor } from "@/types";

export function useContributorPage(
  contributorsArray: Contributor[],
  topScorers: TopScorer[]
) {
  const filters = useContributorFilters(contributorsArray, topScorers);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] =
    useState<TopScorer | null>(null);

  const contributorsSectionRef = useRef<HTMLDivElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);

  const scrollToContributors = () => {
    if (contributorsSectionRef.current && mainPanelRef.current) {
      const sectionTop = contributorsSectionRef.current.offsetTop;
      mainPanelRef.current.scrollTo({ top: sectionTop, behavior: "smooth" });
    }
  };

  return {
    ...filters,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    selectedContributor,
    setSelectedContributor,
    contributorsSectionRef,
    mainPanelRef,
    scrollToContributors,
  };
}
