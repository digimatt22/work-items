export function deliveryFailureUrl(token: string, publicBaseUrl: string): URL {
  const url = new URL(`/deliveries/${token}`, publicBaseUrl);
  url.searchParams.set("error", "1");
  return url;
}
