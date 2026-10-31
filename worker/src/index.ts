// Serves projects.xavierloo.com by proxying each path to a GitHub Pages site, so visitors
// stay on projects.xavierloo.com/<project>/ instead of being sent to jvloo.github.io.

const PAGES_ORIGIN = "https://jvloo.github.io";

// Path prefix on projects.xavierloo.com -> GitHub Pages project.
// Add a line per project when it is ready to be listed.
const PROJECTS: Record<string, string> = {};

// Everything that is not a mounted project is served from this repo.
const INDEX = "/com-xavierloo-projects";

interface Mount {
  prefix: string; // path on projects.xavierloo.com ("" for the index)
  upstream: string; // path on jvloo.github.io
}

const mounts: Mount[] = [
  ...Object.entries(PROJECTS).map(([prefix, upstream]) => ({ prefix, upstream })),
  { prefix: "", upstream: INDEX },
];

// Match a project prefix and its children, but not another name sharing the prefix.
const mountFor = (pathname: string): Mount =>
  mounts.find(
    (m) => m.prefix === "" || pathname === m.prefix || pathname.startsWith(`${m.prefix}/`),
  )!;

// Map a jvloo.github.io URL from a redirect back onto this host, or return null if it
// points somewhere we do not serve.
const toPublic = (location: string, publicOrigin: string): string | null => {
  const target = new URL(location, PAGES_ORIGIN);
  if (target.origin !== PAGES_ORIGIN) return null;
  for (const m of mounts) {
    if (target.pathname === m.upstream || target.pathname.startsWith(`${m.upstream}/`)) {
      const rest = target.pathname.slice(m.upstream.length) || "/";
      return `${publicOrigin}${m.prefix}${rest}${target.search}${target.hash}`;
    }
  }
  return null;
};

export default {
  async fetch(request): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const url = new URL(request.url);
    const mount = mountFor(url.pathname);
    const upstreamUrl = `${PAGES_ORIGIN}${mount.upstream}${url.pathname.slice(mount.prefix.length)}${url.search}`;

    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: request.headers,
      redirect: "manual",
    });

    const location = upstream.headers.get("Location");
    if (!location) return upstream;

    const headers = new Headers(upstream.headers);
    const rewritten = toPublic(location, url.origin);
    if (rewritten) headers.set("Location", rewritten);
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
  },
} satisfies ExportedHandler;
