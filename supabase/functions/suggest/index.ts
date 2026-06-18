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
        content: `A group is collaboratively choosing ${d.domain}. Every item below is one of these: ${d.kind}.\n\n${desc}\n\nWhat each item signals:\n${(d.reads || []).map((r: string) => '- ' + r).join('\n')}\n\nPropose 4 NEW ${d.kind} (none already listed above) that sit at the genuine intersection of everyone's tastes — specific, real options each person would be glad to go with, balancing all of them rather than averaging blandly. Investigate the overlap between the individual reads above.\n\nHard requirements for each suggestion's "label": it must be an actual ${d.kind}, written in the SAME surface format as the listed items (${d.format}) — same length, same capitalization, just the thing itself with no description attached.\n\nReturn ONLY a JSON object, no prose, no markdown:\n{"suggestions":[{"label":"<the ${d.kind}, formatted exactly like the inputs>","why":"<one short clause naming how it bridges these specific people>"}]}`
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
    return Response.json(
      { suggestions: [{ label: 'add a couple more', why: 'a few more items will sharpen the overlap — it retries automatically' }] },
      { headers: corsHeaders }
    );
  }
});
