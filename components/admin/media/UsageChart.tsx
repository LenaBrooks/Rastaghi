import type { CloudinaryUsageSummary } from "@/lib/cloudinary";
import { formatBytesFa, toPersianDigits } from "@/lib/persian";

type UsageChartProps = {
  usage: CloudinaryUsageSummary;
};

export function UsageChart({ usage }: UsageChartProps) {
  const pct = Math.min(100, Math.max(0, usage.usedPercent));
  const free = Math.max(0, 100 - pct);
  const hue = pct >= 90 ? 8 : pct >= 70 ? 32 : "var(--hue)";

  return (
    <div className="admin-media-usage">
      <div
        className="admin-media-chart"
        style={{
          background: `conic-gradient(
            hsl(${hue}, 55%, 42%) 0 ${pct}%,
            color-mix(in oklch, var(--text) 10%, transparent) ${pct}% 100%
          )`,
        }}
        role="img"
        aria-label={`${toPersianDigits(pct)} درصد از فضای ذخیره‌سازی استفاده شده`}
      >
        <div className="admin-media-chart-hole">
          <strong>{toPersianDigits(pct)}٪</strong>
          <span>مصرف</span>
        </div>
      </div>
      <div className="admin-media-usage-meta">
        <p>
          <span className="admin-muted">مصرف‌شده</span>
          <strong>{formatBytesFa(usage.usedBytes)}</strong>
        </p>
        <p>
          <span className="admin-muted">سقف</span>
          <strong>{formatBytesFa(usage.quotaBytes)}</strong>
        </p>
        <p>
          <span className="admin-muted">باقی‌مانده</span>
          <strong>
            {formatBytesFa(Math.max(0, usage.quotaBytes - usage.usedBytes))}
          </strong>
        </p>
        <p className="admin-media-usage-legend">
          <span className="admin-media-dot is-used" />
          مصرف‌شده ({toPersianDigits(pct)}٪)
          <span className="admin-media-dot is-free" />
          آزاد ({toPersianDigits(Math.round(free * 10) / 10)}٪)
        </p>
      </div>
    </div>
  );
}
