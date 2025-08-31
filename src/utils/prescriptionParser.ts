import { HerbItem, PrescriptionData, mockHerbs } from '../stores/pharmacyStore';

/**
 * 解析AI诊断报告中的药方文本，提取药材信息
 * @param prescriptionText 药方文本
 * @param patientInfo 患者信息
 * @returns 解析后的药方数据
 */
export function parsePrescriptionFromText(
  prescriptionText: string,
  patientInfo?: {
    name?: string;
    symptoms?: string;
    diagnosis?: string;
  }
): PrescriptionData {
  // 常见中药材名称映射
  const herbNameMap: { [key: string]: string } = {
    '人参': '人参',
    '当归': '当归',
    '黄芪': '黄芪',
    '白术': '白术',
    '茯苓': '茯苓',
    '甘草': '甘草',
    '川芎': '川芎',
    '白芍': '白芍',
    '熟地黄': '熟地黄',
    '生地黄': '生地黄',
    '党参': '党参',
    '山药': '山药',
    '枸杞子': '枸杞子',
    '大枣': '大枣',
    '陈皮': '陈皮',
    '半夏': '半夏',
    '桂枝': '桂枝',
    '附子': '附子',
    '干姜': '干姜',
    '细辛': '细辛',
    '柴胡': '柴胡',
    '黄芩': '黄芩',
    '连翘': '连翘',
    '金银花': '金银花',
    '板蓝根': '板蓝根',
    '薄荷': '薄荷',
    '桔梗': '桔梗',
    '杏仁': '杏仁',
    '麻黄': '麻黄',
    '石膏': '石膏',
    '知母': '知母',
    '栀子': '栀子',
    '龙胆草': '龙胆草',
    '木通': '木通',
    '车前子': '车前子',
    '泽泻': '泽泻',
    '猪苓': '猪苓',
    '五味子': '五味子',
    '麦冬': '麦冬',
    '玄参': '玄参',
    '丹参': '丹参',
    '红花': '红花',
    '桃仁': '桃仁',
    '牛膝': '牛膝',
    '地龙': '地龙',
    '全蝎': '全蝎',
    '蜈蚣': '蜈蚣',
    '僵蚕': '僵蚕',
    '天麻': '天麻',
    '钩藤': '钩藤',
    '石决明': '石决明',
    '珍珠母': '珍珠母',
    '龙骨': '龙骨',
    '牡蛎': '牡蛎',
    '酸枣仁': '酸枣仁',
    '远志': '远志',
    '菖蒲': '菖蒲',
    '郁金': '郁金',
    '香附': '香附',
    '青皮': '青皮',
    '枳壳': '枳壳',
    '厚朴': '厚朴',
    '苍术': '苍术',
    '藿香': '藿香',
    '佩兰': '佩兰',
    '砂仁': '砂仁',
    '白豆蔻': '白豆蔻',
    '草豆蔻': '草豆蔻',
    '肉桂': '肉桂',
    '吴茱萸': '吴茱萸',
    '小茴香': '小茴香',
    '大茴香': '大茴香',
    '丁香': '丁香',
    '花椒': '花椒'
  };

  // 用量单位映射
  const dosagePattern = /(\d+(?:\.\d+)?)\s*([克g钱])/g;
  
  const herbs: HerbItem[] = [];
  const foundHerbs = new Set<string>();

  // 遍历药方文本，查找匹配的药材
  Object.keys(herbNameMap).forEach(herbName => {
    if (prescriptionText.includes(herbName) && !foundHerbs.has(herbName)) {
      foundHerbs.add(herbName);
      
      // 查找对应的模拟数据
      const mockHerb = mockHerbs.find(herb => herb.name === herbName);
      
      if (mockHerb) {
        // 尝试提取用量信息
        const herbContext = extractHerbContext(prescriptionText, herbName);
        const dosage = extractDosage(herbContext) || mockHerb.dosage;
        const quantity = calculateQuantity(dosage);
        
        herbs.push({
          ...mockHerb,
          dosage,
          quantity
        });
      } else {
        // 如果没有找到模拟数据，创建一个基本的药材项
        herbs.push({
          id: `herb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: herbName,
          description: `${herbName}，具有传统中医药效`,
          price: 20, // 默认价格
          unit: '克',
          dosage: '6-12g',
          quantity: 1,
          category: '中药材',
          effects: ['传统中医药效']
        });
      }
    }
  });

  // 如果没有找到任何药材，添加一些常用的基础药材
  if (herbs.length === 0) {
    const defaultHerbs = ['人参', '当归', '黄芪', '白术', '茯苓'];
    defaultHerbs.forEach(herbName => {
      const mockHerb = mockHerbs.find(herb => herb.name === herbName);
      if (mockHerb) {
        herbs.push({
          ...mockHerb,
          quantity: 1
        });
      }
    });
  }

  return {
    patientName: patientInfo?.name,
    symptoms: patientInfo?.symptoms,
    diagnosis: patientInfo?.diagnosis,
    herbs,
    instructions: extractInstructions(prescriptionText),
    duration: extractDuration(prescriptionText)
  };
}

/**
 * 提取药材在文本中的上下文
 * @param text 完整文本
 * @param herbName 药材名称
 * @returns 药材相关的上下文文本
 */
function extractHerbContext(text: string, herbName: string): string {
  const index = text.indexOf(herbName);
  if (index === -1) return '';
  
  // 提取药材前后各30个字符作为上下文
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + herbName.length + 30);
  
  return text.substring(start, end);
}

/**
 * 从文本中提取用量信息
 * @param text 包含用量信息的文本
 * @returns 用量字符串
 */
function extractDosage(text: string): string | null {
  // 匹配常见的用量格式：数字+单位
  const dosagePatterns = [
    /(\d+(?:\.\d+)?)\s*[克g]/,
    /(\d+(?:\.\d+)?)\s*钱/,
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*[克g]/,
    /(\d+(?:\.\d+)?)\s*～\s*(\d+(?:\.\d+)?)\s*[克g]/
  ];
  
  for (const pattern of dosagePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // 范围用量
        return `${match[1]}-${match[2]}g`;
      } else {
        // 单一用量
        const amount = parseFloat(match[1]);
        return `${amount}g`;
      }
    }
  }
  
  return null;
}

/**
 * 根据用量计算购买数量
 * @param dosage 用量字符串
 * @returns 购买数量
 */
function calculateQuantity(dosage: string): number {
  // 提取数字部分
  const numbers = dosage.match(/\d+(?:\.\d+)?/g);
  if (!numbers) return 1;
  
  // 如果是范围，取平均值
  if (numbers.length > 1) {
    const avg = (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2;
    return Math.ceil(avg / 10); // 假设按10g为一个购买单位
  } else {
    const amount = parseFloat(numbers[0]);
    return Math.max(1, Math.ceil(amount / 10));
  }
}

/**
 * 从药方文本中提取服用说明
 * @param text 药方文本
 * @returns 服用说明
 */
function extractInstructions(text: string): string {
  const instructionKeywords = [
    '服法', '用法', '煎服', '水煎服', '温服', '分服', '饭前', '饭后', '空腹',
    '每日', '一日', '早晚', '睡前', '餐前', '餐后'
  ];
  
  // 查找包含服用说明的句子
  const sentences = text.split(/[。！？；]/)
    .filter(sentence => 
      instructionKeywords.some(keyword => sentence.includes(keyword))
    );
  
  if (sentences.length > 0) {
    return sentences[0].trim();
  }
  
  return '水煎服，每日1剂，分2次温服，饭后30分钟服用';
}

/**
 * 从药方文本中提取疗程信息
 * @param text 药方文本
 * @returns 疗程信息
 */
function extractDuration(text: string): string {
  const durationPatterns = [
    /(\d+)\s*天/,
    /(\d+)\s*日/,
    /(\d+)\s*周/,
    /(\d+)\s*个?月/,
    /连服\s*(\d+)\s*剂/,
    /服用\s*(\d+)\s*剂/
  ];
  
  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      const number = match[1];
      if (text.includes('天') || text.includes('日')) {
        return `${number}天`;
      } else if (text.includes('周')) {
        return `${number}周`;
      } else if (text.includes('月')) {
        return `${number}个月`;
      } else if (text.includes('剂')) {
        return `${number}剂`;
      }
    }
  }
  
  return '7天';
}

/**
 * 解析URL参数中的药方信息
 * @param searchParams URLSearchParams对象
 * @returns 解析后的药方数据
 */
export function parsePrescriptionFromURL(searchParams: URLSearchParams): PrescriptionData | null {
  const prescriptionParam = searchParams.get('prescription');
  const symptomsParam = searchParams.get('symptoms');
  const diagnosisParam = searchParams.get('diagnosis');
  const patientParam = searchParams.get('patient');
  
  if (!prescriptionParam) {
    return null;
  }
  
  try {
    // 解码URL参数
    const prescriptionText = decodeURIComponent(prescriptionParam);
    const symptoms = symptomsParam ? decodeURIComponent(symptomsParam) : undefined;
    const diagnosis = diagnosisParam ? decodeURIComponent(diagnosisParam) : undefined;
    const patientName = patientParam ? decodeURIComponent(patientParam) : undefined;
    
    return parsePrescriptionFromText(prescriptionText, {
      name: patientName,
      symptoms,
      diagnosis
    });
  } catch (error) {
    console.error('解析药方参数失败:', error);
    return null;
  }
}

/**
 * 将药方数据编码为URL参数
 * @param prescription 药方数据
 * @returns URL参数字符串
 */
export function encodePrescriptionToURL(prescription: PrescriptionData): string {
  const params = new URLSearchParams();
  
  // 构建药方文本
  const prescriptionText = prescription.herbs
    .map(herb => `${herb.name} ${herb.dosage}`)
    .join('，');
  
  params.set('prescription', prescriptionText);
  
  if (prescription.symptoms) {
    params.set('symptoms', prescription.symptoms);
  }
  
  if (prescription.diagnosis) {
    params.set('diagnosis', prescription.diagnosis);
  }
  
  if (prescription.patientName) {
    params.set('patient', prescription.patientName);
  }
  
  return params.toString();
}