import { apiRequest } from "./client";

export async function generatePrepSheet(studentInput) {
  return apiRequest("/api/ai/generate-prep-sheet", {
    method: "POST",
    body: JSON.stringify({ studentInput }),
  });
}
