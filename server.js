/**
 * Local Static File Server
 * ________________________________________________________________________
 * Node serves the frontend without requiring a build tool, package.json, |
 * or third-party dependency. This is intended for local development only;| 
 * production hosting will use a standard static host,                    |
 * or a backend service that owns the market-data API.                    | 
 * _______________________________________________________________________|
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Runtime configuration.
 *
 * PORT can be set by the caller if port 3000 is not available:
 *   PORT=3001 node server.js
 */
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const host = "127.0.0.1";

/**
 * Small MIME maps the file types that this prototype is expected to serve.
 * Unknown extensions fall back to application/octet-stream below.
 */
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

/**
 * Resolves a request URL to a safe local file path.
 *
 * The path is normalized and checked against the project root to block path
 * traversal attempts. The root URL serves index.html.
 *
 * @param {string} urlPath - Incoming request URL.
 * @returns {string | null} Absolute file path, or null when the request is not safe.
 */
function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const normalizedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.normalize(path.join(root, normalizedPath));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

/**
 * Request handler for static assets.
 *
 * Intentionally avoids directory listings and always sends no-store cache
 * headers for local edits visibility after a browser refresh.
 */
const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url || "/");

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  });
});

/* Starts the dev server and prints the URL for browser testing. */
server.listen(port, host, () => {
  console.log(`Market data analysis interface running at http://${host}:${port}`);
});
