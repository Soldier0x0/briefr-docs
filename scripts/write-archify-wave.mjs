#!/usr/bin/env node
/** Author remaining Archify IR files (overwrite). Run from repo root. */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('diagrams/archify');

function meta(title, subtitle, extra = {}) {
  return {
    title,
    subtitle,
    animation: 'trace',
    visual_preset: 'signal-flow',
    locale: 'en',
    quality_profile: 'showcase',
    viewBox: [1080, 480],
    ...extra,
  };
}

function dataflow({id, title, subtitle, stages, nodes, flows, note, card}) {
  const focus = nodes.map((n) => n.id);
  return {
    schema_version: 1,
    diagram_type: 'dataflow',
    meta: {
      ...meta(title, subtitle),
      views: [{id: `${id}-path`, label: 'Path', focus, note}],
    },
    stages: stages.map((label) => ({label})),
    nodes,
    flows,
    cards: [
      {
        dot: 'emerald',
        title: card?.title || 'Data movement',
        items: card?.items || [
          'This work is scheduled or on-demand — not a FEED page render',
        ],
      },
    ],
  };
}

function sequence({id, title, subtitle, participants, messages, note, card}) {
  let y = 170;
  const msgs = messages.map((m, i) => {
    const row = {id: m.id || `${id}-${i}`, from: m.from, to: m.to, y, label: m.label, variant: m.variant || 'emphasis'};
    y += 36;
    return row;
  });
  return {
    schema_version: 1,
    diagram_type: 'sequence',
    meta: {
      ...meta(title, subtitle, {viewBox: [1080, 560], column_fit: 'spread'}),
      views: [
        {
          id: `${id}-trace`,
          label: 'Trace',
          focus: participants.map((p) => p.id),
          note,
        },
      ],
    },
    participants,
    messages: msgs,
    cards: [
      {
        dot: 'cyan',
        title: card?.title || 'Request path',
        items: card?.items || ['The UI reads PostgreSQL via FastAPI'],
      },
    ],
  };
}

const files = {};

files['cve-feed'] = sequence({
  id: 'cve-feed',
  title: 'CVE feed request',
  subtitle: 'Filter query through FastAPI into PostgreSQL',
  note: 'Page load never calls NVD; FastAPI reads local rows.',
  participants: [
    {id: 'browser', type: 'frontend', label: 'Browser', sublabel: 'CVEFeed'},
    {id: 'api', type: 'backend', label: 'FastAPI', sublabel: 'GET /api/cves'},
    {id: 'pg', type: 'database', label: 'PostgreSQL', sublabel: 'cves'},
  ],
  messages: [
    {from: 'browser', to: 'api', label: 'GET /api/cves'},
    {from: 'api', to: 'pg', label: 'SELECT + filters'},
    {from: 'pg', to: 'api', label: 'rows', variant: 'return'},
    {from: 'api', to: 'browser', label: 'JSON feed', variant: 'return'},
  ],
});

files['cve-detail'] = sequence({
  id: 'cve-detail',
  title: 'CVE detail drawer',
  subtitle: 'Drawer load joins CVE, KEV, EPSS, and related tables',
  note: 'Enrichment uses short-lived connections; GreyNoise stays on-demand.',
  participants: [
    {id: 'browser', type: 'frontend', label: 'Browser', sublabel: 'DetailDrawer'},
    {id: 'api', type: 'backend', label: 'FastAPI', sublabel: 'GET /api/cves/{id}'},
    {id: 'pg', type: 'database', label: 'PostgreSQL', sublabel: 'joined intel'},
  ],
  messages: [
    {from: 'browser', to: 'api', label: 'GET /api/cves/{id}'},
    {from: 'api', to: 'pg', label: 'JOIN intel tables'},
    {from: 'pg', to: 'api', label: 'CVE + extras', variant: 'return'},
    {from: 'api', to: 'browser', label: 'drawer JSON', variant: 'return'},
  ],
});

