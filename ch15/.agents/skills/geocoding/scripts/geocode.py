#!/usr/bin/env python3
"""
VWorld Geocoding & Reverse Geocoding Utility Script.
Provides CLI and Python module interfaces for geocoding, reverse geocoding,
and distance calculations using VWorld Geocoder API 2.0.
"""

import argparse
import json
import math
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import requests
except ImportError:
    print(
        "Error: 'requests' is not installed. Please install it using 'pip install requests'.",
        file=sys.stderr,
    )
    sys.exit(1)

# Optional geopy import for high-precision distance calculations
try:
    from geopy.distance import geodesic as geopy_geodesic
    from geopy.distance import great_circle as geopy_great_circle
    HAS_GEOPY = True
except ImportError:
    HAS_GEOPY = False

VWORLD_API_BASE_URL = "https://api.vworld.kr/req/address"
DEFAULT_TIMEOUT = 10
DEFAULT_CRS = "EPSG:4326"


def load_env_file() -> None:
    """Load key-value pairs from .env file if present in cwd or workspace."""
    search_dirs = [
        Path.cwd(),
        Path(__file__).resolve().parent,
        Path(__file__).resolve().parent.parent,
        Path(__file__).resolve().parent.parent.parent,
        Path(__file__).resolve().parent.parent.parent.parent,
    ]
    for directory in search_dirs:
        env_file = directory / ".env"
        if env_file.is_file():
            try:
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
                break
            except Exception:
                pass


# Attempt to load environment variables from .env
load_env_file()


def get_api_key(api_key: Optional[str] = None) -> Optional[str]:
    """Retrieve VWorld API key from argument or environment variables."""
    if api_key:
        return api_key.strip()
    return os.environ.get("VWORLD_API_KEY") or os.environ.get("VWORLD_KEY")


def _call_vworld_api(params: Dict[str, Any], timeout: int = DEFAULT_TIMEOUT) -> Dict[str, Any]:
    """Internal helper to invoke VWorld API and handle HTTP / network errors."""
    try:
        response = requests.get(VWORLD_API_BASE_URL, params=params, timeout=timeout)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.Timeout:
        return {
            "response": {
                "status": "ERROR",
                "error": {
                    "code": "TIMEOUT",
                    "text": f"Request to VWorld API timed out after {timeout}s",
                },
            }
        }
    except requests.exceptions.RequestException as e:
        return {
            "response": {
                "status": "ERROR",
                "error": {
                    "code": "REQUEST_FAILED",
                    "text": f"HTTP request failed: {str(e)}",
                },
            }
        }
    except Exception as e:
        return {
            "response": {
                "status": "ERROR",
                "error": {
                    "code": "UNEXPECTED_ERROR",
                    "text": f"Unexpected error while calling VWorld API: {str(e)}",
                },
            }
        }


