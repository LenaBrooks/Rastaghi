import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

function isSensitivePath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/");
}

const sensitiveBypass: RuntimeCaching[] = [
  {
    matcher: ({ url: { pathname }, sameOrigin }) =>
      sameOrigin && isSensitivePath(pathname),
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...sensitiveBypass, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          const pathname = new URL(request.url).pathname;
          return (
            request.destination === "document" && !isSensitivePath(pathname)
          );
        },
      },
    ],
  },
});

serwist.addEventListeners();
