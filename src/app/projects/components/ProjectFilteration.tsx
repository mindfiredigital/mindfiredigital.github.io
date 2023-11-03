"use client";
import Filter from "@/components/filter/Filter";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function ProjectFilteration() {
  const router = useRouter();
  const filter = useCallback(
    (params: any) => {
      router.push(`/projects?${params}`, { scroll: false });
    },
    [router]
  );
  return (
    <Filter className="flex gap-2 justify-center" filter={filter}>
      <Filter.MultiSelect
        label="languages"
        items={[
          { label: "javascript", value: "Javascript" },
          { label: "react", value: "React" },
        ]}
      />
      <Filter.MultiSelect
        label="categories"
        items={[
          { label: "web_development", value: "Web Development" },
          { label: "mobile", value: "Mobile" },
          { label: "frontend", value: "Frontend" },
        ]}
      />
    </Filter>
  );
}
