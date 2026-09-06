import os
from pathlib import Path
from typing import Optional
import requests
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Search and load .env from current directory or parent directory
env_path = Path(__file__).resolve().parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

VWORLD_API_KEY = os.getenv("VWORLD_API_KEY", "").strip()
VWORLD_API_BASE_URL = "https://api.vworld.kr/req/address"

app = FastAPI(
    title="VWorld Map & Geocoding API",
    description="브이월드 지오코딩 및 Leaflet 지도 연동 웹 서비스",
    version="1.0.0"
)

# CORS middleware for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """서버 상태 및 VWorld API Key 로드 여부 확인"""
    has_key = bool(VWORLD_API_KEY)
    masked_key = (VWORLD_API_KEY[:4] + "****" + VWORLD_API_KEY[-4:]) if len(VWORLD_API_KEY) > 8 else ("Set" if has_key else "Not Set")
    return {
        "status": "healthy",
        "api_key_configured": has_key,
        "api_key_preview": masked_key
    }


@app.get("/api/geocode")
def geocode(
    address: str = Query(..., description="조회할 도로명 또는 지번 주소"),
    address_type: str = Query("AUTO", description="주소 종류 (AUTO, ROAD, PARCEL)"),
    refine: bool = Query(True, description="주소 정제 여부")
):
    """
    주소를 위도/경도(EPSG:4326) 좌표로 변환합니다.
    """
    clean_addr = address.strip()
    if not clean_addr:
        raise HTTPException(status_code=400, detail="주소를 입력해주세요.")

    if not VWORLD_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="VWORLD_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요."
        )

    types_to_try = ["ROAD", "PARCEL"] if address_type.upper() == "AUTO" else [address_type.upper()]
    last_error_msg = "주소를 찾을 수 없습니다."

    # First attempt with requested refine mode, then fallback with refine=false if not found
    refine_modes = [refine] if not refine else [True, False]

    for current_refine in refine_modes:
        for t in types_to_try:
            params = {
                "service": "address",
                "request": "getcoord",
                "version": "2.0",
                "crs": "EPSG:4326",
                "address": clean_addr,
                "refine": "true" if current_refine else "false",
                "simple": "false",
                "format": "json",
                "errorformat": "json",
                "type": t,
                "key": VWORLD_API_KEY,
            }

            try:
                res = requests.get(VWORLD_API_BASE_URL, params=params, timeout=10)
                res.raise_for_status()
                data = res.json()
            except requests.exceptions.RequestException as e:
                raise HTTPException(status_code=502, detail=f"VWorld API 통신 오류: {str(e)}")

            resp = data.get("response", {})
            status = resp.get("status")

            if status == "OK":
                result_obj = resp.get("result", {})
                point = result_obj.get("point", {})
                refined = resp.get("refined", {})
                structure = refined.get("structure", {})

                try:
                    lat = float(point.get("y"))
                    lon = float(point.get("x"))
                except (TypeError, ValueError):
                    continue

                return {
                    "status": "success",
                    "query": clean_addr,
                    "address_type": t,
                    "result": {
                        "address": refined.get("text", clean_addr),
                        "latitude": lat,
                        "longitude": lon,
                        "structure": structure,
                        "zipcode": refined.get("zipcode", "")
                    }
                }
            elif status == "NOT_FOUND":
                last_error_msg = f"'{clean_addr}'에 대한 좌표 검색 결과가 없습니다. 도로명 번호나 지번을 다시 확인해주세요."
            elif status == "ERROR":
                err = resp.get("error", {})
                err_code = err.get("code", "UNKNOWN")
                err_text = err.get("text", "알 수 없는 오류")
                raise HTTPException(status_code=400, detail=f"VWorld API 오류 [{err_code}]: {err_text}")

    raise HTTPException(status_code=404, detail=last_error_msg)


