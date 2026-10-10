import { API_URL } from "./constants";

export async function fetchJson(path, errorMessage, options) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    console.error(errorMessage, response.status);
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : true;
}

export const jsonOptions = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});