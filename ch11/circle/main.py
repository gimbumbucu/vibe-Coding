"""main.py - 원의 둘레 계산기 실행 예제"""
from circle import calculate_circumference


def print_separator():
    print("-" * 40)


def demo_examples():
    """다양한 예제를 자동으로 출력합니다."""
    print("=" * 40)
    print("     원의 둘레 계산기 (C = 2πr)")
    print("=" * 40)

    examples = [1, 5, 10, 2.5, 0]
    print("\n[예제 출력]")
    print_separator()
    for r in examples:
        circumference = calculate_circumference(r)
        print(f"  반지름 {r:>4}  →  둘레 = {circumference:.4f}")
    print_separator()


def interactive_mode():
    """사용자 입력을 받아 둘레를 계산합니다."""
    print("\n[직접 계산해보기]")
    print("(종료하려면 'q' 입력)\n")

    while True:
        user_input = input("반지름을 입력하세요: ").strip()

        if user_input.lower() == "q":
            print("\n프로그램을 종료합니다.")
            break

        try:
            radius = float(user_input)
            result = calculate_circumference(radius)
            print(f"  → 원의 둘레: {result:.6f}\n")
        except ValueError as e:
            # float 변환 실패 또는 음수 반지름
            print(f"  ⚠  오류: {e}\n")
        except TypeError as e:
            print(f"  ⚠  오류: {e}\n")


if __name__ == "__main__":
    demo_examples()
    interactive_mode()