files['ioc-lookup'] = sequence({
  id: 'ioc-lookup',
  title: 'IOC lookup',
  subtitle: 'Cache first, then optional provider APIs',
  note: 'Quota-billed providers are not retried automatically.',
  participants: [
    {id: 'browser', type: 'frontend', label: 'Browser', sublabel: 'IOCLookup'},
    {id: 'api', type: 'backend', label: 'FastAPI', sublabel: 'POST /api/ioc/lookup'},
    {id: 'pg', type: 'database', label: 'PostgreSQL', sublabel: 'ioc_cache'},
    {id: 'prov', type: 'external', label: 'Providers', sublabel: 'VT AbuseIPDB'},
  ],
  messages: [
    {from: 'browser', to: 'api', label: 'POST lookup'},
    {from: 'api', to: 'pg', label: 'cache read'},
    {from: 'api', to: 'prov', label: 'miss → HTTP', variant: 'dashed'},
    {from: 'api', to: 'browser', label: 'IOC JSON', variant: 'return'},
  ],
});

files['startup'] = sequence({
  id: 'startup',
  title: 'Backend startup',
  subtitle: 'Schema, seed, scheduler, ingest if empty',
  note: 'Empty corpus triggers a one-shot ingest after jobs register.',
  participants: [
    {id: 'op', type: 'external', label: 'Operator', sublabel: 'systemd/uvicorn'},
    {id: 'api', type: 'backend', label: 'Uvicorn', sublabel: 'lifespan'},
    {id: 'pg', type: 'database', label: 'PostgreSQL', sublabel: 'Alembic'},
    {id: 'sched', type: 'backend', label: 'Scheduler', sublabel: 'APScheduler'},
  ],
  messages: [
    {from: 'op', to: 'api', label: 'start API'},
    {from: 'api', to: 'pg', label: 'migrate + seed'},
    {from: 'api', to: 'sched', label: 'register jobs'},
    {from: 'sched', to: 'pg', label: 'ingest if empty', variant: 'dashed'},
  ],
});

function threeNodeSource({id, title, subtitle, srcLabel, srcSub, jobLabel, storeLabel, storeSub, fetch, upsert, note}) {
  return dataflow({
    id,
    title,
    subtitle,
    stages: ['Source', 'Job', 'Store'],
    nodes: [
      {id: 'src', type: 'external', label: srcLabel, sublabel: srcSub, stage: 0, row: 1, tag: 'upstream'},
      {id: 'job', type: 'backend', label: jobLabel, sublabel: 'scheduler', stage: 1, row: 1, tag: 'paced'},
      {id: 'pg', type: 'database', label: storeLabel, sublabel: storeSub, stage: 2, row: 1, tag: 'local'},
    ],
    flows: [
      {id: 's-j', from: 'src', to: 'job', label: fetch, classification: 'upstream', variant: 'emphasis', route: 'straight'},
      {id: 'j-p', from: 'job', to: 'pg', label: upsert, classification: 'local copy', variant: 'emphasis', route: 'straight'},
    ],
    note,
    card: {
      title: 'Scheduler owned',
      items: ['The FEED never calls this source during page render'],
    },
  });
}

files['nvd-source'] = threeNodeSource({
  id: 'nvd-source',
  title: 'NVD collection',
  subtitle: 'NIST NVD 2.0 into PostgreSQL CVE rows',
  srcLabel: 'NIST NVD 2.0',
  srcSub: 'REST API',
  jobLabel: 'nvd_ingest',
  storeLabel: 'PostgreSQL',
  storeSub: 'cves',
  fetch: 'JSON',
  upsert: 'UPSERT',
  note: 'Watermark in sync_state; incremental modified-since.',
});

files['cisa-kev-source'] = threeNodeSource({
  id: 'cisa-kev-source',
  title: 'CISA KEV collection',
  subtitle: 'Known Exploited Vulnerabilities join onto CVE rows',
  srcLabel: 'CISA KEV',
  srcSub: 'catalog JSON',
  jobLabel: 'kev_sync',
  storeLabel: 'PostgreSQL',
  storeSub: 'kev_deadlines',
  fetch: 'catalog',
  upsert: 'UPSERT + join',
  note: 'KEV flags attach to existing CVE records.',
});

files['epss-source'] = threeNodeSource({
  id: 'epss-source',
  title: 'FIRST EPSS collection',
  subtitle: 'Exploit probability scores per CVE',
  srcLabel: 'FIRST EPSS',
  srcSub: 'CSV scores',
  jobLabel: 'epss_sync',
  storeLabel: 'PostgreSQL',
  storeSub: 'epss',
  fetch: 'scores',
  upsert: 'UPSERT',
  note: 'History table supports EPSS movers on the brief.',
});

