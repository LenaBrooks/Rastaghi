"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

type ContactFormProps = {
  className?: string;
};

export function ContactForm({ className }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      let data: { error?: string; message?: string; ok?: boolean } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        /* ignore */
      }

      if (!res.ok) {
        setError(data.error || "ارسال پیام ناموفق بود.");
        return;
      }

      setSuccess(data.message || "پیام شما ارسال شد.");
      setMessage("");
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={["contact-form", "comment-form", className]
        .filter(Boolean)
        .join(" ")}
      noValidate
    >
      <h2 className="contact-form-heading">ارسال پیام</h2>

      <label className="comment-field">
        <span>نام</span>
        <input
          name="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام شما"
          autoComplete="name"
          disabled={pending}
        />
      </label>

      <label className="comment-field">
        <span>ایمیل (اختیاری)</span>
        <input
          name="email"
          type="email"
          maxLength={120}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          dir="ltr"
          disabled={pending}
        />
      </label>

      <label className="comment-field">
        <span>پیام</span>
        <textarea
          name="message"
          required
          maxLength={4000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="متن پیام…"
          disabled={pending}
        />
      </label>

      {error ? (
        <p className="comment-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="comment-success" role="status">
          {success}
        </p>
      ) : null}

      <div className="comment-form-actions">
        <button
          type="submit"
          className={pending ? "button pending-btn is-pending" : "button pending-btn"}
          disabled={pending}
          aria-busy={pending || undefined}
        >
          <span className="pending-btn-label" aria-hidden={pending || undefined}>
            ارسال پیام
          </span>
          {pending ? (
            <span className="pending-btn-spinner" aria-hidden>
              <Spinner className="pending-spinner" />
            </span>
          ) : null}
        </button>
      </div>
    </form>
  );
}
