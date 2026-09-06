"""
Example usage of VWorld Geocoding & Reverse Geocoding in Python.
"""

import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add scripts directory to sys.path
scripts_dir = Path(__file__).resolve().parent.parent / "scripts"
sys.path.append(str(scripts_dir))

from geocode import geocode_address, reverse_geocode, calculate_distance


def main():
    # Note: Set VWORLD_API_KEY environment variable or pass api_key parameter
    api_key = os.getenv("VWORLD_API_KEY")

    print("=== VWorld Geocoding Python Example ===")
    if not api_key:
        print("[INFO] VWORLD_API_KEY environment variable is not set.")
        print("To test live API requests, set the key:")
        print("  $env:VWORLD_API_KEY='YOUR_VWORLD_API_KEY' (PowerShell)")
        print("  export VWORLD_API_KEY='YOUR_VWORLD_API_KEY' (Linux/macOS)\n")

    print("--- 1. Geocoding: Road Address (도로명주소) ---")
    address_road = "판교로 242"
    res_road = geocode_address(address_road, api_key=api_key)
    if res_road["status"] == "success":
        r = res_road["result"]
        print(f"Query    : {address_road}")
        print(f"Address  : {r['address']}")
        print(f"Latitude : {r['latitude']}")
        print(f"Longitude: {r['longitude']}")
        lat, lon = r["latitude"], r["longitude"]
    else:
        print(f"Geocoding failed/skipped: {res_road.get('message')}")
        lat, lon = 37.401219, 127.108620  # Default fallback for demo

    print("\n--- 2. Geocoding: Parcel Address (지번주소) ---")
    address_parcel = "삼평동 624"
    res_parcel = geocode_address(address_parcel, api_key=api_key, address_type="PARCEL")
    if res_parcel["status"] == "success":
        r = res_parcel["result"]
        print(f"Query    : {address_parcel}")
        print(f"Address  : {r['address']}")
        print(f"Latitude : {r['latitude']}")
        print(f"Longitude: {r['longitude']}")
    else:
        print(f"Geocoding failed/skipped: {res_parcel.get('message')}")

    print("\n--- 3. Reverse Geocoding (Coordinates -> Address) ---")
    res_reverse = reverse_geocode(latitude=lat, longitude=lon, api_key=api_key)
    if res_reverse["status"] == "success":
        r = res_reverse["result"]
        print(f"Input Coordinates : Lat {lat}, Lon {lon}")
        print(f"Resolved Address  : {r['address']}")
        if len(r.get("items", [])) > 1:
            for item in r["items"]:
                print(f" - [{item['type']}] {item['address']}")
    else:
        print(f"Reverse geocoding failed/skipped: {res_reverse.get('message')}")

    print("\n--- 4. Distance Calculation (Seoul City Hall -> Busan City Hall) ---")
    seoul = (37.5665, 126.9780)
    busan = (35.1796, 129.0756)
    res_dist = calculate_distance(seoul, busan)
    if res_dist["status"] == "success":
        d = res_dist["distance"]["geodesic"]
        print(f"Seoul ({seoul[0]}, {seoul[1]}) -> Busan ({busan[0]}, {busan[1]})")
        print(f"Geodesic Distance: {d['kilometers']} km ({d['miles']} miles)")


if __name__ == "__main__":
    main()
