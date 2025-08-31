import { Doctor } from '../stores/appointmentStore';

// 从诊断报告中提取关键词
export function extractKeywordsFromDiagnosis(symptoms: string, diagnosis: string): string[] {
  const keywords: string[] = [];
  const text = `${symptoms} ${diagnosis}`.toLowerCase();
  
  // 常见疾病关键词映射
  const diseaseKeywords = {
    '脾胃': ['胃痛', '腹痛', '消化不良', '胃胀', '食欲不振', '恶心', '呕吐', '腹泻', '便秘', '胃酸', '烧心'],
    '心血管': ['胸闷', '心悸', '气短', '高血压', '心律不齐', '胸痛', '心慌', '血压高'],
    '呼吸系统': ['咳嗽', '咳痰', '气喘', '呼吸困难', '胸闷', '感冒', '发热', '咽痛'],
    '妇科': ['月经不调', '痛经', '白带异常', '妇科炎症', '更年期', '不孕', '乳腺'],
    '骨科': ['关节痛', '腰痛', '颈椎病', '肩周炎', '骨质疏松', '扭伤', '骨折', '风湿'],
    '皮肤': ['湿疹', '皮炎', '过敏', '瘙痒', '皮疹', '荨麻疹', '痤疮', '脱发']
  };
  
  // 检查文本中是否包含相关关键词
  Object.entries(diseaseKeywords).forEach(([category, words]) => {
    const hasMatch = words.some(word => text.includes(word));
    if (hasMatch) {
      keywords.push(category);
    }
  });
  
  return keywords;
}

// 根据关键词匹配医生
export function matchDoctorsByKeywords(doctors: Doctor[], keywords: string[]): Doctor[] {
  if (keywords.length === 0) {
    return doctors; // 如果没有关键词，返回所有医生
  }
  
  const scoredDoctors = doctors.map(doctor => {
    let score = 0;
    
    // 计算匹配分数
    keywords.forEach(keyword => {
      doctor.specialties.forEach(specialty => {
        if (specialty.includes(keyword) || keyword.includes(specialty)) {
          score += 2; // 精确匹配得分更高
        }
      });
    });
    
    // 检查症状关键词是否在专长中
    const specialtyText = doctor.specialties.join(' ').toLowerCase();
    keywords.forEach(keyword => {
      if (specialtyText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    return { doctor, score };
  });
  
  // 按分数排序，分数高的在前
  return scoredDoctors
    .sort((a, b) => b.score - a.score)
    .map(item => item.doctor);
}

// 解析URL参数中的诊断报告数据
export function parseReportFromUrl(): { symptoms: string; diagnosis: string } | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const symptomsParam = urlParams.get('symptoms');
    const diagnosisParam = urlParams.get('diagnosis');
    
    if (!symptomsParam || !diagnosisParam) {
      return null;
    }
    
    return {
      symptoms: decodeURIComponent(symptomsParam),
      diagnosis: decodeURIComponent(diagnosisParam)
    };
  } catch (error) {
    console.error('解析诊断报告参数失败:', error);
    return null;
  }
}

// 生成病情总结
export function generatePatientSummary(symptoms: string, diagnosis: string): string {
  const keywords = extractKeywordsFromDiagnosis(symptoms, diagnosis);
  const keywordText = keywords.length > 0 ? `主要涉及${keywords.join('、')}相关疾病。` : '';
  
  return `患者主要症状：${symptoms}\n\nAI初步诊断：${diagnosis}\n\n${keywordText}建议寻找相关专科医生进行进一步诊断和治疗。`;
}

// 生成预约时间选项（模拟可预约时间）
export function generateAvailableTimeSlots(): string[] {
  const slots: string[] = [];
  const today = new Date();
  
  // 生成未来7天的时间段
  for (let day = 1; day <= 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    const dateStr = date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    // 每天生成几个时间段
    const timeSlots = ['09:00', '10:30', '14:00', '15:30', '16:30'];
    timeSlots.forEach(time => {
      slots.push(`${dateStr} ${time}`);
    });
  }
  
  return slots.slice(0, 15); // 返回前15个时间段
}