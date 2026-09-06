/**
 * 예산(Budget) 분석 및 모니터링 서비스
 * - 카테고리별 예산 소진율 집계 및 초과 감지
 * - 예산 초과 시 경고 알림(Gmail) 발송
 */
class BudgetService {
  /**
   * 당월 카테고리별 예산 현황 조회
   */
  public static getBudgetStatusList(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    yearMonth?: string
  ): BudgetItem[] {
    const budgetSheet = ss.getSheetByName(CONFIG.SHEETS.BUDGETS);
    if (!budgetSheet || budgetSheet.getLastRow() <= 1) {
      return [];
    }

    const currentYm = yearMonth || Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM');
    const data = budgetSheet.getRange(2, 1, budgetSheet.getLastRow() - 1, 7).getValues();

    const result: BudgetItem[] = [];

    data.forEach(row => {
      const ym = String(row[0]).trim();
      if (ym === currentYm) {
        const categoryMain = String(row[1]);
        const budgetAmount = Number(row[2]) || 0;
        const spentAmount = Number(row[3]) || 0;
        const remainingAmount = Number(row[4]) || (budgetAmount - spentAmount);
        const rate = budgetAmount > 0 ? (spentAmount / budgetAmount) : 0;
        
        let status: '정상' | '주의' | '초과' = '정상';
        if (rate >= 1.0) {
          status = '초과';
        } else if (rate >= CONFIG.DEFAULT_SETTINGS.budgetAlertThreshold) {
          status = '주의';
        }

        result.push({
          yearMonth: ym,
          categoryMain,
          budgetAmount,
          spentAmount,
          remainingAmount,
          rate,
          status
        });
      }
    });

    return result;
  }

  /**
   * 예산 초과/주의 항목 검사 후 알림 이메일 발송
   */
  public static checkAndSendBudgetAlert(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    recipientEmail?: string
  ): { sent: boolean; message: string; alertCount: number } {
    let email = recipientEmail;
    if (!email) {
      try {
        email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
      } catch (_e) {
        email = '';
      }
    }
    if (!email) {
      return { sent: false, message: '알림을 수신할 이메일 주소가 없습니다.', alertCount: 0 };
    }

    const currentYm = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM');
    const budgetList = this.getBudgetStatusList(ss, currentYm);

    const alertItems = budgetList.filter(b => b.status === '초과' || b.status === '주의');
    if (alertItems.length === 0) {
      return { sent: false, message: '예산 초과 또는 주의 항목이 없습니다.', alertCount: 0 };
    }

    // 이메일 HTML 본문 생성
    let htmlBody = `
      <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1E293B, #0F172A); padding: 24px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ [스마트 가계부] ${currentYm} 예산 경고 알림</h2>
          <p style="margin: 6px 0 0 0; color: #94A3B8; font-size: 14px;">설정하신 카테고리별 예산 한도에 도달했거나 초과한 항목이 있습니다.</p>
        </div>
        <div style="padding: 24px; background: #FFFFFF;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #F8FAFC; border-bottom: 2px solid #CBD5E1;">
                <th style="padding: 10px; text-align: left;">카테고리</th>
                <th style="padding: 10px; text-align: right;">설정 예산</th>
                <th style="padding: 10px; text-align: right;">현재 지출액</th>
                <th style="padding: 10px; text-align: right;">소진율</th>
                <th style="padding: 10px; text-align: center;">상태</th>
              </tr>
            </thead>
            <tbody>
    `;

    alertItems.forEach(item => {
      const badgeColor = item.status === '초과' ? '#EF4444' : '#F59E0B';
      const badgeBg = item.status === '초과' ? '#FEE2E2' : '#FEF3C7';
      const ratePct = (item.rate * 100).toFixed(1);

      htmlBody += `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px 10px; font-weight: bold;">${item.categoryMain}</td>
          <td style="padding: 12px 10px; text-align: right;">₩${item.budgetAmount.toLocaleString()}</td>
          <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: ${badgeColor};">₩${item.spentAmount.toLocaleString()}</td>
          <td style="padding: 12px 10px; text-align: right;">${ratePct}%</td>
          <td style="padding: 12px 10px; text-align: center;">
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px;">
              ${item.status === '초과' ? '🚨 초과' : '⚠️ 주의'}
            </span>
          </td>
        </tr>
      `;
    });

    htmlBody += `
            </tbody>
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #F1F5F9; border-radius: 8px; font-size: 13px; color: #475569;">
            💡 <strong>지출 관리 팁</strong>: 예산 초과 항목의 남은 기간 지출을 조절하거나, 가계부 스프레드시트에서 예산을 재조정하세요.
          </div>
        </div>
      </div>
    `;

    try {
      GmailApp.sendEmail(email, `[스마트 가계부] ${currentYm} 예산 경고 알림 (${alertItems.length}건)`, '', {
        htmlBody: htmlBody
      });
      return { sent: true, message: `${email}로 예산 경고 이메일을 발송했습니다.`, alertCount: alertItems.length };
    } catch (e: any) {
      Logger.log(`[BudgetService] 이메일 발송 실패: ${e.message}`);
      return { sent: false, message: `이메일 발송 실패: ${e.message}`, alertCount: alertItems.length };
    }
  }
}
