import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const source = "groupme";

type GroupMeMessage = {
  id: string;
  created_at: number;
  text?: string | null;
  name?: string | null;
  sender_id?: string | null;
  sender_type?: string | null;
  system_message?: boolean;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function secretKeyFromEnvironment(): string {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const entry = parsed.default;
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const objectEntry = entry as Record<string, unknown>;
        for (const key of ["key", "value", "secret_key"]) {
          if (typeof objectEntry[key] === "string") return objectEntry[key] as string;
        }
      }
    } catch {
      // Fall back to the legacy environment variable below.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function projectUrl(): string {
  return (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
}

function publishableKey(request: Request): string {
  return request.headers.get("apikey")
    ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
    ?? Deno.env.get("SUPABASE_ANON_KEY")
    ?? "";
}

function groupMeConfig() {
  return {
    token: Deno.env.get("GROUPME_TOKEN") ?? "",
    groupId: Deno.env.get("GROUPME_GROUP_ID") ?? "",
    botId: Deno.env.get("GROUPME_BOT_ID") ?? "",
  };
}

async function groupMeFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { token } = groupMeConfig();
  const headers = new Headers(init.headers);
  headers.set("X-Access-Token", token);
  headers.set("Accept", "application/json");
  return fetch(`https://api.groupme.com/v3${path}`, { ...init, headers });
}

async function readMessages(lastId: string): Promise<GroupMeMessage[]> {
  const query = new URLSearchParams({ limit: "20" });
  if (lastId) query.set("after_id", lastId);
  const response = await groupMeFetch(`/groups/${encodeURIComponent(groupMeConfig().groupId)}/messages?${query}`);
  if (response.status === 304) return [];
  if (!response.ok) throw new Error(`GroupMe messages request failed (${response.status})`);
  const payload = await response.json().catch(() => ({}));
  const messages = Array.isArray(payload?.response?.messages) ? payload.response.messages : [];
  return messages
    .filter((message: unknown): message is GroupMeMessage => Boolean(message && typeof message === "object" && (message as GroupMeMessage).id))
    .sort((left: GroupMeMessage, right: GroupMeMessage) => left.created_at - right.created_at);
}

async function readThread(message: GroupMeMessage): Promise<Array<{ sender: string; text: string }>> {
  const cutoff = message.created_at - 10 * 60;
  const response = await groupMeFetch(`/groups/${encodeURIComponent(groupMeConfig().groupId)}/messages?before_id=${encodeURIComponent(message.id)}&limit=20`);
  if (!response.ok) return [];
  const payload = await response.json().catch(() => ({}));
  const messages = Array.isArray(payload?.response?.messages) ? payload.response.messages : [];
  return messages
    .filter((item: unknown): item is GroupMeMessage => {
      const candidate = item as GroupMeMessage;
      return Boolean(candidate && candidate.text && candidate.created_at >= cutoff && candidate.sender_id === message.sender_id);
    })
    .sort((left: GroupMeMessage, right: GroupMeMessage) => left.created_at - right.created_at)
    .slice(-4)
    .map((item) => ({ sender: item.name || "sender", text: item.text?.trim() || "" }))
    .filter((item) => item.text);
}

function shouldSkip(message: GroupMeMessage): boolean {
  return Boolean(
    !message.text?.trim()
      || message.sender_type === "bot"
      || message.sender_type === "system"
      || message.system_message,
  );
}

async function getCursor(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase.from("channel_cursor").select("source, last_id, read_count, updated_at").eq("source", source).maybeSingle();
  if (error) throw new Error("Could not read the GroupMe cursor");
  return data as { source: string; last_id: string; read_count: number; updated_at: string } | null;
}

