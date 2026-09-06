import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()


def get_current_time() -> str:
    """현재 날짜와 시각(년, 월, 일, 시, 분, 초) 정보를 반환합니다."""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="지금 몇시야?",
    config=types.GenerateContentConfig(
        tools=[get_current_time],
    ),
)

print(response.text)