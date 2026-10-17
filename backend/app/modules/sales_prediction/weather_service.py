import os
from collections import defaultdict
from datetime import date, datetime
from functools import lru_cache
from typing import Dict, Tuple
from zoneinfo import ZoneInfo

import requests


FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
SEASONAL_URL = "https://seasonal-api.open-meteo.com/v1/seasonal"

WEATHER_LATITUDE = float(os.getenv("WEATHER_LATITUDE", "7.4863"))
WEATHER_LONGITUDE = float(os.getenv("WEATHER_LONGITUDE", "80.3647"))
WEATHER_TIMEZONE = os.getenv("WEATHER_TIMEZONE", "Asia/Colombo")
WEATHER_LOCATION_NAME = os.getenv("WEATHER_LOCATION_NAME", "Kurunegala, Sri Lanka")
WEATHER_HISTORY_YEARS = max(1, int(os.getenv("WEATHER_HISTORY_YEARS", "5")))
REQUEST_TIMEOUT_SECONDS = int(os.getenv("WEATHER_API_TIMEOUT", "25"))


def _safe_mean(values):
    numeric = [float(value) for value in values if value is not None]
    return sum(numeric) / len(numeric) if numeric else 0.0


def _aggregate_current_month(payload: Dict, year: int, month: int) -> Dict[str, float]:
    daily = payload.get("daily", {})
    hourly = payload.get("hourly", {})

    daily_times = daily.get("time", [])
    hourly_times = hourly.get("time", [])

    daily_rows = [
        index
        for index, iso_date in enumerate(daily_times)
        if (parsed := date.fromisoformat(iso_date)).year == year and parsed.month == month
    ]
    hourly_rows = [
        index
        for index, iso_time in enumerate(hourly_times)
        if (parsed := datetime.fromisoformat(iso_time)).year == year and parsed.month == month
    ]

    if not daily_rows:
        raise ValueError("Weather API did not return data for the current month.")

    precipitation = [
        daily.get("precipitation_sum", [None] * len(daily_times))[i]
        for i in daily_rows
    ]

    profile = {
        "Rainfall_mm": sum(float(value or 0) for value in precipitation),
        "Humidity_pct": _safe_mean([
            hourly.get("relative_humidity_2m", [None] * len(hourly_times))[i]
            for i in hourly_rows
        ]),
        "Avg_High_C": _safe_mean([
            daily.get("temperature_2m_max", [None] * len(daily_times))[i]
            for i in daily_rows
        ]),
        "Avg_Low_C": _safe_mean([
            daily.get("temperature_2m_min", [None] * len(daily_times))[i]
            for i in daily_rows
        ]),
        "Rainy_Days": float(sum(1 for value in precipitation if float(value or 0) >= 1.0)),
        "Cloud_pct": _safe_mean([
            hourly.get("cloud_cover", [None] * len(hourly_times))[i]
            for i in hourly_rows
        ]),
        "Wind_mph": _safe_mean([
            daily.get("wind_speed_10m_max", [None] * len(daily_times))[i]
            for i in daily_rows
        ]),
    }

    return {key: round(float(value), 2) for key, value in profile.items()}


