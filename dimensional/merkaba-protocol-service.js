#!/usr/bin/env node

// Minimal HTTP server to expose the Merkaba Trading Protocol controls
// No external dependencies; uses Node's http and url modules.

import http from 'http';
import url from 'url';

const QBTC_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 14401;

import MerkabaProtocol from './merkaba-trading-protocol.js';

const merkaba = new MerkabaProtocol();

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function notFound(res) { json(res, 404, { status: 'not_found' }); }

const server = http.createServer(async (req, res) => {
  try {
    const parsed = url.parse(req.url, true);
    const path = parsed.pathname || '/';

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      });
      return res.end();
    }

    if (path === '/health') {
      return json(res, 200, { status: 'healthy', service: 'merkaba-protocol', port: QBTC_PORT });
    }

    if (path === '/status') {
      return json(res, 200, {
        status: 'ok',
        activated: !!merkaba.merkabaState?.activated,
        phase: merkaba.activationPhases?.current_phase,
        metrics: merkaba.metrics,
        dimensional_access: merkaba.merkabaState?.dimensional_access_level,
        rotation_speed: merkaba.merkabaState?.rotation_speed,
      });
    }

    if (path === '/activate' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy(); });
      req.on('end', async () => {
        try {
          const payload = body ? JSON.parse(body) : {};
          const level = typeof payload.consciousness === 'number' ? payload.consciousness : 0.618;
          const result = await merkaba.activateMerkaba(level);
          return json(res, 200, { activated: !!result, level });
        } catch (err) {
          return json(res, 500, { error: err?.message || String(err) });
        }
      });
      return;
    }

    if (path === '/deactivate' && req.method === 'POST') {
      try {
        merkaba.deactivateMerkaba();
        return json(res, 200, { deactivated: true });
      } catch (err) {
        return json(res, 500, { error: err?.message || String(err) });
      }
    }

    notFound(res);
  } catch (err) {
    json(res, 500, { error: err?.message || String(err) });
  }
});

server.listen(QBTC_PORT, () => {
  console.log(`[MerkabaProtocol] listening on http://localhost:${QBTC_PORT}`);
});

process.on('SIGINT', () => {
  try { merkaba.deactivateMerkaba(); } catch {}
  process.exit(0);
});

