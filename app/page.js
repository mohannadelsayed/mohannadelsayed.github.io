'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-5.5');
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ messages: next, model }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages([...next, { role: 'assistant', content: data.content }]);
    } catch (err) { setMessages([...next, { role: 'assistant', content: 'خطأ: ' + err.message }]); }
    finally { setLoading(false); }
  }

  return <main className="shell">
    <header><div><h1>AgentRouter Chat</h1><p>محادثة عبر AgentRouter API</p></div>
      <select value={model} onChange={e => setModel(e.target.value)}><option value="gpt-5.5">GPT-5.5</option><option value="kimi-k2.6">Kimi K2.6</option><option value="glm-5.1">GLM-5.1</option></select>
    </header>
    <section className="chat">
      {messages.length === 0 && <div className="empty">اكتب رسالتك للبدء…</div>}
      {messages.map((m,i) => <div key={i} className={'row '+m.role}><div className="bubble">{m.content}</div></div>)}
      {loading && <div className="row assistant"><div className="bubble">يفكر…</div></div>}
    </section>
    <form onSubmit={sendMessage} className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="اكتب رسالتك..." rows="1" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(e)}}}/><button disabled={loading||!input.trim()}>{loading?'...':'إرسال'}</button></form>
  </main>;
}