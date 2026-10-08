import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// pega todas as classes adicionadas na mão e junta de uma forma para não dar conflito
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}