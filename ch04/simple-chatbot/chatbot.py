import os
from google import genai
from dotenv import load_dotenv

def main():
    # Load environment variables from .env file
    load_dotenv()
    
    print("Welcome to Stateless Gemini Chatbot! Type 'quit' or 'exit' to end the conversation.")
    print("이 챗봇은 완전한 무상태(Stateless)입니다. 이전 대화의 내용을 전혀 기억하지 못합니다.\n")
    
    # Initialize the client. It automatically picks up the GEMINI_API_KEY environment variable.
    try:
        client = genai.Client()
    except Exception as e:
        print(f"Failed to initialize client. Please ensure GEMINI_API_KEY is set as an environment variable.\nError: {e}")
        return

    model_name = "gemini-3.5-flash"
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ['quit', 'exit']:
            print("Goodbye!")
            break
            
        if not user_input.strip():
            continue
            
        try:
            # 과거의 대화 기록(history)을 관리하지 않고, 
            # store=False 로 설정하여 서버에도 저장하지 않으며
            # 오직 '현재 입력(user_input)' 하나만 모델로 보냅니다.
            interaction = client.interactions.create(
                model=model_name,
                store=False,
                input=user_input
            )
            
            # 응답 텍스트 출력
            print(f"Gemini: {interaction.output_text}")
            
        except Exception as e:
            print(f"An error occurred during generation: {e}")

if __name__ == "__main__":
    main()
