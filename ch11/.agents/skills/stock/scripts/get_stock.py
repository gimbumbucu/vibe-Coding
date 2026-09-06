#!/usr/bin/env python3
"""
Antigravity Stock Analysis CLI & Report Generator
Fetches real-time stock prices, historical data, company fundamentals,
and generates interactive visual HTML reports using yfinance.
"""

import sys
import os
import json
import argparse
from datetime import datetime

# UTF-8 output encoding setup for Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    import yfinance as yf
    import pandas as pd
except ImportError:
    sys.stderr.write("Error: Required packages missing. Please install: pip install yfinance pandas\n")
    sys.exit(1)

try:
    from deep_translator import GoogleTranslator
    _translator_available = True
except ImportError:
    _translator_available = False


def translate_to_korean(text: str) -> str:
    """Translates English text to Korean using deep-translator.
    Falls back to the original text if translation is unavailable or fails."""
    if not text or not _translator_available:
        return text
    try:
        # Google Translate has a 5000 char limit per request; split if needed
        max_chunk = 4900
        if len(text) <= max_chunk:
            return GoogleTranslator(source='en', target='ko').translate(text)
        # Split into chunks and translate separately
        chunks = [text[i:i + max_chunk] for i in range(0, len(text), max_chunk)]
        translated_chunks = [
            GoogleTranslator(source='en', target='ko').translate(chunk)
            for chunk in chunks
        ]
        return ' '.join(translated_chunks)
    except Exception:
        return text

# Resource paths
RESOURCES_DIR = os.path.join(os.path.dirname(__file__), "..", "resources")
KOREAN_STOCKS_PATH = os.path.join(RESOURCES_DIR, "korean_stocks.json")

KOREAN_STOCKS_MAP = {}
REVERSE_KOREAN_MAP = {}
if os.path.exists(KOREAN_STOCKS_PATH):
    try:
        with open(KOREAN_STOCKS_PATH, "r", encoding="utf-8") as f:
            KOREAN_STOCKS_MAP = json.load(f)
            for k, v in KOREAN_STOCKS_MAP.items():
                if v not in REVERSE_KOREAN_MAP:
                    REVERSE_KOREAN_MAP[v] = k
    except Exception:
        pass


def resolve_ticker(query: str) -> tuple[str, str]:
    """
    Resolves a company name or ticker query to a valid yfinance ticker symbol.
    Returns (symbol, display_name)
    """
    clean_query = query.strip()
    
    # 1. Exact match in dictionary
    if clean_query in KOREAN_STOCKS_MAP:
        return KOREAN_STOCKS_MAP[clean_query], clean_query
    
    # Case-insensitive match in dictionary
    for k, v in KOREAN_STOCKS_MAP.items():
        if k.lower() == clean_query.lower():
            return v, k
            
    # 2. 6-digit Korean stock code (e.g., 005930 -> 005930.KS)
    if clean_query.isdigit() and len(clean_query) == 6:
        return f"{clean_query}.KS", clean_query

    # 3. Direct ticker symbol (e.g. AAPL, NVDA, 005930.KS, 035720.KQ)
    korean_name = REVERSE_KOREAN_MAP.get(clean_query.upper(), clean_query)
    return clean_query.upper(), korean_name


def format_currency_value(value, currency="USD", include_sign=False):
    if value is None:
        return "N/A"
    try:
        num = float(value)
    except (ValueError, TypeError):
        return str(value)
        
    curr_symbol = "$" if currency == "USD" else ("₩" if currency in ["KRW", "KRW "] else f"{currency} ")
    sign = "+" if (include_sign and num > 0) else ""
    
    if currency == "KRW":
        if abs(num) >= 1_000_000_000_000:
            trillion = num / 1_000_000_000_000
            return f"{sign}{trillion:.2f}조 원"
        elif abs(num) >= 100_000_000:
            hundred_mil = num / 100_000_000
            return f"{sign}{hundred_mil:.1f}억 원"
        else:
            return f"{sign}{num:,.0f}원"
    else:
        if abs(num) >= 1_000_000_000_000:
            return f"{sign}{curr_symbol}{num/1_000_000_000_000:.2f}T"
        elif abs(num) >= 1_000_000_000:
            return f"{sign}{curr_symbol}{num/1_000_000_000:.2f}B"
        elif abs(num) >= 1_000_000:
            return f"{sign}{curr_symbol}{num/1_000_000:.2f}M"
        else:
            return f"{sign}{curr_symbol}{num:,.2f}"


def format_number(val, decimal=2):
    if val is None or pd.isna(val):
        return "N/A"
    try:
        return f"{float(val):,.{decimal}f}"
    except (ValueError, TypeError):
        return str(val)


