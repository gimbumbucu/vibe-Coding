---
name: stock
description: Fetches real-time stock prices, company fundamentals, analyst targets, and historical chart data for Korean (KOSPI/KOSDAQ) and global stocks using yfinance. Generates interactive HTML analysis reports with Chart.js. Use when the user asks about stock prices, market caps, PER/PBR, target prices, investment ratings, stock performance, comparisons between stocks, or requests a visual stock analysis report.
---

# Stock Analysis Skill (yfinance 기반 주가 조회 및 분석)

This skill enables the agent to query real-time stock prices, historical data, company fundamentals, analyst consensus, and generate visually stunning interactive HTML analysis reports for any listed stock worldwide (including Korean KOSPI/KOSDAQ and US/global markets).

## When to use this skill

- The user asks for a stock price or quote (e.g., "애플 주가 얼마야?", "NVDA 현재가 알려줘", "삼성전자 주가 검색해줘")
- The user asks for stock analysis, fundamentals, or valuation metrics (e.g., "엔비디아 PER 얼마야?", "삼성전자 시가총액 알려줘")
- The user wants to see stock performance over a period (e.g., "테슬라 3개월 주가 추이 보여줘", "카카오 올해 주가 변동률")
- The user requests a comparison of multiple stocks (e.g., "애플, 마이크로소프트, 엔비디아 주가 비교해줘", "삼성전자 vs SK하이닉스 분석")
- The user asks about analyst target prices, investment ratings, or buy/sell opinions (e.g., "AAPL 목표주가 얼마야?", "증권사 투자의견 알려줘")
- The user requests a visual report or dashboard (e.g., "주가 분석 보고서 HTML로 만들어줘", "NVDA 주가 차트 리포트 생성")
- The user mentions specific stock-related terms: 주가, 시세, 종목, 코스피, 코스닥, 나스닥, 주식 분석, 배당, 이동평균, 52주, 기업 가치

## Script Reference

