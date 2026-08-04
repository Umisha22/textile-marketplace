import { execSync } from 'node:child_process';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

// Node's c-ares resolver can end up with broken DNS servers (loopback proxies
// that refuse queries, or non-routable fec0:0:0:ffff:: placeholders) while
// system tools like nslookup still work. Discover working resolvers at startup.
const isBrokenServer = (s) => s === '127.0.0.1' || s === '::1' || /^fec0:0:0:ffff:/.test(s);
const isIpv4 = (s) => /^\d{1,3}(\.\d{1,3}){3}$/.test(s);

function systemDnsServers() {
  try {
    if (process.platform === 'win32') {
      const out = execSync('ipconfig /all', { encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
      const ips = [];
      for (const line of out.split(/\r?\n/)) {
        const m = line.match(/DNS\s+Servers?[\s.:]+([\d.]+)/i);
        if (m && isIpv4(m[1])) ips.push(m[1]);
      }
      return [...new Set(ips)];
    }
    const rc = execSync('cat /etc/resolv.conf', { encoding: 'utf8' });
    return [
      ...new Set(
        rc
          .split(/\r?\n/)
          .filter((l) => /^\s*nameserver\s+/.test(l))
          .map((l) => l.trim().split(/\s+/)[1])
          .filter(isIpv4)
      ),
    ];
  } catch {
    return [];
  }
}

(function fixResolvers() {
  const current = dns.getServers();
  const healthy = current.filter((s) => !isBrokenServer(s));
  const discovered = systemDnsServers().filter((s) => !isBrokenServer(s));
  // Public fallbacks are appended last so they only kick in if the system
  // resolver fails to resolve the Atlas SRV records.
  const next = [...new Set([...healthy, ...discovered, '1.1.1.1', '8.8.8.8'])];
  if (next.length && JSON.stringify(next) !== JSON.stringify(current)) {
    try {
      dns.setServers(next);
      console.log('DNS: using resolvers', next);
    } catch {
      /* keep defaults */
    }
  }
})();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

export async function connectDB() {
  const MAX_ATTEMPTS = 6;
  let lastErr;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const conn = await mongoose.connect(MONGO_URI, CONNECT_OPTIONS);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) {
        console.log(
          `MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed (${err.message}). Retrying in 4s…`
        );
        // Re-discover working resolvers between attempts — Atlas DNS or the
        // network may have recovered in the meantime.
        try {
          const next = [
            ...new Set([
              ...dns.getServers().filter((s) => !isBrokenServer(s)),
              ...systemDnsServers().filter((s) => !isBrokenServer(s)),
              '1.1.1.1',
              '8.8.8.8',
            ]),
          ];
          dns.setServers(next);
        } catch {
          /* keep current resolvers */
        }
        await sleep(4000);
      }
    }
  }

  console.error('MongoDB connection failed:', lastErr.message);
  console.error(
    'Hint: if retries keep failing, whitelist your current IP (or 0.0.0.0/0) under Atlas → Network Access.'
  );
  process.exit(1);
}
