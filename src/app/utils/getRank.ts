export const getRankStyles = (rank: number) => {
  if (rank === 1)
    return {
      border: "border-yellow-300",
      glow: "shadow-yellow-100",
      badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
      scoreGradient: "from-yellow-500 to-orange-500",
      label: "🥇",
      rankText: "#1",
    };
  if (rank === 2)
    return {
      border: "border-slate-300",
      glow: "shadow-slate-100",
      badge: "bg-slate-50 text-slate-600 border-slate-200",
      scoreGradient: "from-slate-500 to-slate-400",
      label: "🥈",
      rankText: "#2",
    };
  if (rank === 3)
    return {
      border: "border-orange-300",
      glow: "shadow-orange-100",
      badge: "bg-orange-50 text-orange-600 border-orange-200",
      scoreGradient: "from-orange-500 to-amber-500",
      label: "🥉",
      rankText: "#3",
    };
  return {
    border: "border-gray-100",
    glow: "",
    badge: "bg-gray-50 text-gray-500 border-gray-200",
    scoreGradient: "from-mindfire-text-red to-orange-500",
    label: "",
    rankText: `#${rank}`,
  };
};

export const getRankBadge = (rank: number) => {
  if (rank === 1)
    return {
      label: "🥇 #1",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };
  if (rank === 2)
    return {
      label: "🥈 #2",
      color: "bg-gray-100 text-gray-600 border-gray-300",
    };
  if (rank === 3)
    return {
      label: "🥉 #3",
      color: "bg-orange-100 text-orange-600 border-orange-300",
    };
  return {
    label: `#${rank}`,
    color: "bg-slate-100 text-slate-600 border-slate-300",
  };
};
