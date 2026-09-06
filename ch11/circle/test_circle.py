import pytest
import math
from circle import calculate_circumference


class TestCalculateCircumference:
    """원의 둘레 계산 함수 테스트"""

    # --- 정상 케이스 (Happy Path) ---

    def test_circumference_with_radius_one_returns_two_pi(self):
        """반지름이 1일 때 둘레는 2π"""
        result = calculate_circumference(1)
        assert result == pytest.approx(2 * math.pi)

    def test_circumference_with_radius_five_returns_ten_pi(self):
        """반지름이 5일 때 둘레는 10π"""
        result = calculate_circumference(5)
        assert result == pytest.approx(10 * math.pi)

    def test_circumference_with_float_radius(self):
        """반지름이 실수(float)일 때도 정상 계산"""
        result = calculate_circumference(2.5)
        assert result == pytest.approx(2 * math.pi * 2.5)

    # --- 경계값 테스트 ---

    def test_circumference_with_radius_zero_returns_zero(self):
        """반지름이 0일 때 둘레는 0"""
        result = calculate_circumference(0)
        assert result == 0

    # --- 예외/에러 케이스 ---

    def test_circumference_with_negative_radius_raises_value_error(self):
        """반지름이 음수이면 ValueError 발생"""
        with pytest.raises(ValueError, match="반지름은 0 이상이어야 합니다"):
            calculate_circumference(-1)

    def test_circumference_with_string_input_raises_type_error(self):
        """반지름이 문자열이면 TypeError 발생"""
        with pytest.raises(TypeError, match="반지름은 숫자여야 합니다"):
            calculate_circumference("abc")

    def test_circumference_with_none_input_raises_type_error(self):
        """반지름이 None이면 TypeError 발생"""
        with pytest.raises(TypeError, match="반지름은 숫자여야 합니다"):
            calculate_circumference(None)
