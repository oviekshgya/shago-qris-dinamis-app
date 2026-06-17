import { useMemo, useState } from 'react';
import { API_BASE_URL, API_DISPLAY_URL } from '../styles/theme';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  title: string;
  description: string;
  body?: string;
  response: string;
}

const endpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/health',
    title: 'Health Check',
    description: 'Checks backend availability.',
    response: '{ "data": { "status": "ok" } }',
  },
  {
    method: 'POST',
    path: '/api/v1/merchants/setup',
    title: 'Setup Default Merchant',
    description: 'Stores the default static QRIS payload and max amount.',
    body: '{ "staticPayload": "...", "maxAmount": 10000000 }',
    response: '{ "data": { "id": "default", "merchantInfo": {}, "maxAmount": 10000000 } }',
  },
  {
    method: 'GET',
    path: '/api/v1/merchants/current',
    title: 'Get Current Merchant',
    description: 'Returns the default merchant configuration.',
    response: '{ "data": { "id": "default", "staticPayload": "...", "merchantInfo": {} } }',
  },
  {
    method: 'DELETE',
    path: '/api/v1/merchants/current',
    title: 'Reset Merchant',
    description: 'Deletes the default merchant configuration.',
    response: '{ "data": { "deleted": true } }',
  },
  {
    method: 'GET',
    path: '/api/v1/merchants?limit=50&offset=0',
    title: 'List Merchants',
    description: 'Returns paginated merchant configurations.',
    response: '{ "data": [{ "id": "store-a", "merchantInfo": {}, "maxAmount": 10000000 }] }',
  },
  {
    method: 'POST',
    path: '/api/v1/merchants/{merchant_id}',
    title: 'Create Merchant',
    description: 'Creates a named merchant by ID.',
    body: '{ "staticPayload": "...", "maxAmount": 10000000 }',
    response: '{ "data": { "id": "store-a", "merchantInfo": {} } }',
  },
  {
    method: 'PUT',
    path: '/api/v1/merchants/{merchant_id}',
    title: 'Update Merchant',
    description: 'Updates an existing merchant static payload and max amount.',
    body: '{ "staticPayload": "...", "maxAmount": 10000000 }',
    response: '{ "data": { "id": "store-a", "updatedAt": "2026-06-17T03:10:00Z" } }',
  },
  {
    method: 'GET',
    path: '/api/v1/merchants/{merchant_id}',
    title: 'Get Merchant',
    description: 'Returns one merchant by ID.',
    response: '{ "data": { "id": "store-a", "merchantInfo": {} } }',
  },
  {
    method: 'DELETE',
    path: '/api/v1/merchants/{merchant_id}',
    title: 'Delete Merchant',
    description: 'Deletes a named merchant.',
    response: '{ "data": { "deleted": true } }',
  },
  {
    method: 'POST',
    path: '/api/v1/qris/generate',
    title: 'Generate QRIS Nominal',
    description: 'Generates QRIS from the default merchant or merchantId.',
    body: '{ "merchantId": "default", "amount": 10000, "useUniqueCode": true }',
    response: '{ "data": { "id": "txn_...", "amount": 10047, "qrisPayload": "...", "status": "UNVERIFIED" } }',
  },
  {
    method: 'POST',
    path: '/api/v1/merchants/{merchant_id}/qris/generate',
    title: 'Generate QRIS by Merchant',
    description: 'Generates QRIS using a specific merchant ID.',
    body: '{ "amount": 10000, "useUniqueCode": true }',
    response: '{ "data": { "merchantId": "store-a", "amount": 10047, "qrisPayload": "..." } }',
  },
  {
    method: 'GET',
    path: '/api/v1/transactions?merchantId={merchant_id}&status=UNVERIFIED&limit=50&offset=0',
    title: 'List Transactions',
    description: 'Returns generated QRIS transaction records.',
    response: '{ "data": [{ "id": "txn_...", "status": "UNVERIFIED", "amount": 10047 }] }',
  },
  {
    method: 'PATCH',
    path: '/api/v1/transactions/{transaction_id}/checked',
    title: 'Mark Checked',
    description: 'Marks a transaction as manually checked.',
    response: '{ "data": { "id": "txn_...", "status": "CHECKED", "checkedAt": "2026-06-17T03:05:00Z" } }',
  },
  {
    method: 'DELETE',
    path: '/api/v1/transactions/{transaction_id}',
    title: 'Delete Transaction',
    description: 'Deletes a transaction record.',
    response: '{ "data": { "deleted": true } }',
  },
];

const methodClass: Record<EndpointDoc['method'], string> = {
  GET: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20',
  POST: 'bg-blue-500/15 text-blue-200 ring-blue-400/20',
  PUT: 'bg-amber-500/15 text-amber-100 ring-amber-400/20',
  PATCH: 'bg-purple-500/15 text-purple-100 ring-purple-400/20',
  DELETE: 'bg-red-500/15 text-red-100 ring-red-400/20',
};

export function ApiDocs() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedEndpoint = endpoints[selectedIndex] ?? endpoints[0];
  const fullUrl = useMemo(() => `${API_BASE_URL}${selectedEndpoint.path}`, [selectedEndpoint.path]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">API Documentation</h2>
        <p className="mt-1 text-sm text-slate-400">Base URL: {API_DISPLAY_URL}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-md border border-white/10 bg-white/[0.04] p-2">
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {endpoints.map((endpoint, index) => (
              <button
                key={`${endpoint.method}-${endpoint.path}`}
                type="button"
                className={`mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition last:mb-0 ${
                  selectedIndex === index ? 'bg-red-500/15 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <span className={`w-14 rounded px-2 py-1 text-center text-[10px] font-bold ring-1 ${methodClass[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <span className="min-w-0 truncate font-medium">{endpoint.title}</span>
              </button>
            ))}
          </div>
        </aside>

        <article className="min-w-0 rounded-md border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-1 text-xs font-bold ring-1 ${methodClass[selectedEndpoint.method]}`}>
                  {selectedEndpoint.method}
                </span>
                <h3 className="font-semibold text-white">{selectedEndpoint.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">{selectedEndpoint.description}</p>
              <p className="mt-2 text-xs text-slate-500">Header: X-API-Key: change-this-api-key</p>
              <code className="mt-3 block whitespace-normal break-all rounded-md bg-shago-black/80 p-3 text-xs leading-relaxed text-slate-200">
                {fullUrl}
              </code>
            </div>
            <button
              type="button"
              className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              onClick={() => copy(fullUrl)}
            >
              Copy URL
            </button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Example title="Request" value={selectedEndpoint.body || 'No request body'} />
            <Example title="Response" value={selectedEndpoint.response} />
          </div>
        </article>
      </div>
    </section>
  );
}

function Example({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-slate-500">{title}</p>
      <pre className="whitespace-pre-wrap break-words rounded-md border border-white/10 bg-shago-black/70 p-3 text-xs leading-relaxed text-slate-300">
        {value}
      </pre>
    </div>
  );
}
