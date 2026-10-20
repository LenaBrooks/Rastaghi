export function isTelegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() &&
      process.env.TELEGRAM_CHAT_ID?.trim(),
  );
}

export type SendTelegramMessageResult =
  | { ok: true }
  | { ok: false; status: number; description: string };

/** Send a plain-text message to the configured chat. Server-only. */
export async function sendTelegramMessage(
  text: string,
): Promise<SendTelegramMessageResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return {
      ok: false,
      status: 503,
      description: "Telegram is not configured.",
    };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("[telegram] network error", err);
    return {
      ok: false,
      status: 502,
      description: "Could not reach Telegram.",
    };
  }

  let payload: { ok?: boolean; description?: string } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    /* ignore parse errors */
  }

  if (!response.ok || payload.ok === false) {
    const description =
      payload.description?.trim() ||
      `Telegram API error (${response.status}).`;
    console.error("[telegram]", response.status, description);
    return {
      ok: false,
      status:
        response.status >= 400 && response.status < 600 ? response.status : 502,
      description,
    };
  }

  return { ok: true };
}
