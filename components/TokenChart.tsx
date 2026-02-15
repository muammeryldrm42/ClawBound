"use client";

import { useEffect, useMemo, useRef } from "react";
import { createChart, IChartApi, UTCTimestamp } from "lightweight-charts";

function normalize(resp: any) {
  const list = resp?.data?.ohlcv_list || resp?.data?.attributes?.ohlcv_list || [];
  return (list as any[]).map((a) => {
    // [timestamp, open, high, low, close, volume]
    const t = Number(a?.[0]);
    return {
      time: (t as UTCTimestamp),
      open: Number(a?.[1]),
      high: Number(a?.[2]),
      low: Number(a?.[3]),
      close: Number(a?.[4]),
      volume: Number(a?.[5] ?? 0)
    };
  }).filter(x => Number.isFinite(x.time) && Number.isFinite(x.open));
}

export default function TokenChart({ ohlcv, loading, error }: { ohlcv: any; loading: boolean; error: string | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const data = useMemo(() => normalize(ohlcv), [ohlcv]);

  useEffect(() => {
    if (!ref.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(ref.current, {
      height: 420,
      layout: { background: { color: "#0a0e13" }, textColor: "rgba(255,255,255,0.75)" },
      grid: { vertLines: { color: "rgba(255,255,255,0.06)" }, horzLines: { color: "rgba(255,255,255,0.06)" } },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      timeScale: { borderColor: "rgba(255,255,255,0.08)" },
      crosshair: { mode: 1 }
    });

    chartRef.current = chart;

    const candle = chart.addCandlestickSeries();
    const vol = chart.addHistogramSeries({ priceFormat: { type: "volume" }, priceScaleId: "" });

    if (data.length > 0) {
      candle.setData(data.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
      vol.setData(
        data.map(({ time, close, open, volume }) => ({
          time,
          value: volume,
          color: close >= open ? "rgba(16,185,129,0.35)" : "rgba(244,63,94,0.35)"
        }))
      );
      chart.timeScale().fitContent();
    }

    const ro = new ResizeObserver(() => {
      if (!ref.current) return;
      chart.applyOptions({ width: ref.current.clientWidth });
    });
    ro.observe(ref.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  if (error) return <div className="p-6 text-sm text-rose-300">Error loading chart: {error}</div>;
  if (loading && data.length === 0) return <div className="p-6 text-sm text-white/60">Loading chart…</div>;
  if (!loading && data.length === 0) return <div className="p-6 text-sm text-white/60">No chart data.</div>;

  return <div ref={ref} className="w-full" />;
}
