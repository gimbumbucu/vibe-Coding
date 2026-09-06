/**
 * 스프레드시트(Google Sheets) 서비스
 * - 시트 자동 생성 및 서식/수식/데이터 유효성/조건부 서식 일괄 적용
 * - 거래내역 추가 및 실시간 계좌/예산 수식 연동
 * - 사이드바 UI 폼 초기 데이터 로드
 */
class SheetService {
  /**
   * 모든 시트 초기화 및 템플릿 생성 (Setup 함수)
   */
  public static initAllSheets(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
    // 1. 설정 시트 생성/초기화 (다른 시트 데이터 유효성 검사 기준)
    this.initSettingsSheet(ss);

    // 2. 자산계좌 시트 생성/초기화
    this.initAccountsSheet(ss);

    // 3. 거래내역 시트 생성/초기화
    this.initTransactionsSheet(ss);

    // 4. 예산관리 시트 생성/초기화
    this.initBudgetsSheet(ss);

    // 5. 고정비관리 시트 생성/초기화
    this.initFixedExpensesSheet(ss);

    // 6. 대시보드 시트 생성/초기화
    this.initDashboardSheet(ss);

    // 시트 정렬 (대시보드가 첫 번째로 오도록)
    const dashboardSheet = ss.getSheetByName(CONFIG.SHEETS.DASHBOARD);
    if (dashboardSheet) {
      ss.setActiveSheet(dashboardSheet);
      ss.moveActiveSheet(1);
    }
  }

