#!/usr/bin/env python3
"""
Open-Meteo Weather CLI Helper Script
Fetches weather forecasts, current conditions, and air quality using Open-Meteo API.
"""

import sys
import os
import json
import argparse
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime

# Configure UTF-8 for Windows console output if supported
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Load WMO codes if available
WMO_CODES_PATH = os.path.join(os.path.dirname(__file__), "..", "resources", "wmo_codes.json")
WMO_DICT = {}
if os.path.exists(WMO_CODES_PATH):
    try:
        with open(WMO_CODES_PATH, "r", encoding="utf-8") as f:
            WMO_DICT = json.load(f)
    except Exception:
        pass

# Load Korean city mapping if available
KOREAN_CITIES_PATH = os.path.join(os.path.dirname(__file__), "..", "resources", "korean_cities.json")
KOREAN_CITIES = {}
if os.path.exists(KOREAN_CITIES_PATH):
    try:
        with open(KOREAN_CITIES_PATH, "r", encoding="utf-8") as f:
            KOREAN_CITIES = json.load(f)
    except Exception:
        pass


def get_wmo_info(code, lang="ko"):
    code_str = str(code)
    if code_str in WMO_DICT:
        entry = WMO_DICT[code_str]
        desc = entry.get(lang, entry.get("ko", "알 수 없음"))
        emoji = entry.get("emoji", "🌤️")
        return desc, emoji
    return f"코드 {code}", "🌤️"


def fetch_url_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Antigravity-WeatherSkill/1.0 (open-meteo-client)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = response.read().decode("utf-8")
                return json.loads(data)
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"HTTP Error: {e.code} - {e.reason}\n")
        return None
    except urllib.error.URLError as e:
        sys.stderr.write(f"URL Error: {e.reason}\n")
        return None
    except Exception as e:
        sys.stderr.write(f"Error fetching data: {e}\n")
        return None


def geocode_city(city_name):
    clean_name = city_name.strip()
    query_name = KOREAN_CITIES.get(clean_name, clean_name)
    encoded = urllib.parse.quote(query_name)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded}&count=1&format=json"
    data = fetch_url_json(url)
    if data and "results" in data and len(data["results"]) > 0:
        res = data["results"][0]
        display_name = clean_name if clean_name in KOREAN_CITIES else res.get("name")
        return {
            "name": display_name,
            "original_name": res.get("name"),
            "latitude": res.get("latitude"),
            "longitude": res.get("longitude"),
            "country": res.get("country", ""),
            "admin1": res.get("admin1", ""),
            "timezone": res.get("timezone", "auto")
        }
    return None


def fetch_weather(lat, lon, timezone="auto", days=3, hourly=False):
    params = [
        f"latitude={lat}",
        f"longitude={lon}",
        "current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure",
        "daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset",
        f"timezone={urllib.parse.quote(timezone)}",
        f"forecast_days={days}"
    ]
    if hourly:
        params.append("hourly=temperature_2m,precipitation_probability,weather_code,relative_humidity_2m")

    url = f"https://api.open-meteo.com/v1/forecast?{'&'.join(params)}"
    return fetch_url_json(url)


def fetch_air_quality(lat, lon, timezone="auto"):
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,european_aqi,us_aqi&timezone={urllib.parse.quote(timezone)}"
    return fetch_url_json(url)


