import requests
import json

url = "https://6864a22983d3e600082e8a7d--max-weather-bot.netlify.app/webhook/max"
data = {"message": {"text": "/weather Москва", "chat": {"id": 123}, "from": {"id": 456}}}

try:
    r = requests.post(url, json=data, timeout=10)
    print(f"Status: {r.status_code}")
    if r.text:
        print(f"Response: {r.text[:200]}")
except Exception as e:
    print(f"Error: {e}")