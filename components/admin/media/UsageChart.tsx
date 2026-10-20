import type { CloudinaryUsageSummary } from "@/lib/cloudinary";
import { formatBytesFa, toPersianDigits } from "@/lib/persian";

type UsageChartProps = {
  usage: CloudinaryUsageSummary;
};

export function UsageChart({ usage }: UsageChartProps) {
  const pct = Math.min(100, Math.max(0, usage.usedPercent));
  const hue = pct >= 90 ? 8 : pct >= 70 ? 32 : "var(--hue)";
  const remaining = Math.max(0, usage.quotaBytes - usage.usedBytes);

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
        </div>
      </div>

      <dl className="admin-media-usage-stats">
        <div className="admin-media-usage-row">
          <dt>مصرف‌شده</dt>
          <dd>{formatBytesFa(usage.usedBytes)}</dd>
        </div>
        <div className="admin-media-usage-row">
          <dt>سقف</dt>
          <dd>{formatBytesFa(usage.quotaBytes)}</dd>
        </div>
        <div className="admin-media-usage-row">
          <dt>باقی‌مانده</dt>
          <dd>{formatBytesFa(remaining)}</dd>
        </div>
      </dl>
    </div>
  );
}
