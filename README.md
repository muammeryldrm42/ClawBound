# Clawbound — Solana Screener (Keyless)

**No API keys required.**  
Data:
- **DexScreener API** for token/pair market data and search
- **GeckoTerminal API** for OHLCV candles (candlestick chart)

UI:
- Terminal-style layout
- Sidebar search (CA / ticker autocomplete) + keyboard shortcuts
- Tabs: Trending / Top / Gainers / New Pairs
- Category chips: All / Pump.fun / Bonk.fun / AI
- Virtualized table + sticky header + column picker
- Token detail page with candlestick chart (TradingView Lightweight Charts)

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
1) Push to GitHub
2) Vercel → New Project → Import repo
3) Build settings: default (Next.js)
4) No env vars required

`vercel.json` is included to ensure Node runtime for API routes.

## Config: hardcoded lists (optional)
Edit `config/tokenLists.json` to pin tokens into categories (Pump.fun / Bonk.fun / AI).  
These show up in the category chips and can be used as your curated lists.
