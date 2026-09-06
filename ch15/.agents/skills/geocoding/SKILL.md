---
name: geocoding
description: >-
  Geocoding and reverse geocoding skill using Python and VWorld (브이월드) Geocoder API 2.0.
  Use this skill when you need to convert Korean street addresses (도로명주소/지번주소) or place names into geographic coordinates (latitude and longitude),
  convert coordinates back into human-readable addresses, or calculate geodesic distances between locations.
---

# Geocoding Skill (VWorld Geocoder API 2.0)

This skill provides geocoding, reverse geocoding, and distance calculation capabilities using Python and the official **VWorld (브이월드) Geocoder API 2.0** (`https://api.vworld.kr/req/address`).

## Prerequisites

1. Install required Python packages:
   ```bash
   pip install -r .agents/skills/geocoding/requirements.txt
   ```
   *(Requires `requests` and optionally `geopy`)*

2. **VWorld API Key**:
   - Issue a free API key from [브이월드 오픈플랫폼 (VWorld)](https://www.vworld.kr).
   - Configure the key using any of the following methods:
     - **Environment Variable**:
       - Windows PowerShell: `$env:VWORLD_API_KEY="YOUR_API_KEY"`
       - Linux/macOS: `export VWORLD_API_KEY="YOUR_API_KEY"`
     - **`.env` File**: Add `VWORLD_API_KEY=YOUR_API_KEY` in the workspace root or project directory.
     - **CLI Argument**: Pass `-k "YOUR_API_KEY"` or `--key "YOUR_API_KEY"`.

---

## Capabilities & Usage

The main helper script is located at:
[`scripts/geocode.py`](./scripts/geocode.py)

### 1. Geocoding (Address ➔ Coordinates)

Convert a Korean road name address (`ROAD`) or parcel/lot number address (`PARCEL`) into latitude and longitude coordinates.

```bash
# Basic usage (AUTO-detects ROAD or PARCEL)
python .agents/skills/geocoding/scripts/geocode.py geocode --address "판교로 242"

# Specify address type (ROAD or PARCEL)
python .agents/skills/geocoding/scripts/geocode.py geocode --address "삼평동 624" --type PARCEL

# Output in JSON format
python .agents/skills/geocoding/scripts/geocode.py geocode --address "서울특별시 종로구 세종대로 209" --json

# Pass API key explicitly
python .agents/skills/geocoding/scripts/geocode.py geocode --address "판교로 242" --key "YOUR_KEY"
```

**Parameters**:
- `-a`, `--address` (required): Address string to query (e.g. `판교로 242`, `삼평동 624`, `서울특별시 종로구 세종대로 209`).
- `-t`, `--type` (optional, default: `AUTO`): Search address type (`AUTO`, `ROAD` for 도로명주소, `PARCEL` for 지번주소).
- `-k`, `--key` (optional): VWorld API Key (defaults to `VWORLD_API_KEY` environment variable).
- `--crs` (optional, default: `EPSG:4326`): Coordinate reference system (`EPSG:4326`, `EPSG:3857`, `EPSG:5179`, etc.).
- `--no-refine` (optional): Disable address refinement (`refine=false`).
- `--simple` (optional): Request simplified response.
- `--json` (optional): Output result in structured JSON format.

---

### 2. Reverse Geocoding (Coordinates ➔ Address)

Convert latitude and longitude coordinates into a human-readable address.

```bash
# Basic reverse geocoding
python .agents/skills/geocoding/scripts/geocode.py reverse --lat 37.401219 --lon 127.108620

# JSON output
python .agents/skills/geocoding/scripts/geocode.py reverse --lat 37.401219 --lon 127.108620 --json

# Return only Road name address or Parcel address
python .agents/skills/geocoding/scripts/geocode.py reverse --lat 37.401219 --lon 127.108620 --type ROAD
```

**Parameters**:
- `--lat` (required): Latitude value (위도, Y).
- `--lon` (required): Longitude value (경도, X).
- `-t`, `--type` (optional, default: `BOTH`): Address return type (`BOTH`, `ROAD`, `PARCEL`).
- `-k`, `--key` (optional): VWorld API Key.
- `--crs` (optional, default: `EPSG:4326`): Coordinate reference system.
- `--json` (optional): Output result in JSON format.

---

### 3. Distance Calculation (Point ➔ Point)

Calculate geodesic (WGS-84 ellipsoid) and great-circle distances between two geographic coordinates.

```bash
# Basic distance calculation (Seoul City Hall -> Busan City Hall)
python .agents/skills/geocoding/scripts/geocode.py distance --point1 "37.5665, 126.9780" --point2 "35.1796, 129.0756"

# JSON output
python .agents/skills/geocoding/scripts/geocode.py distance -p1 "37.5665 126.9780" -p2 "35.1796 129.0756" --json
```

**Parameters**:
- `-p1`, `--point1` (required): First coordinate in `lat,lon` or `lat lon` format.
- `-p2`, `--point2` (required): Second coordinate in `lat,lon` or `lat lon` format.
- `--json` (optional): Output result in JSON format.

---

## Python Module Usage

You can import and use the geocoding functions directly in Python scripts:

```python
from geocode import geocode_address, reverse_geocode, calculate_distance

# 1. Geocoding (uses VWORLD_API_KEY from environment or parameter)
res = geocode_address("판교로 242")
if res["status"] == "success":
    print("Address  :", res["result"]["address"])
    print("Latitude :", res["result"]["latitude"])
    print("Longitude:", res["result"]["longitude"])

# 2. Reverse Geocoding
rev = reverse_geocode(latitude=37.401219, longitude=127.108620)
if rev["status"] == "success":
    print("Resolved Address:", rev["result"]["address"])

# 3. Distance Calculation
dist = calculate_distance((37.5665, 126.9780), (35.1796, 129.0756))
print("Distance:", dist["distance"]["geodesic"]["kilometers"], "km")
```

See [`examples/example_usage.py`](./examples/example_usage.py) for a complete runnable script.

---

## VWorld API Error Handling

The script handles VWorld Geocoder API 2.0 response codes:
- `OK`: Request succeeded, coordinates or address returned.
- `NOT_FOUND`: Query address or coordinate was not found in the spatial database.
- `INVALID_KEY`: The API key is invalid or unregistered.
- `INCORRECT_KEY`: Domain/IP mismatch for the key.
- `OVER_REQUEST_LIMIT`: Daily limit (40,000 requests/day) exceeded.
- `PARAM_REQUIRED` / `INVALID_TYPE`: Missing or malformed parameters.
