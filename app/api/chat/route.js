export async function POST(request) {
  try {
    const { messages, model = 'gpt-5.5' } = await request.json();
    const key = process.env.AGENTROUTER_API_KEY;

    if (!key) {
      return Response.json(
        { error: 'AGENTROUTER_API_KEY غير مضبوط في إعدادات الاستضافة.' },
        { status: 500 }
      );
    }

    // AgentRouter OpenAI-compatible endpoint.
    // Base URL: https://co.agentrouter.org/v1
    const upstream = await fetch('https://co.agentrouter.org/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
    });

    // Do not blindly call response.json(): AgentRouter/WAF can return HTML
    // for an invalid endpoint or gateway error.
    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return Response.json(
        {
          error: `AgentRouter أعاد استجابة غير JSON (HTTP ${upstream.status}). تحقق من API Key واتصال AgentRouter.`,
        },
        { status: 502 }
      );
    }

    if (!upstream.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            data?.message ||
            `AgentRouter API error (HTTP ${upstream.status})`,
        },
        { status: upstream.status }
      );
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json(
        { error: 'وصل رد من AgentRouter ولكن بدون محتوى.' },
        { status: 502 }
      );
    }

    return Response.json({ content });
  } catch (error) {
    return Response.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
