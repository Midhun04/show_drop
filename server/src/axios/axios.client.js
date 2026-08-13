import axios from "axios";
import https from "https";
import dns from "dns";

const dnsCache = new Map();
const DNS_CACHE_TTL_MS = 5 * 60 * 1000;

const resolveViaDoh = async (hostname) => {
  const cached = dnsCache.get(hostname);
  if (cached && Date.now() - cached.at < DNS_CACHE_TTL_MS) {
    return cached.address;
  }

  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`
  ];

  let lastError;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/dns-json" },
        signal: controller.signal
      });
      const data = await response.json();
      const address = data?.Answer?.find((item) => item.type === 1)?.data;

      if (address) {
        dnsCache.set(hostname, { address, at: Date.now() });
        return address;
      }

      lastError = new Error(`No A record for ${hostname}`);
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error(`DNS lookup failed for ${hostname}`);
};

const tmdbLookup = (hostname, options, callback) => {
  const opts = typeof options === "object" && options !== null ? options : {};
  const cb = typeof options === "function" ? options : callback;

  if (hostname !== "api.themoviedb.org") {
    return dns.lookup(hostname, opts, cb);
  }

  resolveViaDoh(hostname)
    .then((address) => {
      if (opts.all) {
        cb(null, [{ address, family: 4 }]);
      } else {
        cb(null, address, 4);
      }
    })
    .catch((err) => cb(err));
};

const httpsAgent = new https.Agent({
  keepAlive: true,
  lookup: tmdbLookup
});

const get = async (url) => {
  const response = await axios.get(url, {
    httpsAgent,
    timeout: 20000,
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "identity"
    }
  });
  return response.data;
};

export default { get };
