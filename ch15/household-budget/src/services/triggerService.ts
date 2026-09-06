/**
 * 자동화 트리거 및 정기 스케줄러 서비스
 * - 매월 1일 고정비 자동 등록
 * - 매월 말일 결산 보고서 생성 (PDF/CSV) 및 Gmail 발송
 * - 시간 기반 트리거 설치 및 관리
 */
class TriggerService {
  /**
   * 가계부 자동화 트리거 일괄 설치 (기존 동일 트리거 정리 후 재설치)
   */
  public static installAllTriggers(): { success: boolean; message: string } {
    try {
      // 1. 기존 프로젝트 트리거 삭제 (중복 방지)
      const existingTriggers = ScriptApp.getProjectTriggers();
      existingTriggers.forEach(trigger => {
        const handlerName = trigger.getHandlerFunction();
        if (
          handlerName === 'triggerMonthlyFixedExpenses' ||
          handlerName === 'triggerMonthlyReport'
        ) {
          ScriptApp.deleteTrigger(trigger);
        }
      });

      // 2. 매월 1일 오전 6시: 고정비 자동 등록 트리거
      ScriptApp.newTrigger('triggerMonthlyFixedExpenses')
        .timeBased()
        .onMonthDay(1)
        .atHour(6)
        .create();

      // 3. 매월 28일 오후 23시: 월간 결산 보고서 생성 및 이메일 발송 트리거
      ScriptApp.newTrigger('triggerMonthlyReport')
        .timeBased()
        .onMonthDay(28)
        .atHour(23)
        .create();

      return {
        success: true,
        message: '자동화 트리거(매월 1일 고정비 등록, 매월 말일 월간 결산)가 성공적으로 설치되었습니다.'
      };
    } catch (e: any) {
      Logger.log(`[TriggerService] 트리거 설치 실패: ${e.message}`);
      return {
        success: false,
        message: `트리거 설치 실패: ${e.message}`
      };
    }
  }

  /**
   * 활성화된 고정비를 당월 거래내역으로 자동 등록
   */
  public static processFixedExpenses(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): { count: number; message: string } {
    const fxSheet = ss.getSheetByName(CONFIG.SHEETS.FIXED_EXPENSES);
    if (!fxSheet || fxSheet.getLastRow() <= 1) {
      return { count: 0, message: '등록된 고정비가 없습니다.' };
    }

    const currentYm = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM');
    const data = fxSheet.getRange(2, 1, fxSheet.getLastRow() - 1, 12).getValues();

    let processedCount = 0;

    data.forEach((row, idx) => {
      const rowIdx = idx + 2;
      const name = String(row[1]);
      const type = row[2] as '지출' | '수입' | '이체';
      const catMain = String(row[3]);
      const catSub = String(row[4]);
      const amount = Number(row[5]) || 0;
      const fromAcc = String(row[6]);
      const toAcc = String(row[7]);
      const payDay = Math.min(Math.max(Number(row[8]) || 1, 1), 28);
      const isActive = String(row[9]).toUpperCase() === 'Y';
      const lastMonth = String(row[10]).trim();
      const memo = String(row[11]);

      // 활성화 상태이고 이번 달에 아직 미처리된 경우 등록
      if (isActive && lastMonth !== currentYm && amount > 0) {
        const payDayStr = payDay < 10 ? `0${payDay}` : `${payDay}`;
        const txDate = `${currentYm}-${payDayStr}`;

        SheetService.addTransaction(ss, {
          date: txDate,
          type: type || '지출',
          categoryMain: catMain,
          categorySub: catSub,
          amount: amount,
          fromAccount: fromAcc,
          toAccount: toAcc,
          description: `[고정비] ${name}`,
          memo: memo || '정기 고정비 자동 등록'
        });

        // 처리 완료 연월 기록
        fxSheet.getRange(rowIdx, 11).setValue(currentYm);
        processedCount++;
      }
    });

    return {
      count: processedCount,
      message: `${currentYm}월 고정비 ${processedCount}건이 거래내역에 자동 등록되었습니다.`
    };
  }

