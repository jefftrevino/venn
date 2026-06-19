import Anthropic from 'npm:@anthropic-ai/sdk@0.36.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { participants } = await req.json();
    const active = (participants || []).filter((p: any) => p.items?.length > 0);

    if (active.length < 2) {
      return Response.json({ suggestions: [] }, { headers: corsHeaders });
    }

    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
    const desc = active.map((p: any) => `- ${p.name}: ${p.items.join(', ')}`).join('\n');

    // Stage 1: infer domain
    const s1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Several people each listed items in a shared decision tool. Working from the items alone, figure out what kind of thing these are and what the group is implicitly trying to choose together. Look at each item individually — what is it, and what does it signal about that person's taste?\n\n${desc}\n\nReturn ONLY a JSON object, no prose, no markdown:\n{"domain":"<what they're collectively choosing, e.g. 'a song to cover', 'a city to travel to', 'a board game for game night'>","kind":"<the category EVERY listed item belongs to, plural, e.g. 'music genres', 'cities', 'board games'>","format":"<the surface format of the items: typical length + capitalization, e.g. 'one or two lowercase words', 'Proper-case city names', 'Title Case game titles'>","reads":["<one entry per item, written as 'item — what it is and the taste it signals'>"]}`
      }],
    });

    const d = JSON.parse((s1.content[0] as any).text.match(/\{[\s\S]*\}/)[0]);

    // Stage 2: generate suggestions
    const s2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `A group is collaboratively choosing ${d.domain}. Every item below is one of these: ${d.kind}.\n\n${desc}\n\nWhat each item signals:\n${(d.reads || []).map((r: string) => '- ' + r).join('\n')}\n\nStep 1 — Find the genuine overlap. Identify 3–4 specific qualities that are present across ALL of the listed items simultaneously. Look across dimensions like format, occasion, cultural register, texture, emotional tone, price point, setting. Only count a quality if you can defend its presence in every single item.\n\nStep 2 — Propose 4 NEW ${d.kind} (none already listed above) that embody ALL of those shared qualities at once. Each suggestion must be something every person in the group would recognize as capturing what they were going for. Discard any candidate that mainly resembles just one or two of the inputs — it must bridge all of them. Prefer specific and surprising over safe and obvious.\n\nHard requirements for each suggestion's "label": it must be an actual ${d.kind}, written in the SAME surface format as the listed items (${d.format}) — same length, same capitalization, just the thing itself with no description.\n\nReturn ONLY a JSON object, no prose, no markdown:\n{"shared_qualities":["<quality present in ALL items>","<quality present in ALL items>","<quality present in ALL items>"],"suggestions":[{"label":"<the ${d.kind}, formatted exactly like the inputs>","why":"<one warm, conversational sentence explaining why this would work for this specific group — write it like a friend making the case, not an analyst describing overlap>"}]}`
      }],
    });

    const r = JSON.parse((s2.content[0] as any).text.match(/\{[\s\S]*\}/)[0]);
    const suggestions = (r.suggestions || [])
      .filter((x: any) => x?.label)
      .slice(0, 5)
      .map((x: any) => ({ label: String(x.label), why: String(x.why || '') }));

    return Response.json({ suggestions }, { headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'suggest failed' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
