import os
from pathlib import Path
from typing import Dict, List, Optional, Any
import duckdb

# Determine the absolute path to the Parquet dataset
BASE_DIR = Path(__file__).resolve().parent.parent
PARQUET_PATH = BASE_DIR / "data" / "commercial_stores_national.parquet"

# Cached metadata
_metadata_cache: Optional[Dict[str, Any]] = None


def get_db_connection() -> duckdb.DuckDBPyConnection:
    """Read-only in-memory connection to DuckDB"""
    con = duckdb.connect(database=":memory:", read_only=False)
    return con


def get_parquet_path() -> str:
    if not PARQUET_PATH.exists():
        raise FileNotFoundError(
            f"Parquet dataset not found at {PARQUET_PATH}. Please run scripts/prepare_data.py first."
        )
    return str(PARQUET_PATH).replace("\\", "/")


def build_where_clause(
    sido: Optional[str] = None,
    sigungu: Optional[str] = None,
    category_large: Optional[str] = None,
    category_mid: Optional[str] = None,
    search_query: Optional[str] = None,
    min_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lat: Optional[float] = None,
    max_lon: Optional[float] = None,
) -> tuple[str, list]:
    """Dynamically builds a parameterized SQL WHERE clause"""
    conditions = []
    params = []

    if sido and isinstance(sido, str) and sido.strip() and sido not in ("전체", "all"):
        conditions.append("시도명 = ?")
        params.append(sido.strip())

    if sigungu and isinstance(sigungu, str) and sigungu.strip() and sigungu not in ("전체", "all"):
        conditions.append("시군구명 = ?")
        params.append(sigungu.strip())

    if category_large and isinstance(category_large, str) and category_large.strip() and category_large not in ("전체", "all"):
        conditions.append("상권업종대분류명 = ?")
        params.append(category_large.strip())

    if category_mid and isinstance(category_mid, str) and category_mid.strip() and category_mid not in ("전체", "all"):
        conditions.append("상권업종중분류명 = ?")
        params.append(category_mid.strip())

    if search_query and isinstance(search_query, str) and search_query.strip():
        q = f"%{search_query.strip()}%"
        conditions.append("(상호명 ILIKE ? OR 도로명주소 ILIKE ? OR 지번주소 ILIKE ?)")
        params.extend([q, q, q])

    if (
        min_lat is not None and isinstance(min_lat, (int, float)) and
        max_lat is not None and isinstance(max_lat, (int, float)) and
        min_lon is not None and isinstance(min_lon, (int, float)) and
        max_lon is not None and isinstance(max_lon, (int, float))
    ):
        conditions.append("위도 BETWEEN ? AND ?")
        conditions.append("경도 BETWEEN ? AND ?")
        params.extend([float(min_lat), float(max_lat), float(min_lon), float(max_lon)])

    where_str = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    return where_str, params


def get_filter_metadata() -> Dict[str, Any]:
    """Returns cached hierarchical region and category filter metadata"""
    global _metadata_cache
    if _metadata_cache is not None:
        return _metadata_cache

    p = get_parquet_path()
    con = get_db_connection()

    # 1. Total Stores Count
    total_count = con.execute(f"SELECT COUNT(*) FROM '{p}'").fetchone()[0]

    # 2. Sido & Sigungu Hierarchy
    sido_sigungu_rows = con.execute(f"""
        SELECT 시도명, 시군구명, COUNT(*) as cnt
        FROM '{p}'
        WHERE 시도명 IS NOT NULL AND 시군구명 IS NOT NULL
        GROUP BY 시도명, 시군구명
        ORDER BY 시도명, cnt DESC
    """).fetchall()

    regions: Dict[str, List[str]] = {}
    for sido, sigungu, _ in sido_sigungu_rows:
        if sido not in regions:
            regions[sido] = []
        if sigungu not in regions[sido]:
            regions[sido].append(sigungu)

    # 3. Category Hierarchy (대분류 -> 중분류)
    cat_rows = con.execute(f"""
        SELECT 상권업종대분류명, 상권업종중분류명, COUNT(*) as cnt
        FROM '{p}'
        WHERE 상권업종대분류명 IS NOT NULL AND 상권업종중분류명 IS NOT NULL
        GROUP BY 상권업종대분류명, 상권업종중분류명
        ORDER BY 상권업종대분류명, cnt DESC
    """).fetchall()

    categories: Dict[str, List[str]] = {}
    for large, mid, _ in cat_rows:
        if large not in categories:
            categories[large] = []
        if mid not in categories[large]:
            categories[large].append(mid)

    _metadata_cache = {
        "total_stores": total_count,
        "sido_list": list(regions.keys()),
        "regions": regions,
        "category_large_list": list(categories.keys()),
        "categories": categories,
    }
    return _metadata_cache