async function saveCursor(supabase: ReturnType<typeof createClient>, lastId: string, readCount: number): Promise<void> {
  const { error } = await supabase.from("channel_cursor").upsert({
    source,
    last_id: lastId,
    read_count: readCount,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error("Could not save the GroupMe cursor");
}

async function sendToAgent(message: GroupMeMessage, thread: Array<{ sender: string; text: string }>, key: string) {
  const response = await fetch(`${projectUrl()}/functions/v1/submit-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify({
      announcement: message.text?.trim() || "",
      source,
      source_id: message.id,
      source_name: "GroupMe",
      thread,
    }),
  });
  return await response.json().catch(() => ({ ok: false, message: `The event agent returned ${response.status}.` }));
}

async function replyToGroupMe(text: string): Promise<void> {
  const { botId } = groupMeConfig();
  if (!botId) return;
  const response = await groupMeFetch("/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId, text: text.slice(0, 1000) }),
  });
  if (!response.ok) throw new Error(`GroupMe bot reply failed (${response.status})`);
}

function decisionText(result: Record<string, unknown>): string {
  const status = typeof result.status === "string" ? result.status : "waiting";
  const message = typeof result.message === "string" ? result.message : "The event agent reviewed this post.";
  const reasons = Array.isArray(result.reasons) ? result.reasons.filter((reason): reason is string => typeof reason === "string") : [];
  return [`Club Event Radar: ${status}. ${message}`, ...reasons.map((reason) => `• ${reason}`)].join("\n");
}

async function checkGroupMe(): Promise<Record<string, unknown>> {
  const response = await groupMeFetch(`/groups/${encodeURIComponent(groupMeConfig().groupId)}`);
  if (!response.ok) return { ok: false, token_and_group_work: false, message: `GroupMe returned ${response.status}.` };
  const payload = await response.json().catch(() => ({}));
  return { ok: true, token_and_group_work: true, group_name: typeof payload?.response?.name === "string" ? payload.response.name : "GroupMe group is reachable." };
}

async function runReader(request: Request): Promise<Record<string, unknown>> {
  const supabase = createClient(projectUrl(), secretKeyFromEnvironment(), { auth: { persistSession: false, autoRefreshToken: false } });
  const cursor = await getCursor(supabase);
  const messages = await readMessages(cursor?.last_id || "");

  if (!cursor) {
    const newest = messages[messages.length - 1];
    await saveCursor(supabase, newest?.id || "", 0);
    return { ok: true, initialized: true, last_message_id: newest?.id || "", read_count: 0, bot: Boolean(groupMeConfig().botId) };
  }

  let lastId = cursor.last_id;
  let readCount = cursor.read_count;
  const key = publishableKey(request);
  for (const message of messages) {
    if (!shouldSkip(message)) {
      const thread = await readThread(message);
      const result = await sendToAgent(message, thread, key);
      if (!result.already_read && result.ok !== false) await replyToGroupMe(decisionText(result));
    }
    lastId = message.id;
    readCount += 1;
    await saveCursor(supabase, lastId, readCount);
  }
  return { ok: true, initialized: false, last_message_id: lastId, read_count: readCount, processed: messages.length, bot: Boolean(groupMeConfig().botId) };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    const config = groupMeConfig();
    if (request.method === "GET") {
      const check = new URL(request.url).searchParams.get("check");
      if (check === "groupme") return jsonResponse(await checkGroupMe());
      const cursorSupabase = createClient(projectUrl(), secretKeyFromEnvironment(), { auth: { persistSession: false, autoRefreshToken: false } });
      const cursor = await getCursor(cursorSupabase);
      return jsonResponse({
        ok: true,
        ready: Boolean(config.token && config.groupId && projectUrl() && secretKeyFromEnvironment()),
        last_message_id: cursor?.last_id || "",
        read_count: cursor?.read_count || 0,
        bot: Boolean(config.botId),
      });
    }
    if (request.method !== "POST") return jsonResponse({ ok: false, message: "Use GET or POST." }, 405);
    if (!config.token || !config.groupId || !projectUrl() || !secretKeyFromEnvironment()) {
      return jsonResponse({ ok: false, message: "The GroupMe reader is not configured." }, 503);
    }
    return jsonResponse(await runReader(request));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unexpected GroupMe reader error");
    return jsonResponse({ ok: false, message: "The GroupMe reader could not finish this run." }, 500);
  }
});