def get_stock_data(symbol: str, display_name: str, period="1mo", interval="1d"):
    """
    Fetches detailed stock info and historical data using yfinance.
    """
    ticker = yf.Ticker(symbol)
    
    info = {}
    try:
        info = ticker.info or {}
    except Exception:
        info = {}

    # If info is empty or symbol failed, try alternative for Korean stock (.KS <-> .KQ)
    if not info or (info.get("currentPrice") is None and info.get("regularMarketPrice") is None and info.get("previousClose") is None):
        if symbol.endswith(".KS"):
            alt_sym = symbol[:-3] + ".KQ"
            try:
                alt_ticker = yf.Ticker(alt_sym)
                alt_info = alt_ticker.info
                if alt_info and (alt_info.get("currentPrice") or alt_info.get("regularMarketPrice") or alt_info.get("previousClose")):
                    ticker = alt_ticker
                    symbol = alt_sym
                    info = alt_info
            except Exception:
                pass

    # History data
    try:
        hist = ticker.history(period=period, interval=interval)
    except Exception:
        hist = pd.DataFrame()

    # Extract price points
    curr_price = (
        info.get("currentPrice") 
        or info.get("regularMarketPrice")
        or (float(hist["Close"].iloc[-1]) if not hist.empty else None)
    )
    prev_close = (
        info.get("regularMarketPreviousClose") 
        or info.get("previousClose")
        or (float(hist["Close"].iloc[-2]) if len(hist) > 1 else curr_price)
    )

    currency = info.get("currency", "USD")
    if symbol.endswith(".KS") or symbol.endswith(".KQ"):
        currency = "KRW"

    price_change = None
    pct_change = None
    if curr_price is not None and prev_close is not None and prev_close > 0:
        price_change = curr_price - prev_close
        pct_change = (price_change / prev_close) * 100

    # Period summary
    period_change = None
    period_pct_change = None
    period_high = None
    period_low = None
    if not hist.empty:
        start_close = float(hist["Close"].iloc[0])
        end_close = float(hist["Close"].iloc[-1])
        period_change = end_close - start_close
        period_pct_change = (period_change / start_close) * 100 if start_close > 0 else 0
        period_high = float(hist["High"].max())
        period_low = float(hist["Low"].min())

    # Build structured chart points
    history_points = []
    if not hist.empty:
        for index, row in hist.iterrows():
            date_str = index.strftime("%Y-%m-%d %H:%M") if interval in ["1m", "5m", "15m", "30m", "60m", "1h"] else index.strftime("%Y-%m-%d")
            history_points.append({
                "date": date_str,
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0
            })

    # Dividend yield calculation
    div_yield = info.get("dividendYield")
    if div_yield is None and info.get("trailingAnnualDividendYield") is not None:
        div_yield = info.get("trailingAnnualDividendYield") * 100

    # Determine display company name
    short_name = info.get("shortName") or display_name
    long_name = info.get("longName") or display_name
    korean_alias = REVERSE_KOREAN_MAP.get(symbol)
    if korean_alias and korean_alias not in [short_name, long_name]:
        display_title = f"{korean_alias} ({short_name})"
    else:
        display_title = short_name

    # Fundamentals
    fundamentals = {
        "market_cap": info.get("marketCap"),
        "market_cap_fmt": format_currency_value(info.get("marketCap"), currency),
        "pe_ratio": info.get("trailingPE"),
        "forward_pe": info.get("forwardPE"),
        "pbr": info.get("priceToBook"),
        "eps": info.get("trailingEps"),
        "forward_eps": info.get("forwardEps"),
        "beta": info.get("beta"),
        "dividend_yield": div_yield,
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh") or (period_high if period in ["1y", "2y", "5y", "max"] else None),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow") or (period_low if period in ["1y", "2y", "5y", "max"] else None),
        "fifty_day_avg": info.get("fiftyDayAverage"),
        "two_hundred_day_avg": info.get("twoHundredDayAverage"),
        "volume": info.get("regularMarketVolume") or info.get("volume") or (history_points[-1]["volume"] if history_points else None),
        "avg_volume": info.get("averageVolume"),
        "day_high": info.get("dayHigh") or info.get("regularMarketDayHigh"),
        "day_low": info.get("dayLow") or info.get("regularMarketDayLow"),
        "open": info.get("open") or info.get("regularMarketOpen")
    }

    # Analyst targets
    analyst = {
        "target_mean": info.get("targetMeanPrice"),
        "target_high": info.get("targetHighPrice"),
        "target_low": info.get("targetLowPrice"),
        "recommendation": info.get("recommendationKey"),
        "opinions_count": info.get("numberOfAnalystOpinions")
    }

    # Profile
    profile = {
        "short_name": short_name,
        "long_name": long_name,
        "display_title": display_title,
        "sector": info.get("sector", "N/A"),
        "industry": info.get("industry", "N/A"),
        "country": info.get("country", "N/A"),
        "website": info.get("website", ""),
        "summary": translate_to_korean(info.get("longBusinessSummary", "")),
        "employees": info.get("fullTimeEmployees")
    }

    return {
        "symbol": symbol,
        "query_name": display_name,
        "display_title": display_title,
        "short_name": short_name,
        "long_name": long_name,
        "currency": currency,
        "exchange": info.get("exchange", "N/A"),
        "current_price": curr_price,
        "previous_close": prev_close,
        "price_change": price_change,
        "pct_change": pct_change,
        "period": period,
        "interval": interval,
        "period_change": period_change,
        "period_pct_change": period_pct_change,
        "period_high": period_high,
        "period_low": period_low,
        "fundamentals": fundamentals,
        "analyst": analyst,
        "profile": profile,
        "history": history_points,
        "fetched_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


def calculate_range_pct(curr, low, high):
    if curr is None or low is None or high is None or high <= low:
        return 50
    pct = ((curr - low) / (high - low)) * 100
    return max(0, min(100, round(pct, 1)))


def get_recommendation_class(rec):
    if not rec:
        return "hold"
    r = str(rec).lower()
    if "buy" in r or "strong_buy" in r:
        return "buy"
    elif "sell" in r or "underperform" in r:
        return "sell"
    return "hold"


def get_recommendation_label(rec):
    if not rec:
        return "N/A"
    mapping = {
        "strong_buy": "강력 매수 (Strong Buy)",
        "buy": "매수 (Buy)",
        "hold": "보유 / 중립 (Hold)",
        "underperform": "비중 축소 (Underperform)",
        "sell": "매도 (Sell)"
    }
    return mapping.get(str(rec).lower(), str(rec).upper())


def generate_html_report(data_list, output_file="stock_report.html"):
    """
    Generates a visually stunning, responsive, interactive HTML stock analysis report.
    Supports single stock deep-dive or multi-stock comparative analysis.
    """
    primary = data_list[0]
    is_multi = len(data_list) > 1

    chart_payload = json.dumps(data_list, ensure_ascii=False)

    change_pct = primary["pct_change"] or 0
    change_color_class = "bullish" if change_pct > 0 else ("bearish" if change_pct < 0 else "neutral")
    change_sign = "+" if change_pct > 0 else ""
    change_arrow = "▲" if change_pct > 0 else ("▼" if change_pct < 0 else "•")

    html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{primary['display_title']} ({primary['symbol']}) - 주가 분석 보고서</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {{
      --bg-dark: #0b0f19;
      --bg-card: #131b2e;
      --bg-card-hover: #1b2640;
      --bg-card-subtle: #0f1626;
      --border-color: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(59, 130, 246, 0.4);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --accent-cyan: #06b6d4;
      --bullish: #10b981;
      --bullish-bg: rgba(16, 185, 129, 0.12);
      --bearish: #ef4444;
      --bearish-bg: rgba(239, 68, 68, 0.12);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.45);
      --font-main: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: var(--font-main);
      background-color: var(--bg-dark);
      color: var(--text-main);
      line-height: 1.6;
      padding: 28px 20px;
      min-height: 100vh;
    }}

    .container {{
      max-width: 1240px;
      margin: 0 auto;
    }}

    /* Header styling */
    .header {{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      padding: 26px 32px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95));
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-lg);
    }}

    .header-left {{
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}

    .badge-row {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .badge {{
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }}

    .badge-ticker {{
      background: rgba(59, 130, 246, 0.15);
      color: var(--accent-blue);
      border: 1px solid rgba(59, 130, 246, 0.3);
      font-family: var(--font-mono);
    }}

    .badge-sector {{
      background: rgba(139, 92, 246, 0.15);
      color: var(--accent-purple);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }}

    .badge-exchange {{
      background: rgba(156, 163, 175, 0.1);
      color: var(--text-muted);
    }}

    .company-title {{
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }}

    .header-right {{
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }}

    .current-price {{
      font-family: var(--font-mono);
      font-size: 2.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }}

    .change-tag {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      font-family: var(--font-mono);
    }}

    .change-tag.bullish {{
      background: var(--bullish-bg);
      color: var(--bullish);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }}

    .change-tag.bearish {{
      background: var(--bearish-bg);
      color: var(--bearish);
      border: 1px solid rgba(239, 68, 68, 0.25);
    }}

    .change-tag.neutral {{
      background: rgba(156, 163, 175, 0.1);
      color: var(--text-muted);
    }}

    .meta-time {{
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-top: 4px;
    }}

    /* KPI Grid */
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }}

    .kpi-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 18px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
    }}

    .kpi-card:hover {{
      transform: translateY(-2px);
      border-color: var(--border-accent);
      background-color: var(--bg-card-hover);
    }}

    .kpi-label {{
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}

    .kpi-value {{
      font-size: 1.35rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: #ffffff;
    }}

    .kpi-subtext {{
      font-size: 0.78rem;
      color: var(--text-dim);
    }}

    /* Range Progress Bar */
    .range-bar-wrapper {{
      margin-top: 6px;
    }}

    .range-bar-track {{
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      position: relative;
      overflow: hidden;
    }}

    .range-bar-fill {{
      height: 100%;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
      border-radius: 999px;
    }}

    .range-labels {{
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--text-dim);
      font-family: var(--font-mono);
      margin-top: 4px;
    }}

    /* Main Chart Card */
    .chart-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-lg);
    }}

    .chart-header {{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      gap: 12px;
    }}

    .chart-title {{
      font-size: 1.2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffffff;
    }}

    .chart-actions {{
      display: flex;
      gap: 8px;
      align-items: center;
    }}

    .btn-toggle {{
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }}

    .btn-toggle:hover {{
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.25);
    }}

    .btn-toggle.active {{
      background: var(--accent-blue);
      color: #ffffff;
      border-color: var(--accent-blue);
    }}

    .chart-canvas-container {{
      position: relative;
      width: 100%;
      height: 380px;
    }}

    .volume-canvas-container {{
      position: relative;
      width: 100%;
      height: 110px;
      margin-top: 14px;
    }}

    /* Multi-stock comparative section */
    .compare-section {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 28px;
      margin-bottom: 24px;
    }}

    .compare-table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }}

    .compare-table th {{
      text-align: left;
      padding: 14px 12px;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
    }}

    .compare-table td {{
      padding: 16px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.92rem;
    }}

    /* Two-column details grid */
    .details-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }}

    @media (max-width: 900px) {{
      .details-grid {{
        grid-template-columns: 1fr;
      }}
      .header {{
        flex-direction: column;
        align-items: flex-start;
        gap: 18px;
      }}
      .header-right {{
        align-items: flex-start;
      }}
    }}

    .panel-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 28px;
    }}

    .panel-title {{
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 14px;
    }}

    .metric-table {{
      width: 100%;
      border-collapse: collapse;
    }}

    .metric-table tr {{
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }}

    .metric-table tr:last-child {{
      border-bottom: none;
    }}

    .metric-table td {{
      padding: 11px 4px;
      font-size: 0.9rem;
    }}

    .metric-table td.label {{
      color: var(--text-muted);
      font-weight: 500;
    }}

    .metric-table td.val {{
      text-align: right;
      font-family: var(--font-mono);
      font-weight: 600;
      color: #ffffff;
    }}

    /* Target Price Gauge */
    .target-gauge-box {{
      background: var(--bg-card-subtle);
      border-radius: 14px;
      padding: 18px;
      margin-top: 18px;
      border: 1px solid var(--border-color);
    }}

    .target-gauge-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }}

    .consensus-badge {{
      padding: 4px 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.8rem;
      text-transform: uppercase;
    }}

    .consensus-buy {{
      background: var(--bullish-bg);
      color: var(--bullish);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }}

    .consensus-hold {{
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }}

    .consensus-sell {{
      background: var(--bearish-bg);
      color: var(--bearish);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }}

    .company-summary-text {{
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.75;
      max-height: 250px;
      overflow-y: auto;
      padding-right: 8px;
    }}

    .footer {{
      text-align: center;
      padding: 28px;
      color: var(--text-dim);
      font-size: 0.82rem;
      border-top: 1px solid var(--border-color);
    }}
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Top Header -->
    <header class="header">
      <div class="header-left">
        <div class="badge-row">
          <span class="badge badge-ticker">{primary['symbol']}</span>
          <span class="badge badge-sector">{primary['profile']['sector']}</span>
          <span class="badge badge-exchange">{primary['exchange']}</span>
        </div>
        <h1 class="company-title">{primary['display_title']}</h1>
        <div style="color: var(--text-muted); font-size: 0.92rem;">{primary['profile']['industry']} • {primary['profile']['country']}</div>
      </div>
      <div class="header-right">
        <div class="current-price">{format_currency_value(primary['current_price'], primary['currency'])}</div>
        <div class="change-tag {change_color_class}">
          <span>{change_arrow}</span>
          <span>{format_currency_value(abs(primary['price_change']) if primary['price_change'] is not None else None, primary['currency'])}</span>
          <span>({change_sign}{format_number(primary['pct_change'])}%)</span>
        </div>
        <div class="meta-time">기준일시: {primary['fetched_at']} ({primary['period'].upper()} 차트)</div>
      </div>
    </header>

    <!-- Key Performance Indicators Grid -->
    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">
          <span>시가총액</span>
          <span>🏢</span>
        </div>
        <div class="kpi-value">{primary['fundamentals']['market_cap_fmt']}</div>
        <div class="kpi-subtext">Market Capitalization</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>PER (TTM) / PBR</span>
          <span>📊</span>
        </div>
        <div class="kpi-value">{format_number(primary['fundamentals']['pe_ratio'], 1)}배</div>
        <div class="kpi-subtext">PBR: {format_number(primary['fundamentals']['pbr'], 2)}배 | Fwd PER: {format_number(primary['fundamentals']['forward_pe'], 1)}배</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>52주 최고/최저</span>
          <span>📈</span>
        </div>
        <div class="kpi-value" style="font-size: 1.08rem;">
          {format_currency_value(primary['fundamentals']['fifty_two_week_low'], primary['currency'])} - {format_currency_value(primary['fundamentals']['fifty_two_week_high'], primary['currency'])}
        </div>
        <div class="range-bar-wrapper">
          <div class="range-bar-track">
            <div class="range-bar-fill" style="width: {calculate_range_pct(primary['current_price'], primary['fundamentals']['fifty_two_week_low'], primary['fundamentals']['fifty_two_week_high'])}%;"></div>
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>목표주가 (평균)</span>
          <span>🎯</span>
        </div>
        <div class="kpi-value" style="color: var(--accent-cyan);">
          {format_currency_value(primary['analyst']['target_mean'], primary['currency'])}
        </div>
        <div class="kpi-subtext">
          {f"애널리스트 {primary['analyst']['opinions_count']}명 의견" if primary['analyst']['opinions_count'] else "컨센서스"}
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>배당수익률 (Dividend)</span>
          <span>💰</span>
        </div>
        <div class="kpi-value">
          {format_number(primary['fundamentals']['dividend_yield'])}%
        </div>
        <div class="kpi-subtext">Beta: {format_number(primary['fundamentals']['beta'], 2)}</div>
      </div>
    </section>

    <!-- Main Interactive Chart -->
    <section class="chart-card">
      <div class="chart-header">
        <div class="chart-title">
          <span>📉 {primary['display_title']} 주가 변동 추이 ({primary['period'].upper()})</span>
        </div>
        <div class="chart-actions">
          <button class="btn-toggle active" id="btnLine">라인 차트</button>
          <button class="btn-toggle" id="btnSma">20일 이동평균 (SMA)</button>
        </div>
      </div>
      <div class="chart-canvas-container">
        <canvas id="stockPriceChart"></canvas>
      </div>
      <div class="volume-canvas-container">
        <canvas id="volumeChart"></canvas>
      </div>
    </section>

    <!-- Multi-stock comparison (if applicable) -->
    {f'''
    <section class="compare-section">
      <h2 class="panel-title">⚖️ 종목 비교 분석</h2>
      <div style="margin-bottom: 20px;">
        <canvas id="multiCompareChart" style="max-height: 320px; width: 100%;"></canvas>
      </div>
      <table class="compare-table">
        <thead>
          <tr>
            <th>종목명 (티커)</th>
            <th>현재가</th>
            <th>전일 대비</th>
            <th>기간 등락률 ({primary['period'].upper()})</th>
            <th>시가총액</th>
            <th>PER</th>
            <th>PBR</th>
          </tr>
        </thead>
        <tbody>
          {"".join([f"""
          <tr>
            <td><strong>{s['display_title']}</strong> <span style="color:var(--text-muted); font-size:0.82rem;">({s['symbol']})</span></td>
            <td style="font-family:var(--font-mono); font-weight:600;">{format_currency_value(s['current_price'], s['currency'])}</td>
            <td class="{'bullish' if (s['pct_change'] or 0) > 0 else ('bearish' if (s['pct_change'] or 0) < 0 else 'neutral')}" style="font-family:var(--font-mono);">
              {('+' if (s['pct_change'] or 0) > 0 else '')}{format_number(s['pct_change'])}%
            </td>
            <td class="{'bullish' if (s['period_pct_change'] or 0) > 0 else ('bearish' if (s['period_pct_change'] or 0) < 0 else 'neutral')}" style="font-family:var(--font-mono); font-weight:700;">
              {('+' if (s['period_pct_change'] or 0) > 0 else '')}{format_number(s['period_pct_change'])}%
            </td>
            <td style="font-family:var(--font-mono);">{s['fundamentals']['market_cap_fmt']}</td>
            <td style="font-family:var(--font-mono);">{format_number(s['fundamentals']['pe_ratio'], 1)}배</td>
            <td style="font-family:var(--font-mono);">{format_number(s['fundamentals']['pbr'], 2)}배</td>
          </tr>
          """ for s in data_list])}
        </tbody>
      </table>
    </section>
    ''' if is_multi else ''}

    <!-- Detailed Valuation & Company Profile Grid -->
    <div class="details-grid">
      <!-- Valuation & Financial Metrics -->
      <section class="panel-card">
        <h2 class="panel-title">📋 주요 펀더멘털 & 지표</h2>
        <table class="metric-table">
          <tr>
            <td class="label">시가 (Open)</td>
            <td class="val">{format_currency_value(primary['fundamentals']['open'], primary['currency'])}</td>
          </tr>
          <tr>
            <td class="label">전일 종가 (Prev Close)</td>
            <td class="val">{format_currency_value(primary['previous_close'], primary['currency'])}</td>
          </tr>
          <tr>
            <td class="label">일중 변동폭 (Day Range)</td>
            <td class="val">{format_currency_value(primary['fundamentals']['day_low'], primary['currency'])} - {format_currency_value(primary['fundamentals']['day_high'], primary['currency'])}</td>
          </tr>
          <tr>
            <td class="label">거래량 (Volume)</td>
            <td class="val">{format_number(primary['fundamentals']['volume'], 0)}</td>
          </tr>
          <tr>
            <td class="label">평균 거래량 (Avg Volume)</td>
            <td class="val">{format_number(primary['fundamentals']['avg_volume'], 0)}</td>
          </tr>
          <tr>
            <td class="label">주당순이익 (EPS / Fwd EPS)</td>
            <td class="val">{format_currency_value(primary['fundamentals']['eps'], primary['currency'])} / {format_currency_value(primary['fundamentals']['forward_eps'], primary['currency'])}</td>
          </tr>
          <tr>
            <td class="label">50일 이동평균선 (50D MA)</td>
            <td class="val">{format_currency_value(primary['fundamentals']['fifty_day_avg'], primary['currency'])}</td>
          </tr>
          <tr>
            <td class="label">200일 이동평균선 (200D MA)</td>
            <td class="val">{format_currency_value(primary['fundamentals']['two_hundred_day_avg'], primary['currency'])}</td>
          </tr>
        </table>

        <!-- Analyst Gauge -->
        <div class="target-gauge-box">
          <div class="target-gauge-header">
            <span style="font-weight:600; font-size:0.9rem;">애널리스트 투자의견</span>
            <span class="consensus-badge consensus-{get_recommendation_class(primary['analyst']['recommendation'])}">
              {get_recommendation_label(primary['analyst']['recommendation'])}
            </span>
          </div>
          <div class="range-labels">
            <span>최저: {format_currency_value(primary['analyst']['target_low'], primary['currency'])}</span>
            <span>평균: {format_currency_value(primary['analyst']['target_mean'], primary['currency'])}</span>
            <span>최고: {format_currency_value(primary['analyst']['target_high'], primary['currency'])}</span>
          </div>
        </div>
      </section>

      <!-- Company Profile -->
      <section class="panel-card">
        <h2 class="panel-title">🏢 기업 개요 및 비즈니스</h2>
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <strong style="color:#ffffff;">웹사이트:</strong> 
            {f'<a href="{primary["profile"]["website"]}" target="_blank" style="color:var(--accent-blue); text-decoration:none;">{primary["profile"]["website"]}</a>' if primary["profile"]["website"] else "N/A"}
          </div>
          <div>
            <strong style="color:#ffffff;">임직원 수:</strong> {format_number(primary['profile']['employees'], 0)}명
          </div>
          <div>
            <strong style="color:#ffffff;">사업 요약:</strong>
            <p class="company-summary-text" style="margin-top: 8px;">
              {primary['profile']['summary'] or "기업 사업 설명 데이터가 제공되지 않았습니다."}
            </p>
          </div>
        </div>
      </section>
    </div>

    <footer class="footer">
      Generated automatically by Antigravity Stock Skill (powered by yfinance) • {primary['fetched_at']}
    </footer>

  </div>

  <!-- Chart.js Script Logic -->
  <script>
    const stockData = {chart_payload};
    const primaryStock = stockData[0];
    const history = primaryStock.history || [];

    const labels = history.map(item => item.date);
    const closePrices = history.map(item => item.close);
    const volumes = history.map(item => item.volume);

    // Calculate 20-day Simple Moving Average
    function calculateSMA(data, window = 20) {{
      const sma = [];
      for (let i = 0; i < data.length; i++) {{
        if (i < window - 1) {{
          sma.push(null);
        }} else {{
          let sum = 0;
          for (let j = 0; j < window; j++) {{
            sum += data[i - j];
          }}
          sma.push(Number((sum / window).toFixed(2)));
        }}
      }}
      return sma;
    }}

    const sma20 = calculateSMA(closePrices, 20);

    // Color gradient for price chart
    const ctxPrice = document.getElementById('stockPriceChart').getContext('2d');
    const gradient = ctxPrice.createLinearGradient(0, 0, 0, 380);
    const isBull = (primaryStock.period_pct_change || 0) >= 0;
    
    if (isBull) {{
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    }} else {{
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    }}

    const priceChart = new Chart(ctxPrice, {{
      type: 'line',
      data: {{
        labels: labels,
        datasets: [
          {{
            label: `${{primaryStock.display_title}} 주가 (${{primaryStock.currency}})`,
            data: closePrices,
            borderColor: isBull ? '#10b981' : '#ef4444',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.15,
            pointRadius: labels.length > 50 ? 0 : 2,
            pointHoverRadius: 6
          }},
          {{
            label: '20일 이동평균 (SMA)',
            data: sma20,
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: false,
            pointRadius: 0,
            hidden: true
          }}
        ]
      }},
      options: {{
        responsive: true,
        maintainAspectRatio: false,
        interaction: {{
          mode: 'index',
          intersect: false,
        }},
        plugins: {{
          legend: {{
            labels: {{
              color: '#9ca3af',
              font: {{ family: 'Inter', size: 12 }}
            }}
          }},
          tooltip: {{
            backgroundColor: '#1e293b',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12
          }}
        }},
        scales: {{
          x: {{
            grid: {{ color: 'rgba(255, 255, 255, 0.04)' }},
            ticks: {{ color: '#64748b', maxTicksLimit: 10, font: {{ family: 'JetBrains Mono', size: 11 }} }}
          }},
          y: {{
            grid: {{ color: 'rgba(255, 255, 255, 0.04)' }},
            ticks: {{ color: '#64748b', font: {{ family: 'JetBrains Mono', size: 11 }} }}
          }}
        }}
      }}
    }});

    // Volume Chart
    const ctxVol = document.getElementById('volumeChart').getContext('2d');
    const volumeChart = new Chart(ctxVol, {{
      type: 'bar',
      data: {{
        labels: labels,
        datasets: [{{
          label: '거래량 (Volume)',
          data: volumes,
          backgroundColor: 'rgba(59, 130, 246, 0.45)',
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderRadius: 3
        }}]
      }},
      options: {{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {{
          legend: {{ display: false }},
          tooltip: {{
            backgroundColor: '#1e293b',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            padding: 8
          }}
        }},
        scales: {{
          x: {{ display: false }},
          y: {{
            grid: {{ color: 'rgba(255, 255, 255, 0.04)' }},
            ticks: {{ color: '#64748b', maxTicksLimit: 3, font: {{ family: 'JetBrains Mono', size: 10 }} }}
          }}
        }}
      }}
    }});

    // Toggle SMA
    const btnSma = document.getElementById('btnSma');
    btnSma.addEventListener('click', () => {{
      const smaDataset = priceChart.data.datasets[1];
      smaDataset.hidden = !smaDataset.hidden;
      btnSma.classList.toggle('active', !smaDataset.hidden);
      priceChart.update();
    }});

    // Multi-stock compare chart if multi stocks exist
    if (stockData.length > 1 && document.getElementById('multiCompareChart')) {{
      const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
      const multiDatasets = stockData.map((item, idx) => {{
        const h = item.history || [];
        const basePrice = h.length > 0 ? h[0].close : 1;
        const normData = h.map(pt => Number((((pt.close - basePrice) / basePrice) * 100).toFixed(2)));
        return {{
          label: `${{item.display_title}} (%)`,
          data: normData,
          borderColor: palette[idx % palette.length],
          backgroundColor: 'transparent',
          borderWidth: 2.2,
          pointRadius: 0,
          tension: 0.15
        }};
      }});

      const ctxMulti = document.getElementById('multiCompareChart').getContext('2d');
      new Chart(ctxMulti, {{
        type: 'line',
        data: {{
          labels: labels,
          datasets: multiDatasets
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ labels: {{ color: '#9ca3af', font: {{ family: 'Inter', size: 12 }} }} }},
            tooltip: {{
              callbacks: {{
                label: (ctx) => `${{ctx.dataset.label}}: ${{ctx.parsed.y > 0 ? '+' : ''}}${{ctx.parsed.y}}%`
              }}
            }}
          }},
          scales: {{
            x: {{ grid: {{ color: 'rgba(255, 255, 255, 0.04)' }}, ticks: {{ color: '#64748b' }} }},
            y: {{
              grid: {{ color: 'rgba(255, 255, 255, 0.04)' }},
              ticks: {{
                color: '#64748b',
                callback: (val) => `${{val > 0 ? '+' : ''}}${{val}}%`
              }}
            }}
          }}
        }}
      }});
    }}
  </script>
