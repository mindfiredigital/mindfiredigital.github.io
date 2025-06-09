export interface Aboutprops {
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
  data?: Array<{
    title: string;
    description: string;
  }>;
}