def geocode_address(
    address: str,
    api_key: Optional[str] = None,
    address_type: str = "AUTO",
    crs: str = DEFAULT_CRS,
    refine: bool = True,
    simple: bool = False,
    timeout: int = DEFAULT_TIMEOUT,
) -> Dict[str, Any]:
    """
    Convert an address (Road or Parcel) to geographic coordinates using VWorld Geocoder API 2.0.

    Args:
        address: Target address (e.g. '판교로 242', '삼평동 624', '서울특별시 종로구 세종대로 209')
        api_key: VWorld API Key (defaults to VWORLD_API_KEY environment variable)
        address_type: 'AUTO', 'ROAD' (도로명주소), or 'PARCEL' (지번주소)
        crs: Coordinate reference system (default: 'EPSG:4326')
        refine: Whether to refine address (default: True)
        simple: Simplified response (default: False)
        timeout: Request timeout in seconds

    Returns:
        Structured dictionary with status and coordinates.
    """
    key = get_api_key(api_key)
    if not key:
        return {
            "status": "error",
            "code": "MISSING_API_KEY",
            "message": (
                "VWorld API key is required. Please set the VWORLD_API_KEY environment variable, "
                "add VWORLD_API_KEY to your .env file, or pass --key parameter. "
                "Get a free API key at https://www.vworld.kr"
            ),
        }

    address = address.strip()
    if not address:
        return {"status": "error", "code": "EMPTY_ADDRESS", "message": "Address query cannot be empty."}

    req_type = address_type.upper()
    types_to_try = ["ROAD", "PARCEL"] if req_type == "AUTO" else [req_type]

    last_error: Optional[Dict[str, Any]] = None

    for t in types_to_try:
        params = {
            "service": "address",
            "request": "getcoord",
            "version": "2.0",
            "crs": crs,
            "address": address,
            "refine": "true" if refine else "false",
            "simple": "true" if simple else "false",
            "format": "json",
            "errorformat": "json",
            "type": t,
            "key": key,
        }

        data = _call_vworld_api(params, timeout=timeout)
        resp = data.get("response", {})
        status = resp.get("status")

        if status == "OK":
            result_obj = resp.get("result", {})
            point = result_obj.get("point", {})
            refined = resp.get("refined", {})
            structure = refined.get("structure", {})
            full_text = refined.get("text", address)

            try:
                lon = float(point.get("x"))
                lat = float(point.get("y"))
            except (TypeError, ValueError):
                return {
                    "status": "error",
                    "code": "INVALID_COORDINATE_FORMAT",
                    "message": f"Failed to parse coordinate values from API response: {point}",
                }

            return {
                "status": "success",
                "query": address,
                "address_type": t,
                "result": {
                    "address": full_text,
                    "latitude": lat,
                    "longitude": lon,
                    "crs": result_obj.get("crs", crs),
                    "structure": structure,
                    "raw": resp,
                },
            }

        elif status == "NOT_FOUND":
            last_error = {
                "status": "error",
                "code": "NOT_FOUND",
                "message": f"No coordinates found for address '{address}' (type: {t})",
                "raw": resp,
            }
            # If AUTO, proceed to try next type (e.g. PARCEL)
            continue

        elif status == "ERROR":
            err = resp.get("error", {})
            err_code = err.get("code", "UNKNOWN_ERROR")
            err_text = err.get("text", "Unknown API error")
            return {
                "status": "error",
                "code": err_code,
                "message": f"VWorld API Error [{err_code}]: {err_text}",
                "raw": resp,
            }

    if last_error:
        last_error["message"] = f"No coordinates found for address: '{address}'"
        return last_error

    return {"status": "error", "code": "NO_RESULT", "message": f"No result returned for address: '{address}'"}


def reverse_geocode(
    latitude: float,
    longitude: float,
    api_key: Optional[str] = None,
    address_type: str = "BOTH",
    crs: str = DEFAULT_CRS,
    timeout: int = DEFAULT_TIMEOUT,
) -> Dict[str, Any]:
    """
    Convert coordinates to human-readable address using VWorld Geocoder API 2.0 (GetAddress).

    Args:
        latitude: Latitude (위도, Y)
        longitude: Longitude (경도, X)
        api_key: VWorld API Key (defaults to VWORLD_API_KEY environment variable)
        address_type: 'BOTH' (도로명+지번), 'ROAD' (도로명), or 'PARCEL' (지번)
        crs: Coordinate reference system (default: 'EPSG:4326')
        timeout: Request timeout in seconds

    Returns:
        Structured dictionary with resolved address details.
    """
    key = get_api_key(api_key)
    if not key:
        return {
            "status": "error",
            "code": "MISSING_API_KEY",
            "message": (
                "VWorld API key is required. Please set the VWORLD_API_KEY environment variable, "
                "add VWORLD_API_KEY to your .env file, or pass --key parameter. "
                "Get a free API key at https://www.vworld.kr"
            ),
        }

    req_type = address_type.upper()
    if req_type not in ("BOTH", "ROAD", "PARCEL"):
        req_type = "BOTH"

    # VWorld expects point parameter as: '경도(X),위도(Y)'
    point_str = f"{longitude},{latitude}"

    params = {
        "service": "address",
        "request": "getaddress",
        "version": "2.0",
        "crs": crs,
        "point": point_str,
        "format": "json",
        "errorformat": "json",
        "type": req_type,
        "key": key,
    }

    data = _call_vworld_api(params, timeout=timeout)
    resp = data.get("response", {})
    status = resp.get("status")

    if status == "OK":
        raw_results = resp.get("result", [])
        if isinstance(raw_results, dict):
            raw_results = [raw_results]

        if not raw_results:
            return {
                "status": "error",
                "code": "NOT_FOUND",
                "message": f"No address found for coordinates: ({latitude}, {longitude})",
            }

        # Prefer ROAD address for main display if available, else first item
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
                "structure": item.get("structure", {}),
            })

        return {
            "status": "success",
            "query": {"latitude": latitude, "longitude": longitude, "crs": crs},
            "result": {
                "address": main_addr,
                "latitude": latitude,
                "longitude": longitude,
                "items": formatted_items,
                "raw": resp,
            },
        }

    elif status == "NOT_FOUND":
        return {
            "status": "error",
            "code": "NOT_FOUND",
            "message": f"No address found for coordinates: ({latitude}, {longitude})",
            "raw": resp,
        }

    elif status == "ERROR":
        err = resp.get("error", {})
        err_code = err.get("code", "UNKNOWN_ERROR")
        err_text = err.get("text", "Unknown API error")
        return {
            "status": "error",
            "code": err_code,
            "message": f"VWorld API Error [{err_code}]: {err_text}",
            "raw": resp,
        }

    return {
        "status": "error",
        "code": "NO_RESULT",
        "message": f"No result returned for coordinates: ({latitude}, {longitude})",
    }