def format_text_output(location_info, weather_data, air_quality_data=None, lang="ko", current_only=False, show_hourly=False):
    lines = []
    loc_title = location_info.get("name", "요청 위치")
    country = location_info.get("country", "")
    admin1 = location_info.get("admin1", "")
    full_loc = ", ".join([p for p in [loc_title, admin1, country] if p])

    lines.append(f"📍 위치: {full_loc} (위도: {location_info['latitude']:.2f}, 경도: {location_info['longitude']:.2f})")
    lines.append(f"🕒 타임존: {weather_data.get('timezone', 'UTC')}")
    lines.append("-" * 50)

    # Current Weather
    current = weather_data.get("current", {})
    if current:
        w_code = current.get("weather_code", 0)
        desc, emoji = get_wmo_info(w_code, lang)
        temp = current.get("temperature_2m", "N/A")
        app_temp = current.get("apparent_temperature", "N/A")
        humidity = current.get("relative_humidity_2m", "N/A")
        wind_speed = current.get("wind_speed_10m", "N/A")
        wind_dir = current.get("wind_direction_10m", "N/A")
        precip = current.get("precipitation", 0)

        lines.append(f"【 현재 날씨 】")
        lines.append(f"• 상태: {emoji} {desc}")
        lines.append(f"• 기온: {temp}°C (체감 온도: {app_temp}°C)")
        lines.append(f"• 습도: {humidity}%")
        lines.append(f"• 풍속: {wind_speed} km/h (풍향: {wind_dir}°)")
        lines.append(f"• 현재 강수량: {precip} mm")

    # Air Quality
    if air_quality_data and "current" in air_quality_data:
        aq = air_quality_data["current"]
        pm2_5 = aq.get("pm2_5", "N/A")
        pm10 = aq.get("pm10", "N/A")
        us_aqi = aq.get("us_aqi", "N/A")
        lines.append("")
        lines.append(f"【 대기질 (Air Quality) 】")
        lines.append(f"• 초미세먼지 (PM2.5): {pm2_5} µg/m³")
        lines.append(f"• 미세먼지 (PM10): {pm10} µg/m³")
        lines.append(f"• 통합 대기질 지수 (US AQI): {us_aqi}")

    if current_only:
        return "\n".join(lines)

    # Daily Forecast
    daily = weather_data.get("daily", {})
    if daily and "time" in daily:
        lines.append("")
        lines.append(f"【 일별 예보 ({len(daily['time'])}일간) 】")
        for i, d_str in enumerate(daily["time"]):
            w_code = daily["weather_code"][i]
            desc, emoji = get_wmo_info(w_code, lang)
            t_max = daily["temperature_2m_max"][i]
            t_min = daily["temperature_2m_min"][i]
            pop = daily.get("precipitation_probability_max", [None])[i]
            uv = daily.get("uv_index_max", [None])[i]
            precip_sum = daily.get("precipitation_sum", [None])[i]

            pop_str = f", 강수확률: {pop}%" if pop is not None else ""
            precip_str = f", 예상강수량: {precip_sum}mm" if precip_sum else ""
            uv_str = f", 자외선: {uv}" if uv is not None else ""

            lines.append(f"• {d_str}: {emoji} {desc: <6} | {t_min}°C ~ {t_max}°C{pop_str}{precip_str}{uv_str}")

    # Hourly Forecast (Next 24 Hours)
    if show_hourly:
        hourly = weather_data.get("hourly", {})
        if hourly and "time" in hourly:
            lines.append("")
            lines.append(f"【 시간별 예보 (향후 24시간) 】")
            now_iso = datetime.now().strftime("%Y-%m-%dT%H:00")
            count = 0
            for i, t_str in enumerate(hourly["time"]):
                if t_str >= now_iso or count > 0:
                    if count >= 24:
                        break
                    w_code = hourly["weather_code"][i]
                    desc, emoji = get_wmo_info(w_code, lang)
                    t_val = hourly["temperature_2m"][i]
                    pop = hourly.get("precipitation_probability", [None])[i]
                    pop_str = f" (강수확률 {pop}%)" if pop is not None else ""
                    time_display = t_str.replace("T", " ")
                    lines.append(f"  {time_display}: {emoji} {t_val:>4.1f}°C, {desc}{pop_str}")
                    count += 1

    return "\n".join(lines)


def get_aqi_badge(aqi):
    if aqi is None or aqi == "N/A":
        return "N/A", "#64748b", "알 수 없음"
    try:
        val = float(aqi)
        if val <= 50:
            return f"{int(val)} (좋음)", "#10b981", "Good"
        elif val <= 100:
            return f"{int(val)} (보통)", "#f59e0b", "Moderate"
        elif val <= 150:
            return f"{int(val)} (민감군 주의)", "#f97316", "Sensitive"
        elif val <= 200:
            return f"{int(val)} (나쁨)", "#ef4444", "Unhealthy"
        else:
            return f"{int(val)} (매우 나쁨)", "#8b5cf6", "Very Unhealthy"
    except (ValueError, TypeError):
        return str(aqi), "#64748b", ""