</body>
</html>
"""
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    return output_file


def print_cli_summary(data):
    """Prints a beautiful markdown-friendly terminal output."""
    curr = data["currency"]
    pct = data["pct_change"] or 0
    sign = "+" if pct > 0 else ""
    arrow = "▲" if pct > 0 else ("▼" if pct < 0 else "•")
    
    print("\n" + "=" * 65)
    print(f" 📈 {data['display_title']} ({data['symbol']}) - {data['exchange']}")
    print("=" * 65)
    print(f" 현재가:       {format_currency_value(data['current_price'], curr)} {arrow} {format_currency_value(abs(data['price_change']) if data['price_change'] is not None else None, curr)} ({sign}{format_number(pct)}%)")
    print(f" 전일 종가:     {format_currency_value(data['previous_close'], curr)}")
    print(f" 시가총액:     {data['fundamentals']['market_cap_fmt']}")
    print(f" 52주 범위:    {format_currency_value(data['fundamentals']['fifty_two_week_low'], curr)} ~ {format_currency_value(data['fundamentals']['fifty_two_week_high'], curr)}")
    print(f" PER / PBR:    {format_number(data['fundamentals']['pe_ratio'])}배 / {format_number(data['fundamentals']['pbr'])}배")
    print(f" 배당수익률:   {format_number(data['fundamentals']['dividend_yield'])}%")
    if data['analyst']['target_mean']:
        print(f" 목표주가(평균): {format_currency_value(data['analyst']['target_mean'], curr)} (투자의견: {get_recommendation_label(data['analyst']['recommendation'])})")
    print("-" * 65)
    if data.get("period_pct_change") is not None:
        p_sign = "+" if data["period_pct_change"] > 0 else ""
        print(f" {data['period'].upper()} 기간 변동: {p_sign}{format_number(data['period_pct_change'])}% (최고: {format_currency_value(data['period_high'], curr)}, 최저: {format_currency_value(data['period_low'], curr)})")
    print("=" * 65 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Antigravity Stock Analysis CLI (Powered by yfinance)")
    parser.add_argument("--symbol", "-s", type=str, help="Stock ticker or company name (e.g. AAPL, 삼성전자, NVDA, 005930.KS)")
    parser.add_argument("--compare", "-c", type=str, help="Comma-separated list of symbols to compare (e.g. AAPL,MSFT,NVDA or 삼성전자,SK하이닉스)")
    parser.add_argument("--period", "-p", type=str, default="1mo", choices=["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "ytd", "max"], help="Historical data period (default: 1mo)")
    parser.add_argument("--interval", "-i", type=str, default="1d", choices=["1m", "5m", "15m", "30m", "60m", "1h", "1d", "1wk", "1mo"], help="Data interval (default: 1d)")
    parser.add_argument("--json", action="store_true", help="Output result as JSON")
    parser.add_argument("--html", type=str, help="Generate interactive HTML report file (e.g. --html stock_report.html)")
    
    args = parser.parse_args()

    if not args.symbol and not args.compare:
        parser.print_help()
        sys.exit(1)

    queries = []
    if args.compare:
        queries = [q.strip() for q in args.compare.split(",") if q.strip()]
    elif args.symbol:
        queries = [args.symbol.strip()]

    results = []
    for q in queries:
        sym, display = resolve_ticker(q)
        data = get_stock_data(sym, display, period=args.period, interval=args.interval)
        results.append(data)

    if args.json:
        print(json.dumps(results if len(results) > 1 else results[0], ensure_ascii=False, indent=2))
        return

    # Print summary to console
    for res in results:
        print_cli_summary(res)

    # HTML generation if requested
    if args.html:
        html_path = generate_html_report(results, output_file=args.html)
        abs_path = os.path.abspath(html_path)
        print(f"[HTML 보고서 생성 완료] {abs_path}")


if __name__ == "__main__":
    main()