Always use the bundled script [get_stock.py](file:///d:/wsh/vibe-workspace/ch11/.agents/skills/stock/scripts/get_stock.py). Run `--help` to check available options:

```bash
python .agents/skills/stock/scripts/get_stock.py --help
```

## Quick CLI Reference

### Common Command Examples

**1. 단일 종목 조회 (한글 이름 또는 티커)**
```bash
# 한글 종목명으로 조회
python .agents/skills/stock/scripts/get_stock.py --symbol "삼성전자" --period 3mo

# 영문 티커로 조회
python .agents/skills/stock/scripts/get_stock.py --symbol NVDA --period 1mo

# 6자리 한국 종목 코드로 조회
python .agents/skills/stock/scripts/get_stock.py --symbol 005930 --period 6mo
```

**2. 단일 종목 HTML 분석 보고서 생성**
```bash
python .agents/skills/stock/scripts/get_stock.py --symbol "엔비디아" --period 6mo --html nvidia_report.html
python .agents/skills/stock/scripts/get_stock.py --symbol TSLA --period 1y --html tesla_report.html
python .agents/skills/stock/scripts/get_stock.py --symbol "삼성전자" --period 3mo --html samsung_report.html
```

**3. 다중 종목 비교 분석 + HTML 보고서**
```bash
python .agents/skills/stock/scripts/get_stock.py --compare "AAPL,MSFT,NVDA" --period 3mo --html compare_report.html
python .agents/skills/stock/scripts/get_stock.py --compare "삼성전자,SK하이닉스" --period 6mo --html chips_compare.html
python .agents/skills/stock/scripts/get_stock.py --compare "NVDA,005930.KS,TSLA" --period 1mo --html mixed_compare.html
```

**4. JSON 출력 (프로그래밍 처리용)**
```bash
python .agents/skills/stock/scripts/get_stock.py --symbol AAPL --json
```

**5. 기간(--period) 및 간격(--interval) 조합 예시**
```bash
# 최근 1일 분봉 데이터
python .agents/skills/stock/scripts/get_stock.py --symbol NVDA --period 1d --interval 5m --html nvda_intraday.html

# 1년 주봉 데이터
python .agents/skills/stock/scripts/get_stock.py --symbol TSLA --period 1y --interval 1wk --html tsla_weekly.html

# 5년 월봉 데이터
python .agents/skills/stock/scripts/get_stock.py --symbol AAPL --period 5y --interval 1mo --html aapl_5yr.html
```

## Ticker Symbol Guide

### 한국 주식 (Korean Stocks)

| 시장 | 접미사 | 예시 |
|------|--------|------|
| 코스피 (KOSPI) | `.KS` | `005930.KS` (삼성전자), `000660.KS` (SK하이닉스) |
| 코스닥 (KOSDAQ) | `.KQ` | `247540.KQ` (에코프로비엠), `086520.KQ` (에코프로) |

**지원하는 한글 종목명** (`korean_stocks.json` 참조):
- 코스피 대형주: 삼성전자, SK하이닉스, LG에너지솔루션, 현대차, 기아, NAVER, 카카오, 포스코홀딩스, LG화학 등
- 코스닥: 에코프로비엠, 에코프로, HLB, 알테오젠, 레인보우로보틱스 등
- 미국/해외: 애플, 엔비디아, 테슬라, 마이크로소프트, 메타, 구글(알파벳), 아마존, AMD, 넷플릭스, 팔란티어 등

### 미국 주식 (US Stocks)
Direct ticker symbols: `AAPL`, `NVDA`, `TSLA`, `MSFT`, `GOOGL`, `META`, `AMZN`, `AMD`, `PLTR`, `SMCI`

## Decision Tree

```
User Query
├── 단일 종목 조회
│   ├── 종목명(한글/영문) or 티커 --symbol 지정
│   ├── 기간 선택: 기본 1mo, 상세 분석 시 3mo~1y
│   └── HTML 보고서 필요 시 → --html <파일명>.html
│
├── 다중 종목 비교
│   ├── --compare "종목1,종목2,종목3" (쉼표로 구분)
│   └── HTML 보고서 필요 시 → --html compare_report.html
│
└── 기간(--period) 선택 가이드
    ├── 오늘 / 당일 변동 → 1d (--interval 5m or 30m)
    ├── 최근 1주 → 5d
    ├── 최근 1개월 → 1mo (기본값)
    ├── 최근 3개월 → 3mo
    ├── 최근 6개월 → 6mo
    ├── 최근 1년 → 1y
    ├── 올해 → ytd
    └── 장기 (2~5년, 상장 이후 전체) → 2y, 5y, max
```

## Response Formatting Guidelines

주가 조회 요청을 처리할 때:

1. **항상 HTML 보고서 생성**: `--html <적절한파일명>.html` 플래그를 사용하여 실행
   - 종목명을 반영한 파일명 사용 (예: `nvda_report.html`, `samsung_report.html`)
   - 비교 분석 시 (예: `compare_aapl_msft.html`)

2. **채팅 응답 구조**:
   - **요약 먼저**: 종목명, 현재가, 전일 대비 변동률 및 방향 (예: 📈 **NVDA** $225.16 ▲ +0.06%)
   - **핵심 지표 강조**: 시가총액, PER/PBR, 52주 범위, 목표주가, 투자의견
   - **기간 성과**: 조회된 기간의 등락률 및 최고/최저가
   - **HTML 링크 제공**: 생성된 HTML 보고서 파일 링크를 항상 제공

3. **HTML 파일 링크 포맷**:
   ```markdown
   [📊 {종목명} 주가 분석 보고서 열기](file:///절대경로/report.html)
   ```

4. **여러 종목 비교 시**: 표 형식으로 핵심 지표 비교 후 HTML 리포트 링크 제공

## Dependencies

The script requires:
- `yfinance>=1.6.0` (installed globally via `pip install yfinance`)
- `pandas>=1.3.0` (installed with yfinance)

If missing, run:
```bash
pip install yfinance pandas
```