def get_pm25_badge(pm25):
    if pm25 is None or pm25 == "N/A":
        return "N/A", "#64748b", ""
    try:
        val = float(pm25)
        if val <= 15:
            return f"{val:.1f} µg/m³ (좋음)", "#10b981", "좋음"
        elif val <= 35:
            return f"{val:.1f} µg/m³ (보통)", "#3b82f6", "보통"
        elif val <= 75:
            return f"{val:.1f} µg/m³ (나쁨)", "#f97316", "나쁨"
        else:
            return f"{val:.1f} µg/m³ (매우 나쁨)", "#ef4444", "매우 나쁨"
    except (ValueError, TypeError):
        return str(pm25), "#64748b", ""


def get_pm10_badge(pm10):
    if pm10 is None or pm10 == "N/A":
        return "N/A", "#64748b", ""
    try:
        val = float(pm10)
        if val <= 30:
            return f"{val:.1f} µg/m³ (좋음)", "#10b981", "좋음"
        elif val <= 80:
            return f"{val:.1f} µg/m³ (보통)", "#3b82f6", "보통"
        elif val <= 150:
            return f"{val:.1f} µg/m³ (나쁨)", "#f97316", "나쁨"
        else:
            return f"{val:.1f} µg/m³ (매우 나쁨)", "#ef4444", "매우 나쁨"
    except (ValueError, TypeError):
        return str(pm10), "#64748b", ""


