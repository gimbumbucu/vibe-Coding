/**
 * 구글 드라이브(Google Drive) 연동 서비스
 * - 영수증 폴더 및 월별 보관함 자동 생성
 * - 영수증 파일(이미지/PDF) 업로드 및 URL 링크 반환
 * - 월간 보고서 PDF 및 트랜잭션 CSV 자동 백업
 */
class DriveService {
  /**
   * 가계부 최상위 루트 폴더 조회 또는 생성
   */
  public static getRootFolder(): GoogleAppsScript.Drive.Folder {
    const folderName = CONFIG.DRIVE_ROOT_FOLDER;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(folderName);
  }

  /**
   * 지정된 서브 폴더 조회 또는 생성
   */
  public static getSubFolder(parent: GoogleAppsScript.Drive.Folder, subFolderName: string): GoogleAppsScript.Drive.Folder {
    const folders = parent.getFoldersByName(subFolderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    return parent.createFolder(subFolderName);
  }

  /**
   * 월별 영수증 보관 폴더 조회/생성 (예: '스마트 가계부 보관함/영수증/2026-08')
   */
  public static getReceiptMonthlyFolder(yearMonth: string): GoogleAppsScript.Drive.Folder {
    const root = this.getRootFolder();
    const receiptsRoot = this.getSubFolder(root, CONFIG.DRIVE_RECEIPTS_FOLDER);
    return this.getSubFolder(receiptsRoot, yearMonth);
  }

  /**
   * 백업 및 보고서 폴더 조회/생성
   */
  public static getBackupsFolder(): GoogleAppsScript.Drive.Folder {
    const root = this.getRootFolder();
    return this.getSubFolder(root, CONFIG.DRIVE_BACKUPS_FOLDER);
  }

  /**
   * 영수증 파일(Base64)을 구글 드라이브 해당 월 폴더에 업로드
   */
  public static saveReceiptFile(
    fileData: { base64Data: string; fileName: string; mimeType: string },
    dateStr: string
  ): string {
    try {
      const yearMonth = dateStr.substring(0, 7); // YYYY-MM
      const targetFolder = this.getReceiptMonthlyFolder(yearMonth);

      // Base64 디코딩 및 Blob 생성
      const contentType = fileData.mimeType || 'image/jpeg';
      const cleanBase64 = fileData.base64Data.replace(/^data:.*;base64,/, '');
      const decodedBytes = Utilities.base64Decode(cleanBase64);
      
      const fileExt = fileData.fileName.split('.').pop() || 'jpg';
      const timeStamp = Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyyMMdd_HHmmss');
      const uniqueFileName = `영수증_${dateStr}_${timeStamp}.${fileExt}`;
      
      const blob = Utilities.newBlob(decodedBytes, contentType, uniqueFileName);
      const driveFile = targetFolder.createFile(blob);
      
      // 누구나 읽기 권한 또는 드라이브 내 접근 링크 반환
      driveFile.setDescription(`가계부 영수증 첨부파일 (${dateStr} 등록)`);
      return driveFile.getUrl();
    } catch (e: any) {
      Logger.log(`[DriveService] 영수증 저장 실패: ${e.message}`);
      throw new Error(`영수증 드라이브 업로드 실패: ${e.message}`);
    }
  }

  /**
   * 특정 시트를 PDF로 변환하여 구글 드라이브 백업 폴더에 저장
   */
  public static exportSheetToPdf(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    fileName: string
  ): GoogleAppsScript.Drive.File {
    const ssId = spreadsheet.getId();
    const sheetId = sheet.getSheetId();
    
    const url = `https://docs.google.com/spreadsheets/d/${ssId}/export?` +
      `exportFormat=pdf&format=pdf` +
      `&size=A4` +
      `&portrait=true` +
      `&fitw=true` +
      `&gridlines=false` +
      `&printtitle=false` +
      `&sheetnames=false` +
      `&fzr=false` +
      `&gid=${sheetId}`;

    const token = ScriptApp.getOAuthToken();
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      throw new Error(`PDF 내보내기 요청 실패: HTTP ${response.getResponseCode()}`);
    }

    const pdfBlob = response.getBlob().setName(`${fileName}.pdf`);
    const backupsFolder = this.getBackupsFolder();
    return backupsFolder.createFile(pdfBlob);
  }

  /**
   * 거래내역 시트의 데이터를 CSV로 백업
   */
  public static exportTransactionsCsv(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    yearMonth: string
  ): GoogleAppsScript.Drive.File {
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      throw new Error('내보낼 데이터가 없습니다.');
    }

    let csvContent = '';
    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      // 첫 행(헤더)이거나, 해당 월의 거래내역만 필터
      if (r === 0 || (row[1] && String(row[1]).startsWith(yearMonth))) {
        const line = row.map(val => {
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',');
        csvContent += line + '\r\n';
      }
    }

    const blob = Utilities.newBlob(csvContent, 'text/csv', `가계부_거래내역_${yearMonth}.csv`);
    const backupsFolder = this.getBackupsFolder();
    return backupsFolder.createFile(blob);
  }
}
