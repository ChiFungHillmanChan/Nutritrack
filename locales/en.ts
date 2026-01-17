/**
 * English Translations
 */

const en = {
  // Common
  common: {
    appName: 'Nutritrack',
    tagline: 'Track nutrition, live healthy',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    confirm: 'Confirm',
    close: 'Close',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    retry: 'Retry',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    search: 'Search',
    noData: 'No data',
    today: 'Today',
    yesterday: 'Yesterday',
    items: 'items',
    step: 'Step',
    of: 'of',
    left: 'left',
    version: 'Version',
  },

  // Units
  units: {
    kg: 'kg',
    cm: 'cm',
    ml: 'ml',
    g: 'g',
    kcal: 'kcal',
    hours: 'hours',
    minutes: 'min',
    servings: 'servings',
    glasses: 'glasses',
    years: 'years old',
    l: 'L',
  },

  // Navigation
  nav: {
    home: 'Home',
    camera: 'Camera',
    chat: 'Chat',
    habits: 'Habits',
    profile: 'Profile',
    settings: 'Settings',
  },

  // Tab titles (for header)
  tabs: {
    home: 'Nutritrack',
    record: 'Record Food',
    habits: 'Habits',
    chat: 'AI Nutritionist',
    profile: 'My Profile',
  },

  // Nutrient labels
  nutrients: {
    carbs: 'Carbs',
    protein: 'Protein',
    fiber: 'Fibre',
    fat: 'Fats',
    sugar: 'Sugar',
    fluids: 'Fluids',
  },

  // Profile Edit Screen
  profileEdit: {
    title: 'Edit Profile',
    saving: 'Saving...',
    basicInfo: 'Basic Information',
    name: 'Name',
    namePlaceholder: 'Enter your name',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    gender: 'Gender',
    bodyData: 'Body Data',
    height: 'Height',
    weight: 'Weight',
    healthGoal: 'Health Goal',
    activityLevel: 'Activity Level',
    genders: {
      male: 'Male',
      female: 'Female',
      other: 'Other',
      preferNotToSay: 'Prefer not to say',
    },
    goals: {
      loseWeight: 'Lose Weight',
      maintain: 'Maintain Weight',
      gainWeight: 'Gain Weight',
      buildMuscle: 'Build Muscle',
    },
    activity: {
      sedentary: 'Sedentary',
      sedentaryDesc: 'Little or no exercise',
      light: 'Lightly Active',
      lightDesc: 'Exercise 1-3 days/week',
      moderate: 'Moderately Active',
      moderateDesc: 'Exercise 3-5 days/week',
      active: 'Active',
      activeDesc: 'Exercise 6-7 days/week',
      veryActive: 'Very Active',
      veryActiveDesc: 'Intense exercise daily',
    },
    errors: {
      nameRequired: 'Please enter your name',
      invalidHeight: 'Please enter a valid height (100-250 cm)',
      invalidWeight: 'Please enter a valid weight (30-300 kg)',
      updateFailed: 'Update failed, please try again',
    },
    success: {
      updated: 'Profile updated',
    },
  },

  // Timeline Screen
  timeline: {
    title: 'Timeline',
    calendar: 'Calendar',
    list: 'List',
    noEntries: 'No entries for this day',
    mealTypes: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
    },
  },

  // Calculators
  calculators: {
    insulin: {
      title: 'Insulin Calculator',
      disclaimer: 'Important Notice',
      disclaimerText: 'This calculator is for reference only. Please consult your doctor or diabetes specialist nurse and follow your prescription.',
      carbsInput: 'Carbohydrates (g)',
      bloodSugar: 'Current Blood Sugar (mg/dL)',
      targetBloodSugar: 'Target Blood Sugar (mg/dL)',
      carbRatio: 'Carb Ratio (1 unit per X g)',
      correctionFactor: 'Correction Factor (1 unit drops X mg/dL)',
      calculate: 'Calculate',
      result: 'Calculated Dose',
      units: 'units',
      carbCoverage: 'Carb Coverage',
      correction: 'Correction',
      total: 'Total',
      errors: {
        invalidCarbs: 'Please enter a valid carbohydrate amount',
        invalidRatio: 'Please enter a valid carb ratio',
      },
    },
    creon: {
      title: 'Creon Calculator',
      disclaimer: 'Important Notice',
      disclaimerText: 'This calculator is for reference only. Creon dosage varies by individual. Please follow your doctor or dietitian\'s prescription.',
      info: 'About Creon',
      infoText: 'Creon contains pancreatic enzymes to help digest fats. The typical dosage is 2000-4000 lipase units per gram of fat.',
      fatInput: 'Fat Content (g)',
      lipasePerGram: 'Lipase Units per Gram of Fat',
      capsuleStrength: 'Capsule Strength',
      calculate: 'Calculate',
      result: 'Recommended Dosage',
      capsules: 'capsules',
      totalLipase: 'Total Lipase Units',
      errors: {
        invalidFat: 'Please enter a valid fat amount',
        invalidLipase: 'Please enter a valid lipase dosage',
      },
    },
  },

  // Auth - Login
  auth: {
    login: {
      title: 'Login',
      email: 'Email address',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      loginButton: 'Login',
      orUse: 'or use',
      noAccount: "Don't have an account?",
      registerNow: 'Register now',
      demoMode: 'Demo Mode (No login required)',
      loginFailed: 'Login Failed',
      tryAgain: 'Please try again',
      timeout: 'Login timed out. Please try again.',
      fillEmailPassword: 'Please fill in email and password',
      cancelled: 'Login cancelled',
    },
    register: {
      title: 'Create Account',
      subtitle: 'Start your healthy tracking journey',
      email: 'Email address',
      emailPlaceholder: 'yourname@example.com',
      password: 'Password',
      passwordPlaceholder: 'Create a secure password',
      confirmPassword: 'Confirm password',
      confirmPasswordPlaceholder: 'Enter password again',
      registerButton: 'Create Account',
      haveAccount: 'Already have an account?',
      loginNow: 'Login',
      passwordMismatch: 'Passwords do not match',
      registerFailed: 'Registration Failed',
      registerSuccess: 'Registration Successful',
      checkEmail: 'Please check your email to confirm your account',
      fillAllFields: 'Please fill in all fields',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordNeedsUppercase: 'Password must contain at least one uppercase letter',
      passwordNeedsNumber: 'Password must contain at least one number',
      passwordNotStrong: 'Password is not strong enough',
      terms: 'By creating an account, you agree to our',
      termsOfService: 'Terms of Service',
      and: 'and',
      requirements: {
        minLength: 'At least 8 characters',
        uppercase: 'Contains uppercase letter',
        number: 'Contains a number',
      },
    },
    logout: {
      title: 'Logout',
      confirm: 'Are you sure you want to logout?',
      button: 'Logout',
    },
  },

  // Onboarding
  onboarding: {
    progress: {
      step: 'Step {{current}} / {{total}}',
    },
    basics: {
      title: 'Basic Info',
      description: "Let's get to know you better",
      name: 'Name',
      namePlaceholder: 'Your name',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
    },
    gender: {
      male: 'Male',
      female: 'Female',
      other: 'Other',
      preferNotToSay: 'Prefer not to say',
    },
    metrics: {
      title: 'Body Metrics',
      description: 'Used to calculate your daily nutrition needs',
      height: 'Height',
      weight: 'Weight',
      activityLevel: 'Activity Level',
    },
    activity: {
      sedentary: 'Sedentary',
      sedentaryDesc: 'Little to no exercise, office work',
      light: 'Lightly Active',
      lightDesc: 'Exercise 1-3 times per week',
      moderate: 'Moderately Active',
      moderateDesc: 'Exercise 3-5 times per week',
      active: 'Active',
      activeDesc: 'Exercise 6-7 times per week',
      veryActive: 'Very Active',
      veryActiveDesc: 'Intense exercise daily or physical job',
    },
    goals: {
      title: 'Health Goals',
      description: 'Choose your goals',
      primaryGoal: 'Primary Goal (choose one)',
      additionalGoals: 'Additional Health Goals (optional)',
    },
    primaryGoals: {
      loseWeight: 'Lose Weight',
      loseWeightDesc: 'Reduce body fat, get healthier',
      gainWeight: 'Gain Weight',
      gainWeightDesc: 'Increase weight, get stronger',
      maintain: 'Maintain',
      maintainDesc: 'Keep current weight and condition',
      buildMuscle: 'Build Muscle',
      buildMuscleDesc: 'Increase muscle mass, shape body',
    },
    healthGoals: {
      healthyBalancedEating: 'Balanced Diet',
      weightLoss: 'Weight Loss',
      weightGain: 'Weight Gain',
      healthyBowels: 'Improve Gut Health',
      muscleGain: 'Build Muscle',
      improveHydration: 'Better Hydration',
      bloodSugarControl: 'Blood Sugar Control',
      fixMicros: 'Improve Micronutrients',
      improveSleep: 'Better Sleep',
      improveBreathing: 'Improve Breathing',
      reduceAlcohol: 'Reduce Alcohol',
      reduceSmoking: 'Reduce Smoking',
      achieve10kSteps: '10K Steps Daily',
      improveMentalHealth: 'Mental Wellness',
    },
    conditions: {
      title: 'Health Conditions',
      description: 'If you have any of these conditions, we will adjust nutrition advice',
      none: 'None of the above',
      t1dm: 'Type 1 Diabetes',
      t2dm: 'Type 2 Diabetes',
      hypertension: 'High Blood Pressure',
      coronaryHeartDisease: 'Coronary Heart Disease',
      highCholesterol: 'High Cholesterol',
      kidneyDisease: 'Kidney Disease',
      copd: 'COPD',
      asthma: 'Asthma',
      cancer: 'Cancer',
      celiacDisease: 'Celiac Disease',
      lactoseIntolerance: 'Lactose Intolerance',
      pcos: 'PCOS',
      thyroidDisorders: 'Thyroid Disorders',
      ibs: 'IBS',
      crohnsDisease: "Crohn's Disease",
      ulcerativeColitis: 'Ulcerative Colitis',
    },
    medications: {
      title: 'Medications & Supplements',
      description: 'Record medications you are taking (optional)',
      currentMeds: 'Current Medications',
      medNamePlaceholder: 'Medication name',
      supplements: 'Supplements / ONS',
      suppNamePlaceholder: 'Supplement name',
    },
    dietary: {
      title: 'Dietary Preferences',
      description: 'Help us provide suitable food suggestions',
      dietaryWays: 'Dietary Styles',
      allergies: 'Food Allergies',
      allergyPlaceholder: 'Enter allergenic food',
    },
    dietaryPrefs: {
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      pescatarian: 'Pescatarian',
      halal: 'Halal',
      kosher: 'Kosher',
      glutenFree: 'Gluten-free',
      dairyFree: 'Dairy-free',
      nutFree: 'Nut-free',
      lowSodium: 'Low Sodium',
      lowCarb: 'Low Carb',
      keto: 'Keto',
    },
    summary: {
      title: 'Ready to Go!',
      description: 'Here are your personalized settings',
      dailyTargets: 'Daily Nutrition Targets',
      healthGoalsTitle: 'Health Goals',
      conditionsTitle: 'Health Conditions',
      medicationsTitle: 'Medications',
      supplementsTitle: 'Supplements',
      dietaryPrefsTitle: 'Dietary Preferences',
      allergiesTitle: 'Allergies',
      startUsing: 'Start Using',
    },
    nutrients: {
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbohydrates',
      fat: 'Fat',
      fiber: 'Fiber',
      water: 'Water',
    },
    validation: {
      enterName: 'Please enter your name',
      enterHeightWeight: 'Please fill in height and weight',
      selectGoal: 'Please select your primary goal',
      selectConditions: 'Please select your health conditions',
      saveFailed: 'Failed to save data, please try again',
    },
  },

  // Home Screen
  home: {
    greeting: 'Hi, {{name}}',
    userDefault: 'User',
    todayIntake: "Today's intake",
    recordIntake: 'Record Intake',
    todayRecord: "Today's Records",
    askAI: 'Ask AI',
    nutritionAdvice: 'Nutrition Advice',
    habits: 'Habits',
    trackRecord: 'Track Record',
    meditation: 'Meditation',
    relaxMind: 'Relax Mind',
    day: 'Day',
  },

  // Chat Screen
  chat: {
    title: 'AI Nutritionist',
    tryAsking: 'Try asking:',
    suggestions: {
      whatToEat: 'What should I eat today?',
      healthyWeightLoss: 'How to lose weight healthily?',
      highProtein: 'Which foods are high in protein?',
    },
    inputPlaceholder: 'Enter your question...',
    errorMessage: 'Sorry, something went wrong. Please try again.',
    welcomeMessage: "Hello! I'm your AI Nutritionist 🥗\n\nYou can ask me any questions about nutrition, diet, and health. I'll give you personalized advice based on your daily intake!",
    demoResponses: {
      default: "Thanks for your question! I'm your AI nutritionist, here to help you with questions about nutrition, diet, and health.\n\nYou can ask me:\n• What should I eat today?\n• How to lose weight healthily?\n• Which foods are high in protein?\n• How can I improve my diet?",
      food: "Based on your intake today, I suggest considering these options:\n\n1. Chicken breast salad - High protein, low fat\n2. Salmon with brown rice - Quality protein and complex carbs\n3. Greek yogurt with fruit - Protein and fiber boost\n\nYour protein intake today is a bit low, I recommend choosing high-protein foods!",
      weight: "The key to weight loss is maintaining a moderate calorie deficit while ensuring balanced nutrition. Here are some suggestions:\n\n1. Include protein in every meal to help maintain satiety\n2. Eat more vegetables to increase fiber intake\n3. Reduce processed foods and sugar\n4. Stay well hydrated\n\nRemember, sustainable habit changes are more effective than short-term dieting!",
      protein: "Protein is very important for your body! Here are some quality protein sources:\n\nAnimal-based: Chicken breast, fish, eggs, lean beef, dairy\nPlant-based: Tofu, legumes, quinoa, nuts\n\nGenerally recommended to consume 1.6-2.2g protein per kg body weight. If you exercise regularly, you can consume more.",
    },
  },

  // Habits Screen
  habits: {
    title: 'Habit Tracking',
    subtitle: 'Build healthy habits, persist daily',
    todayRecord: "Today's Records",
    noRecords: 'No records today',
    tapToStart: 'Tap cards above to start tracking',
    record: 'Record',
    types: {
      hydration: 'Water',
      sleep: 'Sleep',
      mood: 'Mood',
      fiveADay: 'Fruits & Veg',
      weight: 'Weight',
      bowels: 'Bowel',
      periodCycle: 'Period Cycle',
    },
    habitRecord: 'Habit Record',
    mood: {
      veryBad: 'Very Bad',
      bad: 'Bad',
      okay: 'Okay',
      good: 'Good',
      veryGood: 'Very Good',
    },
    bristol: {
      type1: 'Type 1',
      type1Desc: 'Hard lumps',
      type2: 'Type 2',
      type2Desc: 'Sausage-shaped, lumpy',
      type3: 'Type 3',
      type3Desc: 'Sausage with cracks',
      type4: 'Type 4',
      type4Desc: 'Smooth sausage',
      type5: 'Type 5',
      type5Desc: 'Soft blobs',
      type6: 'Type 6',
      type6Desc: 'Mushy',
      type7: 'Type 7',
      type7Desc: 'Watery',
    },
    inputPlaceholder: 'Enter {{habit}} value',
    invalidNumber: 'Please enter a valid number',
    notSupported: 'This habit type is not yet supported',
  },

  // Settings/Profile Screen
  settings: {
    lastSync: 'Last sync time',
    myGoals: 'My Goals',
    timeline: {
      title: 'Timeline of all entries',
      subtitle: 'All previous entries can be found here',
      totalRecords: '{{count}} records total',
    },
    supportInfo: 'Support & Info',
    privacyPolicy: 'Privacy Policy',
    about: 'About Nutritrack',
    faq: 'FAQ',
    faqComingSoon: 'This feature is coming soon',
    dataManagement: 'Data Management',
    foodLogs: 'Food Logs',
    chatLogs: 'Chat Logs',
    habitLogs: 'Habit Logs',
    clearAllData: 'Clear All Data',
    clearConfirm: {
      title: 'Clear All Data',
      message: 'This will delete all your records. This action cannot be undone.',
      clear: 'Clear',
    },
    cleared: 'Done',
    clearedMessage: 'All data has been cleared',
    language: 'Language',
    languageSettings: 'Language Settings',
    // Quick Actions
    quickActions: {
      setting: 'Setting',
      notifications: 'Notifications',
      feedback: 'Feedback',
      theme: 'Theme',
      export: 'Export',
      notificationsAlert: 'Notification settings coming soon',
      feedbackAlert: 'Thank you for your feedback! This feature is coming soon',
      themeAlert: 'Dark mode coming soon',
      exportAlert: 'Export report coming soon',
    },
    // Goals
    goals: {
      title: 'MY GOALS',
      editTitle: 'Edit Goals',
      editComingSoon: 'This feature is coming soon',
      noGoals: 'No goals set',
      addGoal: 'Add Goal',
      viewAll: 'View all {{count}} goals',
    },
  },

  // Camera Screen
  camera: {
    title: 'Food Camera',
    takePhoto: 'Take Photo',
    choosePhoto: 'Gallery',
    analyzing: 'AI analyzing...',
    analyzeButton: 'AI Analyze Nutrition',
    retry: 'Try Again',
    save: 'Save',
    nutritionInfo: 'Nutrition Information',
    confirmSave: 'Save this meal?',
    mealType: 'Select Meal Type',
    permissionRequired: 'Permission Required',
    cameraPermission: 'Please allow Nutritrack to use the camera',
    galleryPermission: 'Please allow Nutritrack to access photos',
    analysisFailed: 'Analysis Failed',
    tryAgain: 'Please try again',
    placeholderTitle: 'Take a food photo',
    placeholderSubtitle: 'AI will automatically analyze nutrition',
    accuracy: 'accurate',
    estimatedPortion: 'Estimated portion',
    totalCalories: 'Total Calories',
    recordMeal: 'Record This Meal',
    recorded: 'Recorded',
    recordedMessage: '{{food}} has been added to today\'s record',
    saveFailed: 'Save Failed',
  },

  // Meal Types
  mealTypes: {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  },

  // About Screen
  about: {
    title: 'About Nutritrack',
    version: 'Version',
    description: 'Your personal nutrition tracking companion. Track your meals, monitor your nutrition intake, and achieve your health goals.',
    features: 'Features',
    feature1: 'AI-powered food recognition',
    feature2: 'Personalized nutrition targets',
    feature3: 'Habit tracking',
    feature4: 'AI nutritionist chat',
    credits: 'Credits',
    creditsText: 'Built with Expo and React Native',
  },

  // Privacy Policy
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated',
    intro: 'Your privacy is important to us. This policy describes how we collect, use, and protect your information.',
  },

  // Menu / Extended Functions
  menu: {
    title: 'Extended Functions',
    aboutUs: 'About us',
    carbCounting: 'Carb-counting',
    myMedications: 'My medications',
    portionGuide: 'Portion guide',
    lifestyleTips: 'Lifestyle tips',
    nutritionFacts: 'Nutrition facts',
    exerciseGuide: 'Exercise guide',
    meditation: 'Meditation',
    affirmation: 'Affirmation',
    miniGames: 'Mini games',
    otherServices: 'Other services',
    bookConsultation: 'Book a consultation',
    contactUs: 'Contact us',
  },

  // Goals Labels
  goalLabels: {
    healthy_balanced_eating: 'Balanced Diet',
    weight_loss: 'Weight Loss',
    weight_gain: 'Weight Gain',
    healthy_bowels: 'Gut Health',
    muscle_gain: 'Build Muscle',
    improve_hydration: 'Improve Hydration',
    blood_sugar_control: 'Blood Sugar Control',
    fix_micros: 'Improve Micronutrients',
    improve_sleep: 'Improve Sleep',
    improve_breathing: 'Improve Breathing',
    reduce_alcohol: 'Reduce Alcohol',
    reduce_smoking: 'Reduce Smoking',
    achieve_10k_steps: '10K Steps Daily',
    improve_mental_health: 'Mental Wellness',
  },

  // Tools
  tools: {
    carbCounting: {
      title: 'Carb Counting',
      headerTitle: 'Carbohydrate Calculator',
      subtitle: 'Select food and enter portion to calculate carbohydrate content',
      commonFoods: 'Common Foods',
      portionGrams: 'Portion (grams)',
      enterGrams: 'Enter grams',
      commonPortion: 'Common portion',
      carbContent: 'Carbohydrate Content',
      resultNote: '{{food}} ({{portion}}g) contains about {{carbs}}g carbohydrates',
      tips: 'Carb Counting Tips',
      tip1: 'Diabetics should monitor carb intake each meal',
      tip2: 'Recommended carb intake per meal is about 45-60g',
      tip3: 'Choose low glycemic index carb sources',
      tip4: 'Eat with protein and fiber',
      foods: {
        rice: 'White Rice',
        noodles: 'Noodles',
        bread: 'Bread',
        apple: 'Apple',
        banana: 'Banana',
        potato: 'Potato',
        corn: 'Corn',
        milk: 'Milk',
      },
    },
    exerciseGuide: {
      title: 'Exercise Guide',
      headerTitle: 'Exercise Guide',
      subtitle: 'Simple exercises you can do at home',
      steps: 'Steps',
      safetyTitle: 'Safety Tips',
      safety1: 'Warm up before exercise',
      safety2: 'Stop immediately if you feel unwell',
      safety3: 'Keep breathing, don\'t hold your breath',
      safety4: 'Consult a doctor if you have health issues',
      difficulty: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
      },
      categories: {
        stretching: {
          name: 'Stretching',
          description: 'Relax muscles, improve flexibility',
        },
        cardio: {
          name: 'Cardio',
          description: 'Improve cardiovascular health',
        },
        strength: {
          name: 'Strength Training',
          description: 'Build muscle strength',
        },
      },
    },
    lifestyleTips: {
      title: 'Lifestyle Tips',
      headerTitle: 'Lifestyle Tips',
      subtitle: 'Simple habit changes for a healthier life',
      categories: {
        eating: {
          title: 'Healthy Eating',
          tips: [
            'Each meal should include protein, carbs, and vegetables',
            'Chew slowly and enjoy the taste of food',
            'Avoid using electronic devices while eating',
            'Eat at least 5 servings of fruits and vegetables daily',
            'Choose whole grains over refined grains',
          ],
        },
        hydration: {
          title: 'Hydration',
          tips: [
            'Drink 8 glasses of water daily (about 2 liters)',
            'Drink a glass of water after waking up',
            'Hydrate before and after exercise',
            'Can substitute with unsweetened tea or fruit water',
            'Light yellow urine indicates adequate hydration',
          ],
        },
        sleep: {
          title: 'Quality Sleep',
          tips: [
            'Maintain a regular sleep schedule',
            'Avoid electronic devices 1 hour before bed',
            'Keep bedroom cool and dark',
            'Avoid caffeine and alcohol before bed',
            'Adults need 7-9 hours of sleep per night',
          ],
        },
        activity: {
          title: 'Stay Active',
          tips: [
            'Do at least 150 minutes of moderate exercise per week',
            'Get up and move for 5 minutes every hour',
            'Use stairs instead of elevator',
            'Walking after meals aids digestion',
            'Find an exercise you enjoy and stick with it',
          ],
        },
        mental: {
          title: 'Mental Health',
          tips: [
            'Spend 10 minutes daily meditating or deep breathing',
            'Maintain social connections',
            'Learn to say no, don\'t overcommit',
            'Keep a grateful attitude',
            'Seek professional help when needed',
          ],
        },
      },
    },
    medications: {
      title: 'My Medications',
      headerTitle: 'My Medications',
      subtitle: 'Manage your medications and supplements',
      prescriptionMeds: 'Prescription Medications',
      supplements: 'Supplements',
      add: 'Add',
      noMedications: 'No medications recorded',
      noSupplements: 'No supplements recorded',
      importantTips: 'Important Tips',
      tip1: 'Take medications on time, do not stop without consulting your doctor',
      tip2: 'Consult your doctor if you feel unwell',
      tip3: 'This app cannot replace professional medical advice',
      tip4: 'Keep medications in a safe place',
      addMedication: 'Add Medication',
      addSupplement: 'Add Supplement',
      editMedication: 'Edit Medication',
      comingSoon: 'This feature is coming soon',
    },
    portionGuide: {
      title: 'Portion Guide',
      headerTitle: 'Portion Guide',
      subtitle: 'Simple ways to estimate food portions',
      useYourHand: 'Use Your Hand as Reference',
      handExplanation: 'Your hand is a convenient reference tool because its size is proportional to your body.',
      practicalTips: 'Practical Tips',
      tip1: 'Using smaller plates can help control portions',
      tip2: 'Eat slowly to give your brain time to feel full',
      tip3: 'Vegetables should fill half your plate',
      tip4: 'Protein should fill a quarter of your plate',
      tip5: 'Carbohydrates should fill a quarter of your plate',
      portions: {
        protein: {
          food: 'Protein (Meat, Fish, Chicken)',
          portion: 'About 100g',
          visual: 'Size of a deck of cards',
        },
        carbs: {
          food: 'Carbohydrates (Rice, Noodles)',
          portion: 'About 150g (cooked)',
          visual: 'Size of your fist',
        },
        vegetables: {
          food: 'Vegetables',
          portion: 'About 80g',
          visual: 'Size of two palms',
        },
        fruit: {
          food: 'Fruit',
          portion: 'About 80g',
          visual: 'Size of a tennis ball',
        },
        cheese: {
          food: 'Cheese',
          portion: 'About 30g',
          visual: 'Size of two thumbs',
        },
        nuts: {
          food: 'Nuts',
          portion: 'About 30g',
          visual: 'A small handful',
        },
        oil: {
          food: 'Oil/Fat',
          portion: 'About 5g',
          visual: 'One teaspoon',
        },
        sauce: {
          food: 'Sauce',
          portion: 'About 15g',
          visual: 'One tablespoon',
        },
      },
    },
    nutritionFacts: {
      title: 'Nutrition Facts',
      headerTitle: 'Nutrition Facts',
      subtitle: 'Learn about nutrients and their benefits',
      benefits: 'Benefits',
      sources: 'Food Sources',
      nutrients: {
        protein: {
          name: 'Protein',
          description: 'Protein is the building block of the body, used to build and repair muscles, organs, and tissues.',
          benefits: ['Build muscle', 'Repair tissue', 'Boost immunity', 'Produce enzymes and hormones'],
          sources: ['Meat', 'Fish', 'Eggs', 'Tofu', 'Milk', 'Nuts'],
        },
        carbs: {
          name: 'Carbohydrates',
          description: 'Carbohydrates are the main source of energy for the body, especially the brain and muscles.',
          benefits: ['Provide energy', 'Support brain function', 'Aid digestion', 'Regulate blood sugar'],
          sources: ['Rice', 'Bread', 'Potatoes', 'Fruits', 'Vegetables', 'Whole grains'],
        },
        fat: {
          name: 'Fat',
          description: 'Fat is an essential nutrient that helps absorb vitamins and protect organs.',
          benefits: ['Absorb fat-soluble vitamins', 'Protect organs', 'Provide sustained energy', 'Maintain cell health'],
          sources: ['Olive oil', 'Avocado', 'Nuts', 'Salmon', 'Cheese'],
        },
        fiber: {
          name: 'Fiber',
          description: 'Fiber helps maintain digestive health and regular bowel movements.',
          benefits: ['Aid digestion', 'Maintain gut health', 'Control blood sugar', 'Lower cholesterol'],
          sources: ['Vegetables', 'Fruits', 'Whole grains', 'Legumes', 'Nuts'],
        },
        vitamins: {
          name: 'Vitamins',
          description: 'Vitamins are micronutrients essential for various body functions.',
          benefits: ['Boost immunity', 'Support metabolism', 'Maintain vision', 'Support bone health'],
          sources: ['Fruits', 'Vegetables', 'Meat', 'Dairy', 'Sunlight (Vitamin D)'],
        },
        minerals: {
          name: 'Minerals',
          description: 'Minerals are involved in many important body functions, including bone formation and nerve conduction.',
          benefits: ['Strengthen bones', 'Regulate fluid balance', 'Support nerve function', 'Carry oxygen'],
          sources: ['Dairy', 'Leafy greens', 'Meat', 'Seafood', 'Nuts'],
        },
      },
    },
    insulinCalculator: 'Insulin Calculator',
    creonCalculator: 'Creon Calculator',
  },

  // About Screen
  aboutScreen: {
    title: 'About Nutritrack',
    tagline: 'Smart Nutrition Tracking Assistant',
    version: 'Version {{version}} ({{build}})',
    features: 'Features',
    aiRecognition: 'AI Food Recognition',
    aiRecognitionDesc: 'Take a photo to automatically identify food and calculate nutrition',
    nutritionConsult: 'Nutrition Consultation',
    nutritionConsultDesc: 'AI nutritionist available anytime to answer your diet questions',
    habitTracking: 'Habit Tracking',
    habitTrackingDesc: 'Record water intake, sleep, exercise, and other lifestyle habits',
    dataAnalysis: 'Data Analysis',
    dataAnalysisDesc: 'Visualize your nutrition intake trends',
    dataPrivacy: 'Data & Privacy',
    dataPrivacyText: 'Your health data is securely stored on your device. We value your privacy and will never share your personal information without your consent.',
    credits: 'Credits',
    creditsText: 'Nutritrack uses advanced AI technology to provide accurate nutrition analysis. Thank you to all contributors and users for your support.',
    copyright: '© 2024 Nutritrack. All rights reserved.',
    madeWith: 'Made for healthy living',
  },

  // Consultation Screen
  consultation: {
    title: 'Book Consultation',
    headerTitle: 'Book a Nutritionist Consultation',
    subtitle: 'One-on-one consultation with a professional registered dietitian for personalized advice',
    selectType: 'Select Consultation Type',
    bookButton: 'Book Consultation',
    aboutDietitians: 'About Our Dietitians',
    registeredDietitian: 'Registered Dietitian',
    yearsExperience: 'Over 10 years clinical experience',
    languages: 'Cantonese, Mandarin, English',
    consultMode: 'In-person or video consultation',
    pleaseSelect: 'Please Select',
    selectTypeFirst: 'Please select a consultation type first',
    bookingTitle: 'Book Consultation',
    bookingMessage: 'We will contact you via email to confirm booking details.\n\nYou can also call to book directly.',
    cancel: 'Cancel',
    callToBook: 'Call to Book',
    sendEmail: 'Send Email',
    types: {
      initial: {
        name: 'Initial Consultation',
        description: 'Comprehensive nutrition assessment and personalized diet plan',
        duration: '60 minutes',
        price: 'HK$800',
      },
      followup: {
        name: 'Follow-up Consultation',
        description: 'Review progress and adjust diet plan',
        duration: '30 minutes',
        price: 'HK$500',
      },
      diabetes: {
        name: 'Diabetes Nutrition Consultation',
        description: 'Diet management designed specifically for diabetics',
        duration: '45 minutes',
        price: 'HK$700',
      },
      sports: {
        name: 'Sports Nutrition Consultation',
        description: 'Optimize nutrition intake for sports enthusiasts',
        duration: '45 minutes',
        price: 'HK$650',
      },
    },
  },

  // Contact Screen
  contact: {
    title: 'Contact Us',
    headerTitle: 'Contact Us',
    subtitle: 'Have questions or suggestions? We would love to hear from you',
    contactMethods: 'Contact Methods',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    sendMessage: 'Send Message',
    name: 'Name',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'your@email.com',
    message: 'Message',
    messagePlaceholder: 'What would you like to tell us?',
    sendButton: 'Send Message',
    sending: 'Sending...',
    officeHours: 'Office Hours',
    mondayFriday: 'Monday - Friday',
    saturday: 'Saturday',
    sundayHolidays: 'Sunday & Public Holidays',
    closed: 'Closed',
    fillAllFields: 'Please fill in all fields',
    fillAllFieldsMessage: 'Name, email, and message are required',
    sent: 'Sent',
    sentMessage: 'We have received your message and will reply soon.',
  },

  // Errors
  errors: {
    generic: 'Something went wrong',
    network: 'Network error. Please check your connection.',
    unauthorized: 'Please login to continue',
    notFound: 'Not found',
    serverError: 'Server error. Please try again later.',
  },

  // Privacy Policy
  privacyPolicy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: January 2024',
    intro: 'Nutritrack ("we") is committed to protecting your privacy. This privacy policy explains how we collect, use, and protect your personal data.',
    section1Title: '1. Data Collection',
    section1Content: `We collect the following types of data:

• Account data: Email address, name, password
• Health data: Height, weight, age, gender
• Diet records: Food photos, nutrition intake records
• Habit data: Water intake, sleep, exercise records
• Device data: Device type, operating system version

All health data is stored locally on your device unless you choose to enable cloud sync.`,
    section2Title: '2. Data Usage',
    section2Content: `We use collected data to:

• Provide personalized nutrition advice
• Analyze your eating habits and trends
• Improve app features and user experience
• Send notifications and reminders (if you choose to receive them)

We do not sell your personal health data to third parties.`,
    section3Title: '3. Data Storage',
    section3Content: `Your data security is our top priority:

• Local storage: All health data is stored on your device by default
• Cloud sync: If enabled, data is encrypted during transmission and storage
• Data deletion: You can delete your account and all related data at any time`,
    section4Title: '4. AI Analysis',
    section4Content: `We use AI technology to provide food recognition and nutrition analysis:

• Food photos are sent to secure AI services for analysis
• Photos are not retained after analysis is complete
• AI analysis results are only used to provide nutrition information`,
    section5Title: '5. Your Rights',
    section5Content: `You have the right to:

• Access your personal data
• Correct inaccurate data
• Delete your account and all data
• Export your data
• Opt out of non-essential data collection`,
    section6Title: '6. Contact Us',
    section6Content: `If you have any privacy-related questions, please contact us:

Email: privacy@nutritrack.app

We will respond to your inquiry within a reasonable time.`,
  },

  // Exercise Guide (detailed exercises)
  exerciseGuide: {
    categories: {
      stretching: {
        name: 'Stretching',
        description: 'Relax muscles and improve flexibility',
      },
      cardio: {
        name: 'Cardio',
        description: 'Improve heart health',
      },
      strength: {
        name: 'Strength',
        description: 'Build muscle and bone strength',
      },
    },
    exercises: {
      'neck-stretch': {
        name: 'Neck Stretch',
        duration: '2 minutes',
        description: 'Relax neck muscles and reduce tension',
        steps: [
          'Sit or stand straight, relax shoulders',
          'Slowly tilt head to the right, ear toward shoulder',
          'Hold for 15-30 seconds',
          'Return to center, repeat on left side',
          'Tilt head forward and back for 15 seconds each',
        ],
      },
      'shoulder-roll': {
        name: 'Shoulder Roll',
        duration: '1 minute',
        description: 'Release shoulder tension',
        steps: [
          'Stand or sit straight',
          'Shrug shoulders up to ears',
          'Roll shoulders backward',
          'Repeat 10 times',
          'Change direction and roll forward 10 times',
        ],
      },
      'walking': {
        name: 'Indoor Walking',
        duration: '10 minutes',
        description: 'Exercise without leaving home',
        steps: [
          'Walk back and forth indoors',
          'Maintain a moderate pace',
          'Swing arms to increase exercise',
          'Can be done during TV commercials',
          'Aim for 30 minutes total daily',
        ],
      },
      'marching': {
        name: 'Marching in Place',
        duration: '5 minutes',
        description: 'Simple and effective warm-up exercise',
        steps: [
          'Stand with feet shoulder-width apart',
          'Alternate lifting knees',
          'Lift knees as high as waist level',
          'Swing arms simultaneously',
          'Maintain steady breathing',
        ],
      },
      'wall-pushup': {
        name: 'Wall Push-up',
        duration: '3 minutes',
        description: 'Upper body training for beginners',
        steps: [
          'Stand facing wall, about arm\'s length away',
          'Place hands on wall, shoulder-width apart',
          'Bend elbows, lean body toward wall',
          'Push back to starting position',
          'Repeat 10-15 times',
        ],
      },
      'chair-squat': {
        name: 'Chair Squat',
        duration: '3 minutes',
        description: 'Strengthen lower body muscles',
        steps: [
          'Stand in front of a chair',
          'Feet shoulder-width apart',
          'Slowly sit down, lightly touch chair',
          'Stand up immediately',
          'Repeat 10-15 times',
        ],
      },
    },
  },
};

export default en;
