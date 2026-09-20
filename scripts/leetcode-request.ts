/** Public read-only GraphQL. No HTML gate, cookies, challenge solving or proxies. */
export async function leetcodeRequest(
  query: string,
  variables: Record<string, string | number>,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetcher("https://leetcode.com/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok)
    throw new Error(`Public endpoint returned HTTP ${response.status}.`);
  return response.json();
}
