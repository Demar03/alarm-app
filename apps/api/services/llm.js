import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
let client = null;
if (apiKey) {
  client = new OpenAI({ apiKey });
}

export async function getNlpPlanFromLlm(text) {
  if (!client) return null;

  const system = `You convert user natural language about home alarm control into a normalized JSON plan.
Return ONLY compact JSON, no prose. Fields:
{
  action: "ARM_SYSTEM" | "DISARM_SYSTEM" | "ADD_USER" | "REMOVE_USER" | "LIST_USERS",
  payload: { any fields needed for the corresponding REST call },
  defaults: { describe any defaults you applied }
}`;

  const user = `Text: ${text}`;

  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    const content = resp.choices?.[0]?.message?.content || '';
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    const jsonStr = start >= 0 && end >= 0 ? content.slice(start, end + 1) : content;
    return JSON.parse(jsonStr);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('LLM error', err?.message);
    return null;
  }
}


