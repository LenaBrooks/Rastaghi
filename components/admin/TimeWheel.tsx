"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "cn";

const ITEM_HEIGHT = 32;
const VISIBLE_COUNT = 3;

function toFa(n: number) {
  return n.toLocaleString("fa-IR", {
    useGrouping: false,
    minimumIntegerDigits: 2,
  });
}

type WheelColumnProps = {
  label: string;
  items: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
};

function WheelColumn({ label, items, value, onChange }: WheelColumnProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef(0);
  const settlingRef = useRef(false);

  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const el = scrollerRef.current;
    if (!el) return;
    settlingRef.current = true;
    el.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: smooth ? "smooth" : "instant",
    });
    window.setTimeout(
      () => {
        settlingRef.current = false;
      },
      smooth ? 180 : 0,
    );
  }, []);

  useEffect(() => {
    setActiveIndex(selectedIndex);
    scrollToIndex(selectedIndex, false);
  }, [selectedIndex, items.length, scrollToIndex]);

  useEffect(() => () => window.clearTimeout(settleTimerRef.current), []);

  const commitFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || settlingRef.current) return;
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    const next = items[clamped];
    if (!next) return;
    setActiveIndex(clamped);
    if (Math.abs(el.scrollTop - clamped * ITEM_HEIGHT) > 1) {
      scrollToIndex(clamped, true);
    }
    if (next.value !== value) onChange(next.value);
  }, [items, onChange, scrollToIndex, value]);

  function onScroll() {
    const el = scrollerRef.current;
    if (el) {
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      setActiveIndex(clamped);
    }
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(commitFromScroll, 80);
  }

  return (
    <div className="admin-time-wheel-col">
      <div className="admin-time-wheel-label">{label}</div>
      <div
        className="admin-time-wheel-viewport"
        style={{ height: ITEM_HEIGHT * VISIBLE_COUNT }}
      >
        <div className="admin-time-wheel-highlight" aria-hidden />
        <div className="admin-time-wheel-fade-top" aria-hidden />
        <div className="admin-time-wheel-fade-bottom" aria-hidden />
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="admin-time-wheel-scroller"
          style={{
            paddingBlock: ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2),
          }}
        >
          {items.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onChange(item.value);
                  setActiveIndex(index);
                  scrollToIndex(index, true);
                }}
                className={cn(
                  "admin-time-wheel-item",
                  selected && "is-selected",
                )}
                style={{ height: ITEM_HEIGHT }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type TimeWheelProps = {
  date: Date;
  onChange: (next: Date) => void;
};

export function TimeWheel({ date, onChange }: TimeWheelProps) {
  const hours = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: toFa(i),
      })),
    [],
  );

  const minutes = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        value: i,
        label: toFa(i),
      })),
    [],
  );

  function setPart(part: "hours" | "minutes", value: number) {
    const next = new Date(date);
    if (part === "hours") next.setHours(value);
    else next.setMinutes(value);
    next.setSeconds(0, 0);
    onChange(next);
  }

  return (
    <div className="admin-time-wheel" dir="ltr" lang="fa">
      <WheelColumn
        label="ساعت"
        items={hours}
        value={date.getHours()}
        onChange={(v) => setPart("hours", v)}
      />
      <WheelColumn
        label="دقیقه"
        items={minutes}
        value={date.getMinutes()}
        onChange={(v) => setPart("minutes", v)}
      />
    </div>
  );
}