@app.get("/api/reverse-geocode")
def reverse_geocode(
    lat: float = Query(..., description="위도 (Latitude, Y)"),
    lon: float = Query(..., description="경도 (Longitude, X)"),
    address_type: str = Query("BOTH", description="주소 종류 (BOTH, ROAD, PARCEL)")
):
    """
    위도/경도 좌표를 지번/도로명 주소로 변환합니다.
    """
    if not VWORLD_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="VWORLD_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요."
        )

    # VWorld expects point=x(경도),y(위도)
    point_str = f"{lon},{lat}"
    params = {
        "service": "address",
        "request": "getaddress",
        "version": "2.0",
        "crs": "EPSG:4326",
        "point": point_str,
        "format": "json",
        "errorformat": "json",
        "type": address_type.upper(),
        "key": VWORLD_API_KEY,
    }

    try:
        res = requests.get(VWORLD_API_BASE_URL, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"VWorld API 통신 오류: {str(e)}")

    resp = data.get("response", {})
    status = resp.get("status")

    if status == "OK":
        raw_results = resp.get("result", [])
        if isinstance(raw_results, dict):
            raw_results = [raw_results]

        if not raw_results:
            raise HTTPException(status_code=404, detail="해당 좌표의 주소를 찾을 수 없습니다.")

        main_addr = raw_results[0].get("text", "")
        for item in raw_results:
            if item.get("type", "").upper() == "ROAD" and item.get("text"):
                main_addr = item.get("text")
                break

        formatted_items = []
        for item in raw_results:
            formatted_items.append({
                "type": item.get("type"),
                "zipcode": item.get("zipcode"),
                "address": item.get("text"),
                "structure": item.get("structure", {})
            })

        return {
            "status": "success",
            "query": {"latitude": lat, "longitude": lon},
            "result": {
                "address": main_addr,
                "latitude": lat,
                "longitude": lon,
                "items": formatted_items
            }
        }
    elif status == "NOT_FOUND":
        raise HTTPException(status_code=404, detail=f"좌표 ({lat:.5f}, {lon:.5f})에 해당하는 주소가 없습니다.")
    elif status == "ERROR":
        err = resp.get("error", {})
        err_code = err.get("code", "UNKNOWN")
        err_text = err.get("text", "알 수 없는 오류")
        raise HTTPException(status_code=400, detail=f"VWorld API 오류 [{err_code}]: {err_text}")

    raise HTTPException(status_code=500, detail="알 수 없는 오류가 발생했습니다.")


# ---------------------------------------------------------
# Commercial District Analytics & Market Entry Strategy Endpoints
# ---------------------------------------------------------
try:
    from database import (
        get_filter_metadata,
        get_dashboard_summary,
        get_category_stats,
        get_franchise_comparison,
        get_map_stores,
        get_stores_list,
        get_market_entry_strategy,
        get_radius_site_assessment,
        TARGET_INDUSTRY_PROFILES,
        FRANCHISE_GROUPS,
    )
    HAS_DB = True
except Exception as e:
    print(f"[Warning] Database module load error: {e}")
    HAS_DB = False


@app.get("/api/strategy/profiles")
def api_strategy_profiles():
    """시장 진입 분석을 위한 목표 업종 프로필 목록 반환"""
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    return {
        key: {
            "key": key,
            "name": val["name"],
            "keywords": val["keywords"],
        }
        for key, val in TARGET_INDUSTRY_PROFILES.items()
    }


