import axios from "axios";

// Backend error shapes we might receive:
// - ExceptionMiddleware (NotFound/Conflict/BadRequest): { StatusCode, Message } (PascalCase)
// - ASP.NET model validation (400): { title, errors: { field: string[] } }
const STATUS_FALLBACKS: Record<number, string> = {
  400: "Invalid request. Please check the form and try again.",
  404: "Item not found.",
  409: "This item already exists (duplicate code/barcode).",
};

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!axios.isAxiosError(err)) return fallback;

  const data = err.response?.data as
    | { message?: string; Message?: string; title?: string; errors?: Record<string, string[]> }
    | undefined;

  if (data?.message) return data.message;
  if (data?.Message) return data.Message;
  if (data?.errors) {
    const firstError = Object.values(data.errors)[0]?.[0];
    if (firstError) return firstError;
  }
  if (data?.title) return data.title;

  const status = err.response?.status;
  if (status && STATUS_FALLBACKS[status]) return STATUS_FALLBACKS[status];

  return fallback;
}