  /**
   * 1. ⚙️ 설정 시트 초기화
   */
  public static initSettingsSheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.SETTINGS);
    } else {
      sheet.clear();
    }

    sheet.setTabColor('#64748B');

    // [A-C열] 카테고리 마스터 테이블
    sheet.getRange('A1:C1').setValues([['구분', '대분류', '소분류']])
      .setBackground(CONFIG.THEME.HEADER_BG)
      .setFontColor(CONFIG.THEME.HEADER_TEXT)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    const catRows: any[][] = [];
    CONFIG.DEFAULT_CATEGORIES.forEach(cat => {
      cat.subCategories.forEach(sub => {
        catRows.push([cat.type, cat.mainCategory, sub]);
      });
    });

    if (catRows.length > 0) {
      sheet.getRange(2, 1, catRows.length, 3).setValues(catRows);
    }

    // [E-F열] 시스템 설정 테이블
    sheet.getRange('E1:F1').setValues([['설정 항목', '설정값']])
      .setBackground(CONFIG.THEME.HEADER_BG)
      .setFontColor(CONFIG.THEME.HEADER_TEXT)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    let userEmail = '';
    try {
      userEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    } catch (_e) {
      userEmail = '';
    }

    const settingRows = [
      ['보관함 폴더명', CONFIG.DEFAULT_SETTINGS.storageFolderName],
      ['알림 수신 이메일', userEmail || CONFIG.DEFAULT_SETTINGS.notificationEmail],
      ['예산 경고 기준비율', CONFIG.DEFAULT_SETTINGS.budgetAlertThreshold],
      ['월간 보고서 자동 발송', CONFIG.DEFAULT_SETTINGS.enableMonthlyReport ? 'Y' : 'N'],
      ['예산 초과 알림 활성화', CONFIG.DEFAULT_SETTINGS.enableBudgetAlert ? 'Y' : 'N']
    ];
    sheet.getRange('E2:F6').setValues(settingRows);

    sheet.autoResizeColumns(1, 6);
    return sheet;
  }

  /**
   * 2. 🏦 자산계좌 시트 초기화
   */
  public static initAccountsSheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = ss.getSheetByName(CONFIG.SHEETS.ACCOUNTS);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.ACCOUNTS);
    } else {
      sheet.clear();
    }

    sheet.setTabColor('#0284C7');

    const headers = [['계좌/카드명', '구분', '기초 잔액', '총 입금/수입', '총 출금/지출', '현재 잔액', '메모']];
    sheet.getRange('A1:G1').setValues(headers)
      .setBackground(CONFIG.THEME.HEADER_BG)
      .setFontColor(CONFIG.THEME.HEADER_TEXT)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    const rows = CONFIG.DEFAULT_ACCOUNTS.map((acc, idx) => {
      const rowIdx = idx + 2;
      // D열(총 입금/수입): 거래내역의 입금계좌로 들어온 금액 합계
      const incomeFormula = `=SUMIFS('${CONFIG.SHEETS.TRANSACTIONS}'!F:F, '${CONFIG.SHEETS.TRANSACTIONS}'!H:H, A${rowIdx})`;
      // E열(총 출금/지출): 거래내역의 출금계좌에서 나간 금액 합계
      const expenseFormula = `=SUMIFS('${CONFIG.SHEETS.TRANSACTIONS}'!F:F, '${CONFIG.SHEETS.TRANSACTIONS}'!G:G, A${rowIdx})`;
      // F열(현재 잔액): 기초잔액 + 입금 - 출금
      const balanceFormula = `=C${rowIdx} + D${rowIdx} - E${rowIdx}`;

      return [acc.name, acc.type, acc.initialBalance, incomeFormula, expenseFormula, balanceFormula, acc.memo];
    });

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 7).setValues(rows);
      // 금액 서식 적용 (C~F열)
      sheet.getRange(2, 3, rows.length, 4).setNumberFormat('₩#,##0;[Red](₩#,##0);"-"');
    }

    // 합계 행 추가
    const totalRowIdx = rows.length + 2;
    sheet.getRange(`A${totalRowIdx}:B${totalRowIdx}`).merge().setValue('총 자산 합계')
      .setFontWeight('bold').setHorizontalAlignment('center').setBackground('#E2E8F0');
    sheet.getRange(`C${totalRowIdx}`).setFormula(`=SUM(C2:C${totalRowIdx - 1})`).setFontWeight('bold').setNumberFormat('₩#,##0');
    sheet.getRange(`D${totalRowIdx}`).setFormula(`=SUM(D2:D${totalRowIdx - 1})`).setFontWeight('bold').setNumberFormat('₩#,##0');
    sheet.getRange(`E${totalRowIdx}`).setFormula(`=SUM(E2:E${totalRowIdx - 1})`).setFontWeight('bold').setNumberFormat('₩#,##0');
    sheet.getRange(`F${totalRowIdx}`).setFormula(`=SUM(F2:F${totalRowIdx - 1})`).setFontWeight('bold').setNumberFormat('₩#,##0').setBackground('#BAE6FD');

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 7);
    return sheet;
  }

  /**
   * 3. 💳 거래내역 시트 초기화
   */
  public static initTransactionsSheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.TRANSACTIONS);
    } else {
      sheet.clear();
    }

    sheet.setTabColor('#2563EB');

    const headers = [['거래ID', '일자', '구분', '대분류', '소분류', '금액', '출금계좌', '입금계좌', '내용/사용처', '영수증', '메모', '등록일시']];
    sheet.getRange('A1:L1').setValues(headers)
      .setBackground(CONFIG.THEME.HEADER_BG)
      .setFontColor(CONFIG.THEME.HEADER_TEXT)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    // 샘플 데이터 2건 추가
    const today = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM-dd');
    const nowIso = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    const sampleRows = [
      ['TX-' + today.replace(/-/g, '') + '-0001', today, '지출', '식비', '외식', 25000, '생활비 체크카드', '', '동네 식당 점심식사', '', '친구와 점심', nowIso],
      ['TX-' + today.replace(/-/g, '') + '-0002', today, '수입', '급여', '본업급여', 3500000, '', '주거래 은행계좌', '월급 입금', '', '정기 급여', nowIso]
    ];
    sheet.getRange(2, 1, sampleRows.length, 12).setValues(sampleRows);

    // 서식 적용
    sheet.getRange('B2:B').setNumberFormat('yyyy-mm-dd').setHorizontalAlignment('center');
    sheet.getRange('C2:C').setHorizontalAlignment('center');
    sheet.getRange('D2:E').setHorizontalAlignment('center');
    sheet.getRange('F2:F').setNumberFormat('₩#,##0').setHorizontalAlignment('right');
    sheet.getRange('G2:H').setHorizontalAlignment('center');
    sheet.getRange('J2:J').setHorizontalAlignment('center');
    sheet.getRange('L2:L').setNumberFormat('yyyy-mm-dd hh:mm:ss').setHorizontalAlignment('center');

    // 조건부 서식: 구분별 색상 (지출: 연빨강, 수입: 연초록, 이체: 연파랑)
    const ruleExpense = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('지출')
      .setBackground('#FEE2E2')
      .setFontColor('#991B1B')
      .setRanges([sheet.getRange('C2:C')])
      .build();

    const ruleIncome = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('수입')
      .setBackground('#DCFCE7')
      .setFontColor('#166534')
      .setRanges([sheet.getRange('C2:C')])
      .build();

    const ruleTransfer = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('이체')
      .setBackground('#DBEAFE')
      .setFontColor('#1E40AF')
      .setRanges([sheet.getRange('C2:C')])
      .build();

    sheet.setConditionalFormatRules([ruleExpense, ruleIncome, ruleTransfer]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 12);
    return sheet;
  }

  /**
   * 4. 🎯 예산관리 시트 초기화
   */
  public static initBudgetsSheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = ss.getSheetByName(CONFIG.SHEETS.BUDGETS);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.BUDGETS);
    } else {
      sheet.clear();
    }

    sheet.setTabColor('#F59E0B');

    const headers = [['연월 (YYYY-MM)', '대분류 (카테고리)', '설정 예산', '실지출액', '잔여액', '소진율 (%)', '상태']];
    sheet.getRange('A1:G1').setValues(headers)
      .setBackground(CONFIG.THEME.HEADER_BG)
      .setFontColor(CONFIG.THEME.HEADER_TEXT)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    const currentYearMonth = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM');
    const expenseCategories = CONFIG.DEFAULT_CATEGORIES
      .filter(c => c.type === '지출')
      .map(c => c.mainCategory);

    const defaultBudgetAmounts: Record<string, number> = {
      '식비': 600000,
      '주거/통신': 400000,
      '생활/쇼핑': 300000,
      '교통/차량': 150000,
      '건강/의료': 100000,
      '문화/여가': 200000,
      '교육/자기계발': 100000,
      '경조/선물': 100000,
      '금융/기타': 50000
    };

    const budgetRows = expenseCategories.map((cat, idx) => {
      const rowIdx = idx + 2;
      const budgetVal = defaultBudgetAmounts[cat] || 200000;
      // 실지출액: 거래내역에서 해당 연월(B열)과 대분류(D열), 구분(지출)에 일치하는 금액(F열) 합계
      const spentFormula = `=SUMIFS('${CONFIG.SHEETS.TRANSACTIONS}'!F:F, '${CONFIG.SHEETS.TRANSACTIONS}'!D:D, B${rowIdx}, '${CONFIG.SHEETS.TRANSACTIONS}'!C:C, "지출", '${CONFIG.SHEETS.TRANSACTIONS}'!B:B, ">="&DATE(LEFT(A${rowIdx},4), RIGHT(A${rowIdx},2), 1), '${CONFIG.SHEETS.TRANSACTIONS}'!B:B, "<="&EOMONTH(DATE(LEFT(A${rowIdx},4), RIGHT(A${rowIdx},2), 1), 0))`;
      // 잔여액: 설정예산 - 실지출액
      const remFormula = `=C${rowIdx} - D${rowIdx}`;
      // 소진율: 실지출액 / 설정예산
      const rateFormula = `=IF(C${rowIdx}>0, D${rowIdx}/C${rowIdx}, 0)`;
      // 상태: IF(소진율>=1, "초과", IF(소진율>=0.8, "주의", "정상"))
      const statusFormula = `=IF(F${rowIdx}>=1, "🚨 초과", IF(F${rowIdx}>=0.8, "⚠️ 주의", "✅ 정상"))`;

      return [currentYearMonth, cat, budgetVal, spentFormula, remFormula, rateFormula, statusFormula];
    });

    if (budgetRows.length > 0) {
      sheet.getRange(2, 1, budgetRows.length, 7).setValues(budgetRows);
      sheet.getRange(2, 1, budgetRows.length, 1).setHorizontalAlignment('center');
      sheet.getRange(2, 2, budgetRows.length, 1).setHorizontalAlignment('center');
      sheet.getRange(2, 3, budgetRows.length, 3).setNumberFormat('₩#,##0;[Red](₩#,##0);"-"');
      sheet.getRange(2, 6, budgetRows.length, 1).setNumberFormat('0.0%').setHorizontalAlignment('right');
      sheet.getRange(2, 7, budgetRows.length, 1).setHorizontalAlignment('center');
    }

    // 조건부 서식: 상태 열 색상
    const ruleOver = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('초과')
      .setBackground('#FEE2E2')
      .setFontColor('#991B1B')
      .setRanges([sheet.getRange('G2:G')])
      .build();

    const ruleWarn = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('주의')
      .setBackground('#FEF3C7')
      .setFontColor('#92400E')
      .setRanges([sheet.getRange('G2:G')])
      .build();

    const ruleOk = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('정상')
      .setBackground('#DCFCE7')
      .setFontColor('#166534')
      .setRanges([sheet.getRange('G2:G')])
      .build();

    sheet.setConditionalFormatRules([ruleOver, ruleWarn, ruleOk]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 7);
    return sheet;
  }

  /**
   * 5. 🔄 고정비관리 시트 초기화
   */
  public static initFixedExpensesSheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = ss.getSheetByName(CONFIG.SHEETS.FIXED_EXPENSES);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.FIXED_EXPENSES);
    } else {
      sheet.clear();
    }

    sheet.setTabColor('#8B5CF6');

    const headers = [['고정비ID', '고정비명', '구분', '대분류', '소분류', '금액', '출금계좌', '입금계좌', '결제일(1~31)', '활성화여부', '최근반영연월', '메모']];
    sheet.getRange('A1:L1').setValues(headers)
      .setBackground(CONFIG.THEME.HEADER_BG)
      .setFontColor(CONFIG.THEME.HEADER_TEXT)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    const rows = CONFIG.DEFAULT_FIXED_EXPENSES.map(fx => [
      fx.id,
      fx.name,
      fx.type,
      fx.categoryMain,
      fx.categorySub,
      fx.amount,
      fx.fromAccount,
      fx.toAccount || '',
      fx.payDay,
      fx.isActive ? 'Y' : 'N',
      '',
      fx.memo || ''
    ]);

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 12).setValues(rows);
      sheet.getRange(2, 6, rows.length, 1).setNumberFormat('₩#,##0');
      sheet.getRange(2, 9, rows.length, 2).setHorizontalAlignment('center');
    }

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 12);
    return sheet;
  }

  /**
   * 6. 📊 대시보드 시트 초기화
   */
  public static initDashboardSheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = ss.getSheetByName(CONFIG.SHEETS.DASHBOARD);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.DASHBOARD);
    } else {
      sheet.clear();
    }

    sheet.setTabColor('#10B981');
    sheet.setHiddenGridlines(true);

    // 타이틀 영역
    sheet.getRange('B2:H2').merge().setValue('📊 스마트 가계부 월간 재정 대시보드')
      .setFontSize(18).setFontWeight('bold').setFontColor('#1E293B').setVerticalAlignment('middle');

    const currentYearMonth = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM');
    sheet.getRange('B3').setValue('기준 연월:').setFontWeight('bold').setFontColor('#64748B');
    sheet.getRange('C3').setValue(currentYearMonth).setFontWeight('bold').setFontSize(12).setHorizontalAlignment('center').setBackground('#E2E8F0');

    // KPI 카드 1: 당월 총 수입
    sheet.getRange('B5:C5').merge().setValue('당월 총 수입').setFontWeight('bold').setFontColor('#065F46').setBackground('#D1FAE5').setHorizontalAlignment('center');
    sheet.getRange('B6:C6').merge().setFormula(`=SUMIFS('${CONFIG.SHEETS.TRANSACTIONS}'!F:F, '${CONFIG.SHEETS.TRANSACTIONS}'!C:C, "수입", '${CONFIG.SHEETS.TRANSACTIONS}'!B:B, ">="&DATE(LEFT(C3,4), RIGHT(C3,2), 1), '${CONFIG.SHEETS.TRANSACTIONS}'!B:B, "<="&EOMONTH(DATE(LEFT(C3,4), RIGHT(C3,2), 1), 0))`)
      .setFontSize(16).setFontWeight('bold').setFontColor('#047857').setBackground('#ECFDF5').setHorizontalAlignment('center').setNumberFormat('₩#,##0');

    // KPI 카드 2: 당월 총 지출
    sheet.getRange('D5:E5').merge().setValue('당월 총 지출').setFontWeight('bold').setFontColor('#991B1B').setBackground('#FEE2E2').setHorizontalAlignment('center');
    sheet.getRange('D6:E6').merge().setFormula(`=SUMIFS('${CONFIG.SHEETS.TRANSACTIONS}'!F:F, '${CONFIG.SHEETS.TRANSACTIONS}'!C:C, "지출", '${CONFIG.SHEETS.TRANSACTIONS}'!B:B, ">="&DATE(LEFT(C3,4), RIGHT(C3,2), 1), '${CONFIG.SHEETS.TRANSACTIONS}'!B:B, "<="&EOMONTH(DATE(LEFT(C3,4), RIGHT(C3,2), 1), 0))`)
      .setFontSize(16).setFontWeight('bold').setFontColor('#B91C1C').setBackground('#FEF2F2').setHorizontalAlignment('center').setNumberFormat('₩#,##0');

    // KPI 카드 3: 당월 순 잔여금 (수입 - 지출)
    sheet.getRange('F5:G5').merge().setValue('당월 순 잔여금').setFontWeight('bold').setFontColor('#1E40AF').setBackground('#DBEAFE').setHorizontalAlignment('center');
    sheet.getRange('F6:G6').merge().setFormula(`=B6 - D6`)
      .setFontSize(16).setFontWeight('bold').setFontColor('#1D4ED8').setBackground('#EFF6FF').setHorizontalAlignment('center').setNumberFormat('₩#,##0');

    // KPI 카드 4: 총 예산 대비 소진율
    sheet.getRange('H5:I5').merge().setValue('당월 총 예산 대비 소진율').setFontWeight('bold').setFontColor('#92400E').setBackground('#FEF3C7').setHorizontalAlignment('center');
    sheet.getRange('H6:I6').merge().setFormula(`=IF(SUM('${CONFIG.SHEETS.BUDGETS}'!C2:C)>0, D6/SUM('${CONFIG.SHEETS.BUDGETS}'!C2:C), 0)`)
      .setFontSize(16).setFontWeight('bold').setFontColor('#B45309').setBackground('#FFFBEB').setHorizontalAlignment('center').setNumberFormat('0.0%');

    // 카테고리별 지출 요약 테이블 헤더
    sheet.getRange('B9:E9').setValues([['카테고리 (대분류)', '설정 예산', '당월 지출액', '예산 소진율']])
      .setBackground(CONFIG.THEME.HEADER_BG)
      .setFontColor(CONFIG.THEME.HEADER_TEXT)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    // 예산 시트의 대분류 목록 동적 바인딩
    sheet.getRange('B10:E18').setFormulas([
      [`='${CONFIG.SHEETS.BUDGETS}'!B2`, `='${CONFIG.SHEETS.BUDGETS}'!C2`, `='${CONFIG.SHEETS.BUDGETS}'!D2`, `='${CONFIG.SHEETS.BUDGETS}'!F2`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B3`, `='${CONFIG.SHEETS.BUDGETS}'!C3`, `='${CONFIG.SHEETS.BUDGETS}'!D3`, `='${CONFIG.SHEETS.BUDGETS}'!F3`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B4`, `='${CONFIG.SHEETS.BUDGETS}'!C4`, `='${CONFIG.SHEETS.BUDGETS}'!D4`, `='${CONFIG.SHEETS.BUDGETS}'!F4`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B5`, `='${CONFIG.SHEETS.BUDGETS}'!C5`, `='${CONFIG.SHEETS.BUDGETS}'!D5`, `='${CONFIG.SHEETS.BUDGETS}'!F5`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B6`, `='${CONFIG.SHEETS.BUDGETS}'!C6`, `='${CONFIG.SHEETS.BUDGETS}'!D6`, `='${CONFIG.SHEETS.BUDGETS}'!F6`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B7`, `='${CONFIG.SHEETS.BUDGETS}'!C7`, `='${CONFIG.SHEETS.BUDGETS}'!D7`, `='${CONFIG.SHEETS.BUDGETS}'!F7`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B8`, `='${CONFIG.SHEETS.BUDGETS}'!C8`, `='${CONFIG.SHEETS.BUDGETS}'!D8`, `='${CONFIG.SHEETS.BUDGETS}'!F8`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B9`, `='${CONFIG.SHEETS.BUDGETS}'!C9`, `='${CONFIG.SHEETS.BUDGETS}'!D9`, `='${CONFIG.SHEETS.BUDGETS}'!F9`],
      [`='${CONFIG.SHEETS.BUDGETS}'!B10`, `='${CONFIG.SHEETS.BUDGETS}'!C10`, `='${CONFIG.SHEETS.BUDGETS}'!D10`, `='${CONFIG.SHEETS.BUDGETS}'!F10`]
    ]);

    sheet.getRange('B10:B18').setHorizontalAlignment('center');
    sheet.getRange('C10:D18').setNumberFormat('₩#,##0');
    sheet.getRange('E10:E18').setNumberFormat('0.0%').setHorizontalAlignment('right');

    // 카테고리별 지출 도넛 차트 생성
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(sheet.getRange('B9:B18'))
      .addRange(sheet.getRange('D9:D18'))
      .setPosition(9, 7, 0, 0)
      .setOption('title', '🎯 당월 카테고리별 지출 비중')
      .setOption('pieHole', 0.4)
      .setOption('width', 450)
      .setOption('height', 300)
      .build();

    sheet.insertChart(chart);

    sheet.autoResizeColumns(1, 10);
    return sheet;
  }

  /**
   * 새 거래내역 등록 (스프레드시트에 기록 & 영수증 드라이브 업로드)
   */
  public static addTransaction(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    input: TransactionInput
  ): TransactionRecord {
    const txSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    if (!txSheet) {
      throw new Error(`'${CONFIG.SHEETS.TRANSACTIONS}' 시트를 찾을 수 없습니다. 먼저 가계부 설정을 실행하세요.`);
    }

    // 거래 ID 및 타임스탬프 생성
    const dateFormatted = input.date.replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const txId = `TX-${dateFormatted}-${randSuffix}`;
    const nowIso = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    // 영수증 파일이 있는 경우 구글 드라이브에 저장하고 URL 생성
    let receiptUrl = '';
    if (input.receiptFile && input.receiptFile.base64Data) {
      receiptUrl = DriveService.saveReceiptFile(input.receiptFile, input.date);
    }

    // 행 데이터 준비
    const rowData = [
      txId,
      input.date,
      input.type,
      input.categoryMain,
      input.categorySub,
      input.amount,
      input.fromAccount || '',
      input.toAccount || '',
      input.description,
      receiptUrl ? `=HYPERLINK("${receiptUrl}", "🔗 영수증보기")` : '',
      input.memo || '',
      nowIso
    ];

    txSheet.appendRow(rowData);
    const lastRow = txSheet.getLastRow();

    // 서식 적용
    txSheet.getRange(lastRow, 2).setNumberFormat('yyyy-mm-dd').setHorizontalAlignment('center');
    txSheet.getRange(lastRow, 3).setHorizontalAlignment('center');
    txSheet.getRange(lastRow, 4, 1, 2).setHorizontalAlignment('center');
    txSheet.getRange(lastRow, 6).setNumberFormat('₩#,##0').setHorizontalAlignment('right');
    txSheet.getRange(lastRow, 7, 1, 2).setHorizontalAlignment('center');
    txSheet.getRange(lastRow, 10).setHorizontalAlignment('center');
    txSheet.getRange(lastRow, 12).setNumberFormat('yyyy-mm-dd hh:mm:ss').setHorizontalAlignment('center');

    return {
      ...input,
      id: txId,
      receiptUrl,
      createdAt: nowIso
    };
  }

  /**
   * 사이드바 UI에 전달할 초기 데이터 조회 (카테고리, 계좌목록, 최근거래 등)
   */
  public static getInitialFormData(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): InitialFormData {
    const settingsSheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
    const accountsSheet = ss.getSheetByName(CONFIG.SHEETS.ACCOUNTS);
    const txSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);

    // 1. 카테고리 매핑 로드
    const categories: CategoryMapping[] = [];
    if (settingsSheet && settingsSheet.getLastRow() > 1) {
      const catData = settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, 3).getValues();
      const catMap = new Map<string, { type: '지출' | '수입' | '이체'; subCategories: Set<string> }>();

      catData.forEach(row => {
        const type = row[0] as '지출' | '수입' | '이체';
        const main = String(row[1]).trim();
        const sub = String(row[2]).trim();

        if (main) {
          if (!catMap.has(main)) {
            catMap.set(main, { type, subCategories: new Set<string>() });
          }
          if (sub) {
            catMap.get(main)!.subCategories.add(sub);
          }
        }
      });

      catMap.forEach((val, main) => {
        categories.push({
          mainCategory: main,
          type: val.type,
          subCategories: Array.from(val.subCategories)
        });
      });
    } else {
      categories.push(...CONFIG.DEFAULT_CATEGORIES);
    }

    // 2. 계좌 목록 로드
    const accounts: string[] = [];
    if (accountsSheet && accountsSheet.getLastRow() > 1) {
      const accData = accountsSheet.getRange(2, 1, accountsSheet.getLastRow() - 1, 1).getValues();
      accData.forEach(row => {
        const accName = String(row[0]).trim();
        if (accName && !accName.includes('합계')) {
          accounts.push(accName);
        }
      });
    } else {
      CONFIG.DEFAULT_ACCOUNTS.forEach(a => accounts.push(a.name));
    }

    // 3. 최근 거래 5건 로드
    const recentTransactions: InitialFormData['recentTransactions'] = [];
    if (txSheet && txSheet.getLastRow() > 1) {
      const startRow = Math.max(2, txSheet.getLastRow() - 4);
      const numRows = txSheet.getLastRow() - startRow + 1;
      const recentData = txSheet.getRange(startRow, 1, numRows, 9).getValues();
      
      recentData.reverse().forEach(row => {
        const dateVal = row[1];
        const dateStr = dateVal instanceof Date 
          ? Utilities.formatDate(dateVal, CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM-dd')
          : String(dateVal);

        recentTransactions.push({
          date: dateStr,
          type: String(row[2]),
          category: `${row[3]} > ${row[4]}`,
          amount: Number(row[5]) || 0,
          description: String(row[8])
        });
      });
    }

    const currentMonth = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM');

    return {
      categories,
      accounts,
      currentMonth,
      recentTransactions
    };
  }
}