@app.get("/api/strategy/opportunity")
def api_strategy_opportunity(
    sido: Optional[str] = Query(default=None, description="시도명"),
    sigungu: Optional[str] = Query(default=None, description="시군구명"),
    target_industry: str = Query(default="cafe", description="목표 진입 업종 (cafe, korean_food, chicken_fastfood 등)")
):
    """
    [시장 진입 전략] 지역 내 행정동별 상권 포화도 및 신규 출점 유망 상권 TOP 5 랭킹
    """
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_market_entry_strategy(
            sido=sido,
            sigungu=sigungu,
            target_industry_key=target_industry
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/strategy/radius-assessment")
def api_strategy_radius_assessment(
    lat: float = Query(..., description="후보지 위도"),
    lon: float = Query(..., description="후보지 경도"),
    radius: float = Query(default=500.0, ge=100.0, le=3000.0, description="반경 (미터 단위)"),
    target_industry: str = Query(default="cafe", description="목표 진입 업종")
):
    """
    [후보지 입지 실시간 진단] 지정 반경 내 직접 경쟁점 수, 최근접 경쟁점 거리, 배후 집객 시설, 출점 적합도 점수
    """
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_radius_site_assessment(
            lat=lat,
            lon=lon,
            radius_meter=radius,
            target_industry_key=target_industry
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/metadata")
def api_dashboard_metadata():
    """상권 대시보드 필터 메타데이터 (시도/시군구 및 업종 분류) 반환"""
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_filter_metadata()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/summary")
def api_dashboard_summary(
    sido: Optional[str] = Query(default=None, description="시도명 (예: 서울특별시)"),
    sigungu: Optional[str] = Query(default=None, description="시군구명 (예: 강남구)"),
    category_large: Optional[str] = Query(default=None, description="업종 대분류"),
    category_mid: Optional[str] = Query(default=None, description="업종 중분류"),
    query: Optional[str] = Query(default=None, description="상호명 검색어")
):
    """선택된 필터 조건에 따른 KPI 지표 및 업종 대분류 점유율 요약"""
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_dashboard_summary(
            sido=sido,
            sigungu=sigungu,
            category_large=category_large,
            category_mid=category_mid,
            search_query=query
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/stats/categories")
def api_dashboard_category_stats(
    sido: Optional[str] = Query(default=None),
    sigungu: Optional[str] = Query(default=None),
    category_large: Optional[str] = Query(default=None),
    limit: int = Query(default=10, ge=3, le=50)
):
    """상위 N개 업종 중분류 분포 통계 (막대 차트용)"""
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_category_stats(
            sido=sido,
            sigungu=sigungu,
            category_large=category_large,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/stats/franchise")
def api_dashboard_franchise_stats(
    sido: Optional[str] = Query(default=None),
    sigungu: Optional[str] = Query(default=None),
    group_key: str = Query(default="cafe", description="프랜차이즈 그룹 (cafe, convenience, fastfood_chicken, bakery_dessert)")
):
    """주요 프랜차이즈 브랜드별 출점 수 비교 분석"""
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_franchise_comparison(
            sido=sido,
            sigungu=sigungu,
            group_key=group_key
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/stores/map")
def api_dashboard_map_stores(
    sido: Optional[str] = Query(default=None),
    sigungu: Optional[str] = Query(default=None),
    category_large: Optional[str] = Query(default=None),
    category_mid: Optional[str] = Query(default=None),
    query: Optional[str] = Query(default=None),
    min_lat: Optional[float] = Query(default=None),
    min_lon: Optional[float] = Query(default=None),
    max_lat: Optional[float] = Query(default=None),
    max_lon: Optional[float] = Query(default=None),
    limit: int = Query(default=2500, ge=10, le=10000)
):
    """지도 시각화용 상가 좌표 및 기본 정보 목록"""
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_map_stores(
            sido=sido,
            sigungu=sigungu,
            category_large=category_large,
            category_mid=category_mid,
            search_query=query,
            min_lat=min_lat,
            min_lon=min_lon,
            max_lat=max_lat,
            max_lon=max_lon,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/stores/list")
def api_dashboard_stores_list(
    sido: Optional[str] = Query(default=None),
    sigungu: Optional[str] = Query(default=None),
    category_large: Optional[str] = Query(default=None),
    category_mid: Optional[str] = Query(default=None),
    query: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=5, le=100)
):
    """상가 상세 목록 페이징 조회 (데이터 테이블용)"""
    if not HAS_DB:
        raise HTTPException(status_code=500, detail="데이터베이스 모듈이 준비되지 않았습니다.")
    try:
        return get_stores_list(
            sido=sido,
            sigungu=sigungu,
            category_large=category_large,
            category_mid=category_mid,
            search_query=query,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Static directory mounting
static_dir = Path(__file__).resolve().parent / "static"
if not static_dir.exists():
    static_dir.mkdir(parents=True, exist_ok=True)

app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