files['otx-source'] = threeNodeSource({
  id: 'otx-source',
  title: 'AlienVault OTX collection',
  subtitle: 'Pulses and IOCs mirrored locally',
  srcLabel: 'OTX API',
  srcSub: 'pulses',
  jobLabel: 'otx_sync',
  storeLabel: 'PostgreSQL',
  storeSub: 'otx_*',
  fetch: 'pulses',
  upsert: 'mirror',
  note: 'Drawer and IOC lookup read the local mirror first.',
});

files['greynoise-source'] = dataflow({
  id: 'greynoise-source',
  title: 'GreyNoise on demand',
  subtitle: 'IP classification only when the analyst asks',
  stages: ['UI', 'API', 'Provider', 'Cache'],
  nodes: [
    {id: 'ui', type: 'frontend', label: 'Drawer / IOC', sublabel: 'opt-in', stage: 0, row: 1, tag: 'click'},
    {id: 'api', type: 'backend', label: 'FastAPI', sublabel: 'greynoise', stage: 1, row: 1, tag: 'quota'},
    {id: 'gn', type: 'external', label: 'GreyNoise', sublabel: 'IP class', stage: 2, row: 1, tag: 'paid'},
    {id: 'pg', type: 'database', label: 'PostgreSQL', sublabel: 'cache', stage: 3, row: 1, tag: 'TTL'},
  ],
  flows: [
    {id: 'u-a', from: 'ui', to: 'api', label: 'on demand', classification: 'request', variant: 'emphasis', route: 'straight'},
    {id: 'a-g', from: 'api', to: 'gn', label: 'lookup', classification: 'upstream', variant: 'emphasis', route: 'straight'},
    {id: 'g-p', from: 'gn', to: 'pg', label: 'cache result', classification: 'local', variant: 'dashed', route: 'straight'},
  ],
  note: 'No scheduler job fills GreyNoise into the FEED.',
});

files['osv-source'] = dataflow({
  id: 'osv-source',
  title: 'OSV.dev on demand',
  subtitle: 'Package ranges attach on CVE detail',
  stages: ['Drawer', 'API', 'OSV', 'CVE row'],
  nodes: [
    {id: 'ui', type: 'frontend', label: 'CVE detail', sublabel: 'packages', stage: 0, row: 1, tag: 'lazy'},
    {id: 'api', type: 'backend', label: 'FastAPI', sublabel: 'osv_packages', stage: 1, row: 1, tag: 'best effort'},
    {id: 'osv', type: 'external', label: 'OSV.dev', sublabel: 'ranges', stage: 2, row: 1, tag: 'public'},
    {id: 'pg', type: 'database', label: 'PostgreSQL', sublabel: 'attach', stage: 3, row: 1, tag: 'local'},
  ],
  flows: [
    {id: 'u-a', from: 'ui', to: 'api', label: 'open CVE', classification: 'request', variant: 'emphasis', route: 'straight'},
    {id: 'a-o', from: 'api', to: 'osv', label: 'query', classification: 'upstream', variant: 'emphasis', route: 'straight'},
    {id: 'o-p', from: 'osv', to: 'pg', label: 'osv_packages', classification: 'local', variant: 'dashed', route: 'straight'},
  ],
  note: 'OSV is additive package context, not the CVE backbone.',
});

files['attack-source'] = threeNodeSource({
  id: 'attack-source',
  title: 'MITRE ATT&CK collection',
  subtitle: 'Weekly STIX techniques mapped to CVEs',
  srcLabel: 'MITRE STIX',
  srcSub: 'ATT&CK',
  jobLabel: 'mitre_refresh',
  storeLabel: 'PostgreSQL',
  storeSub: 'techniques',
  fetch: 'STIX',
  upsert: 'map CVEs',
  note: 'Forge coverage and hunt packs read these maps.',
});

files['vulncheck-source'] = threeNodeSource({
  id: 'vulncheck-source',
  title: 'VulnCheck KEV collection',
  subtitle: 'Exploited-in-the-wild flag for scoring',
  srcLabel: 'VulnCheck',
  srcSub: 'KEV API',
  jobLabel: 'vulncheck_kev',
  storeLabel: 'PostgreSQL',
  storeSub: 'is_vulncheck',
  fetch: 'catalog',
  upsert: 'flag CVE',
  note: 'Optional key; missing source leaves the flag false.',
});

