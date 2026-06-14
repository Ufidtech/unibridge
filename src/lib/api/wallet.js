import { apiRequest, getApiBase } from "./client";

function getBaseUrl(baseUrl) {
  const raw = baseUrl || (typeof window !== "undefined" && window.location?.origin) || getApiBase();
  return String(raw).replace(/\/+$/, "");
}

export async function fetchMyWallet() {
  return apiRequest("/api/wallet/me");
}

export async function fetchMyWalletTransactions() {
  return apiRequest("/api/wallet/me/transactions");
}

export async function createWalletRequestLink({ amount, note = "", baseUrl } = {}) {
  return apiRequest("/api/wallet/request-links", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(amount || 0),
      note,
      baseUrl: getBaseUrl(baseUrl),
    }),
  });
}

export async function createOpayCheckout(payload) {
  return apiRequest("/api/pay/opay/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fundMyWallet({ amount, note = "", sponsorName = "", source = "wallet_fund" } = {}) {
  return apiRequest("/api/wallet/fund", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(amount || 0),
      note,
      sponsorName,
      source,
    }),
  });
}
