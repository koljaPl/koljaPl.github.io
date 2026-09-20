import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const port = Number(process.env.PORT ?? 4322);
const host = "127.0.0.1";
const distDirectory = resolve("dist");
const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

async function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relativePath = decoded === "/" ? "index.html" : decoded.slice(1);
  const candidates = [
    relativePath,
    relativePath.endsWith("/") ? `${relativePath}index.html` : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const filePath = resolve(distDirectory, candidate);
    if (!filePath.startsWith(`${distDirectory}${sep}`)) continue;
    try {
      if ((await stat(filePath)).isFile()) return { filePath, status: 200 };
    } catch {}
  }

  return { filePath: resolve(distDirectory, "404.html"), status: 404 };
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);
    const { filePath, status } = await resolveRequest(url.pathname);
    response.writeHead(status, {
      "Cache-Control": "no-cache",
      "Content-Type":
        contentTypes.get(extname(filePath)) ?? "application/octet-stream",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Preview server error.");
  }
});

server.listen(port, host, () => {
  console.log(`Serving dist at http://${host}:${port}`);
});
