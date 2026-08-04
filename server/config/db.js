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
  const next = [...new Set([...healthy, ...discovered])];
  if (next.length && JSON.stringify(next) !== JSON.stringify(current)) {
    try {
      dns.setServers(next);
      console.log('DNS: using resolvers', next);
    } catch {
      /* keep defaults */
    }
  }
})();

export async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error(
      'Hint: create a free cluster at https://www.mongodb.com/cloud/atlas and set MONGO_URI in server/.env'
    );
    process.exit(1);
  }
}