def fetch_current_month_weather() -> Dict:
    today = datetime.now(ZoneInfo(WEATHER_TIMEZONE)).date()

    params = {
        "latitude": WEATHER_LATITUDE,
        "longitude": WEATHER_LONGITUDE,
        "timezone": WEATHER_TIMEZONE,
        "past_days": 31,
        "forecast_days": 1,
        "wind_speed_unit": "mph",
        "hourly": "relative_humidity_2m,cloud_cover",
        "daily": (
            "temperature_2m_max,temperature_2m_min,"
            "precipitation_sum,wind_speed_10m_max"
        ),
    }

    response = requests.get(FORECAST_URL, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()

    return {
        "year": today.year,
        "month": today.month,
        "location": WEATHER_LOCATION_NAME,
        "source": "Open-Meteo Forecast API (month-to-date aggregation)",
        "weather_profile": _aggregate_current_month(
            response.json(),
            today.year,
            today.month,
        ),
    }


@lru_cache(maxsize=1)
def fetch_historical_monthly_profiles() -> Tuple[Dict[int, Dict[str, float]], str]:
    today = datetime.now(ZoneInfo(WEATHER_TIMEZONE)).date()
    end_year = today.year - 1
    start_year = end_year - WEATHER_HISTORY_YEARS + 1

    params = {
        "latitude": WEATHER_LATITUDE,
        "longitude": WEATHER_LONGITUDE,
        "timezone": WEATHER_TIMEZONE,
        "start_date": f"{start_year}-01-01",
        "end_date": f"{end_year}-12-31",
        "wind_speed_unit": "mph",
        "hourly": "relative_humidity_2m,cloud_cover",
        "daily": (
            "temperature_2m_max,temperature_2m_min,"
            "precipitation_sum,wind_speed_10m_max"
        ),
    }

    response = requests.get(ARCHIVE_URL, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload = response.json()

    daily = payload.get("daily", {})
    hourly = payload.get("hourly", {})
    daily_times = daily.get("time", [])
    hourly_times = hourly.get("time", [])

    month_periods = defaultdict(lambda: {
        "rainfall": 0.0,
        "rainy_days": 0.0,
        "highs": [],
        "lows": [],
        "winds": [],
    })

    for index, iso_date in enumerate(daily_times):
        parsed = date.fromisoformat(iso_date)
        key = (parsed.year, parsed.month)

        precip = daily.get("precipitation_sum", [None] * len(daily_times))[index]
        high = daily.get("temperature_2m_max", [None] * len(daily_times))[index]
        low = daily.get("temperature_2m_min", [None] * len(daily_times))[index]
        wind = daily.get("wind_speed_10m_max", [None] * len(daily_times))[index]

        if precip is not None:
            month_periods[key]["rainfall"] += float(precip)
            if float(precip) >= 1.0:
                month_periods[key]["rainy_days"] += 1.0
        if high is not None:
            month_periods[key]["highs"].append(float(high))
        if low is not None:
            month_periods[key]["lows"].append(float(low))
        if wind is not None:
            month_periods[key]["winds"].append(float(wind))

    hourly_by_month = defaultdict(lambda: {"humidity": [], "cloud": []})
    for index, iso_time in enumerate(hourly_times):
        parsed = datetime.fromisoformat(iso_time)
        humidity = hourly.get("relative_humidity_2m", [None] * len(hourly_times))[index]
        cloud = hourly.get("cloud_cover", [None] * len(hourly_times))[index]

        if humidity is not None:
            hourly_by_month[parsed.month]["humidity"].append(float(humidity))
        if cloud is not None:
            hourly_by_month[parsed.month]["cloud"].append(float(cloud))

    grouped = defaultdict(lambda: {
        "Rainfall_mm": [],
        "Rainy_Days": [],
        "Avg_High_C": [],
        "Avg_Low_C": [],
        "Wind_mph": [],
    })

    for (_, month), values in month_periods.items():
        grouped[month]["Rainfall_mm"].append(values["rainfall"])
        grouped[month]["Rainy_Days"].append(values["rainy_days"])
        grouped[month]["Avg_High_C"].append(_safe_mean(values["highs"]))
        grouped[month]["Avg_Low_C"].append(_safe_mean(values["lows"]))
        grouped[month]["Wind_mph"].append(_safe_mean(values["winds"]))

    profiles = {}
    for month in range(1, 13):
        if month not in grouped:
            continue

        profiles[month] = {
            "Rainfall_mm": round(_safe_mean(grouped[month]["Rainfall_mm"]), 2),
            "Humidity_pct": round(_safe_mean(hourly_by_month[month]["humidity"]), 2),
            "Avg_High_C": round(_safe_mean(grouped[month]["Avg_High_C"]), 2),
            "Avg_Low_C": round(_safe_mean(grouped[month]["Avg_Low_C"]), 2),
            "Rainy_Days": round(_safe_mean(grouped[month]["Rainy_Days"]), 2),
            "Cloud_pct": round(_safe_mean(hourly_by_month[month]["cloud"]), 2),
            "Wind_mph": round(_safe_mean(grouped[month]["Wind_mph"]), 2),
        }

    if len(profiles) != 12:
        raise ValueError("Could not create all 12 monthly weather profiles from Open-Meteo.")

    source = (
        f"Open-Meteo Historical Weather API averages "
        f"({start_year}-{end_year}, {WEATHER_LOCATION_NAME})"
    )
    return profiles, source


def _next_year_month(year: int, month: int) -> tuple[int, int]:
    if month == 12:
        return year + 1, 1
    return year, month + 1


def _requested_months(start_year: int, start_month: int, count: int = 12):
    months = []
    year, month = int(start_year), int(start_month)
    for _ in range(count):
        months.append((year, month))
        year, month = _next_year_month(year, month)
    return months


def fetch_forecast_monthly_profiles(
    start_year: int,
    start_month: int,
    months: int = 12,
) -> Tuple[Dict[int, Dict[str, float]], Dict[int, str], str]:
    """
    Build monthly weather inputs for the ML forecast.

    Priority:
      1. Open-Meteo ECMWF seasonal ensemble-mean forecast for months that
         are inside the available long-range forecast horizon.
      2. Open-Meteo historical monthly climatology for months outside that
         horizon or when a seasonal month is incomplete/unavailable.

    The ML model still receives the same seven weather features it was
    trained with, so no model retraining is required.
    """
    requested = _requested_months(start_year, start_month, months)

    # Baseline for months outside the seasonal forecast horizon. If the
    # archive service is temporarily unavailable, leave those months absent;
    # forecast_next_12_months will then use the trained model bundle profile.
    try:
        historical_profiles, historical_source = fetch_historical_monthly_profiles()
    except Exception:
        historical_profiles = {}
        historical_source = (
            "Fallback: monthly weather profile saved inside the trained model bundle"
        )

    profiles = {
        month: dict(historical_profiles[month])
        for _, month in requested
        if month in historical_profiles
    }
    sources = {
        month: historical_source
        for _, month in requested
        if month in historical_profiles
    }

    params = {
        "latitude": WEATHER_LATITUDE,
        "longitude": WEATHER_LONGITUDE,
        "timezone": WEATHER_TIMEZONE,
        "forecast_days": 217,
        "models": "ecmwf_seasonal_ensemble_mean_seamless",
        "wind_speed_unit": "mph",
        "hourly": (
            "temperature_2m,relative_humidity_2m,precipitation,"
            "cloud_cover,wind_speed_10m"
        ),
    }

    response = requests.get(SEASONAL_URL, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload = response.json()
    hourly = payload.get("hourly", {})
    times = hourly.get("time", [])

    temperature = hourly.get("temperature_2m", [])
    humidity = hourly.get("relative_humidity_2m", [])
    precipitation = hourly.get("precipitation", [])
    cloud = hourly.get("cloud_cover", [])
    wind = hourly.get("wind_speed_10m", [])

    if not times:
        raise ValueError("Seasonal weather API returned no forecast time series.")

    # Aggregate the native 6-hourly seasonal forecast into daily values first.
    daily = defaultdict(lambda: {
        "temperature": [],
        "humidity": [],
        "precipitation": 0.0,
        "cloud": [],
        "wind": [],
    })

    for index, iso_time in enumerate(times):
        parsed = datetime.fromisoformat(str(iso_time))
        key = parsed.date()

        if index < len(temperature) and temperature[index] is not None:
            daily[key]["temperature"].append(float(temperature[index]))
        if index < len(humidity) and humidity[index] is not None:
            daily[key]["humidity"].append(float(humidity[index]))
        if index < len(precipitation) and precipitation[index] is not None:
            daily[key]["precipitation"] += float(precipitation[index])
        if index < len(cloud) and cloud[index] is not None:
            daily[key]["cloud"].append(float(cloud[index]))
        if index < len(wind) and wind[index] is not None:
            daily[key]["wind"].append(float(wind[index]))

    monthly = defaultdict(lambda: {
        "rainfall": 0.0,
        "humidity": [],
        "highs": [],
        "lows": [],
        "rainy_days": 0.0,
        "cloud": [],
        "winds": [],
        "days": 0,
    })

    for day, values in daily.items():
        key = (day.year, day.month)
        bucket = monthly[key]
        bucket["days"] += 1
        bucket["rainfall"] += values["precipitation"]
        if values["precipitation"] >= 1.0:
            bucket["rainy_days"] += 1.0
        if values["temperature"]:
            bucket["highs"].append(max(values["temperature"]))
            bucket["lows"].append(min(values["temperature"]))
        if values["humidity"]:
            bucket["humidity"].append(_safe_mean(values["humidity"]))
        if values["cloud"]:
            bucket["cloud"].append(_safe_mean(values["cloud"]))
        if values["wind"]:
            bucket["winds"].append(max(values["wind"]))

    requested_set = set(requested)
    seasonal_months_used = []

    for (year, month), values in monthly.items():
        if (year, month) not in requested_set or values["days"] < 10:
            continue

        profiles[month] = {
            "Rainfall_mm": round(float(values["rainfall"]), 2),
            "Humidity_pct": round(_safe_mean(values["humidity"]), 2),
            "Avg_High_C": round(_safe_mean(values["highs"]), 2),
            "Avg_Low_C": round(_safe_mean(values["lows"]), 2),
            "Rainy_Days": round(float(values["rainy_days"]), 2),
            "Cloud_pct": round(_safe_mean(values["cloud"]), 2),
            "Wind_mph": round(_safe_mean(values["winds"]), 2),
        }
        sources[month] = (
            "Open-Meteo ECMWF seasonal ensemble-mean forecast "
            f"({WEATHER_LOCATION_NAME})"
        )
        seasonal_months_used.append((year, month))

    if seasonal_months_used:
        overall_source = (
            "Hybrid live weather forecast: Open-Meteo ECMWF seasonal forecast "
            "where available, with historical/model monthly fallback outside "
            "the forecast horizon"
        )
    else:
        overall_source = historical_source

    return profiles, sources, overall_source
