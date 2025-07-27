import requests
import json

def get_weather_data(latitude:float, longitude:float):
    print(f"Latitude: {latitude}, Longitude: {longitude}")
    """
    Fetches weather data from the Open-Meteo API based on user-provided latitude and longitude.
    """
    base_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "sunrise,sunset,daylight_duration,sunshine_duration,weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max,precipitation_hours,showers_sum,rain_sum,snowfall_sum,uv_index_max,uv_index_clear_sky_max,wind_direction_10m_dominant,temperature_2m_mean,dew_point_2m_mean,visibility_mean,snowfall_water_equivalent_sum,pressure_msl_mean,relative_humidity_2m_mean,precipitation_probability_mean,wind_speed_10m_mean,leaf_wetness_probability_mean,cloud_cover_mean,surface_pressure_mean",
        "current": "temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m",
        "timezone": "auto",
        "forecast_days": 1
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        
        weather_data = response.json()

        daily_data = weather_data['daily']
        dates = daily_data.get('time', [])
        daily_units = weather_data.get('daily_units', {})

        # current_data = weather_data['current']
        
        restructured_data_daily = {}
        if dates:
            for i, date in enumerate(dates):
                date_data = {}
                for key, values in daily_data.items():
                    if key != 'time' and values is not None and i < len(values):
                        unit = daily_units.get(key, '')
                        value = values[i]
                        date_data[key] = f"{value} {unit}".strip() if value is not None else None
                restructured_data_daily[date] = date_data
        
        # processed_output = {
        #     "daily_forecast": restructured_data_daily
        # }
        # print(json.dumps(restructured_data_daily, indent=2))

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while fetching data from the API: {e}")
    except json.JSONDecodeError:
        print("Failed to decode JSON from the response.")

# if __name__ == "__main__":
#     get_weather_data(latitude = 17, longitude = 78)