files['search-pipeline'] = dataflow({
  id: 'search-pipeline',
  title: 'Search and embeddings',
  subtitle: 'Keyword FTS plus optional pgvector hybrid merge',
  stages: ['Query', 'API', 'Indexes', 'Hits'],
  nodes: [
    {id: 'q', type: 'frontend', label: 'Query', sublabel: 'q=', stage: 0, row: 1, tag: 'analyst'},
    {id: 'api', type: 'backend', label: 'Search API', sublabel: 'hybrid RRF', stage: 1, row: 1, tag: 'request'},
    {id: 'idx', type: 'database', label: 'FTS + vector', sublabel: 'PostgreSQL', stage: 2, row: 1, tag: 'optional kNN'},
    {id: 'hits', type: 'frontend', label: 'Ranked hits', sublabel: 'FEED', stage: 3, row: 1, tag: 'merge'},
  ],
  flows: [
    {id: 'q-a', from: 'q', to: 'api', label: 'search', classification: 'request', variant: 'emphasis', route: 'straight'},
    {id: 'a-i', from: 'api', to: 'idx', label: 'keyword + kNN', classification: 'local', variant: 'emphasis', route: 'straight'},
    {id: 'i-h', from: 'idx', to: 'hits', label: 'ranked', classification: 'read', variant: 'emphasis', route: 'straight'},
  ],
  note: 'Embeddings off → keyword only.',
});

files['webhooks-ops'] = dataflow({
  id: 'webhooks-ops',
  title: 'Webhooks and notifications',
  subtitle: 'Alert rules enqueue deliveries to operator channels',
  stages: ['Event', 'Rules', 'Queue', 'Channel'],
  nodes: [
    {id: 'evt', type: 'backend', label: 'Alert event', sublabel: 'KEV / EPSS', stage: 0, row: 1, tag: 'local'},
    {id: 'rules', type: 'backend', label: 'Rules engine', sublabel: 'match', stage: 1, row: 1, tag: 'filter'},
    {id: 'q', type: 'messagebus', label: 'Delivery', sublabel: 'queue', stage: 2, row: 1, tag: 'retry'},
    {id: 'ch', type: 'external', label: 'Webhook', sublabel: 'Slack HTTPS', stage: 3, row: 1, tag: 'SSRF gated'},
  ],
  flows: [
    {id: 'e-r', from: 'evt', to: 'rules', label: 'match', classification: 'local', variant: 'emphasis', route: 'straight'},
    {id: 'r-q', from: 'rules', to: 'q', label: 'enqueue', classification: 'ops', variant: 'emphasis', route: 'straight'},
    {id: 'q-c', from: 'q', to: 'ch', label: 'POST JSON', classification: 'outbound', variant: 'emphasis', route: 'straight'},
  ],
  note: 'Destinations are operator-configured; SSRF checks apply.',
});

files['resilience'] = dataflow({
  id: 'resilience',
  title: 'Source resilience',
  subtitle: 'Circuit breaker and retry around public intel HTTP',
  stages: ['Job', 'Breaker', 'Source', 'Cache'],
  nodes: [
    {id: 'job', type: 'backend', label: 'Ingest job', sublabel: 'scheduler', stage: 0, row: 1, tag: 'lock'},
    {id: 'cb', type: 'security', label: 'Breaker', sublabel: 'resilient_client', stage: 1, row: 1, tag: 'cooldown'},
    {id: 'http', type: 'external', label: 'Public source', sublabel: 'NVD etc', stage: 2, row: 1, tag: '503'},
    {id: 'pg', type: 'database', label: 'Last-good', sublabel: 'PostgreSQL', stage: 3, row: 1, tag: 'stale ok'},
  ],
  flows: [
    {id: 'j-c', from: 'job', to: 'cb', label: 'fetch', classification: 'outbound', variant: 'emphasis', route: 'straight'},
    {id: 'c-h', from: 'cb', to: 'http', label: 'if closed', classification: 'upstream', variant: 'emphasis', route: 'straight'},
    {id: 'h-p', from: 'http', to: 'pg', label: 'persist or skip', classification: 'local', variant: 'dashed', route: 'straight'},
  ],
  note: 'Open breaker skips the source; FEED still serves local rows.',
});

