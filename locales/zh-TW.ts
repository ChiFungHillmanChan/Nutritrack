/**
 * Traditional Chinese (Taiwan) Translations
 */

const zhTW = {
  // Common
  common: {
    appName: 'Nutritrack',
    tagline: '追蹤營養，健康生活',
    loading: '載入中...',
    save: '儲存',
    cancel: '取消',
    delete: '刪除',
    edit: '編輯',
    done: '完成',
    back: '返回',
    next: '下一步',
    continue: '繼續',
    confirm: '確認',
    close: '關閉',
    error: '錯誤',
    success: '成功',
    warning: '警告',
    retry: '重試',
    ok: '確定',
    yes: '是',
    no: '否',
    search: '搜尋',
    noData: '沒有資料',
    today: '今日',
    yesterday: '昨日',
    items: '項',
    step: '步驟',
    of: '/',
    left: '剩餘',
    version: '版本',
  },

  // Units
  units: {
    kg: '公斤',
    cm: '公分',
    ml: '毫升',
    g: '克',
    kcal: '卡路里',
    hours: '小時',
    minutes: '分鐘',
    servings: '份',
    glasses: '杯',
    years: '歲',
    l: '升',
  },

  // Navigation
  nav: {
    home: '首頁',
    camera: '相機',
    chat: '聊天',
    habits: '習慣',
    profile: '個人資料',
    settings: '設定',
  },

  // Tab titles (for header)
  tabs: {
    home: 'Nutritrack',
    record: '記錄食物',
    habits: '習慣',
    chat: 'AI 營養師',
    profile: '我的檔案',
  },

  // Nutrient labels
  nutrients: {
    carbs: '碳水',
    protein: '蛋白質',
    fiber: '纖維',
    fat: '脂肪',
    sugar: '糖分',
    fluids: '水分',
  },

  // Profile Edit Screen
  profileEdit: {
    title: '編輯個人資料',
    saving: '儲存中...',
    basicInfo: '基本資料',
    name: '名稱',
    namePlaceholder: '輸入你的名稱',
    email: '電郵',
    emailPlaceholder: '輸入你的電郵',
    gender: '性別',
    bodyData: '身體數據',
    height: '身高',
    weight: '體重',
    healthGoal: '健康目標',
    activityLevel: '活動水平',
    genders: {
      male: '男性',
      female: '女性',
      other: '其他',
      preferNotToSay: '不願透露',
    },
    goals: {
      loseWeight: '減重',
      maintain: '維持體重',
      gainWeight: '增重',
      buildMuscle: '增肌',
    },
    activity: {
      sedentary: '久坐',
      sedentaryDesc: '很少運動',
      light: '輕度活動',
      lightDesc: '每週運動1-3天',
      moderate: '中度活動',
      moderateDesc: '每週運動3-5天',
      active: '活躍',
      activeDesc: '每週運動6-7天',
      veryActive: '非常活躍',
      veryActiveDesc: '每天高強度運動',
    },
    errors: {
      nameRequired: '請輸入名稱',
      invalidHeight: '請輸入有效的身高 (100-250 cm)',
      invalidWeight: '請輸入有效的體重 (30-300 kg)',
      updateFailed: '更新失敗，請稍後再試',
    },
    success: {
      updated: '個人資料已更新',
    },
  },

  // Timeline Screen
  timeline: {
    title: '時間軸',
    calendar: '日曆',
    list: '列表',
    noEntries: '今日沒有記錄',
    mealTypes: {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '小食',
    },
  },

  // Calculators
  calculators: {
    insulin: {
      title: '胰島素計算器',
      disclaimer: '重要提示',
      disclaimerText: '此計算器僅供參考。請務必諮詢你嘅醫生或糖尿病專科護士，並按照處方用藥。',
      carbsInput: '碳水化合物 (克)',
      bloodSugar: '目前血糖 (mg/dL)',
      targetBloodSugar: '目標血糖 (mg/dL)',
      carbRatio: '碳水比例 (1單位 / X克)',
      correctionFactor: '校正因子 (1單位降 X mg/dL)',
      calculate: '計算',
      result: '建議劑量',
      units: '單位',
      carbCoverage: '碳水覆蓋',
      correction: '校正',
      total: '總計',
      errors: {
        invalidCarbs: '請輸入有效嘅碳水化合物克數',
        invalidRatio: '請輸入有效嘅碳水比例',
      },
    },
    creon: {
      title: 'Creon 計算器',
      disclaimer: '重要提示',
      disclaimerText: '此計算器僅供參考。Creon 劑量因人而異，請按照你嘅醫生或營養師處方用藥。',
      info: '關於 Creon',
      infoText: 'Creon 含有胰臟酶，幫助消化脂肪。一般劑量為每克脂肪 2000-4000 脂肪酶單位。',
      fatInput: '脂肪含量 (克)',
      lipasePerGram: '每克脂肪嘅脂肪酶單位',
      capsuleStrength: '膠囊強度',
      calculate: '計算',
      result: '建議劑量',
      capsules: '粒膠囊',
      totalLipase: '總脂肪酶單位',
      errors: {
        invalidFat: '請輸入有效嘅脂肪克數',
        invalidLipase: '請輸入有效嘅脂肪酶劑量',
      },
    },
  },

  // Auth - Login
  auth: {
    login: {
      title: '登入',
      email: '電郵地址',
      password: '密碼',
      forgotPassword: '忘記密碼？',
      loginButton: '登入',
      orUse: '或者使用',
      noAccount: '未有帳戶？',
      registerNow: '立即註冊',
      demoMode: '示範模式（無需登入）',
      loginFailed: '登入失敗',
      tryAgain: '請再試一次',
      fillEmailPassword: '請填寫電郵同密碼',
      cancelled: '登入已取消',
    },
    register: {
      title: '建立帳戶',
      subtitle: '開始你嘅健康追蹤之旅',
      email: '電郵地址',
      emailPlaceholder: 'yourname@example.com',
      password: '密碼',
      passwordPlaceholder: '建立一個安全嘅密碼',
      confirmPassword: '確認密碼',
      confirmPasswordPlaceholder: '再次輸入密碼',
      registerButton: '建立帳戶',
      haveAccount: '已有帳戶？',
      loginNow: '登入',
      passwordMismatch: '兩次輸入嘅密碼唔一樣',
      registerFailed: '註冊失敗',
      registerSuccess: '註冊成功',
      checkEmail: '請檢查你嘅電郵確認帳戶',
      fillAllFields: '請填寫所有欄位',
      passwordTooShort: '密碼最少要 8 個字元',
      passwordNeedsUppercase: '密碼要包含最少一個大楷字母',
      passwordNeedsNumber: '密碼要包含最少一個數字',
      passwordNotStrong: '密碼唔夠強',
      terms: '建立帳戶即表示你同意我哋嘅',
      termsOfService: '服務條款',
      and: '及',
      requirements: {
        minLength: '最少 8 個字元',
        uppercase: '包含大楷字母',
        number: '包含數字',
      },
    },
    logout: {
      title: '登出',
      confirm: '你確定要登出嗎？',
      button: '登出',
    },
  },

  // Onboarding
  onboarding: {
    progress: {
      step: '第 {{current}} / {{total}} 步',
    },
    basics: {
      title: '基本資料',
      description: '讓我們更了解你',
      name: '姓名',
      namePlaceholder: '你的名字',
      gender: '性別',
      dateOfBirth: '出生日期',
    },
    gender: {
      male: '男性',
      female: '女性',
      other: '其他',
      preferNotToSay: '不願透露',
    },
    metrics: {
      title: '身體數據',
      description: '用於計算每日營養需求',
      height: '身高',
      weight: '體重',
      activityLevel: '活動量',
    },
    activity: {
      sedentary: '久坐不動',
      sedentaryDesc: '很少運動，文職工作',
      light: '輕度活動',
      lightDesc: '每週運動 1-3 次',
      moderate: '中度活動',
      moderateDesc: '每週運動 3-5 次',
      active: '活躍',
      activeDesc: '每週運動 6-7 次',
      veryActive: '非常活躍',
      veryActiveDesc: '每日劇烈運動或體力工作',
    },
    goals: {
      title: '健康目標',
      description: '選擇你的目標',
      primaryGoal: '主要目標（選一個）',
      additionalGoals: '其他健康目標（可選）',
    },
    primaryGoals: {
      loseWeight: '減肥',
      loseWeightDesc: '減少體脂，更健康',
      gainWeight: '增重',
      gainWeightDesc: '增加體重，變得更強壯',
      maintain: '維持',
      maintainDesc: '保持現有體重和狀態',
      buildMuscle: '增肌',
      buildMuscleDesc: '增加肌肉量，塑造體型',
    },
    healthGoals: {
      healthyBalancedEating: '均衡飲食',
      weightLoss: '減肥',
      weightGain: '增重',
      healthyBowels: '改善腸道健康',
      muscleGain: '增肌',
      improveHydration: '改善補水',
      bloodSugarControl: '血糖控制',
      fixMicros: '改善微量營養素',
      improveSleep: '改善睡眠',
      improveBreathing: '改善呼吸',
      reduceAlcohol: '減少酒精',
      reduceSmoking: '減少吸煙',
      achieve10kSteps: '每日一萬步',
      improveMentalHealth: '心理健康',
    },
    conditions: {
      title: '健康狀況',
      description: '如有以下情況，我們會調整營養建議',
      none: '以上皆無',
      t1dm: '一型糖尿病',
      t2dm: '二型糖尿病',
      hypertension: '高血壓',
      coronaryHeartDisease: '冠心病',
      highCholesterol: '高膽固醇',
      kidneyDisease: '腎病',
      copd: '慢性阻塞性肺病',
      asthma: '哮喘',
      cancer: '癌症',
      celiacDisease: '乳糜瀉',
      lactoseIntolerance: '乳糖不耐症',
      pcos: '多囊卵巢綜合症',
      thyroidDisorders: '甲狀腺疾病',
      ibs: '腸易激綜合症',
      crohnsDisease: '克隆氏症',
      ulcerativeColitis: '潰瘍性結腸炎',
    },
    medications: {
      title: '藥物及營養補充品',
      description: '記錄你正在服用的藥物（可選）',
      currentMeds: '目前用藥',
      medNamePlaceholder: '藥物名稱',
      supplements: '營養補充品 / 口服營養補充劑',
      suppNamePlaceholder: '補充品名稱',
    },
    dietary: {
      title: '飲食偏好',
      description: '幫助我們提供適合的食物建議',
      dietaryWays: '飲食方式',
      allergies: '食物過敏',
      allergyPlaceholder: '輸入過敏食物',
    },
    dietaryPrefs: {
      vegetarian: '素食',
      vegan: '純素',
      pescatarian: '魚素',
      halal: '清真',
      kosher: '猶太潔食',
      glutenFree: '無麩質',
      dairyFree: '無乳製品',
      nutFree: '無堅果',
      lowSodium: '低鈉',
      lowCarb: '低碳水',
      keto: '生酮',
    },
    summary: {
      title: '準備就緒！',
      description: '以下是你的個人化設定',
      dailyTargets: '每日營養目標',
      healthGoalsTitle: '健康目標',
      conditionsTitle: '健康狀況',
      medicationsTitle: '藥物',
      supplementsTitle: '營養補充品',
      dietaryPrefsTitle: '飲食偏好',
      allergiesTitle: '過敏',
      startUsing: '開始使用',
    },
    nutrients: {
      calories: '熱量',
      protein: '蛋白質',
      carbs: '碳水化合物',
      fat: '脂肪',
      fiber: '纖維',
      water: '水份',
    },
    validation: {
      enterName: '請輸入你的名字',
      enterHeightWeight: '請填寫身高同體重',
      selectGoal: '請選擇你的主要目標',
      selectConditions: '請選擇你的健康狀況',
      saveFailed: '儲存資料失敗，請再試一次',
    },
  },

  // Home Screen
  home: {
    greeting: 'Hi, {{name}}',
    userDefault: '用戶',
    todayIntake: '今日攝取',
    recordIntake: '記錄攝取',
    todayRecord: '今日記錄',
    askAI: '問 AI',
    nutritionAdvice: '營養建議',
    habits: '習慣',
    trackRecord: '追蹤記錄',
    meditation: '冥想',
    relaxMind: '放鬆心情',
    day: '天',
  },

  // Chat Screen
  chat: {
    title: 'AI 營養師',
    tryAsking: '試下問：',
    suggestions: {
      whatToEat: '今日應該食啲咩？',
      healthyWeightLoss: '點樣健康咁減肥？',
      highProtein: '邊啲食物蛋白質高？',
    },
    inputPlaceholder: '輸入你的問題...',
    errorMessage: '對唔住，出咗啲問題。請再試一次。',
    welcomeMessage: '你好！我係你嘅 AI 營養師 🥗\n\n你可以問我任何關於營養、飲食同健康嘅問題。我會根據你今日嘅攝取情況俾你個人化建議！',
    demoResponses: {
      default: '多謝你嘅問題！我係你嘅 AI 營養師，可以幫你解答關於營養、飲食同健康嘅問題。\n\n你可以問我：\n• 今日應該食咩？\n• 點樣健康減重？\n• 邊啲食物高蛋白？\n• 我嘅飲食有咩可以改善？',
      food: '根據你今日嘅攝取情況，我建議你可以考慮以下選擇：\n\n1. 雞胸肉沙律 - 高蛋白低脂\n2. 三文魚配糙米 - 優質蛋白同複合碳水\n3. 希臘乳酪配水果 - 補充蛋白質同纖維\n\n你今日蛋白質攝取偏低，建議揀高蛋白嘅食物！',
      weight: '減重嘅關鍵係保持適度嘅熱量赤字，同時確保營養均衡。以下係一啲建議：\n\n1. 每餐都要有蛋白質，幫助維持飽足感\n2. 多食蔬菜增加纖維攝取\n3. 減少加工食品同糖分\n4. 保持足夠水分攝取\n\n記住，持續嘅習慣改變比短期節食更有效！',
      protein: '蛋白質對身體好重要！以下係一啲優質蛋白質來源：\n\n動物性：雞胸肉、魚、蛋、瘦牛肉、乳製品\n植物性：豆腐、豆類、藜麥、堅果\n\n一般建議每公斤體重攝取 1.6-2.2g 蛋白質，如果你有運動習慣可以攝取較多。',
    },
  },

  // Habits Screen
  habits: {
    title: '習慣追蹤',
    subtitle: '建立健康習慣，每日堅持',
    todayRecord: '今日記錄',
    noRecords: '今日未有記錄',
    tapToStart: '點撃上面的卡片開始記錄',
    record: '記錄',
    types: {
      hydration: '飲水',
      sleep: '睡眠',
      mood: '心情',
      fiveADay: '蔬果',
      weight: '體重',
      bowels: '排便',
      periodCycle: '生理週期',
    },
    habitRecord: '習慣記錄',
    mood: {
      veryBad: '非常差',
      bad: '差',
      okay: '普通',
      good: '好',
      veryGood: '非常好',
    },
    bristol: {
      type1: '第一型',
      type1Desc: '硬粒狀',
      type2: '第二型',
      type2Desc: '香腸狀，表面凹凸',
      type3: '第三型',
      type3Desc: '香腸狀，表面有裂紋',
      type4: '第四型',
      type4Desc: '香腸狀，光滑',
      type5: '第五型',
      type5Desc: '軟塊狀',
      type6: '第六型',
      type6Desc: '糊狀',
      type7: '第七型',
      type7Desc: '水狀',
    },
    inputPlaceholder: '輸入{{habit}}數值',
    invalidNumber: '請輸入有效數字',
    notSupported: '呢個習慣類型暫未支援',
  },

  // Settings/Profile Screen
  settings: {
    lastSync: '上次同步時間',
    myGoals: '我的目標',
    timeline: {
      title: '所有記錄時間線',
      subtitle: '所有之前的記錄都可以在這裡找到',
      totalRecords: '共 {{count}} 筆記錄',
    },
    supportInfo: '支援及資訊',
    privacyPolicy: '私隱政策',
    about: '關於 Nutritrack',
    faq: '常見問題',
    faqComingSoon: '此功能即將推出',
    dataManagement: '數據管理',
    foodLogs: '食物記錄',
    chatLogs: '聊天記錄',
    habitLogs: '習慣記錄',
    clearAllData: '清除所有數據',
    clearConfirm: {
      title: '清除所有數據',
      message: '這將刪除你所有的記錄。此操作無法復原。',
      clear: '清除',
    },
    cleared: '完成',
    clearedMessage: '所有數據已清除',
    language: '語言',
    languageSettings: '語言設定',
    // Quick Actions
    quickActions: {
      setting: '設定',
      notifications: '通知',
      feedback: '回饋',
      theme: '主題',
      export: '匯出',
      notificationsAlert: '通知設定即將推出',
      feedbackAlert: '感謝你的意見！此功能即將推出',
      themeAlert: '深色模式即將推出',
      exportAlert: '匯出報告即將推出',
    },
    // Goals
    goals: {
      title: '我的目標',
      editTitle: '編輯目標',
      editComingSoon: '此功能即將推出',
      noGoals: '未設定任何目標',
      addGoal: '新增目標',
      viewAll: '查看全部 {{count}} 個目標',
    },
  },

  // Camera Screen
  camera: {
    title: '食物相機',
    takePhoto: '拍攝',
    choosePhoto: '相簿',
    analyzing: 'AI 分析緊...',
    analyzeButton: 'AI 分析營養',
    retry: '重試',
    save: '儲存',
    nutritionInfo: '營養資訊',
    confirmSave: '儲存這餐？',
    mealType: '選擇餐類',
    permissionRequired: '需要權限',
    cameraPermission: '請允許 Nutritrack 使用相機',
    galleryPermission: '請允許 Nutritrack 存取相簿',
    analysisFailed: '分析失敗',
    tryAgain: '請再試一次',
    placeholderTitle: '拍攝食物相片',
    placeholderSubtitle: 'AI 會自動分析營養成分',
    accuracy: '準確',
    estimatedPortion: '估計份量',
    totalCalories: '總卡路里',
    recordMeal: '記錄呢餐',
    recorded: '已記錄',
    recordedMessage: '{{food}} 已加入今日記錄',
    saveFailed: '儲存失敗',
  },

  // Meal Types
  mealTypes: {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '小食',
  },

  // About Screen
  about: {
    title: '關於 Nutritrack',
    version: '版本',
    description: '你的個人營養追蹤助手。追蹤你的餐飲，監控營養攝取，達成健康目標。',
    features: '功能',
    feature1: 'AI 食物辨識',
    feature2: '個人化營養目標',
    feature3: '習慣追蹤',
    feature4: 'AI 營養師對話',
    credits: '致謝',
    creditsText: '使用 Expo 和 React Native 開發',
  },

  // Privacy Policy
  privacy: {
    title: '私隱政策',
    lastUpdated: '最後更新',
    intro: '你的私隱對我們非常重要。此政策說明我們如何收集、使用和保護你的資料。',
  },

  // Menu / Extended Functions
  menu: {
    title: '延伸功能',
    aboutUs: '關於我們',
    carbCounting: '碳水計算',
    myMedications: '我的藥物',
    portionGuide: '份量指南',
    lifestyleTips: '生活貼士',
    nutritionFacts: '營養知識',
    exerciseGuide: '運動指南',
    meditation: '冥想',
    affirmation: '正面語句',
    miniGames: '迷你遊戲',
    otherServices: '其他服務',
    bookConsultation: '預約諮詢',
    contactUs: '聯絡我們',
  },

  // Goals Labels
  goalLabels: {
    healthy_balanced_eating: '均衡飲食',
    weight_loss: '減重',
    weight_gain: '增重',
    healthy_bowels: '腸道健康',
    muscle_gain: '增肌',
    improve_hydration: '增加飲水',
    blood_sugar_control: '控制血糖',
    fix_micros: '改善微量營養素',
    improve_sleep: '改善睡眠',
    improve_breathing: '改善呼吸',
    reduce_alcohol: '減少飲酒',
    reduce_smoking: '減少吸煙',
    achieve_10k_steps: '每日萬步',
    improve_mental_health: '改善心理健康',
  },

  // Tools
  tools: {
    carbCounting: {
      title: '碳水計算',
      headerTitle: '碳水化合物計算器',
      subtitle: '選擇食物並輸入份量，計算碳水化合物含量',
      commonFoods: '常見食物',
      portionGrams: '份量 (克)',
      enterGrams: '輸入克數',
      commonPortion: '常見份量',
      carbContent: '碳水化合物含量',
      resultNote: '{{food}} ({{portion}}克) 含約 {{carbs}}克 碳水化合物',
      tips: '碳水計算小貼士',
      tip1: '糖尿病患者應該每餐監控碳水攝取',
      tip2: '建議每餐碳水攝取量約 45-60 克',
      tip3: '選擇低升糖指數的碳水來源',
      tip4: '配合蛋白質和纖維一起進食',
      foods: {
        rice: '白飯',
        noodles: '麵條',
        bread: '麵包',
        apple: '蘋果',
        banana: '香蕉',
        potato: '薯仔',
        corn: '粟米',
        milk: '牛奶',
      },
    },
    exerciseGuide: {
      title: '運動指南',
      headerTitle: '運動指南',
      subtitle: '簡單的運動，在家也能做',
      steps: '步驟',
      safetyTitle: '安全提示',
      safety1: '運動前先熱身',
      safety2: '如感到不適，立即停止',
      safety3: '保持呼吸，不要憋氣',
      safety4: '如有健康問題，請先諮詢醫生',
      difficulty: {
        easy: '簡單',
        medium: '中等',
        hard: '困難',
      },
      categories: {
        stretching: {
          name: '伸展運動',
          description: '放鬆肌肉，提高靈活性',
        },
        cardio: {
          name: '有氧運動',
          description: '提高心肺功能',
        },
        strength: {
          name: '力量訓練',
          description: '增強肌肉力量',
        },
      },
    },
    lifestyleTips: {
      title: '生活貼士',
      headerTitle: '生活貼士',
      subtitle: '簡單的習慣改變，帶來更健康的生活',
      categories: {
        eating: {
          title: '健康飲食',
          tips: [
            '每餐應包含蛋白質、碳水化合物和蔬菜',
            '慢慢咀嚼，享受食物的味道',
            '避免進食時使用電子設備',
            '每日進食至少5份蔬果',
            '選擇全穀物而非精製穀物',
          ],
        },
        hydration: {
          title: '水分補充',
          tips: [
            '每日飲用 8 杯水（約 2 升）',
            '起床後先喝一杯水',
            '運動前後要補充水分',
            '可以用無糖茶或水果水代替',
            '尿液顏色淺黃色表示水分充足',
          ],
        },
        sleep: {
          title: '優質睡眠',
          tips: [
            '保持規律的睡眠時間',
            '睡前 1 小時避免使用電子設備',
            '睡房保持涼爽和黑暗',
            '睡前避免咖啡因和酒精',
            '成人每晚需要 7-9 小時睡眠',
          ],
        },
        activity: {
          title: '保持活躍',
          tips: [
            '每週進行至少 150 分鐘中等強度運動',
            '每小時起來活動 5 分鐘',
            '使用樓梯代替電梯',
            '飯後散步有助消化',
            '找一項你喜歡的運動並堅持',
          ],
        },
        mental: {
          title: '心理健康',
          tips: [
            '每日花 10 分鐘冥想或深呼吸',
            '保持社交聯繫',
            '學習說「不」，不要過度承諾',
            '保持感恩的心態',
            '有需要時尋求專業幫助',
          ],
        },
      },
    },
    medications: {
      title: '我的藥物',
      headerTitle: '我的藥物',
      subtitle: '管理你的藥物和營養補充品',
      prescriptionMeds: '處方藥物',
      supplements: '營養補充品',
      add: '新增',
      noMedications: '未有記錄任何藥物',
      noSupplements: '未有記錄任何補充品',
      importantTips: '重要提示',
      tip1: '請定時服用藥物，切勿自行停藥',
      tip2: '如有任何不適，請諮詢醫生',
      tip3: '此 App 不能取代專業醫療建議',
      tip4: '請確保藥物存放在安全地方',
      addMedication: '新增藥物',
      addSupplement: '新增補充品',
      editMedication: '編輯藥物',
      comingSoon: '此功能即將推出',
    },
    portionGuide: {
      title: '份量指南',
      headerTitle: '份量指南',
      subtitle: '用簡單嘅方法估算食物份量',
      useYourHand: '用你隻手做參考',
      handExplanation: '你隻手係一個方便嘅參考工具，因為佢嘅大小同你嘅身體比例相關。',
      practicalTips: '實用貼士',
      tip1: '用細啲嘅碟可以幫你控制份量',
      tip2: '慢慢食，比你嘅腦有時間感覺飽',
      tip3: '蔬菜應該佔碟嘅一半',
      tip4: '蛋白質應該佔碟嘅四分之一',
      tip5: '碳水化合物應該佔碟嘅四分之一',
      portions: {
        protein: {
          food: '蛋白質 (肉類、魚、雞)',
          portion: '約 100 克',
          visual: '一副啤牌大小',
        },
        carbs: {
          food: '碳水化合物 (飯、麵)',
          portion: '約 150 克 (熟)',
          visual: '一個拳頭大小',
        },
        vegetables: {
          food: '蔬菜',
          portion: '約 80 克',
          visual: '兩個手掌大小',
        },
        fruit: {
          food: '水果',
          portion: '約 80 克',
          visual: '一個網球大小',
        },
        cheese: {
          food: '芝士',
          portion: '約 30 克',
          visual: '兩個拇指大小',
        },
        nuts: {
          food: '堅果',
          portion: '約 30 克',
          visual: '一小把',
        },
        oil: {
          food: '油脂',
          portion: '約 5 克',
          visual: '一茶匙',
        },
        sauce: {
          food: '醬汁',
          portion: '約 15 克',
          visual: '一湯匙',
        },
      },
    },
    nutritionFacts: {
      title: '營養知識',
      headerTitle: '營養知識',
      subtitle: '了解各種營養素及其對身體的益處',
      benefits: '好處',
      sources: '食物來源',
      nutrients: {
        protein: {
          name: '蛋白質',
          description: '蛋白質是身體的基本建築材料，用於建造和修復肌肉、器官和組織。',
          benefits: ['建造肌肉', '修復組織', '增強免疫力', '產生酶和荷爾蒙'],
          sources: ['肉類', '魚類', '蛋', '豆腐', '牛奶', '堅果'],
        },
        carbs: {
          name: '碳水化合物',
          description: '碳水化合物是身體的主要能量來源，特別是大腦和肌肉。',
          benefits: ['提供能量', '支援腦部功能', '促進消化', '調節血糖'],
          sources: ['米飯', '麵包', '薯仔', '水果', '蔬菜', '全穀物'],
        },
        fat: {
          name: '脂肪',
          description: '脂肪是必需營養素，幫助吸收維他命和保護器官。',
          benefits: ['吸收脂溶性維他命', '保護器官', '提供長效能量', '維持細胞健康'],
          sources: ['橄欖油', '牛油果', '堅果', '三文魚', '芝士'],
        },
        fiber: {
          name: '纖維',
          description: '纖維有助消化系統健康，維持腸道蠕動正常。',
          benefits: ['促進消化', '維持腸道健康', '控制血糖', '降低膽固醇'],
          sources: ['蔬菜', '水果', '全穀物', '豆類', '堅果'],
        },
        vitamins: {
          name: '維他命',
          description: '維他命是微量營養素，對身體各種功能至關重要。',
          benefits: ['增強免疫力', '促進新陳代謝', '維持視力', '支援骨骼健康'],
          sources: ['水果', '蔬菜', '肉類', '奶製品', '陽光 (維他命 D)'],
        },
        minerals: {
          name: '礦物質',
          description: '礦物質參與身體的許多重要功能，包括骨骼形成和神經傳導。',
          benefits: ['強化骨骼', '調節體液平衡', '支援神經功能', '攜帶氧氣'],
          sources: ['奶製品', '綠葉蔬菜', '肉類', '海鮮', '堅果'],
        },
      },
    },
    insulinCalculator: '胰島素計算機',
    creonCalculator: '消化酶計算機',
  },

  // About Screen
  aboutScreen: {
    title: '關於 Nutritrack',
    tagline: '智能營養追蹤助手',
    version: '版本 {{version}} ({{build}})',
    features: '功能特色',
    aiRecognition: 'AI 食物辨識',
    aiRecognitionDesc: '拍照即可自動辨識食物並計算營養成分',
    nutritionConsult: '營養諮詢',
    nutritionConsultDesc: 'AI 營養師隨時解答你的飲食問題',
    habitTracking: '習慣追蹤',
    habitTrackingDesc: '記錄水分、睡眠、運動等生活習慣',
    dataAnalysis: '數據分析',
    dataAnalysisDesc: '視覺化呈現營養攝取趨勢',
    dataPrivacy: '數據與私隱',
    dataPrivacyText: '你的健康數據安全地儲存在你的設備上。我們重視你的私隱，絕不會在未經你同意的情況下分享你的個人資料。',
    credits: '致謝',
    creditsText: 'Nutritrack 使用先進的 AI 技術提供準確的營養分析。感謝所有貢獻者和用戶的支持。',
    copyright: '© 2024 Nutritrack. All rights reserved.',
    madeWith: 'Made for healthy living',
  },

  // Consultation Screen
  consultation: {
    title: '預約諮詢',
    headerTitle: '預約營養師諮詢',
    subtitle: '與專業註冊營養師一對一諮詢，獲取個人化建議',
    selectType: '選擇諮詢類型',
    bookButton: '預約諮詢',
    aboutDietitians: '關於我們的營養師',
    registeredDietitian: '註冊營養師',
    yearsExperience: '超過 10 年臨床經驗',
    languages: '粵語、普通話、英語',
    consultMode: '面對面或視像諮詢',
    pleaseSelect: '請選擇',
    selectTypeFirst: '請先選擇諮詢類型',
    bookingTitle: '預約諮詢',
    bookingMessage: '我們會透過電郵聯絡你確認預約詳情。\n\n你亦可以直接致電預約。',
    cancel: '取消',
    callToBook: '致電預約',
    sendEmail: '發送電郵',
    types: {
      initial: {
        name: '初次諮詢',
        description: '全面營養評估及個人化飲食計劃',
        duration: '60 分鐘',
        price: 'HK$800',
      },
      followup: {
        name: '跟進諮詢',
        description: '檢視進度及調整飲食計劃',
        duration: '30 分鐘',
        price: 'HK$500',
      },
      diabetes: {
        name: '糖尿病營養諮詢',
        description: '專為糖尿病患者設計的飲食管理',
        duration: '45 分鐘',
        price: 'HK$700',
      },
      sports: {
        name: '運動營養諮詢',
        description: '為運動愛好者優化營養攝取',
        duration: '45 分鐘',
        price: 'HK$650',
      },
    },
  },

  // Contact Screen
  contact: {
    title: '聯絡我們',
    headerTitle: '聯絡我們',
    subtitle: '有任何問題或建議？我們樂意聆聽',
    contactMethods: '聯絡方式',
    email: '電郵',
    phone: '電話',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    sendMessage: '發送訊息',
    name: '姓名',
    namePlaceholder: '你的姓名',
    emailPlaceholder: 'your@email.com',
    message: '訊息',
    messagePlaceholder: '你想告訴我們什麼？',
    sendButton: '發送訊息',
    sending: '發送中...',
    officeHours: '辦公時間',
    mondayFriday: '星期一至五',
    saturday: '星期六',
    sundayHolidays: '星期日及公眾假期',
    closed: '休息',
    fillAllFields: '請填寫所有欄位',
    fillAllFieldsMessage: '姓名、電郵和訊息為必填項目',
    sent: '已發送',
    sentMessage: '我們已收到你的訊息，將盡快回覆。',
  },

  // Errors
  errors: {
    generic: '發生錯誤',
    network: '網絡錯誤。請檢查你的連接。',
    unauthorized: '請登入以繼續',
    notFound: '找不到',
    serverError: '伺服器錯誤。請稍後再試。',
  },

  // Privacy Policy
  privacyPolicy: {
    title: '私隱政策',
    lastUpdated: '最後更新: 2024年1月',
    intro: 'Nutritrack（「我們」）致力於保護你的私隱。本私隱政策說明我們如何收集、使用和保護你的個人資料。',
    section1Title: '1. 資料收集',
    section1Content: `我們收集以下類型的資料：

• 帳戶資料：電郵地址、姓名、密碼
• 健康資料：身高、體重、年齡、性別
• 飲食記錄：食物照片、營養攝取記錄
• 習慣數據：水分攝取、睡眠、運動記錄
• 設備資料：設備類型、作業系統版本

所有健康數據都儲存在你的設備本地，除非你選擇啟用雲端同步功能。`,
    section2Title: '2. 資料使用',
    section2Content: `我們使用收集的資料：

• 提供個人化的營養建議
• 分析你的飲食習慣和趨勢
• 改善應用程式功能和用戶體驗
• 發送通知和提醒（如果你選擇接收）

我們不會將你的個人健康數據出售給第三方。`,
    section3Title: '3. 資料儲存',
    section3Content: `你的數據安全是我們的首要考慮：

• 本地儲存：所有健康數據預設儲存在你的設備上
• 雲端同步：如啟用，數據會加密傳輸和儲存
• 數據刪除：你可以隨時刪除你的帳戶和所有相關數據`,
    section4Title: '4. AI 分析',
    section4Content: `我們使用 AI 技術提供食物辨識和營養分析：

• 食物照片會傳送至安全的 AI 服務進行分析
• 分析完成後，照片不會被保留
• AI 分析結果僅用於提供營養資訊`,
    section5Title: '5. 你的權利',
    section5Content: `你有權：

• 存取你的個人資料
• 更正不準確的資料
• 刪除你的帳戶和所有數據
• 匯出你的數據
• 選擇退出非必要的數據收集`,
    section6Title: '6. 聯繫我們',
    section6Content: `如有任何關於私隱的問題，請聯繫我們：

電郵：privacy@nutritrack.app

我們會在合理時間內回覆你的查詢。`,
  },

  // Exercise Guide (detailed exercises)
  exerciseGuide: {
    categories: {
      stretching: {
        name: '伸展運動',
        description: '放鬆肌肉，增加柔韌性',
      },
      cardio: {
        name: '有氧運動',
        description: '提升心肺功能',
      },
      strength: {
        name: '力量訓練',
        description: '增強肌肉和骨骼',
      },
    },
    exercises: {
      'neck-stretch': {
        name: '頸部伸展',
        duration: '2 分鐘',
        description: '放鬆頸部肌肉，減少緊張感',
        steps: [
          '坐直或站立，放鬆肩膀',
          '慢慢將頭向右傾斜，耳朵靠近肩膀',
          '保持 15-30 秒',
          '回到中間位置，換左邊重複',
          '前後傾斜頭部各 15 秒',
        ],
      },
      'shoulder-roll': {
        name: '肩膀滾動',
        duration: '1 分鐘',
        description: '釋放肩膀壓力',
        steps: [
          '站立或坐直',
          '聳起肩膀至耳朵',
          '向後滾動肩膀',
          '重複 10 次',
          '換方向向前滾動 10 次',
        ],
      },
      'walking': {
        name: '室內步行',
        duration: '10 分鐘',
        description: '不出門也能運動',
        steps: [
          '在室內來回步行',
          '保持中等步速',
          '擺動手臂增加運動量',
          '可以在廣告時間進行',
          '目標每日累計 30 分鐘',
        ],
      },
      'marching': {
        name: '原地踏步',
        duration: '5 分鐘',
        description: '簡單有效的熱身運動',
        steps: [
          '站立，雙腳與肩同寬',
          '交替抬起膝蓋',
          '膝蓋盡量抬至腰部高度',
          '同時擺動手臂',
          '保持穩定呼吸',
        ],
      },
      'wall-pushup': {
        name: '牆壁俯臥撐',
        duration: '3 分鐘',
        description: '適合初學者的上身訓練',
        steps: [
          '面對牆壁站立，距離約一臂長',
          '雙手放在牆上，與肩同寬',
          '彎曲手肘，身體向牆壁靠近',
          '推回起始位置',
          '重複 10-15 次',
        ],
      },
      'chair-squat': {
        name: '椅子深蹲',
        duration: '3 分鐘',
        description: '強化下肢肌肉',
        steps: [
          '站在椅子前面',
          '雙腳與肩同寬',
          '慢慢坐下，臀部輕觸椅子',
          '立即站起來',
          '重複 10-15 次',
        ],
      },
    },
  },
};

export default zhTW;
