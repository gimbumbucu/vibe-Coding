import tkinter as tk
from tkinter import messagebox
import threading
import time
import datetime
import requests
import pyautogui
from pynput import mouse
from email.utils import parsedate_to_datetime

class NaverMacroApp:
    def __init__(self, root):
        self.root = root
        self.root.title("네이버 서버 시간 매크로")
        self.root.geometry("400x480")
        self.root.resizable(False, False)

        self.coordinates = [(None, None), (None, None), (None, None)]
        self.time_offset = 0.0  # (Naver time - Local time) in seconds
        self.is_running = False
        self.macro_thread = None

        self.setup_ui()
        
        # 백그라운드 서버 시간 동기화 스레드 시작
        self.sync_thread = threading.Thread(target=self.time_sync_loop, daemon=True)
        self.sync_thread.start()

        # UI 시계 업데이트 시작
        self.update_ui_time()

    def setup_ui(self):
        # 1. 시간 표시 영역
        time_frame = tk.LabelFrame(self.root, text="시간 정보", padx=10, pady=10)
        time_frame.pack(fill="x", padx=10, pady=10)

        self.lbl_local_time = tk.Label(time_frame, text="로컬 시간: 로딩 중...", font=("맑은 고딕", 10))
        self.lbl_local_time.pack(anchor="w")

        self.lbl_naver_time = tk.Label(time_frame, text="네이버 시간: 로딩 중...", font=("맑은 고딕", 11, "bold"), fg="blue")
        self.lbl_naver_time.pack(anchor="w", pady=5)

        # 2. 목표 시간 설정 영역
        target_frame = tk.LabelFrame(self.root, text="목표 시간 설정 (24시간제)", padx=10, pady=10)
        target_frame.pack(fill="x", padx=10, pady=5)

        tk.Label(target_frame, text="시(HH) : 분(MM) : 초(SS)").pack(anchor="w")
        time_input_frame = tk.Frame(target_frame)
        time_input_frame.pack(anchor="w", pady=5)
        
        self.entry_hour = tk.Entry(time_input_frame, width=4, justify="center")
        self.entry_hour.pack(side="left")
        tk.Label(time_input_frame, text=":").pack(side="left")
        self.entry_minute = tk.Entry(time_input_frame, width=4, justify="center")
        self.entry_minute.pack(side="left")
        tk.Label(time_input_frame, text=":").pack(side="left")
        self.entry_second = tk.Entry(time_input_frame, width=4, justify="center")
        self.entry_second.pack(side="left")

        # 3. 좌표 설정 영역
        coord_frame = tk.LabelFrame(self.root, text="클릭 좌표 설정", padx=10, pady=10)
        coord_frame.pack(fill="x", padx=10, pady=5)

        self.coord_labels = []
        for i in range(3):
            f = tk.Frame(coord_frame)
            f.pack(fill="x", pady=2)
            btn = tk.Button(f, text=f"{i+1}번 좌표 설정", command=lambda idx=i: self.set_coordinate(idx))
            btn.pack(side="left", padx=(0, 10))
            lbl = tk.Label(f, text="설정 안됨", fg="gray")
            lbl.pack(side="left")
            self.coord_labels.append(lbl)

        # 4. 제어 및 상태 영역
        control_frame = tk.Frame(self.root)
        control_frame.pack(fill="x", padx=10, pady=10)

        self.btn_start = tk.Button(control_frame, text="매크로 시작", font=("맑은 고딕", 12, "bold"), bg="#4CAF50", fg="white", width=15, command=self.start_macro)
        self.btn_start.pack(side="left", padx=5)

        self.btn_stop = tk.Button(control_frame, text="매크로 중지", font=("맑은 고딕", 12, "bold"), bg="#f44336", fg="white", width=15, state="disabled", command=self.stop_macro)
        self.btn_stop.pack(side="left", padx=5)

        self.status_var = tk.StringVar(value="대기 중입니다.")
        self.lbl_status = tk.Label(self.root, textvariable=self.status_var, fg="gray", font=("맑은 고딕", 10))
        self.lbl_status.pack(pady=10)

    def time_sync_loop(self):
        """네이버 서버에 HEAD 요청을 보내 시간을 동기화하는 백그라운드 스레드"""
        while True:
            try:
                response = requests.head("https://www.naver.com", timeout=3)
                if 'Date' in response.headers:
                    server_time_str = response.headers['Date']
                    server_time = parsedate_to_datetime(server_time_str)
                    
                    # 로컬 시간(timestamp)과 서버 시간(timestamp)의 차이를 계산
                    server_timestamp = server_time.timestamp()
                    local_timestamp = time.time()
                    
                    # 서버 시간이 얼마나 빠르거나 느린지 보정값 저장
                    self.time_offset = server_timestamp - local_timestamp
            except Exception as e:
                pass
            
            # 5초마다 동기화 갱신
            time.sleep(5)

    def update_ui_time(self):
        """UI에 실시간 시간을 표시하는 루프"""
        current_local = time.time()
        current_naver = current_local + self.time_offset

        local_dt = datetime.datetime.fromtimestamp(current_local)
        naver_dt = datetime.datetime.fromtimestamp(current_naver)

        self.lbl_local_time.config(text=f"로컬 시간: {local_dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]}")
        self.lbl_naver_time.config(text=f"네이버 시간: {naver_dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:-4]}")

        self.root.after(50, self.update_ui_time)

    def set_coordinate(self, index):
        """마우스 리스너를 활성화하여 좌표를 획득"""
        self.status_var.set(f"{index+1}번 좌표 설정 대기 중... 원하는 곳을 좌클릭하세요.")
        
        def on_click(x, y, button, pressed):
            if pressed and button == mouse.Button.left:
                self.coordinates[index] = (int(x), int(y))
                
                # UI 업데이트는 메인 스레드에서 해야하므로 after 사용
                self.root.after(0, self.update_coord_label, index, int(x), int(y))
                return False # 리스너 종료

        # pynput Listener 시작
        listener = mouse.Listener(on_click=on_click)
        listener.start()

    def update_coord_label(self, index, x, y):
        self.coord_labels[index].config(text=f"X: {x}, Y: {y}", fg="black")
        self.status_var.set(f"{index+1}번 좌표가 ({x}, {y})로 설정되었습니다.")

    def start_macro(self):
        """매크로 실행 버튼 클릭 시 호출"""
        if None in [c[0] for c in self.coordinates]:
            messagebox.showwarning("경고", "모든 좌표(1~3번)를 설정해주세요.")
            return

        h = self.entry_hour.get().strip()
        m = self.entry_minute.get().strip()
        s = self.entry_second.get().strip()

        if not (h and m and s):
            messagebox.showwarning("경고", "목표 시간을 모두 입력해주세요.")
            return

        try:
            h, m, s = int(h), int(m), int(s)
            if not (0 <= h <= 23 and 0 <= m <= 59 and 0 <= s <= 59):
                raise ValueError
        except ValueError:
            messagebox.showerror("오류", "올바른 시간(숫자)을 입력해주세요. (0~23시)")
            return

        # 오늘 날짜를 기준으로 목표 시간의 timestamp 생성
        now = datetime.datetime.fromtimestamp(time.time() + self.time_offset)
        target_dt = now.replace(hour=h, minute=m, second=s, microsecond=0)
        
        # 만약 설정한 시간이 이미 지났다면 다음날로 설정할지 묻지 않고 당일로 계산
        if target_dt < now:
            if not messagebox.askyesno("확인", "설정한 시간이 이미 지났습니다. 다음 날짜로 설정하시겠습니까?"):
                return
            target_dt += datetime.timedelta(days=1)

        self.target_timestamp = target_dt.timestamp()

        # UI 상태 변경
        self.is_running = True
        self.btn_start.config(state="disabled")
        self.btn_stop.config(state="normal")
        self.status_var.set(f"매크로 작동 중... 목표 시간: {target_dt.strftime('%H:%M:%S')}")

        # 백그라운드 감시 스레드 시작
        self.macro_thread = threading.Thread(target=self.macro_loop, daemon=True)
        self.macro_thread.start()

    def stop_macro(self):
        """매크로 수동 중지"""
        self.is_running = False
        self.btn_start.config(state="normal")
        self.btn_stop.config(state="disabled")
        self.status_var.set("매크로가 중지되었습니다.")

    def macro_loop(self):
        """목표 시간에 도달하면 즉시 클릭하는 감시 루프"""
        while self.is_running:
            current_naver = time.time() + self.time_offset
            
            # 목표 시간 도달 또는 초과 시 클릭
            if current_naver >= self.target_timestamp:
                # 3개의 좌표를 지연 없이 순차적으로 클릭
                for x, y in self.coordinates:
                    pyautogui.click(x, y)
                
                # 메인 스레드에 작업 완료 알림
                self.root.after(0, self.macro_finished)
                break
            
            # 스마트 슬립: 남은 시간에 따라 대기 시간 조절하여 CPU 점유율 최적화
            time_left = self.target_timestamp - current_naver
            if time_left > 1.0:
                time.sleep(0.5)
            elif time_left > 0.1:
                time.sleep(0.01)
            else:
                # 0.1초 미만 남았을 때는 sleep 없이 최대한 빠르게 while문 회전 (busy-waiting)
                pass

    def macro_finished(self):
        """매크로 완료 후 UI 복구"""
        self.is_running = False
        self.btn_start.config(state="normal")
        self.btn_stop.config(state="disabled")
        self.status_var.set("목표 시간에 도달하여 클릭을 완료했습니다!")
        messagebox.showinfo("완료", "클릭 작업이 성공적으로 수행되었습니다.")

if __name__ == "__main__":
    root = tk.Tk()
    app = NaverMacroApp(root)
    root.mainloop()