def get_dashboard_summary(
    sido: Optional[str] = None,
    sigungu: Optional[str] = None,
    category_large: Optional[str] = None,
    category_mid: Optional[str] = None,
    search_query: Optional[str] = None,
) -> Dict[str, Any]:
    """Calculates KPI summary numbers and category distribution for the current filter"""
    p = get_parquet_path()
    con = get_db_connection()
    where_str, params = build_where_clause(
        sido=sido,
        sigungu=sigungu,
        category_large=category_large,
        category_mid=category_mid,
        search_query=search_query,
    )

    # Main KPI aggregate
    sql = f"""
        SELECT 
            COUNT(*) as total_stores,
            COUNT(DISTINCT 행정동명) as dong_count,
            COUNT(DISTINCT 시군구명) as sigungu_count
        FROM '{p}'
        {where_str}
    """
    row = con.execute(sql, params).fetchone()
    total_stores = row[0] if row else 0
    dong_count = row[1] if row else 0
    sigungu_count = row[2] if row else 0

    # Top Major Categories Distribution
    cat_dist_sql = f"""
        SELECT 상권업종대분류명, COUNT(*) as cnt
        FROM '{p}'
        {where_str}
        GROUP BY 상권업종대분류명
        ORDER BY cnt DESC
    """
    cat_dist_rows = con.execute(cat_dist_sql, params).fetchall()

    category_distribution = [
        {"name": r[0], "count": r[1], "percentage": round((r[1] / total_stores * 100), 2) if total_stores > 0 else 0}
        for r in cat_dist_rows if r[0] is not None
    ]

    top_category = category_distribution[0]["name"] if category_distribution else "없음"
    top_category_ratio = category_distribution[0]["percentage"] if category_distribution else 0

    return {
        "total_stores": total_stores,
        "dong_count": dong_count,
        "sigungu_count": sigungu_count,
        "top_category": top_category,
        "top_category_ratio": top_category_ratio,
        "category_distribution": category_distribution,
    }


