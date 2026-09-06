/**
 * 스프레드시트 객체 안전 참조 헬퍼 (웹 앱 / 트리거 / 컨테이너 환경 호환)
 */
function getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (_e) {
    // ignore
  }
  return SpreadsheetApp.openById('1ezj_-eVBfKSpK6OJWofrK3TOcWuU-RkDKtAiv4X8aBU');
}

/**
 * 📱 웹 앱(Web App) 진입점 - 모바일 스마트폰 브라우저에서 직접 접속
 */
function doGet(_e?: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
  const template = HtmlService.createTemplateFromFile('ui/sidebar');
  return template.evaluate()
    .setTitle('📊 스마트 가계부')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Google Spreadsheet 열릴 때 실행되는 트리거 (커스텀 메뉴 등록)
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 스마트 가계부')
    .addItem('📝 내역 입력 사이드바 열기', 'openSidebar')
    .addItem('📱 모바일 웹 앱(Web App) 접속 안내', 'menuShowWebAppUrl')
    .addSeparator()
    .addItem('⚙️ 가계부 초기 세팅 (시트/서식/수식 자동생성)', 'setupHouseholdBudget')
    .addItem('🔄 당월 고정비 수동 반영', 'menuProcessFixedExpenses')
    .addItem('📑 당월 결산 보고서 생성 (PDF/CSV 백업)', 'menuExportMonthlyReport')
    .addItem('⚠️ 예산 초과 현황 점검 및 알림', 'menuCheckBudgetAlerts')
    .addSeparator()
    .addItem('⏰ 자동화 트리거 설치 (정기 실행)', 'menuInstallTriggers')
    .addItem('📁 구글 드라이브 보관함 폴더 열기', 'menuOpenDriveFolder')
    .addToUi();
}

/**
 * 사이드바 열기 (입력 폼 HTML 로드)
 */
