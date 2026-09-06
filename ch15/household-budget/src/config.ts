/**
 * 스마트 가계부 시스템 전역 설정 상수 (Config)
 */
const CONFIG = {
  APP_TITLE: '📊 스마트 가계부 & 자산관리 시스템',
  VERSION: '1.0.0',
  DEFAULT_TIMEZONE: 'Asia/Seoul',

  // 구글 드라이브 폴더명
  DRIVE_ROOT_FOLDER: '스마트 가계부 보관함',
  DRIVE_RECEIPTS_FOLDER: '영수증',
  DRIVE_BACKUPS_FOLDER: '백업_보고서',

  // 스프레드시트 시트명
  SHEETS: {
    DASHBOARD: '📊 대시보드',
    TRANSACTIONS: '💳 거래내역',
    BUDGETS: '🎯 예산관리',
    ACCOUNTS: '🏦 자산계좌',
    FIXED_EXPENSES: '🔄 고정비관리',
    SETTINGS: '⚙️ 설정'
  },

  // 거래내역 시트 컬럼 인덱스 (1-based for GAS)
  TX_COLUMNS: {
    ID: 1,
    DATE: 2,
    TYPE: 3,
    MAIN_CAT: 4,
    SUB_CAT: 5,
    AMOUNT: 6,
    FROM_ACC: 7,
    TO_ACC: 8,
    DESC: 9,
    RECEIPT: 10,
    MEMO: 11,
    CREATED_AT: 12
  },

  // 기본 카테고리 마스터 데이터
  DEFAULT_CATEGORIES: [
    // 지출 카테고리
    { mainCategory: '식비', type: '지출', subCategories: ['식자재/마트', '외식', '카페/간식', '배달음식'] },
    { mainCategory: '주거/통신', type: '지출', subCategories: ['월세/관리비', '통신비', '공과금(전기/가스/수도)', '인터넷'] },
    { mainCategory: '생활/쇼핑', type: '지출', subCategories: ['생필품', '의류/미용', '가구/가전', '반려동물'] },
    { mainCategory: '교통/차량', type: '지출', subCategories: ['대중교통', '택시', '주유비', '차량정비/보험'] },
    { mainCategory: '건강/의료', type: '지출', subCategories: ['병원비', '약국', '운동/헬스', '영양제'] },
    { mainCategory: '문화/여가', type: '지출', subCategories: ['영화/공연', '도서', '취미/레저', 'OTT/구독', '여행/숙박'] },
    { mainCategory: '교육/자기계발', type: '지출', subCategories: ['강의/학원', '자격증', '교재'] },
    { mainCategory: '경조/선물', type: '지출', subCategories: ['경조사비', '부모님용돈', '선물'] },
    { mainCategory: '금융/기타', type: '지출', subCategories: ['대출이자', '수수료', '세금', '기타지출'] },

    // 수입 카테고리
    { mainCategory: '급여', type: '수입', subCategories: ['본업급여', '상여금/성과급'] },
    { mainCategory: '부수입', type: '수입', subCategories: ['부업/프리랜서', '블로그/콘텐츠', '중고판매'] },
    { mainCategory: '금융수입', type: '수입', subCategories: ['이자/배당금', '투자수익', '환급금'] },
    { mainCategory: '용돈/기타수입', type: '수입', subCategories: ['용돈', '상금', '기타수입'] },

    // 이체 카테고리
    { mainCategory: '계좌이체', type: '이체', subCategories: ['단순이체', '저축/적금', '투자송금', '카드대금결제'] }
  ] as CategoryMapping[],

  // 기본 결제수단 및 계좌
  DEFAULT_ACCOUNTS: [
    { name: '주거래 은행계좌', type: '은행계좌', initialBalance: 1000000, currentBalance: 1000000, memo: '급여 및 생활비' },
    { name: '비상금 통장', type: '은행계좌', initialBalance: 3000000, currentBalance: 3000000, memo: '비상금 전용' },
    { name: '주사용 신용카드', type: '신용카드', initialBalance: 0, currentBalance: 0, memo: '포인트 적립용' },
    { name: '생활비 체크카드', type: '체크카드', initialBalance: 500000, currentBalance: 500000, memo: '식비/교통' },
    { name: '지갑 현금', type: '현금', initialBalance: 50000, currentBalance: 50000, memo: '비상 현금' },
    { name: '주식/ETF 투자계좌', type: '투자', initialBalance: 5000000, currentBalance: 5000000, memo: '장기 투자' }
  ],

  // 기본 고정비 샘플
  DEFAULT_FIXED_EXPENSES: [
    { id: 'FX-0001', name: '아파트 관리비/공과금', type: '지출', categoryMain: '주거/통신', categorySub: '월세/관리비', amount: 150000, fromAccount: '주거래 은행계좌', payDay: 25, isActive: true, memo: '자동이체' },
    { id: 'FX-0002', name: '스마트폰 요금', type: '지출', categoryMain: '주거/통신', categorySub: '통신비', amount: 65000, fromAccount: '주사용 신용카드', payDay: 15, isActive: true, memo: '카드 자동결제' },
    { id: 'FX-0003', name: 'OTT 구독료(넷플릭스/유튜브)', type: '지출', categoryMain: '문화/여가', categorySub: 'OTT/구독', amount: 28000, fromAccount: '주사용 신용카드', payDay: 10, isActive: true, memo: '정기결제' },
    { id: 'FX-0004', name: '청약저축/적금', type: '이체', categoryMain: '계좌이체', categorySub: '저축/적금', amount: 200000, fromAccount: '주거래 은행계좌', toAccount: '비상금 통장', payDay: 1, isActive: true, memo: '매월 1일 저축' }
  ],

  // 기본 시스템 설정값
  DEFAULT_SETTINGS: {
    storageFolderName: '스마트 가계부 보관함',
    notificationEmail: '',
    budgetAlertThreshold: 0.8, // 80% 이상 시 경고
    enableMonthlyReport: true,
    enableBudgetAlert: true
  } as SystemSettings,

  // 디자인 테마 색상 (Google Sheets 셀 서식용)
  THEME: {
    PRIMARY: '#2563EB',      // Blue-600 (메인 헤더)
    PRIMARY_LIGHT: '#DBEAFE',// Blue-100 (배경 강조)
    SECONDARY: '#10B981',    // Emerald-500 (수입 강조)
    ACCENT: '#F59E0B',       // Amber-500 (주의/경고)
    DANGER: '#EF4444',       // Red-500 (지출/초과)
    HEADER_BG: '#1E293B',    // Slate-800 (다크 헤더 배경)
    HEADER_TEXT: '#FFFFFF',  // 헤더 텍스트
    ZEBRA_BG: '#F8FAFC',     // 줄바꿈 배경 Slate-50
    CARD_BG: '#F1F5F9',      // 요약 카드 배경
    BORDER: '#CBD5E1'        // 테두리 Slate-300
  }
};
