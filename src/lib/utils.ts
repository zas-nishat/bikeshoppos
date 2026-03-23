import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: string | Date | undefined) {
  if (!date) return '';
  return format(new Date(date), "h:mmaaa M/d/yyyy");
}
