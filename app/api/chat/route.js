export async function POST(request) {
  try {
    const { messages, model = 'gpt-5.5' } = await request.json();
    const key = process.env.AGENTROUTER_API_KEY;
    if (!key) return Response.json({ error: 'AGENTROUTER_API_KEY is not configured on the server.' }, { status: 500 });
    const upstream = await fetch('https://agentrouter.org/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body: JSON.stringify({ model, messages, temperature: 0.7 })
    });
    const data = await upstream.json();
    if (!upstream.ok) return Response.json({ error: data?.error?.message || data?.message || 'AgentRouter API error' }, { status: upstream.status });
    return Response.json({ content: data?.choices?.[0]?.message?.content || 'لم يصل رد من النموذج.' });
  } catch (e) { return Response.json({ error: e.message || 'Server error' }, { status: 500 }); }
}