files['hunt-workflow'] = dataflow({
  id: 'hunt-workflow',
  title: 'Hunt workflow',
  subtitle: 'Pivot from a local CVE into IOC and Forge packs',
  stages: ['Signal', 'Drawer', 'IOC', 'Forge'],
  nodes: [
    {id: 'cve', type: 'frontend', label: 'CVE signal', sublabel: 'FEED card', stage: 0, row: 1, tag: 'local'},
    {id: 'draw', type: 'frontend', label: 'Investigation', sublabel: 'session only', stage: 1, row: 1, tag: 'pivot'},
    {id: 'ioc', type: 'backend', label: 'IOC lookup', sublabel: 'cached', stage: 2, row: 1, tag: 'optional'},
    {id: 'forge', type: 'frontend', label: 'Forge pack', sublabel: 'ATT&CK gap', stage: 3, row: 1, tag: 'queue'},
  ],
  flows: [
    {id: 'c-d', from: 'cve', to: 'draw', label: 'open', classification: 'ui', variant: 'emphasis', route: 'straight'},
    {id: 'd-i', from: 'draw', to: 'ioc', label: 'related IOC', classification: 'pivot', variant: 'emphasis', route: 'straight'},
    {id: 'i-f', from: 'ioc', to: 'forge', label: 'technique pack', classification: 'pivot', variant: 'dashed', route: 'straight'},
  ],
  note: 'Hunt reads stored intel; it is not live telemetry search.',
});

files['detect-workflow'] = dataflow({
  id: 'detect-workflow',
  title: 'Detect workflow',
  subtitle: 'Coverage gaps become Sigma starters and hunt packs',
  stages: ['Map', 'Gap', 'Generate', 'Pack'],
  nodes: [
    {id: 'map', type: 'database', label: 'ATT&CK map', sublabel: 'local STIX', stage: 0, row: 1, tag: 'weekly'},
    {id: 'gap', type: 'frontend', label: 'Coverage gap', sublabel: 'Forge', stage: 1, row: 1, tag: 'KEV'},
    {id: 'gen', type: 'backend', label: 'Generate', sublabel: 'Sigma / query', stage: 2, row: 1, tag: 'starter'},
    {id: 'pack', type: 'database', label: 'Hunt pack', sublabel: 'saved', stage: 3, row: 1, tag: 'not SIEM'},
  ],
  flows: [
    {id: 'm-g', from: 'map', to: 'gap', label: 'uncovered', classification: 'read', variant: 'emphasis', route: 'straight'},
    {id: 'g-n', from: 'gap', to: 'gen', label: 'generate', classification: 'request', variant: 'emphasis', route: 'straight'},
    {id: 'n-p', from: 'gen', to: 'pack', label: 'save', classification: 'local', variant: 'emphasis', route: 'straight'},
  ],
  note: 'BRIEFR does not deploy rules to a production SIEM.',
});

files['background-jobs'] = dataflow({
  id: 'background-jobs',
  title: 'Background jobs',
  subtitle: 'Correlation, backfill, and maintenance off the request path',
  stages: ['Clock', 'Jobs', 'Store', 'UI'],
  nodes: [
    {id: 'clock', type: 'backend', label: 'APScheduler', sublabel: 'cron/interval', stage: 0, row: 1, tag: 'locks'},
    {id: 'jobs', type: 'backend', label: 'Nightly work', sublabel: 'correlate', stage: 1, row: 1, tag: 'off-request'},
    {id: 'pg', type: 'database', label: 'PostgreSQL', sublabel: 'mirrors', stage: 2, row: 1, tag: 'upsert'},
    {id: 'ui', type: 'frontend', label: 'Analyst UI', sublabel: 'read', stage: 3, row: 1, tag: 'SPA'},
  ],
  flows: [
    {id: 'c-j', from: 'clock', to: 'jobs', label: 'fire', classification: 'async', variant: 'emphasis', route: 'straight'},
    {id: 'j-p', from: 'jobs', to: 'pg', label: 'write', classification: 'local', variant: 'emphasis', route: 'straight'},
    {id: 'p-u', from: 'pg', to: 'ui', label: 'JSON', classification: 'request', variant: 'emphasis', route: 'straight'},
  ],
  note: 'Ingest jobs import; these jobs act on already-local intel.',
});

for (const [id, ir] of Object.entries(files)) {
  const p = path.join(dir, `${id}.json`);
  fs.writeFileSync(p, `${JSON.stringify(ir, null, 2)}\n`);
  console.log('wrote', p);
}