def _haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine great-circle distance in meters as fallback."""
    r = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def calculate_distance(
    point1: Tuple[float, float],
    point2: Tuple[float, float],
) -> Dict[str, Any]:
    """
    Calculate geodesic (WGS-84 ellipsoid) and great-circle distances between two geographic points.

    Args:
        point1: Tuple of (latitude, longitude)
        point2: Tuple of (latitude, longitude)

    Returns:
        Dictionary containing calculated distances in km, meters, and miles.
    """
    try:
        lat1, lon1 = point1[0], point1[1]
        lat2, lon2 = point2[0], point2[1]

        if HAS_GEOPY:
            dist_geodesic = geopy_geodesic((lat1, lon1), (lat2, lon2))
            dist_great_circle = geopy_great_circle((lat1, lon1), (lat2, lon2))
            km_geo = dist_geodesic.kilometers
            m_geo = dist_geodesic.meters
            mi_geo = dist_geodesic.miles
            km_gc = dist_great_circle.kilometers
            m_gc = dist_great_circle.meters
            mi_gc = dist_great_circle.miles
        else:
            m_gc = _haversine_distance_meters(lat1, lon1, lat2, lon2)
            km_gc = m_gc / 1000.0
            mi_gc = km_gc * 0.621371
            m_geo = m_gc
            km_geo = km_gc
            mi_geo = mi_gc

        return {
            "status": "success",
            "point1": {"latitude": lat1, "longitude": lon1},
            "point2": {"latitude": lat2, "longitude": lon2},
            "distance": {
                "geodesic": {
                    "kilometers": round(km_geo, 4),
                    "meters": round(m_geo, 2),
                    "miles": round(mi_geo, 4),
                },
                "great_circle": {
                    "kilometers": round(km_gc, 4),
                    "meters": round(m_gc, 2),
                    "miles": round(mi_gc, 4),
                },
            },
        }
    except Exception as e:
        return {"status": "error", "message": f"Distance calculation error: {str(e)}"}


def parse_coordinate(coord_str: str) -> Tuple[float, float]:
    """Parse comma-separated or space-separated latitude and longitude string."""
    cleaned = coord_str.replace(",", " ").strip()
    parts = [float(p) for p in cleaned.split() if p]
    if len(parts) != 2:
        raise ValueError(
            f"Expected 2 coordinate values (latitude, longitude), got {len(parts)}: '{coord_str}'"
        )
    return (parts[0], parts[1])


def main():
    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    common_parser.add_argument(
        "-k",
        "--key",
        default=None,
        help="VWorld API key (defaults to VWORLD_API_KEY environment variable)",
    )
    common_parser.add_argument(
        "--crs",
        default=DEFAULT_CRS,
        help=f"Coordinate system (default: {DEFAULT_CRS})",
    )
    common_parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"Request timeout in seconds (default: {DEFAULT_TIMEOUT})",
    )

    parser = argparse.ArgumentParser(
        description="Geocoding, Reverse Geocoding, and Distance Utility using VWorld Geocoder API 2.0",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        parents=[common_parser],
    )

    subparsers = parser.add_subparsers(dest="command", required=True, help="Sub-commands")

    # Geocode command
    geocode_parser = subparsers.add_parser(
        "geocode",
        parents=[common_parser],
        help="Geocode an address to coordinates using VWorld API",
    )
    geocode_parser.add_argument("-a", "--address", required=True, help="Address to geocode")
    geocode_parser.add_argument(
        "-t",
        "--type",
        choices=["AUTO", "ROAD", "PARCEL", "auto", "road", "parcel"],
        default="AUTO",
        help="Address search type: AUTO (auto-detect), ROAD (도로명주소), PARCEL (지번주소) (default: AUTO)",
    )
    geocode_parser.add_argument(
        "--no-refine",
        action="store_true",
        help="Disable address refinement",
    )
    geocode_parser.add_argument(
        "--simple",
        action="store_true",
        help="Return simplified response",
    )

    # Reverse geocode command
    reverse_parser = subparsers.add_parser(
        "reverse",
        parents=[common_parser],
        help="Reverse geocode coordinates to an address using VWorld API",
    )
    reverse_parser.add_argument("--lat", type=float, required=True, help="Latitude (위도, Y)")
    reverse_parser.add_argument("--lon", type=float, required=True, help="Longitude (경도, X)")
    reverse_parser.add_argument(
        "-t",
        "--type",
        choices=["BOTH", "ROAD", "PARCEL", "both", "road", "parcel"],
        default="BOTH",
        help="Address return type: BOTH, ROAD, or PARCEL (default: BOTH)",
    )

    # Distance command
    dist_parser = subparsers.add_parser(
        "distance",
        parents=[common_parser],
        help="Calculate distance between two coordinates",
    )
    dist_parser.add_argument(
        "-p1",
        "--point1",
        required=True,
        help="Point 1 coordinates: 'lat,lon' or 'lat lon'",
    )
    dist_parser.add_argument(
        "-p2",
        "--point2",
        required=True,
        help="Point 2 coordinates: 'lat,lon' or 'lat lon'",
    )

    args = parser.parse_args()

    if args.command == "geocode":
        data = geocode_address(
            address=args.address,
            api_key=args.key,
            address_type=args.type,
            crs=args.crs,
            refine=not args.no_refine,
            simple=args.simple,
            timeout=args.timeout,
        )
    elif args.command == "reverse":
        data = reverse_geocode(
            latitude=args.lat,
            longitude=args.lon,
            api_key=args.key,
            address_type=args.type,
            crs=args.crs,
            timeout=args.timeout,
        )
    elif args.command == "distance":
        try:
            p1 = parse_coordinate(args.point1)
            p2 = parse_coordinate(args.point2)
            data = calculate_distance(p1, p2)
        except ValueError as e:
            data = {"status": "error", "message": str(e)}
    else:
        parser.print_help()
        sys.exit(1)

    # Output formatting
    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        if data["status"] == "error":
            print(f"[ERROR] {data['message']}", file=sys.stderr)
            sys.exit(1)

        if args.command == "geocode":
            res = data["result"]
            print("=== VWorld Geocoding Result ===")
            print(f"Query Address: {data['query']}")
            print(f"Address Type : {data.get('address_type', 'N/A')}")
            print(f"Full Address : {res['address']}")
            print(f"Latitude (Y) : {res['latitude']}")
            print(f"Longitude (X): {res['longitude']}")
            print(f"CRS          : {res.get('crs', DEFAULT_CRS)}")
            struct = res.get("structure")
            if struct:
                parts = [f"{k}: {v}" for k, v in struct.items() if v]
                if parts:
                    print(f"Structure    : {', '.join(parts)}")

        elif args.command == "reverse":
            res = data["result"]
            print("=== VWorld Reverse Geocoding Result ===")
            print(f"Coordinates  : Lat {res['latitude']}, Lon {res['longitude']}")
            print(f"Main Address : {res['address']}")
            items = res.get("items", [])
            if len(items) > 1:
                print("\nDetailed Addresses:")
                for item in items:
                    zipcode_str = f" [Zip: {item['zipcode']}]" if item.get("zipcode") else ""
                    print(f" - [{item['type']}]{zipcode_str} {item['address']}")

        elif args.command == "distance":
            dist = data["distance"]
            print("=== Distance Calculation ===")
            print(f"Point 1 : ({data['point1']['latitude']}, {data['point1']['longitude']})")
            print(f"Point 2 : ({data['point2']['latitude']}, {data['point2']['longitude']})")
            print(f"Geodesic (WGS-84) : {dist['geodesic']['kilometers']} km ({dist['geodesic']['meters']} m)")
            print(f"Great-Circle      : {dist['great_circle']['kilometers']} km ({dist['great_circle']['meters']} m)")


if __name__ == "__main__":
    main()
