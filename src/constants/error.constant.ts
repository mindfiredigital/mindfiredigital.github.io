import { Severity } from "@/types";

export const ERROR = {
  error: "ERROR",
  somethingWentWrong: "Something went",
  tryAgain: "Try Again",
  goHome: "Go Home",
  criticalError: "Critical Error",
  seriouslyWrong: "seriously wrong.",
  rootErroor: "A root-level error occurred. Our team has been notified.",
  errorID: "Error ID:",
};

/* Tailwind classes and icon mapped per severity level */
export const CONFIG: Record<Severity, { classes: string; icon: string }> = {
  error: {
    classes: "bg-red-50 border border-red-200 text-red-700",
    icon: "✕",
  },
  warning: {
    classes: "bg-yellow-50 border border-yellow-200 text-yellow-800",
    icon: "⚠",
  },
  info: {
    classes: "bg-blue-50 border border-blue-200 text-blue-800",
    icon: "ℹ",
  },
};
