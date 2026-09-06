/**
 * 스마트 가계부 시스템 타입 정의 (TypeScript Models)
 */

type TransactionType = '지출' | '수입' | '이체';

interface TransactionInput {
  date: string;              // YYYY-MM-DD
  type: TransactionType;     // 지출, 수입, 이체
  categoryMain: string;      // 대분류 (식비, 주거/통신, 급여 등)
  categorySub: string;       // 소분류 (식자재, 외식, 월세 등)
  amount: number;            // 금액
  fromAccount: string;       // 출금/결제 계좌 (지출/이체 시)
  toAccount?: string;        // 입금 계좌 (수입/이체 시)
  description: string;       // 사용처/내용
  memo?: string;             // 추가 메모
  receiptFile?: {            // 영수증 첨부 파일 정보
    base64Data: string;
    fileName: string;
    mimeType: string;
  };
}

interface TransactionRecord extends TransactionInput {
  id: string;                // TX-YYYYMMDD-XXXX
  receiptUrl?: string;       // 구글 드라이브 파일 링크
  createdAt: string;         // 생성일시 ISO
}

interface AccountItem {
  name: string;              // 계좌/카드명
  type: '은행계좌' | '체크카드' | '신용카드' | '투자' | '현금';
  initialBalance: number;    // 기초 잔액
  currentBalance: number;    // 현재 잔액
  memo?: string;
}

interface BudgetItem {
  yearMonth: string;         // YYYY-MM
  categoryMain: string;      // 대분류
  budgetAmount: number;      // 설정 예산
  spentAmount: number;       // 실지출액
  remainingAmount: number;   // 잔여액
  rate: number;              // 소진율 (0.0 ~ 1.0+)
  status: '정상' | '주의' | '초과';
}

interface FixedExpenseItem {
  id: string;                // FX-XXXX
  name: string;              // 고정비명 (넷플릭스, 월세, 통신비 등)
  type: TransactionType;     // 지출 / 수입
  categoryMain: string;
  categorySub: string;
  amount: number;
  fromAccount: string;
  toAccount?: string;
  payDay: number;            // 매월 결제일 (1~31)
  isActive: boolean;         // 활성화 여부
  lastProcessedMonth?: string; // 마지막 처리된 연월 (YYYY-MM)
  memo?: string;
}

interface CategoryMapping {
  mainCategory: string;
  type: TransactionType;
  subCategories: string[];
}

interface SystemSettings {
  storageFolderName: string;
  notificationEmail: string;
  budgetAlertThreshold: number; // 예: 0.8 (80%)
  enableMonthlyReport: boolean;
  enableBudgetAlert: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface InitialFormData {
  categories: CategoryMapping[];
  accounts: string[];
  currentMonth: string;
  recentTransactions: Array<{
    date: string;
    type: string;
    category: string;
    amount: number;
    description: string;
  }>;
}