  /**
   * 월간 결산 보고서 생성 (PDF/CSV Drive 저장) 및 이메일 발송
   */
  public static generateMonthlyReportAndEmail(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    targetYm?: string
  ): { success: boolean; message: string; pdfUrl?: string; csvUrl?: string } {
    try {
      const yearMonth = targetYm || Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM');
      const dashboardSheet = ss.getSheetByName(CONFIG.SHEETS.DASHBOARD);
      const txSheet = ss.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);

      if (!dashboardSheet || !txSheet) {
        throw new Error('필요한 시트(대시보드/거래내역)를 찾을 수 없습니다.');
      }

      // 1. 대시보드 시트 기준 연월 갱신
      dashboardSheet.getRange('C3').setValue(yearMonth);
      SpreadsheetApp.flush();

      // 2. PDF 및 CSV 파일 생성하여 구글 드라이브에 저장
      const pdfFileName = `가계부_월간결산_${yearMonth}`;
      const pdfFile = DriveService.exportSheetToPdf(ss, dashboardSheet, pdfFileName);
      const csvFile = DriveService.exportTransactionsCsv(txSheet, yearMonth);

      // 3. 당월 주요 지표 산출
      const totalIncome = dashboardSheet.getRange('B6').getValue() || 0;
      const totalExpense = dashboardSheet.getRange('D6').getValue() || 0;
      const netSavings = dashboardSheet.getRange('F6').getValue() || 0;
      const budgetRate = dashboardSheet.getRange('H6').getValue() || 0;

      // 4. 이메일 발송
      let recipientEmail = '';
      try {
        recipientEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
      } catch (_e) {
        recipientEmail = '';
      }
      if (recipientEmail) {
        const ratePct = (Number(budgetRate) * 100).toFixed(1);
        const emailHtml = `
          <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1E293B, #0F172A); padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">📊 [스마트 가계부] ${yearMonth} 월간 결산 보고서</h2>
              <p style="margin: 6px 0 0 0; color: #94A3B8; font-size: 14px;">한 달 동안의 가계부 결산 요약 및 백업 파일 안내입니다.</p>
            </div>
            <div style="padding: 24px; background: #FFFFFF;">
              <h3 style="margin-top: 0; font-size: 16px; color: #1E293B;">📌 ${yearMonth} 재정 요약</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px; color: #64748B;">총 수입</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #059669;">₩${Number(totalIncome).toLocaleString()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px; color: #64748B;">총 지출</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #DC2626;">₩${Number(totalExpense).toLocaleString()}</td>
                </tr>
                <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px; color: #64748B;">순 잔여금</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #2563EB;">₩${Number(netSavings).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #64748B;">총 예산 소진율</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #D97706;">${ratePct}%</td>
                </tr>
              </table>

              <h3 style="font-size: 16px; color: #1E293B;">📁 구글 드라이브 백업 파일</h3>
              <ul style="color: #475569; font-size: 14px; line-height: 1.8;">
                <li><a href="${pdfFile.getUrl()}" style="color: #2563EB; font-weight: bold; text-decoration: none;">📄 ${yearMonth} 월간 결산 PDF 보고서 열기</a></li>
                <li><a href="${csvFile.getUrl()}" style="color: #2563EB; font-weight: bold; text-decoration: none;">📊 ${yearMonth} 거래내역 CSV 백업 열기</a></li>
              </ul>
            </div>
          </div>
        `;

        GmailApp.sendEmail(recipientEmail, `[스마트 가계부] ${yearMonth} 월간 결산 보고서 및 백업 완료`, '', {
          htmlBody: emailHtml,
          attachments: [pdfFile.getAs('application/pdf')]
        });
      }

      return {
        success: true,
        message: `${yearMonth} 월간 결산 완료 (드라이브 백업 및 이메일 발송)`,
        pdfUrl: pdfFile.getUrl(),
        csvUrl: csvFile.getUrl()
      };
    } catch (e: any) {
      Logger.log(`[TriggerService] 결산 보고서 생성 실패: ${e.message}`);
      return {
        success: false,
        message: `결산 보고서 생성 실패: ${e.message}`
      };
    }
  }
}
