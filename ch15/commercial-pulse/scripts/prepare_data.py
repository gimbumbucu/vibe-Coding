"""
소상공인시장진흥공단 전국 상가(상권)정보 CSV 데이터를
고성능 단일 Parquet 파일로 변환 및 최적화하는 스크립트입니다.
"""

import os
import sys
import glob
import time
import duckdb

# UTF-8 stdout configuration for Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_DIR = os.path.join(DATA_DIR, "소상공인시장진흥공단_상가(상권)정보_20260630")
OUTPUT_PARQUET = os.path.join(DATA_DIR, "commercial_stores_national.parquet")


def convert_csv_to_parquet():
    print("=" * 60)
    print("소상공인 상가(상권)정보 데이터 Parquet 고속 변환 시작")
    print("=" * 60)

    if not os.path.exists(CSV_DIR):
        print(f"[오류] 데이터 디렉토리를 찾을 수 없습니다: {CSV_DIR}")
        return False

    csv_files = glob.glob(os.path.join(CSV_DIR, "*.csv"))
    print(f"발견된 CSV 파일 수: {len(csv_files)}개")
    for f in sorted(csv_files):
        sz = os.path.getsize(f) / (1024 * 1024)
        print(f"  - {os.path.basename(f)} ({sz:.1f} MB)")

    con = duckdb.connect()
    csv_glob_path = os.path.join(CSV_DIR, "*.csv").replace("\\", "/")
    output_path = OUTPUT_PARQUET.replace("\\", "/")

    print("\nDuckDB를 사용하여 Parquet 변환 및 압축을 진행합니다...")
    t0 = time.time()

    query = f"""
    COPY (
        SELECT 
            상가업소번호,
            상호명,
            지점명,
            상권업종대분류코드,
            상권업종대분류명,
            상권업종중분류코드,
            상권업종중분류명,
            상권업종소분류코드,
            상권업종소분류명,
            시도코드,
            시도명,
            시군구코드,
            시군구명,
            행정동코드,
            행정동명,
            법정동코드,
            법정동명,
            도로명주소,
            지번주소,
            건물명,
            CAST(경도 AS DOUBLE) as 경도,
            CAST(위도 AS DOUBLE) as 위도
        FROM read_csv(
            '{csv_glob_path}',
            header=True,
            union_by_name=True,
            ignore_errors=True
        )
        WHERE 경도 IS NOT NULL AND 위도 IS NOT NULL
          AND 경도 BETWEEN 124.0 AND 132.0
          AND 위도 BETWEEN 33.0 AND 39.0
    ) TO '{output_path}' (FORMAT PARQUET, COMPRESSION ZSTD);
    """

    con.execute(query)
    t1 = time.time()

    if os.path.exists(OUTPUT_PARQUET):
        size_mb = os.path.getsize(OUTPUT_PARQUET) / (1024 * 1024)
        print(f"\n[성공] Parquet 변환 완료! (소요 시간: {t1 - t0:.2f}초)")
        print(f"생성된 파일: {OUTPUT_PARQUET}")
        print(f"파일 크기: {size_mb:.2f} MB")

        # Quick validation
        count_res = con.execute(f"SELECT COUNT(*) FROM '{output_path}'").fetchone()
        print(f"총 상가 레코드 수: {count_res[0]:,} 건")
        return True
    else:
        print("[실패] Parquet 파일 생성에 실패했습니다.")
        return False


if __name__ == "__main__":
    convert_csv_to_parquet()
