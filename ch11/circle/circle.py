"""circle.py - 원의 둘레를 계산하는 모듈"""
import math


def calculate_circumference(radius):
    """원의 둘레를 계산합니다.

    Args:
        radius: 원의 반지름 (0 이상의 숫자)

    Returns:
        float: 원의 둘레 (2 * π * radius)

    Raises:
        TypeError: radius가 숫자가 아닌 경우
        ValueError: radius가 음수인 경우
    """
    if isinstance(radius, bool) or not isinstance(radius, (int, float)):
        raise TypeError("반지름은 숫자여야 합니다")
    if radius < 0:
        raise ValueError("반지름은 0 이상이어야 합니다")
    return 2 * math.pi * radius