def get_category_stats(
    sido: Optional[str] = None,
    sigungu: Optional[str] = None,
    category_large: Optional[str] = None,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """Returns top N mid-level categories distribution for horizontal bar chart"""
    p = get_parquet_path()
    con = get_db_connection()
    where_str, params = build_where_clause(
        sido=sido,
        sigungu=sigungu,
        category_large=category_large,
    )

    sql = f"""
        SELECT 상권업종중분류명, 상권업종대분류명, COUNT(*) as cnt
        FROM '{p}'
        {where_str}
        GROUP BY 상권업종중분류명, 상권업종대분류명
        ORDER BY cnt DESC
        LIMIT {limit}
    """
    rows = con.execute(sql, params).fetchall()

    return [
        {
            "category_mid": r[0],
            "category_large": r[1],
            "count": r[2],
        }
        for r in rows
    ]


# Predefined brand keywords for franchise comparative analysis
FRANCHISE_GROUPS = {
    "cafe": {
        "title": "커피 / 카페",
        "brands": [
            {"name": "스타벅스", "pattern": "스타벅스"},
            {"name": "메가MGC커피", "pattern": "메가커피|메가MGC|메가엠지씨"},
            {"name": "컴포즈커피", "pattern": "컴포즈"},
            {"name": "이디야커피", "pattern": "이디야"},
            {"name": "투썸플레이스", "pattern": "투썸"},
            {"name": "빽다방", "pattern": "빽다방"},
            {"name": "할리스", "pattern": "할리스"},
            {"name": "폴바셋", "pattern": "폴바셋"},
        ]
    },
    "convenience": {
        "title": "편의점 / H&B",
        "brands": [
            {"name": "CU", "pattern": "씨유|\\bCU\\b"},
            {"name": "GS25", "pattern": "GS25|지에스25"},
            {"name": "세븐일레븐", "pattern": "세븐일레븐"},
            {"name": "이마트24", "pattern": "이마트24"},
            {"name": "올리브영", "pattern": "올리브영"},
            {"name": "다이소", "pattern": "다이소"},
        ]
    },
    "fastfood_chicken": {
        "title": "치킨 / 패스트푸드",
        "brands": [
            {"name": "교촌치킨", "pattern": "교촌"},
            {"name": "BHC", "pattern": "BHC|비에이치씨"},
            {"name": "BBQ", "pattern": "BBQ|비비큐"},
            {"name": "맥도날드", "pattern": "맥도날드"},
            {"name": "버거킹", "pattern": "버거킹"},
            {"name": "맘스터치", "pattern": "맘스터치"},
            {"name": "롯데리아", "pattern": "롯데리아"},
            {"name": "써브웨이", "pattern": "써브웨이|서브웨이"},
        ]
    },
    "bakery_dessert": {
        "title": "베이커리 / 디저트",
        "brands": [
            {"name": "파리바게뜨", "pattern": "파리바게"},
            {"name": "뚜레쥬르", "pattern": "뚜레쥬르|뚜레주르"},
            {"name": "배스킨라빈스", "pattern": "배스킨라빈스|베스킨라빈스"},
            {"name": "설빙", "pattern": "설빙"},
            {"name": "던킨", "pattern": "던킨"},
        ]
    }
}


def get_franchise_comparison(
    sido: Optional[str] = None,
    sigungu: Optional[str] = None,
    group_key: str = "cafe",
) -> Dict[str, Any]:
    """Analyzes store counts of top franchise brands in the selected region"""
    p = get_parquet_path()
    con = get_db_connection()

    group_info = FRANCHISE_GROUPS.get(group_key, FRANCHISE_GROUPS["cafe"])
    where_str, params = build_where_clause(sido=sido, sigungu=sigungu)

    results = []
    for b in group_info["brands"]:
        brand_name = b["name"]
        pattern = b["pattern"]
        # Use regexp_matches for flexible pattern matching
        if where_str:
            sql = f"""
                SELECT COUNT(*) FROM '{p}'
                {where_str} AND (regexp_matches(상호명, '(?i){pattern}'))
            """
            cnt = con.execute(sql, params).fetchone()[0]
        else:
            sql = f"""
                SELECT COUNT(*) FROM '{p}'
                WHERE regexp_matches(상호명, '(?i){pattern}')
            """
            cnt = con.execute(sql).fetchone()[0]

        results.append({
            "brand": brand_name,
            "count": cnt,
        })

    # Sort descending by store count
    results.sort(key=lambda x: x["count"], reverse=True)

    return {
        "group_key": group_key,
        "group_title": group_info["title"],
        "brands": results,
    }


def get_map_stores(
    sido: Optional[str] = None,
    sigungu: Optional[str] = None,
    category_large: Optional[str] = None,
    category_mid: Optional[str] = None,
    search_query: Optional[str] = None,
    min_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lat: Optional[float] = None,
    max_lon: Optional[float] = None,
    limit: int = 2500,
) -> Dict[str, Any]:
    """Retrieves store coordinates and essential metadata for Leaflet map visualization"""
    p = get_parquet_path()
    con = get_db_connection()

    where_str, params = build_where_clause(
        sido=sido,
        sigungu=sigungu,
        category_large=category_large,
        category_mid=category_mid,
        search_query=search_query,
        min_lat=min_lat,
        min_lon=min_lon,
        max_lat=max_lat,
        max_lon=max_lon,
    )

    # Count total in bounding box or filter
    count_sql = f"SELECT COUNT(*) FROM '{p}' {where_str}"
    total_matched = con.execute(count_sql, params).fetchone()[0]

    # Select store locations
    sql = f"""
        SELECT 
            상가업소번호,
            상호명,
            지점명,
            상권업종대분류명,
            상권업종중분류명,
            상권업종소분류명,
            시도명,
            시군구명,
            행정동명,
            도로명주소,
            건물명,
            경도,
            위도
        FROM '{p}'
        {where_str}
        LIMIT {limit}
    """
    rows = con.execute(sql, params).fetchall()

    stores = [
        {
            "id": r[0],
            "name": r[1] or "",
            "branch": r[2] or "",
            "cat_large": r[3] or "",
            "cat_mid": r[4] or "",
            "cat_sub": r[5] or "",
            "sido": r[6] or "",
            "sigungu": r[7] or "",
            "dong": r[8] or "",
            "road_addr": r[9] or "",
            "building": r[10] or "",
            "lon": r[11],
            "lat": r[12],
        }
        for r in rows
    ]

    return {
        "total_matched": total_matched,
        "count": len(stores),
        "stores": stores,
    }


def get_stores_list(
    sido: Optional[str] = None,
    sigungu: Optional[str] = None,
    category_large: Optional[str] = None,
    category_mid: Optional[str] = None,
    search_query: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """Retrieves paginated store records for table display"""
    p = get_parquet_path()
    con = get_db_connection()

    where_str, params = build_where_clause(
        sido=sido,
        sigungu=sigungu,
        category_large=category_large,
        category_mid=category_mid,
        search_query=search_query,
    )

    count_sql = f"SELECT COUNT(*) FROM '{p}' {where_str}"
    total_count = con.execute(count_sql, params).fetchone()[0]

    offset = (max(page, 1) - 1) * page_size
    sql = f"""
        SELECT 
            상가업소번호,
            상호명,
            지점명,
            상권업종대분류명,
            상권업종중분류명,
            상권업종소분류명,
            시도명,
            시군구명,
            행정동명,
            도로명주소,
            경도,
            위도
        FROM '{p}'
        {where_str}
        ORDER BY 시도명, 시군구명, 상호명
        LIMIT {page_size} OFFSET {offset}
    """
    rows = con.execute(sql, params).fetchall()

    stores = [
        {
            "id": r[0],
            "name": r[1] or "",
            "branch": r[2] or "",
            "cat_large": r[3] or "",
            "cat_mid": r[4] or "",
            "cat_sub": r[5] or "",
            "sido": r[6] or "",
            "sigungu": r[7] or "",
            "dong": r[8] or "",
            "road_addr": r[9] or "",
            "lon": r[10],
            "lat": r[11],
        }
        for r in rows
    ]

    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return {
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": stores,
    }


# =========================================================================
# MARKET ENTRY STRATEGY & SITE ASSESSMENT ANALYTICS MODULES
# =========================================================================

# Predefined Target Industry Profiles for Franchise / Market Entry
TARGET_INDUSTRY_PROFILES = {
    "cafe": {
        "name": "커피 / 카페",
        "keywords": ["비알코올", "카페", "커피", "디저트"],
        "complementary": ["과학·기술", "교육", "보건의료"], # 오피스, 학원, 병원
    },
    "korean_food": {
        "name": "한식 / 일반음식점",
        "keywords": ["한식", "백반", "식당"],
        "complementary": ["과학·기술", "부동산", "소매"],
    },
    "chicken_fastfood": {
        "name": "치킨 / 패스트푸드",
        "keywords": ["기타 간이", "치킨", "버거", "피자"],
        "complementary": ["교육", "소매", "부동산"],
    },
    "bakery_dessert": {
        "name": "베이커리 / 디저트",
        "keywords": ["식료품 소매", "빵", "제과", "베이커리", "도넛", "케이크"],
        "complementary": ["교육", "보건의료", "소매"],
    },
    "convenience": {
        "name": "편의점 / 마트",
        "keywords": ["종합 소매", "편의점", "슈퍼마켓"],
        "complementary": ["부동산", "교육", "과학·기술"],
    },
    "beauty_hair": {
        "name": "미용실 / 뷰티샵",
        "keywords": ["이용·미용", "헤어", "네일", "피부"],
        "complementary": ["부동산", "소매"],
    },
    "academy_education": {
        "name": "학원 / 교습소",
        "keywords": ["일반 교육", "기타 교육", "학원", "교습소"],
        "complementary": ["부동산", "소매"],
    }
}


def get_market_entry_strategy(
    sido: Optional[str] = None,
    sigungu: Optional[str] = None,
    target_industry_key: str = "cafe",
) -> Dict[str, Any]:
    """
    Evaluates market saturation, opportunity score, and recommends TOP promising
    commercial districts (Dong level) for new store entry and franchise expansion.
    """
    p = get_parquet_path()
    con = get_db_connection()

    profile = TARGET_INDUSTRY_PROFILES.get(target_industry_key, TARGET_INDUSTRY_PROFILES["cafe"])
    target_name = profile["name"]
    kw_conditions = " OR ".join([f"상권업종중분류명 ILIKE '%{kw}%' OR 상호명 ILIKE '%{kw}%'" for kw in profile["keywords"]])

    where_str, params = build_where_clause(sido=sido, sigungu=sigungu)
    where_base = f"{where_str} AND 행정동명 IS NOT NULL" if where_str else "WHERE 행정동명 IS NOT NULL"

    # Aggregating at Dong level
    sql = f"""
        WITH dong_stats AS (
            SELECT 
                시도명,
                시군구명,
                행정동명,
                COUNT(*) as total_stores,
                COUNT(CASE WHEN ({kw_conditions}) THEN 1 END) as target_stores,
                COUNT(CASE WHEN 상권업종대분류명 = '과학·기술' OR 상권업종중분류명 ILIKE '%경영%' THEN 1 END) as office_stores,
                COUNT(CASE WHEN 상권업종대분류명 = '교육' THEN 1 END) as edu_stores,
                COUNT(CASE WHEN 상권업종대분류명 = '보건의료' THEN 1 END) as health_stores,
                COUNT(CASE WHEN 상권업종대분류명 = '소매' THEN 1 END) as retail_stores
            FROM '{p}'
            {where_base}
            GROUP BY 시도명, 시군구명, 행정동명
        )
        SELECT 
            시도명,
            시군구명,
            행정동명,
            total_stores,
            target_stores,
            ROUND((target_stores * 100.0 / total_stores), 2) as target_ratio,
            office_stores,
            edu_stores,
            health_stores,
            retail_stores,
            -- Opportunity Score (0~100 normalized):
            -- Higher magnet footfall (office, education, total) with moderate/low competitor ratio
            ROUND(
                (office_stores * 0.35 + edu_stores * 0.25 + total_stores * 0.1) / 
                (CASE WHEN target_stores = 0 THEN 1.0 ELSE target_stores * 0.8 + 1 END), 2
            ) as raw_score
        FROM dong_stats
        WHERE total_stores >= 50
        ORDER BY raw_score DESC
    """
    rows = con.execute(sql, params).fetchall()

    if not rows:
        return {
            "target_industry": target_name,
            "total_dongs": 0,
            "overall_saturation": "데이터 부족",
            "top_promising_dongs": [],
            "dong_list": []
        }

    # Normalize opportunity scores to 0-100 scale
    max_raw = max(r[10] for r in rows) if rows else 1.0
    if max_raw <= 0:
        max_raw = 1.0

    dong_list = []
    blue_count = 0
    balanced_count = 0
    red_count = 0

    for r in rows:
        score_100 = min(round((r[10] / max_raw) * 100, 1), 100.0)
        target_ratio = r[5]

        # Saturation level classification
        if target_ratio <= 1.5:
            status = "블루오션 (유망)"
            status_badge = "blue"
            blue_count += 1
        elif target_ratio <= 3.5:
            status = "적정 경쟁 (성장)"
            status_badge = "emerald"
            balanced_count += 1
        else:
            status = "레드오션 (과포화)"
            status_badge = "rose"
            red_count += 1

        dong_list.append({
            "sido": r[0],
            "sigungu": r[1],
            "dong": r[2],
            "total_stores": r[3],
            "target_stores": r[4],
            "target_ratio": target_ratio,
            "office_stores": r[6],
            "edu_stores": r[7],
            "health_stores": r[8],
            "retail_stores": r[9],
            "score": score_100,
            "status": status,
            "status_badge": status_badge,
        })

    # Overall regional market saturation summary
    if blue_count >= len(dong_list) * 0.4:
        overall_saturation = "블루오션 (신규 진입 기회 우수)"
        overall_badge = "blue"
    elif red_count >= len(dong_list) * 0.5:
        overall_saturation = "레드오션 (차별화 및 입지 선별 필수)"
        overall_badge = "rose"
    else:
        overall_saturation = "균형 상권 (입지별 선별 진입)"
        overall_badge = "emerald"

    top_5 = dong_list[:5]

    return {
        "target_industry_key": target_industry_key,
        "target_industry_name": target_name,
        "total_analyzed_dongs": len(dong_list),
        "overall_saturation": overall_saturation,
        "overall_badge": overall_badge,
        "top_promising_dongs": top_5,
        "dong_list": dong_list[:30],
    }


def get_radius_site_assessment(
    lat: float,
    lon: float,
    radius_meter: float = 500.0,
    target_industry_key: str = "cafe",
) -> Dict[str, Any]:
    """
    Evaluates candidate location within circular catchment area (e.g. 300m / 500m / 1,000m):
    Direct competitors count, nearest competitor distance, footfall magnets, and entry score.
    """
    p = get_parquet_path()
    con = get_db_connection()

    profile = TARGET_INDUSTRY_PROFILES.get(target_industry_key, TARGET_INDUSTRY_PROFILES["cafe"])
    target_name = profile["name"]
    kw_conditions = " OR ".join([f"상권업종중분류명 ILIKE '%{kw}%' OR 상호명 ILIKE '%{kw}%'" for kw in profile["keywords"]])

    deg_lat = radius_meter / 111000.0
    deg_lon = radius_meter / (111000.0 * 0.79)

    sql = f"""
        WITH nearby_stores AS (
            SELECT 
                상가업소번호,
                상호명,
                지점명,
                상권업종대분류명,
                상권업종중분류명,
                상권업종소분류명,
                시도명,
                시군구명,
                행정동명,
                도로명주소,
                위도,
                경도,
                (2 * 6371000 * asin(sqrt(
                    power(sin(radians(위도 - {lat})/2), 2) + 
                    cos(radians({lat})) * cos(radians(위도)) * power(sin(radians(경도 - {lon})/2), 2)
                ))) as distance_m
            FROM '{p}'
            WHERE 위도 BETWEEN {lat - deg_lat} AND {lat + deg_lat}
              AND 경도 BETWEEN {lon - deg_lon} AND {lon + deg_lon}
        )
        SELECT 
            상가업소번호,
            상호명,
            지점명,
            상권업종대분류명,
            상권업종중분류명,
            상권업종소분류명,
            시도명,
            시군구명,
            행정동명,
            도로명주소,
            위도,
            경도,
            ROUND(distance_m, 1) as distance_m,
            CASE WHEN ({kw_conditions}) THEN 1 ELSE 0 END as is_competitor
        FROM nearby_stores
        WHERE distance_m <= {radius_meter}
        ORDER BY distance_m ASC
    """
    rows = con.execute(sql).fetchall()

    total_stores = len(rows)
    competitors = []
    office_count = 0
    edu_count = 0
    health_count = 0
    retail_count = 0

    for r in rows:
        is_comp = (r[13] == 1)
        cat_large = r[3] or ""
        cat_mid = r[4] or ""

        if is_comp:
            competitors.append({
                "id": r[0],
                "name": r[1],
                "branch": r[2] or "",
                "category": cat_mid,
                "address": r[9] or r[8],
                "distance_m": r[12],
                "lat": r[10],
                "lon": r[11],
            })
        
        if cat_large == '과학·기술' or '경영' in cat_mid:
            office_count += 1
        elif cat_large == '교육':
            edu_count += 1
        elif cat_large == '보건의료':
            health_count += 1
        elif cat_large == '소매':
            retail_count += 1

    comp_count = len(competitors)
    nearest_distance = competitors[0]["distance_m"] if competitors else radius_meter

    # Site Viability Score (0 ~ 100)
    # Ideal site: high magnets (office, edu, retail) and nearest competitor is not right next door (> 80m)
    magnet_score = min((office_count * 1.5 + edu_count * 2.0 + health_count * 2.0 + retail_count * 0.5), 60.0)
    distance_bonus = min(nearest_distance / 10.0, 25.0) # More bonus if nearest competitor is farther
    comp_penalty = min(comp_count * 1.2, 35.0)
    
    total_score = max(min(round(magnet_score + distance_bonus - comp_penalty + 20, 1), 100.0), 10.0)

    # Strategy Grade & Actionable Tip
    if total_score >= 80:
        grade = "최우수 입지 (S등급)"
        action_tip = "배후 집객 시설이 매우 풍부하며 독점/선점 효과를 기대할 수 있는 최우수 후보지입니다."
    elif total_score >= 65:
        grade = "우수 입지 (A등급)"
        action_tip = "안정적인 유동인구와 배후 수요가 뒷받침되며, 인근 경쟁점과 메뉴/서비스 차별화 시 성공 가능성이 높습니다."
    elif total_score >= 50:
        grade = "보통 (B등급 - 차별화 필요)"
        action_tip = "인접 경쟁점이 밀집해 있으므로 피크타임 특화 서비스(테이크아웃 전문, 배달 연계 등)로 틈새를 공략해야 합니다."
    else:
        grade = "과포화 주의 (C등급)"
        action_tip = "동종 경쟁점이 밀집해 있어 신규 진입 비용 대비 초기 리스크가 높습니다. 반경 200m 이탈 후보지를 추가 검토하세요."

    return {
        "candidate_lat": lat,
        "candidate_lon": lon,
        "radius_meter": radius_meter,
        "target_industry": target_name,
        "total_stores_in_radius": total_stores,
        "competitors_count": comp_count,
        "nearest_competitor_distance_m": nearest_distance,
        "office_magnets": office_count,
        "edu_magnets": edu_count,
        "health_magnets": health_count,
        "retail_magnets": retail_count,
        "site_score": total_score,
        "site_grade": grade,
        "action_tip": action_tip,
        "closest_competitors": competitors[:10],
    }

