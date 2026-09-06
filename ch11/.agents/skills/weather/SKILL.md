---
name: weather
description: Provides real-time weather, forecasts, temperature, precipitation, and air quality for any city or coordinates using Open-Meteo, and generates visual HTML weather reports. Use when the user asks about weather, forecasts, climate conditions, or temperature.
---

# Weather Forecast Skill (Open-Meteo)

This skill enables the agent to query real-time weather, multi-day forecasts (up to 16 days), hourly forecasts, and air quality (PM2.5, PM10, AQI) for any city or geographical coordinates worldwide using Open-Meteo, and produce a beautifully styled visual HTML weather report.

## When to use this skill

- The user asks for current weather conditions in a specific city or region (e.g., "오늘 서울 날씨 어때?", "What's the weather in Tokyo?").
- The user asks for a weather forecast for upcoming days or the weekend (e.g., "이번 주말 부산 날씨 알려줘", "3-day forecast for New York").
- The user requests hourly temperature, rain/snow probabilities, or air quality (fine dust / PM2.5).
- The user provides latitude and longitude coordinates and asks for weather details.
- The user requests a visual report or comprehensive dashboard of weather conditions.

## Quick CLI Reference

Always use the bundled script [get_weather.py](file:///d:/wsh/vibe-workspace/ch11/.agents/skills/weather/scripts/get_weather.py). Run `--help` if you need to check available parameters:

```bash
python .agents/skills/weather/scripts/get_weather.py --help
```

### Common Command Examples

1. **Current weather + HTML report**:
   ```bash
   python .agents/skills/weather/scripts/get_weather.py --city "서울" --current --html weather_report.html
   ```

2. **3-day (or N-day) forecast with Air Quality + HTML report**:
   ```bash
   python .agents/skills/weather/scripts/get_weather.py --city "부산" --days 3 --air-quality --html weather_report.html
   ```

3. **Forecast including hourly breakdown, air quality, and HTML report**:
   ```bash
   python .agents/skills/weather/scripts/get_weather.py --city "Tokyo" --days 3 --hourly --air-quality --html tokyo_weather.html
   ```

4. **Weather by Latitude / Longitude**:
   ```bash
   python .agents/skills/weather/scripts/get_weather.py --lat 37.5665 --lon 126.9780 --days 5 --html weather_report.html
   ```

5. **JSON output for programmatic inspection**:
   ```bash
   python .agents/skills/weather/scripts/get_weather.py --city "London" --json
   ```

## Decision Tree

```
User Query
├── Specific City Name (e.g., "서울", "New York", "Paris")
│   ├── Current Weather ──> `get_weather.py --city "<city>" --current --html weather_report.html`
│   ├── N-day Forecast (Default 3~7 days) ──> `get_weather.py --city "<city>" --days <N> --air-quality --html weather_report.html`
│   └── Includes Hourly / Detailed ──> `get_weather.py --city "<city>" --days <N> --hourly --air-quality --html weather_report.html`
│
└── Geographic Coordinates (Latitude / Longitude)
    └── Run `get_weather.py --lat <lat> --lon <lon> [--days <N>] --html weather_report.html`
```

## Resources and WMO Codes

The skill includes a WMO weather code mapping file at [wmo_codes.json](file:///d:/wsh/vibe-workspace/ch11/.agents/skills/weather/resources/wmo_codes.json) for mapping weather status codes (0~99) to Korean/English descriptions and emojis.

- `0`: 맑음 ☀️ (Clear sky)
- `1~3`: 대체로 맑음/구름 조금/흐림 🌤️ ⛅ ☁️
- `45, 48`: 안개 🌫️ (Fog)
- `51~67`: 이슬비/비 🌦️ 🌧️ (Rain)
- `71~77`: 눈 ❄️ 🌨️ (Snow)
- `80~82`: 소나기 🌦️ ⛈️ (Showers)
- `95~99`: 뇌우 ⛈️ (Thunderstorm)

## Response Formatting & HTML Report Guidelines

When fulfilling user weather requests:
1. **Always generate an HTML report**: Execute `get_weather.py` with the `--html` flag (e.g. `--html weather_report.html` or `<city>_weather_report.html`).
2. **Chat Response Structure**:
   - **Summary First**: State the location, current temperature, and general condition with an emoji (e.g. ☀️ 맑음, 🌧️ 비).
   - **Key Details**: Highlight high/low temperatures, precipitation probability, humidity, and fine dust / air quality.
   - **Actionable Advice**: If rain, high UV index, or bad air quality is forecast, provide practical tips (e.g. "우산을 챙기세요", "보건용 마스크를 권장합니다").
   - **HTML Report Link**: Always provide a clickable markdown file link to the generated HTML report for the user to open in their browser (e.g., `[📄 상세 HTML 날씨 보고서 확인하기](file:///path/to/weather_report.html)`).
