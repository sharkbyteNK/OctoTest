import { useState } from 'react';
import { SendRequest } from '../wailsjs/go/main/App';
import './App.css';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function sendRequest() {
    if (!url) return;
    setLoading(true);
    setResponse(null);
    try {
      const result = await SendRequest({
        method,
        url,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      setResponse(result);
    } catch (e) {
      setResponse({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'monospace', background: '#1e1e1e', color: '#d4d4d4' }}>
      
      {/* Top bar */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px', background: '#252526', borderBottom: '1px solid #333' }}>
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          style={{ background: '#333', color: methodColor(method), border: '1px solid #555', borderRadius: '4px', padding: '6px 10px', fontWeight: 'bold', fontSize: '14px' }}
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

      {/* Body input */}
      <div style={{ padding: '12px', background: '#1e1e1e', borderBottom: '1px solid #333' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>REQUEST BODY (JSON)</div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={'{\n  "key": "value"\n}'}
          rows={4}
          style={{ width: '100%', background: '#2d2d2d', color: '#d4d4d4', border: '1px solid #555', borderRadius: '4px', padding: '8px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

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
                {/* Status bar */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: statusColor(response.status) }}>● {response.statusText}</span>
                  <span style={{ color: '#888' }}>{response.duration}ms</span>
                </div>

                {/* Response body */}
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>RESPONSE BODY</div>
                <pre style={{ background: '#2d2d2d', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '13px', margin: 0 }}>
                  {formatBody(response.body)}
                </pre>

                {/* Response headers */}
                <div style={{ fontSize: '12px', color: '#888', margin: '12px 0 6px' }}>RESPONSE HEADERS</div>
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
  const colors: Record<string, string> = {
    GET: '#4ec9b0', POST: '#dcdcaa', PUT: '#ce9178', PATCH: '#9cdcfe', DELETE: '#f44747'
  };
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