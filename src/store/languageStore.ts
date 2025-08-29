import { create } from 'zustand';

type Language = 'zh' | 'en' | 'ja';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'zh',
  setLanguage: (language) => set({ language }),
  toggleLanguage: () => set((state) => ({ 
    language: state.language === 'zh' ? 'en' : state.language === 'en' ? 'ja' : 'zh'
  })),
}));

// 多语言文本配置
export const texts = {
  zh: {
    // 通用
    loading: '加载中...',
    error: '出错了',
    retry: '重试',
    back: '返回',
    submit: '提交',
    cancel: '取消',
    confirm: '确认',
    
    // 诊断页面
    diagnosis: {
      title: 'AI中医智能诊断',
      subtitle: '基于传统中医理论的智能诊断系统',
      placeholder: '请描述您的症状，如：头痛、失眠、食欲不振等...',
      send: '发送',
      tips: '💡 使用提示',
      tip1: '详细描述症状有助于提高诊断准确性',
      tip2: '可以描述症状的时间、程度、伴随症状等',
      tip3: '本系统仅供参考，不能替代专业医生诊断',
      disclaimer: '⚠️ 免责声明：本系统提供的诊断建议仅供参考，不能替代专业医生的诊断和治疗。如有严重症状，请及时就医。',
      initialMessage: '您好！我是AI中医诊断助手。请详细描述您的症状，我将为您提供专业的中医诊断建议。',
      waitingTitle: '正在分析您的症状...',
      waitingDescription: 'AI正在基于中医理论为您生成诊断报告，请稍候',
      symptomDescription: '症状描述',
      chatTitle: 'AI中医诊断助手',
      chatSubtitle: '基于传统中医理论的智能诊断系统',
      analyzing: 'AI正在分析中...',
      uploadDoc: '上传文档',
      uploadImage: '上传图片',
      demoNotSupported: '(演示版本暂不支持)'
    },
    
    // 报告
    report: {
      title: '中医诊断报告',
      pharmacy: '马上配药',
      appointment: '安排就诊',
      download: '下载报告',
      downloadSuccess: '报告下载成功',
      downloadError: '下载失败，请稍后重试'
    },
    
    // 药房页面
    pharmacy: {
      title: '马上配药',
      subtitle: '选择合作药房，便捷配药服务',
      selectPharmacy: '选择药房',
      contactInfo: '联系信息',
      contact: '联系方式',
      name: '姓名',
      phone: '手机号',
      address: '地址',
      submit: '提交',
      submitOrder: '提交配药申请',
      submitSuccess: '配药申请已提交！药房将在30分钟内联系您确认订单。',
      submitError: '提交失败，请稍后重试',
      orderSuccess: '配药申请已提交！药房将在30分钟内联系您确认订单。',
      orderError: '提交失败，请稍后重试',
      namePlaceholder: '请输入您的姓名',
      phonePlaceholder: '请输入手机号',
      addressPlaceholder: '请输入详细地址',
      fillAllFields: '请填写完整信息',
      selectPharmacyFirst: '请先选择药房',
      back: '返回',
      backToDiagnosis: '返回诊断',
      rating: '评分',
      distance: '距离',
      deliveryTime: '配送时间',
      pharmacyName: '药房名称'
    },
    
    // 预约页面
    appointment: {
      title: '安排就诊',
      subtitle: '选择专业中医师，预约面诊时间',
      selectDoctor: '选择医师',
      selectDateTime: '选择时间',
      patientInfo: '患者信息',
      name: '姓名',
      phone: '手机号',
      age: '年龄',
      gender: '性别',
      symptoms: '主要症状',
      male: '男',
      female: '女',
      submit: '提交预约申请',
      back: '返回诊断',
      experience: '从业经验',
      rating: '评分',
      price: '诊费',
      specialty: '专长',
      hospital: '医院',
      date: '日期',
      time: '时间',
      namePlaceholder: '请输入患者姓名',
      phonePlaceholder: '请输入手机号',
      agePlaceholder: '请输入年龄',
      symptomsPlaceholder: '请简要描述主要症状',
      selectDoctorFirst: '请先选择医师',
      selectDateFirst: '请选择就诊日期',
      selectTimeFirst: '请选择就诊时间',
      fillAllFields: '请填写完整信息',
      submitSuccess: '预约申请已提交！医院将在1小时内联系您确认预约。',
      submitError: '提交失败，请稍后重试'
    }
  },
  
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error occurred',
    retry: 'Retry',
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    
    // Diagnosis page
    diagnosis: {
      title: 'AI Traditional Chinese Medicine Diagnosis',
      subtitle: 'Intelligent diagnosis system based on traditional Chinese medicine theory',
      placeholder: 'Please describe your symptoms, such as: headache, insomnia, loss of appetite, etc...',
      send: 'Send',
      tips: '💡 Usage Tips',
      tip1: 'Detailed symptom description helps improve diagnostic accuracy',
      tip2: 'You can describe the time, severity, accompanying symptoms, etc.',
      tip3: 'This system is for reference only and cannot replace professional medical diagnosis',
      disclaimer: '⚠️ Disclaimer: The diagnostic advice provided by this system is for reference only and cannot replace professional medical diagnosis and treatment. If you have serious symptoms, please seek medical attention promptly.',
      initialMessage: 'Hello! I am an AI TCM diagnosis assistant. Please describe your symptoms in detail, and I will provide professional TCM diagnostic advice.',
      waitingTitle: 'Analyzing your symptoms...',
      waitingDescription: 'AI is generating a diagnostic report based on TCM theory, please wait',
      symptomDescription: 'Symptom Description',
      chatTitle: 'AI TCM Diagnosis Assistant',
      chatSubtitle: 'Intelligent diagnosis system based on traditional Chinese medicine theory',
      analyzing: 'AI is analyzing...',
      uploadDoc: 'Upload Document',
      uploadImage: 'Upload Image',
      demoNotSupported: '(Not supported in demo version)'
    },
    
    // Report
    report: {
      title: 'TCM Diagnosis Report',
      pharmacy: 'Get Medicine',
      appointment: 'Book Appointment',
      download: 'Download Report',
      downloadSuccess: 'Report downloaded successfully',
      downloadError: 'Download failed, please try again'
    },
    
    // Pharmacy page
    pharmacy: {
      title: 'Get Medicine',
      subtitle: 'Choose partner pharmacies for convenient medication services',
      selectPharmacy: 'Select Pharmacy',
      contactInfo: 'Contact Information',
      contact: 'Contact Information',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      submit: 'Submit',
      submitOrder: 'Submit Medication Request',
      submitSuccess: 'Medication request submitted! The pharmacy will contact you within 30 minutes to confirm the order.',
      submitError: 'Submission failed, please try again later',
      orderSuccess: 'Medication request submitted! The pharmacy will contact you within 30 minutes to confirm the order.',
      orderError: 'Submission failed, please try again later',
      namePlaceholder: 'Enter your name',
      phonePlaceholder: 'Enter phone number',
      addressPlaceholder: 'Enter detailed address',
      fillAllFields: 'Please fill in all information',
      selectPharmacyFirst: 'Please select a pharmacy first',
      back: 'Back',
      backToDiagnosis: 'Back to Diagnosis',
      rating: 'Rating',
      distance: 'Distance',
      deliveryTime: 'Delivery Time',
      pharmacyName: 'Pharmacy Name'
    },
    
    // Appointment page
    appointment: {
      title: 'Book Appointment',
      subtitle: 'Choose a professional TCM physician and schedule consultation time',
      selectDoctor: 'Select Doctor',
      selectDateTime: 'Select Date & Time',
      patientInfo: 'Patient Information',
      name: 'Name',
      phone: 'Phone',
      age: 'Age',
      gender: 'Gender',
      symptoms: 'Main Symptoms',
      male: 'Male',
      female: 'Female',
      submit: 'Submit Appointment Request',
      back: 'Back to Diagnosis',
      experience: 'Experience',
      rating: 'Rating',
      price: 'Fee',
      specialty: 'Specialty',
      hospital: 'Hospital',
      date: 'Date',
      time: 'Time',
      namePlaceholder: 'Enter patient name',
      phonePlaceholder: 'Enter phone number',
      agePlaceholder: 'Enter age',
      symptomsPlaceholder: 'Briefly describe main symptoms',
      selectDoctorFirst: 'Please select a doctor first',
      selectDateFirst: 'Please select appointment date',
      selectTimeFirst: 'Please select appointment time',
      fillAllFields: 'Please fill in all information',
      submitSuccess: 'Appointment request submitted! The hospital will contact you within 1 hour to confirm the appointment.',
      submitError: 'Submission failed, please try again later'
    }
  },
  
  ja: {
    // 共通
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
    back: '戻る',
    submit: '送信',
    cancel: 'キャンセル',
    confirm: '確認',
    
    // 診断ページ
    diagnosis: {
      title: 'AI中医智能診断',
      subtitle: '伝統中医学理論に基づく知能診断システム',
      placeholder: '症状を詳しく記述してください。例：頭痛、不眠、食欲不振など...',
      send: '送信',
      tips: '💡 使用のヒント',
      tip1: '詳細な症状の記述は診断精度の向上に役立ちます',
      tip2: '症状の時間、程度、随伴症状などを記述できます',
      tip3: 'このシステムは参考のみで、専門医の診断に代わるものではありません',
      disclaimer: '⚠️ 免責事項：このシステムが提供する診断アドバイスは参考のみで、専門医の診断と治療に代わるものではありません。重篤な症状がある場合は、速やかに医療機関を受診してください。',
      initialMessage: 'こんにちは！私はAI中医診断アシスタントです。症状を詳しく記述していただければ、専門的な中医診断アドバイスを提供いたします。',
      waitingTitle: '症状を分析中...',
      waitingDescription: 'AIが中医理論に基づいて診断レポートを生成しています。しばらくお待ちください',
      symptomDescription: '症状の記述',
      chatTitle: 'AI中医診断アシスタント',
      chatSubtitle: '伝統中医学理論に基づく知能診断システム',
      analyzing: 'AIが分析中...',
      uploadDoc: '文書をアップロード',
      uploadImage: '画像をアップロード',
      demoNotSupported: '(デモ版では対応していません)'
    },
    
    // レポート
    report: {
      title: '中医診断レポート',
      pharmacy: '薬を処方',
      appointment: '診察予約',
      download: 'レポートダウンロード',
      downloadSuccess: 'レポートのダウンロードが完了しました',
      downloadError: 'ダウンロードに失敗しました。後でもう一度お試しください'
    },
    
    // 薬局ページ
    pharmacy: {
      title: '薬を処方',
      subtitle: '提携薬局を選択し、便利な調剤サービスをご利用ください',
      selectPharmacy: '薬局を選択',
      contactInfo: '連絡先情報',
      contact: '連絡先',
      name: '氏名',
      phone: '電話番号',
      address: '住所',
      submit: '送信',
      submitOrder: '調剤申請を送信',
      submitSuccess: '調剤申請が送信されました！薬局から30分以内にご連絡し、注文を確認いたします。',
      submitError: '送信に失敗しました。後でもう一度お試しください',
      orderSuccess: '調剤申請が送信されました！薬局から30分以内にご連絡し、注文を確認いたします。',
      orderError: '送信に失敗しました。後でもう一度お試しください',
      namePlaceholder: 'お名前を入力してください',
      phonePlaceholder: '電話番号を入力してください',
      addressPlaceholder: '詳細な住所を入力してください',
      fillAllFields: '全ての情報を入力してください',
      selectPharmacyFirst: 'まず薬局を選択してください',
      back: '戻る',
      backToDiagnosis: '診断に戻る',
      rating: '評価',
      distance: '距離',
      deliveryTime: '配送時間',
      pharmacyName: '薬局名'
    },
    
    // 予約ページ
    appointment: {
      title: '診察予約',
      subtitle: '専門中医師を選択し、診察時間を予約してください',
      selectDoctor: '医師を選択',
      selectDateTime: '日時を選択',
      patientInfo: '患者情報',
      name: '氏名',
      phone: '電話番号',
      age: '年齢',
      gender: '性別',
      symptoms: '主な症状',
      male: '男性',
      female: '女性',
      submit: '予約申請を送信',
      back: '診断に戻る',
      experience: '経験年数',
      rating: '評価',
      price: '診察料',
      specialty: '専門分野',
      hospital: '病院',
      date: '日付',
      time: '時間',
      namePlaceholder: '患者名を入力してください',
      phonePlaceholder: '電話番号を入力してください',
      agePlaceholder: '年齢を入力してください',
      symptomsPlaceholder: '主な症状を簡潔に記述してください',
      selectDoctorFirst: 'まず医師を選択してください',
      selectDateFirst: '診察日を選択してください',
      selectTimeFirst: '診察時間を選択してください',
      fillAllFields: '全ての情報を入力してください',
      submitSuccess: '予約申請が送信されました！病院から1時間以内にご連絡し、予約を確認いたします。',
      submitError: '送信に失敗しました。後でもう一度お試しください'
    }
  }
};

// 获取当前语言的文本
export const useTexts = () => {
  const language = useLanguageStore((state) => state.language);
  return texts[language];
};