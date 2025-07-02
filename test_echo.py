import requests
import json

def test_echo_function():
    """
    Тестирование эхо функции на Netlify
    """
    # URL вашего деплоя на Netlify (замените на ваш)
    base_url = "https://your-site-name.netlify.app"  # Замените на ваш URL
    echo_url = f"{base_url}/echo"
    
    print(f"Тестируем эхо функцию: {echo_url}")
    
    # Тестовые данные
    test_data = {
        "message": "Привет от тестового скрипта!",
        "timestamp": "2024-01-01T12:00:00Z",
        "test_number": 123
    }
    
    try:
        # POST запрос
        print("\n=== POST запрос ===")
        response = requests.post(
            echo_url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Статус: {response.status_code}")
        print(f"Заголовки ответа: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"Ответ (JSON): {json.dumps(result, ensure_ascii=False, indent=2)}")
            except json.JSONDecodeError:
                print(f"Ответ (текст): {response.text}")
        else:
            print(f"Ошибка: {response.text}")
            
        # GET запрос
        print("\n=== GET запрос ===")
        response_get = requests.get(echo_url, timeout=10)
        print(f"Статус: {response_get.status_code}")
        
        if response_get.status_code == 200:
            try:
                result_get = response_get.json()
                print(f"Ответ (JSON): {json.dumps(result_get, ensure_ascii=False, indent=2)}")
            except json.JSONDecodeError:
                print(f"Ответ (текст): {response_get.text}")
        else:
            print(f"Ошибка: {response_get.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Ошибка запроса: {e}")
    except Exception as e:
        print(f"Неожиданная ошибка: {e}")

if __name__ == "__main__":
    print("=== Тест эхо функции ===")
    print("ВНИМАНИЕ: Замените base_url на ваш реальный URL Netlify!")
    test_echo_function()