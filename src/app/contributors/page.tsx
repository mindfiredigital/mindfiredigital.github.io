/*
  Contributors Page — Server Component
  - Exports `revalidate` so Next.js regenerates this page via ISR
    every 3 600 s (1 hour), matching the cadence at which contributor
    and leaderboard JSON data is refreshed.
  - Keeps the page as a Server Component so the HTML is pre-rendered
    and served from cache — no client-side data fetch waterfall.
  - All interactive state (filtering, sorting, modal) is delegated to
    ContributorsClient, a "use client" child component.
*/

/* ── ISR: regenerate at most once per hour ─────────────────────────────── */
export const revalidate = 3600;

/*
  Data imports
  - Static JSON assets are resolved at build / revalidation time
  - No runtime fetch needed; Next.js bundles and caches these
*/
import contributorList from "@/asset/contributors.json";
import leaderboardData from "@/asset/leaderboard.json";

/*
  Type imports
  - Contributor: shape of each entry in contributors.json
  - TopScorer:   shape of each entry in leaderboard.json
*/
import { Contributor, TopScorer } from "@/types";

/*
  Client shell import
  - ContributorsClient owns all useState / useEffect / hooks
  - Receives pre-parsed arrays as props so it never needs to
    re-fetch or re-parse the JSON on the client
*/
import ContributorsClient from "./components/ContributorsClient";

export default function ContributorsPage() {
  /* Convert contributors object map into an iterable array */
  const contributorsArray = Object.values(contributorList) as Contributor[];

  /* Extract the ranked leaderboard array from the JSON wrapper */
  const topScorers = leaderboardData.leaderboard as TopScorer[];

  /*
    Render the interactive client shell.
    Prop-drilling the parsed data avoids a duplicate JSON import
    inside a "use client" module, which would double-bundle the asset.
  */
  return (
    <ContributorsClient
      contributorsArray={contributorsArray}
      topScorers={topScorers}
    />
  );
}