function openSidebar() {
  const template = HtmlService.createTemplateFromFile('ui/sidebar');
  const htmlOutput = template.evaluate()
    .setTitle('📝 가계부 빠른 내역 입력')
    .setWidth(380);
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

/**
 * HTML 내 CSS/JS include 헬퍼
 */
function include(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ⚙️ 1. 가계부 초기화 (Setup)
 */
function setupHouseholdBudget(): void {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    '가계부 초기 세팅',
    '기존 시트 서식 및 구조를 새로 구성합니다. 진행하시겠습니까?',
    ui.ButtonSet.YES_NO
  );

  if (res !== ui.Button.YES) {
    return;
  }

  try {
    const ss = getSpreadsheet();
    SheetService.initAllSheets(ss);
    DriveService.getRootFolder(); // 드라이브 폴더 생성

    ui.alert('성공', '🎉 스마트 가계부 초기 세팅이 완료되었습니다!\n상단 메뉴에서 "내역 입력 사이드바"를 열어 사용해보세요.', ui.ButtonSet.OK);
  } catch (e: any) {
    ui.alert('오류', `초기 세팅 중 오류가 발생했습니다: ${e.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 사이드바 및 모바일 웹 앱 API: 폼 초기 데이터 로드 (카테고리, 계좌목록, 최근내역)
 */
function apiGetFormData(): ApiResponse<InitialFormData> {
  try {
    const ss = getSpreadsheet();
    const data = SheetService.getInitialFormData(ss);
    return {
      success: true,
      message: '데이터 로드 완료',
      data
    };
  } catch (e: any) {
    return {
      success: false,
      message: '초기 데이터 로드 실패',
      error: e.message
    };
  }
}

/**
 * 사이드바 및 모바일 웹 앱 API: 새 거래내역 등록
 */
function apiRecordTransaction(input: TransactionInput): ApiResponse {
  try {
    const ss = getSpreadsheet();
    const record = SheetService.addTransaction(ss, input);

    // 지출인 경우 예산 상태 체크
    if (input.type === '지출') {
      const budgetAlert = BudgetService.checkAndSendBudgetAlert(ss);
      if (budgetAlert.sent) {
        return {
          success: true,
          message: `거래가 등록되었습니다. (⚠️ 예산 한도 알림이 이메일로 발송되었습니다.)`,
          data: record
        };
      }
    }

    return {
      success: true,
      message: '✅ 거래내역이 정상적으로 등록되었습니다.',
      data: record
    };
  } catch (e: any) {
    return {
      success: false,
      message: '거래 등록 실패',
      error: e.message
    };
  }
}

/**
 * 메뉴: 모바일 웹 앱 접속 안내 다이얼로그
 */
function menuShowWebAppUrl(): void {
  const scriptId = ScriptApp.getScriptId();
  const webAppUrl = `https://script.google.com/macros/s/${scriptId}/exec`;
  const html = `
    <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding:12px; font-size:13px; line-height:1.6;">
      <h3 style="margin-top:0; color:#1E293B;">📱 스마트폰에서 가계부 접속하기</h3>
      <p style="color:#475569;">스마트폰 브라우저(사파리, 크롬, 삼성인터넷)에서 아래 URL로 접속하시면 전용 앱 화면으로 가계부를 이용할 수 있습니다.</p>
      
      <div style="background:#EFF6FF; border:1px solid #BFDBFE; padding:10px 12px; border-radius:8px; word-break:break-all; font-weight:bold; color:#2563EB; margin:12px 0;">
        <a href="${webAppUrl}" target="_blank" style="color:#2563EB; text-decoration:underline;">${webAppUrl}</a>
      </div>

      <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:10px; border-radius:8px; color:#475569; font-size:12px; margin-bottom:14px;">
        💡 <strong>홈 화면에 앱으로 추가하기</strong>:
        <ul style="padding-left:18px; margin:4px 0 0 0;">
          <li><strong>아이폰(Safari)</strong>: 하단 공유 버튼 ➔ <strong>'홈 화면에 추가'</strong></li>
          <li><strong>갤럭시(Chrome)</strong>: 우측 상단 더보기(⋮) ➔ <strong>'홈 화면에 추가'</strong></li>
        </ul>
      </div>

      <div style="text-align:right;">
        <button onclick="google.script.host.close()" style="background:#2563EB; color:white; border:none; padding:8px 16px; border-radius:6px; font-weight:bold; cursor:pointer;">닫기</button>
      </div>
    </div>
  `;
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(460).setHeight(290), '📱 모바일 가계부 웹 앱');
}

/**
 * 메뉴: 당월 고정비 수동 처리
 */
function menuProcessFixedExpenses(): void {
  const ui = SpreadsheetApp.getUi();
  const ss = getSpreadsheet();
  const result = TriggerService.processFixedExpenses(ss);
  ui.alert('고정비 처리', result.message, ui.ButtonSet.OK);
}

/**
 * 메뉴: 당월 결산 보고서 생성 (PDF/CSV 백업)
 */
function menuExportMonthlyReport(): void {
  const ui = SpreadsheetApp.getUi();
  const ss = getSpreadsheet();
  const result = TriggerService.generateMonthlyReportAndEmail(ss);
  if (result.success) {
    ui.alert('결산 보고서 생성 완료', `✅ ${result.message}\n\nPDF: ${result.pdfUrl}\nCSV: ${result.csvUrl}`, ui.ButtonSet.OK);
  } else {
    ui.alert('오류', result.message, ui.ButtonSet.OK);
  }
}

/**
 * 메뉴: 예산 초과 현황 점검
 */
function menuCheckBudgetAlerts(): void {
  const ui = SpreadsheetApp.getUi();
  const ss = getSpreadsheet();
  const result = BudgetService.checkAndSendBudgetAlert(ss);
  ui.alert('예산 점검 결과', result.message, ui.ButtonSet.OK);
}

/**
 * 메뉴: 자동화 트리거 설치
 */
function menuInstallTriggers(): void {
  const ui = SpreadsheetApp.getUi();
  const result = TriggerService.installAllTriggers();
  ui.alert(result.success ? '성공' : '실패', result.message, ui.ButtonSet.OK);
}

/**
 * 메뉴: 구글 드라이브 보관함 폴더 열기 안내
 */
function menuOpenDriveFolder(): void {
  const root = DriveService.getRootFolder();
  const url = root.getUrl();
  const html = `<p>아래 링크를 클릭하여 구글 드라이브 보관함 폴더로 이동하세요:</p><p><a href="${url}" target="_blank" style="font-weight:bold; color:#2563EB;">📁 ${CONFIG.DRIVE_ROOT_FOLDER} 열기</a></p>`;
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(400).setHeight(150), '구글 드라이브 보관함');
}

/**
 * 시간 기반 트리거 핸들러 1: 매월 1일 고정비 자동 등록
 */
function triggerMonthlyFixedExpenses(): void {
  const ss = getSpreadsheet();
  TriggerService.processFixedExpenses(ss);
}

/**
 * 시간 기반 트리거 핸들러 2: 매월 말일 월간 결산 보고서 생성 및 이메일 발송
 */
function triggerMonthlyReport(): void {
  const ss = getSpreadsheet();
  TriggerService.generateMonthlyReportAndEmail(ss);
}
