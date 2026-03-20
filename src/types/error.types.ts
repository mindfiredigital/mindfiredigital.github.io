export type Severity = "error" | "warning" | "info";

export interface ErrorMessageProps {
  message: string;
  severity?: Severity;
  detail?: string;
  onDismiss?: () => void;
  className?: string;
}
