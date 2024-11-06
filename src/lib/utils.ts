//
// import { User } from "@/types/user"
// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"
//
// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }
//
//
// export function fullName(user: Partial<User>) {
//   return user.first_name + " " + user.last_name
// }
//
// export const formatCurrency = (amount: number, currency?: string) => {
//   return (amount).toLocaleString('en-US', {
//     style: 'currency',
//     currency: currency || 'UGX',
//   });
// };
//
// export const formatDateToLocal = (
//   dateStr: string,
//   locale: string = 'en-US',
// ) => {
//   const date = new Date(dateStr);
//   const options: Intl.DateTimeFormatOptions = {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   };
//   const formatter = new Intl.DateTimeFormat(locale, options);
//   return formatter.format(date);
// };
//
// export function getInvoiceId(id: number|string) {
//   // Convert the ID to a string and pad it with leading zeros to make it at least 3 digits
//   const paddedId = String(id).padStart(3, "0");
//
//   const invoiceId = `INV-${paddedId}`;
//
//   return invoiceId;
// }
//
// export const generatePagination = (currentPage: number, totalPages: number) => {
//   // If the total number of pages is 7 or less,
//   // display all pages without any ellipsis.
//   if (totalPages <= 7) {
//     return Array.from({ length: totalPages }, (_, i) => i + 1);
//   }
//
//   // If the current page is among the first 3 pages,
//   // show the first 3, an ellipsis, and the last 2 pages.
//   if (currentPage <= 3) {
//     return [1, 2, 3, '...', totalPages - 1, totalPages];
//   }
//
//   // If the current page is among the last 3 pages,
//   // show the first 2, an ellipsis, and the last 3 pages.
//   if (currentPage >= totalPages - 2) {
//     return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
//   }
//
//   // If the current page is somewhere in the middle,
//   // show the first page, an ellipsis, the current page and its neighbors,
//   // another ellipsis, and the last page.
//   return [
//     1,
//     '...',
//     currentPage - 1,
//     currentPage,
//     currentPage + 1,
//     '...',
//     totalPages,
//   ];
// };
//
//
// export async function isValidImage(url: string) {
//   try {
//     const response = await fetch(url, { method: "HEAD" });
//     const contentType = response.headers.get("content-type");
//
//     // Check if the response is ok (status is in the range 200-299) and if the content type is an image
//     return !!(response.ok && contentType && contentType.startsWith("image/"));
//     // if (response.ok && contentType && contentType.startsWith("image/")) return true
//     // return false
//
//   } catch (error) {
//     console.error("Error checking image validity:", error);
//     return false; // Return false if there's any error in fetching or checking the URL
//   }
// }
//
// export const capitalizeEachWord = (text:any) => {
//     if (typeof text !== 'string') return '';
//     return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
// };