def generate_html_report(location_info, weather_data, air_quality_data=None, lang="ko", current_only=False, show_hourly=False):
    loc_title = location_info.get("name", "요청 위치")
    country = location_info.get("country", "")
    admin1 = location_info.get("admin1", "")
    full_loc = ", ".join([p for p in [loc_title, admin1, country] if p])
    lat = location_info.get("latitude", 0)
    lon = location_info.get("longitude", 0)
    tz = weather_data.get("timezone", "UTC")
    now_str = datetime.now().strftime("%Y년 %m월 %d일 %H:%M")

    current = weather_data.get("current", {})
    w_code = current.get("weather_code", 0)
    cur_desc, cur_emoji = get_wmo_info(w_code, lang)
    temp = current.get("temperature_2m", "--")
    app_temp = current.get("apparent_temperature", "--")
    humidity = current.get("relative_humidity_2m", "--")
    wind_speed = current.get("wind_speed_10m", "--")
    wind_dir = current.get("wind_direction_10m", "--")
    precip = current.get("precipitation", 0)
    pressure = current.get("surface_pressure", "--")

    # Recommendations
    tips = []
    daily = weather_data.get("daily", {})
    first_day_pop = 0
    if daily and "precipitation_probability_max" in daily and len(daily["precipitation_probability_max"]) > 0:
        first_day_pop = daily["precipitation_probability_max"][0] or 0

    if precip > 0 or first_day_pop >= 40:
        tips.append("☔ <strong>우산 지참 권장:</strong> 비 또는 강수 확률이 높아 외출 시 우산을 챙기세요.")
    elif first_day_pop >= 20:
        tips.append("🌦️ <strong>외출 안내:</strong> 약간의 강수 가능성이 있으니 일기예보를 주기적으로 확인하세요.")

    if isinstance(temp, (int, float)):
        if temp >= 30:
            tips.append("☀️ <strong>폭염/열사병 주의:</strong> 기온이 높으니 충분한 수분을 섭취하고 야외활동을 조절하세요.")
        elif temp <= 0:
            tips.append("🧣 <strong>한파/방한 대책:</strong> 영하권 날씨입니다. 따뜻한 외투와 방한용품을 착용하세요.")

    if air_quality_data and "current" in air_quality_data:
        aq = air_quality_data["current"]
        us_aqi = aq.get("us_aqi")
        if us_aqi and isinstance(us_aqi, (int, float)) and us_aqi > 100:
            tips.append("😷 <strong>마스크 착용 권장:</strong> 공기질이 좋지 않으니 외출 시 보건용 마스크를 착용하세요.")

    if not tips:
        tips.append("✨ <strong>쾌적한 날씨:</strong> 야외 활동하기에 무난한 날씨입니다. 즐거운 하루 되세요!")

    # Air Quality Card HTML
    aq_html = ""
    if air_quality_data and "current" in air_quality_data:
        aq = air_quality_data["current"]
        aqi_label, aqi_color, _ = get_aqi_badge(aq.get("us_aqi"))
        pm25_label, pm25_color, _ = get_pm25_badge(aq.get("pm2_5"))
        pm10_label, pm10_color, _ = get_pm10_badge(aq.get("pm10"))
        
        aq_html = f"""
        <div class="card aq-card">
            <div class="card-title">🍃 대기질 현황 (Air Quality)</div>
            <div class="aq-grid">
                <div class="aq-item">
                    <span class="aq-label">통합 대기질 (US AQI)</span>
                    <span class="aq-value" style="color: {aqi_color};">{aqi_label}</span>
                </div>
                <div class="aq-item">
                    <span class="aq-label">초미세먼지 (PM2.5)</span>
                    <span class="aq-value" style="color: {pm25_color};">{pm25_label}</span>
                </div>
                <div class="aq-item">
                    <span class="aq-label">미세먼지 (PM10)</span>
                    <span class="aq-value" style="color: {pm10_color};">{pm10_label}</span>
                </div>
            </div>
        </div>
        """

    # Daily Forecast HTML
    daily_html = ""
    if not current_only and daily and "time" in daily:
        day_cards = []
        for i, d_str in enumerate(daily["time"]):
            d_code = daily["weather_code"][i]
            d_desc, d_emoji = get_wmo_info(d_code, lang)
            t_max = daily["temperature_2m_max"][i]
            t_min = daily["temperature_2m_min"][i]
            pop = daily.get("precipitation_probability_max", [None])[i]
            uv = daily.get("uv_index_max", [None])[i]
            precip_sum = daily.get("precipitation_sum", [None])[i]
            sunrise = daily.get("sunrise", [None])[i]
            sunset = daily.get("sunset", [None])[i]

            sunrise_str = sunrise.split("T")[1] if sunrise and "T" in sunrise else "--:--"
            sunset_str = sunset.split("T")[1] if sunset and "T" in sunset else "--:--"

            pop_badge = f'<span class="badge badge-pop">💧 {pop}%</span>' if pop is not None else ''
            precip_badge = f'<span class="badge badge-precip">🌧️ {precip_sum}mm</span>' if precip_sum else ''
            uv_badge = f'<span class="badge badge-uv">☀️ UV {uv}</span>' if uv is not None else ''

            day_cards.append(f"""
            <div class="daily-item">
                <div class="daily-date">{d_str}</div>
                <div class="daily-condition">
                    <span class="daily-emoji">{d_emoji}</span>
                    <span class="daily-desc">{d_desc}</span>
                </div>
                <div class="daily-temp">
                    <span class="temp-min">{t_min:.1f}°</span>
                    <div class="temp-bar-bg"><div class="temp-bar-fill"></div></div>
                    <span class="temp-max">{t_max:.1f}°</span>
                </div>
                <div class="daily-meta">
                    {pop_badge}
                    {precip_badge}
                    {uv_badge}
                </div>
                <div class="sun-times">🌅 {sunrise_str} · 🌇 {sunset_str}</div>
            </div>
            """)
        
        daily_html = f"""
        <div class="card">
            <div class="card-title">📅 일별 일기예보 ({len(daily['time'])}일간)</div>
            <div class="daily-list">
                {''.join(day_cards)}
            </div>
        </div>
        """

    # Hourly Forecast HTML
    hourly_html = ""
    if show_hourly:
        hourly = weather_data.get("hourly", {})
        if hourly and "time" in hourly:
            now_iso = datetime.now().strftime("%Y-%m-%dT%H:00")
            h_cards = []
            count = 0
            for i, t_str in enumerate(hourly["time"]):
                if t_str >= now_iso or count > 0:
                    if count >= 24:
                        break
                    h_code = hourly["weather_code"][i]
                    h_desc, h_emoji = get_wmo_info(h_code, lang)
                    h_temp = hourly["temperature_2m"][i]
                    h_pop = hourly.get("precipitation_probability", [None])[i]
                    time_short = t_str.split("T")[1] if "T" in t_str else t_str
                    pop_text = f"💧 {h_pop}%" if h_pop is not None else ""

                    h_cards.append(f"""
                    <div class="hourly-item">
                        <div class="h-time">{time_short}</div>
                        <div class="h-emoji">{h_emoji}</div>
                        <div class="h-temp">{h_temp:.1f}°C</div>
                        <div class="h-pop">{pop_text}</div>
                    </div>
                    """)
                    count += 1
            
            hourly_html = f"""
            <div class="card">
                <div class="card-title">⏱️ 시간별 예보 (24시간)</div>
                <div class="hourly-scroll">
                    {''.join(h_cards)}
                </div>
            </div>
            """

    tips_html = "".join([f"<li>{tip}</li>" for tip in tips])

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{loc_title} 날씨 보고서 | Weather Report</title>
    <style>
        :root {{
            --bg-color: #0b0f19;
            --card-bg: rgba(26, 34, 53, 0.75);
            --card-border: rgba(255, 255, 255, 0.08);
            --accent: #38bdf8;
            --accent-gradient: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --radius-lg: 20px;
            --radius-md: 14px;
            --radius-sm: 8px;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
            background-color: var(--bg-color);
            background-image: radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%),
                              radial-gradient(at 100% 100%, rgba(129, 140, 248, 0.12) 0px, transparent 50%);
            background-attachment: fixed;
            color: var(--text-main);
            line-height: 1.6;
            padding: 32px 16px;
            min-height: 100vh;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }}

        header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
            gap: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--card-border);
        }}

        .loc-header h1 {{
            font-size: 2.2rem;
            font-weight: 800;
            background: var(--accent-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 10px;
        }}

        .loc-sub {{
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-top: 4px;
        }}

        .time-badge {{
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--card-border);
            padding: 8px 16px;
            border-radius: var(--radius-md);
            font-size: 0.85rem;
            color: var(--text-muted);
        }}

        .card {{
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: var(--radius-lg);
            padding: 24px;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }}

        .card-title {{
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 18px;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        /* Hero Current Weather */
        .hero-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            align-items: center;
        }}

        @media (max-width: 680px) {{
            .hero-grid {{
                grid-template-columns: 1fr;
            }}
        }}

        .current-main {{
            display: flex;
            flex-direction: column;
            gap: 8px;
        }}

        .temp-display {{
            display: flex;
            align-items: baseline;
            gap: 16px;
        }}

        .current-temp {{
            font-size: 4.2rem;
            font-weight: 800;
            line-height: 1;
            letter-spacing: -2px;
        }}

        .current-condition-badge {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.25);
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 1.1rem;
            font-weight: 600;
            width: fit-content;
        }}

        .feels-like {{
            color: var(--text-muted);
            font-size: 0.95rem;
        }}

        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }}

        .metric-box {{
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-md);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}

        .metric-label {{
            font-size: 0.8rem;
            color: var(--text-muted);
        }}

        .metric-val {{
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--text-main);
        }}

        /* Tips Card */
        .tips-card {{
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
            border-color: rgba(56, 189, 248, 0.2);
        }}

        .tips-list {{
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }}

        .tips-list li {{
            font-size: 0.95rem;
            line-height: 1.5;
        }}

        /* Air Quality */
        .aq-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 14px;
        }}

        .aq-item {{
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-md);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }}

        .aq-label {{
            font-size: 0.85rem;
            color: var(--text-muted);
        }}

        .aq-value {{
            font-size: 1.25rem;
            font-weight: 800;
        }}

        /* Daily Forecast */
        .daily-list {{
            display: flex;
            flex-direction: column;
            gap: 10px;
        }}

        .daily-item {{
            display: grid;
            grid-template-columns: 110px 140px 180px 1fr 130px;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-md);
            padding: 12px 18px;
            transition: transform 0.15s ease, background 0.15s ease;
        }}

        .daily-item:hover {{
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-2px);
        }}

        @media (max-width: 760px) {{
            .daily-item {{
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }}
            .daily-meta, .sun-times {{
                grid-column: span 2;
            }}
        }}

        .daily-date {{
            font-weight: 700;
            font-size: 0.95rem;
        }}

        .daily-condition {{
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .daily-emoji {{
            font-size: 1.3rem;
        }}

        .daily-desc {{
            font-size: 0.9rem;
            color: var(--text-muted);
        }}

        .daily-temp {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}

        .temp-min {{
            color: #38bdf8;
            font-weight: 600;
            font-size: 0.95rem;
        }}

        .temp-max {{
            color: #f87171;
            font-weight: 600;
            font-size: 0.95rem;
        }}

        .temp-bar-bg {{
            flex: 1;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 999px;
            overflow: hidden;
            min-width: 40px;
        }}

        .temp-bar-fill {{
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, #38bdf8, #f87171);
            border-radius: 999px;
        }}

        .daily-meta {{
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }}

        .badge {{
            padding: 3px 8px;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
        }}

        .badge-pop {{
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
        }}

        .badge-precip {{
            background: rgba(129, 140, 248, 0.15);
            color: #a5b4fc;
        }}

        .badge-uv {{
            background: rgba(251, 146, 60, 0.15);
            color: #fb923c;
        }}

        .sun-times {{
            font-size: 0.8rem;
            color: var(--text-muted);
            text-align: right;
        }}

        /* Hourly */
        .hourly-scroll {{
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 8px;
            scrollbar-width: thin;
        }}

        .hourly-item {{
            min-width: 72px;
            flex: 0 0 auto;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-md);
            padding: 12px 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            text-align: center;
        }}

        .h-time {{
            font-size: 0.8rem;
            color: var(--text-muted);
        }}

        .h-emoji {{
            font-size: 1.4rem;
        }}

        .h-temp {{
            font-size: 0.95rem;
            font-weight: 700;
        }}

        .h-pop {{
            font-size: 0.75rem;
            color: #38bdf8;
            min-height: 16px;
        }}

        footer {{
            text-align: center;
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 12px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="loc-header">
                <h1>📍 {loc_title}</h1>
                <div class="loc-sub">{full_loc} (위도: {lat:.2f}, 경도: {lon:.2f}) · {tz}</div>
            </div>
            <div class="time-badge">🕒 기준 시각: {now_str}</div>
        </header>

        <!-- Weather Advice Card -->
        <div class="card tips-card">
            <div class="card-title">💡 맞춤형 날씨 안내 및 외출 팁</div>
            <ul class="tips-list">
                {tips_html}
            </ul>
        </div>

        <!-- Current Weather Hero Card -->
        <div class="card">
            <div class="card-title">🌤️ 현재 날씨 현황</div>
            <div class="hero-grid">
                <div class="current-main">
                    <div class="temp-display">
                        <div class="current-temp">{temp}°C</div>
                    </div>
                    <div class="current-condition-badge">
                        <span>{cur_emoji}</span>
                        <span>{cur_desc}</span>
                    </div>
                    <div class="feels-like">체감 온도: <strong>{app_temp}°C</strong></div>
                </div>

                <div class="metrics-grid">
                    <div class="metric-box">
                        <span class="metric-label">💧 상대 습도</span>
                        <span class="metric-val">{humidity}%</span>
                    </div>
                    <div class="metric-box">
                        <span class="metric-label">💨 풍속 (풍향)</span>
                        <span class="metric-val">{wind_speed} km/h <small style="font-weight:normal; font-size:0.85rem">({wind_dir}°)</small></span>
                    </div>
                    <div class="metric-box">
                        <span class="metric-label">🌧️ 현재 강수량</span>
                        <span class="metric-val">{precip} mm</span>
                    </div>
                    <div class="metric-box">
                        <span class="metric-label">⏱️ 현지 기압</span>
                        <span class="metric-val">{pressure} hPa</span>
                    </div>
                </div>
            </div>
        </div>

        {aq_html}

        {hourly_html}

        {daily_html}

        <footer>
            데이터 출처: Open-Meteo API · Antigravity Weather Skill
        </footer>
    </div>
</body>
</html>
"""
    return html


def main():
    parser = argparse.ArgumentParser(
        description="Open-Meteo 기반 날씨 정보 조회 도구 (Weather Info CLI)"
    )
    parser.add_argument("-c", "--city", type=str, help="조회할 도시명 (예: 서울, Tokyo, London, New York)")
    parser.add_argument("--lat", type=float, help="위도 (Latitude)")
    parser.add_argument("--lon", type=float, help="경도 (Longitude)")
    parser.add_argument("-d", "--days", type=int, default=3, help="예보 일수 (1~16일, 기본값: 3)")
    parser.add_argument("--current", action="store_true", help="현재 날씨만 조회")
    parser.add_argument("--hourly", action="store_true", help="시간별 예보(24시간) 포함")
    parser.add_argument("-aq", "--air-quality", action="store_true", help="대기질 정보(PM2.5, PM10, AQI) 포함")
    parser.add_argument("--lang", type=str, default="ko", choices=["ko", "en"], help="날씨 설명 언어 (ko, en)")
    parser.add_argument("--json", action="store_true", help="JSON 포맷으로 출력")
    parser.add_argument("--html", nargs="?", const="weather_report.html", type=str, help="HTML 보고서 생성 (파일 경로 지정 가능, 기본값: weather_report.html)")

    args = parser.parse_args()

    if not args.city and (args.lat is None or args.lon is None):
        parser.print_help()
        sys.exit(1)

    location_info = {}
    if args.city:
        geo = geocode_city(args.city)
        if not geo:
            err = {"error": f"도시 '{args.city}'의 위치 정보를 찾을 수 없습니다."}
            if args.json:
                print(json.dumps(err, ensure_ascii=False, indent=2))
            else:
                sys.stderr.write(f"오류: {err['error']}\n")
            sys.exit(1)
        location_info = geo
    else:
        location_info = {
            "name": f"좌표 ({args.lat}, {args.lon})",
            "latitude": args.lat,
            "longitude": args.lon,
            "timezone": "auto"
        }

    weather = fetch_weather(
        lat=location_info["latitude"],
        lon=location_info["longitude"],
        timezone=location_info.get("timezone", "auto"),
        days=args.days,
        hourly=args.hourly
    )

    if not weather:
        err = {"error": "Open-Meteo 날씨 정보를 가져오는 데 실패했습니다."}
        if args.json:
            print(json.dumps(err, ensure_ascii=False, indent=2))
        else:
            sys.stderr.write(f"오류: {err['error']}\n")
        sys.exit(1)

    air_quality = None
    if args.air_quality:
        air_quality = fetch_air_quality(
            lat=location_info["latitude"],
            lon=location_info["longitude"],
            timezone=location_info.get("timezone", "auto")
        )

    # HTML Report Generation if requested
    html_filepath = None
    if args.html:
        html_content = generate_html_report(
            location_info=location_info,
            weather_data=weather,
            air_quality_data=air_quality,
            lang=args.lang,
            current_only=args.current,
            show_hourly=args.hourly
        )
        html_filepath = os.path.abspath(args.html)
        try:
            with open(html_filepath, "w", encoding="utf-8") as f:
                f.write(html_content)
        except Exception as e:
            sys.stderr.write(f"HTML 보고서 파일 작성 중 오류 발생: {e}\n")

    if args.json:
        combined = {
            "location": location_info,
            "weather": weather
        }
        if air_quality:
            combined["air_quality"] = air_quality
        if html_filepath:
            combined["html_report"] = html_filepath
        print(json.dumps(combined, ensure_ascii=False, indent=2))
    else:
        output = format_text_output(
            location_info=location_info,
            weather_data=weather,
            air_quality_data=air_quality,
            lang=args.lang,
            current_only=args.current,
            show_hourly=args.hourly
        )
        print(output)
        if html_filepath:
            print("-" * 50)
            print(f"📄 HTML 보고서가 생성되었습니다: {html_filepath}")


if __name__ == "__main__":
    main()
