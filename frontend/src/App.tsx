import { useState } from 'react';
import { SendRequest } from '../wailsjs/go/main/App';
import './App.css';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: '', value: '', enabled: true },
  ]);

  function updateHeader(index: number, field: keyof Header, value: string | boolean) {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };
    // auto-add new empty row when user types in the last row
    if (field !== 'enabled' && index === headers.length - 1 && value !== '') {
      updated.push({ key: '', value: '', enabled: true });
    }
    setHeaders(updated);
  }

  function removeHeader(index: number) {
    if (headers.length === 1) return;
    setHeaders(headers.filter((_, i) => i !== index));
  }

  async function sendRequest() {
    if (!url) return;
    setLoading(true);
    setResponse(null);

    const builtHeaders: Record<string, string> = {};
    headers.forEach(h => {
      if (h.enabled && h.key.trim()) builtHeaders[h.key.trim()] = h.value.trim();
    });

    try {
      const result = await SendRequest({ method, url, headers: builtHeaders, body });
      setResponse(result);
    } catch (e) {
      setResponse({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'monospace', background: '#1e1e1e', color: '#d4d4d4' }}>

      {/* URL Bar */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px', background: '#252526', borderBottom: '1px solid #333' }}>
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          style={{ background: '#333', color: methodColor(method), border: '1px solid #555', borderRadius: '4px', padding: '6px 10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
        >
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendRequest()}
          placeholder="https://api.example.com/endpoint"
          style={{ flex: 1, background: '#3c3c3c', color: '#d4d4d4', border: '1px solid #555', borderRadius: '4px', padding: '6px 12px', fontSize: '14px' }}
        />

        <button
          onClick={sendRequest}
          disabled={loading}
          style={{ background: '#0e639c', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 20px', fontSize: '14px', cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#252526', borderBottom: '1px solid #333', paddingLeft: '12px' }}>
        {(['headers', 'body'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #0e639c' : '2px solid transparent',
              color: activeTab === tab ? '#d4d4d4' : '#888', padding: '8px 16px', fontSize: '13px',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px'
            }}
          >
            {tab} {tab === 'headers' && <span style={{ color: '#555', fontSize: '11px' }}>({headers.filter(h => h.enabled && h.key).length})</span>}
          </button>
        ))}
      </div>

      {/* Headers Editor */}
      {activeTab === 'headers' && (
        <div style={{ padding: '12px', borderBottom: '1px solid #333', background: '#1e1e1e' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 24px', gap: '6px', marginBottom: '6px' }}>
            <div/>
            <div style={{ fontSize: '11px', color: '#666', paddingLeft: '8px' }}>KEY</div>
            <div style={{ fontSize: '11px', color: '#666', paddingLeft: '8px' }}>VALUE</div>
            <div/>
          </div>
          {headers.map((header, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 24px', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={e => updateHeader(i, 'enabled', e.target.checked)}
                style={{ cursor: 'pointer', accentColor: '#0e639c' }}
              />
              <input
                value={header.key}
                onChange={e => updateHeader(i, 'key', e.target.value)}
                placeholder="Header name"
                style={{ background: '#2d2d2d', color: '#9cdcfe', border: '1px solid #444', borderRadius: '4px', padding: '5px 8px', fontSize: '13px' }}
              />
              <input
                value={header.value}
                onChange={e => updateHeader(i, 'value', e.target.value)}
                placeholder="Value"
                style={{ background: '#2d2d2d', color: '#ce9178', border: '1px solid #444', borderRadius: '4px', padding: '5px 8px', fontSize: '13px' }}
              />
              <button
                onClick={() => removeHeader(i)}
                style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Body Editor */}
      {activeTab === 'body' && (
        <div style={{ padding: '12px', borderBottom: '1px solid #333', background: '#1e1e1e' }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>RAW JSON</div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={'{\n  "key": "value"\n}'}
            rows={5}
            style={{ width: '100%', background: '#2d2d2d', color: '#d4d4d4', border: '1px solid #555', borderRadius: '4px', padding: '8px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
      )}

      {/* Response */}
      <div style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
        {!response && !loading && (
          <div style={{ color: '#555', textAlign: 'center', marginTop: '60px' }}>Enter a URL and hit Send</div>
        )}
        {loading && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '60px' }}>Sending request...</div>
        )}
        {response && (
          <>
            {response.error ? (
              <div style={{ color: '#f44747' }}>Error: {response.error}</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: statusColor(response.status) }}>● {response.statusText}</span>
                  <span style={{ color: '#888' }}>{response.duration}ms</span>
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>RESPONSE BODY</div>
                <pre style={{ background: '#2d2d2d', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '13px', margin: 0 }}>
                  {formatBody(response.body)}
                </pre>
                <div style={{ fontSize: '11px', color: '#666', margin: '12px 0 6px' }}>RESPONSE HEADERS</div>
                <pre style={{ background: '#2d2d2d', padding: '12px', borderRadius: '4px', fontSize: '13px', margin: 0 }}>
                  {Object.entries(response.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
                </pre>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function methodColor(method: string) {
  const colors: Record<string, string> = { GET: '#4ec9b0', POST: '#dcdcaa', PUT: '#ce9178', PATCH: '#9cdcfe', DELETE: '#f44747' };
  return colors[method] || '#d4d4d4';
}

function statusColor(status: number) {
  if (status >= 200 && status < 300) return '#4ec9b0';
  if (status >= 400) return '#f44747';
  return '#dcdcaa';
}

function formatBody(body: string) {
  try { return JSON.stringify(JSON.parse(body), null, 2); }
  catch { return body; }
}

export default App;