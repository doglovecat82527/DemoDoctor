import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Star, Video, Users, Phone } from 'lucide-react';
import { useAppointmentStore, Doctor } from '../stores/appointmentStore';
import { 
  parseReportFromUrl, 
  generatePatientSummary, 
  extractKeywordsFromDiagnosis, 
  matchDoctorsByKeywords,
  generateAvailableTimeSlots 
} from '../utils/appointmentParser';

interface ReportData {
  symptoms: string;
  diagnosis: string;
  fullReport: string;
}



const AppointmentHome: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'local' | 'online'>('local');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [localDoctors, setLocalDoctors] = useState<Doctor[]>([]);
  const [onlineDoctors, setOnlineDoctors] = useState<Doctor[]>([]);
  const [patientSummary, setPatientSummary] = useState<string>('');
  const [matchedDoctors, setMatchedDoctors] = useState<{ local: Doctor[]; online: Doctor[] }>({ local: [], online: [] });
  const { doctors, addAppointment } = useAppointmentStore();

  useEffect(() => {
    // 解析URL参数中的诊断报告数据
    const reportParam = searchParams.get('report');
    if (reportParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(reportParam));
        setReportData(decoded);
        generateDoctors(decoded);
        
        // 生成病情总结
        const summary = generatePatientSummary(decoded.symptoms, decoded.diagnosis);
        setPatientSummary(summary);
        
        // 提取关键词并匹配医生
        const keywords = extractKeywordsFromDiagnosis(decoded.symptoms, decoded.diagnosis);
        const localDoctorData = localDoctors.filter(d => d.type === 'local');
        const onlineDoctorData = onlineDoctors.filter(d => d.type === 'online');
        
        setMatchedDoctors({
          local: matchDoctorsByKeywords(localDoctorData, keywords),
          online: matchDoctorsByKeywords(onlineDoctorData, keywords)
        });
      } catch (error) {
        console.error('解析报告数据失败:', error);
      }
    }
  }, [searchParams, localDoctors, onlineDoctors]);

  const generateDoctors = (report: ReportData) => {
    // 从诊断报告中提取关键词
    const keywords = extractKeywords(report.diagnosis + ' ' + report.symptoms);
    
    // 生成本地医生数据
    const localDoctorData: Doctor[] = [
      {
        id: 'local_1',
        name: '张明华',
        experience: 25,
        specialties: generateSpecialties(keywords, ['脾胃病', '消化系统疾病', '慢性胃炎']),
        hospital: '北京中医医院',
        address: '东城区美术馆后街23号',
        distance: '2.3公里',
        fee: 300,
        rating: 4.8,
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20male%20middle%20aged%20wearing%20white%20coat&image_size=square',
        type: 'local' as const
      },
      {
        id: 'local_2',
        name: '李秀英',
        experience: 18,
        specialties: generateSpecialties(keywords, ['内科', '呼吸系统', '心血管疾病']),
        hospital: '北京同仁堂中医门诊',
        address: '西城区大栅栏街24号',
        distance: '4.1公里',
        fee: 250,
        rating: 4.6,
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20female%20doctor%20portrait%20middle%20aged%20wearing%20white%20coat&image_size=square',
        type: 'local' as const
      },
      {
        id: 'local_3',
        name: '王建国',
        experience: 30,
        specialties: generateSpecialties(keywords, ['针灸推拿', '骨伤科', '疼痛治疗']),
        hospital: '北京中医药大学东直门医院',
        address: '东城区海运仓5号',
        distance: '5.8公里',
        fee: 350,
        rating: 4.9,
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=senior%20chinese%20doctor%20portrait%20male%20experienced%20wearing%20white%20coat&image_size=square',
        type: 'local' as const
      }
    ];

    // 生成在线医生数据
    const onlineDoctorData: Doctor[] = [
      {
        id: 'online_1',
        name: '陈志远',
        experience: 22,
        specialties: generateSpecialties(keywords, ['远程诊疗', '慢性病管理', '健康咨询']),
        hospital: '北京协和医院中医科',
        onlineConsultations: 1580,
        fee: 200,
        rating: 4.7,
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20male%20online%20consultation%20wearing%20white%20coat&image_size=square',
        type: 'online' as const
      },
      {
        id: 'online_2',
        name: '刘美玲',
        experience: 15,
        specialties: generateSpecialties(keywords, ['妇科', '儿科', '养生保健']),
        hospital: '首都医科大学附属北京中医医院',
        onlineConsultations: 2340,
        fee: 180,
        rating: 4.5,
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20female%20doctor%20portrait%20young%20online%20consultation%20wearing%20white%20coat&image_size=square',
        type: 'online' as const
      },
      {
        id: 'online_3',
        name: '赵国强',
        experience: 28,
        specialties: generateSpecialties(keywords, ['肿瘤科', '免疫调理', '康复医学']),
        hospital: '中国中医科学院广安门医院',
        onlineConsultations: 980,
        fee: 280,
        rating: 4.8,
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=senior%20chinese%20doctor%20portrait%20male%20specialist%20wearing%20white%20coat&image_size=square',
        type: 'online' as const
      }
    ];

    setLocalDoctors(localDoctorData);
    setOnlineDoctors(onlineDoctorData);
  };

  const extractKeywords = (text: string): string[] => {
    const commonKeywords = [
      '胃痛', '腹胀', '消化不良', '脾胃虚弱', '湿热', '气滞', '血瘀',
      '头痛', '失眠', '焦虑', '疲劳', '咳嗽', '感冒', '发热',
      '腰痛', '关节痛', '颈椎病', '高血压', '糖尿病', '心悸'
    ];
    
    return commonKeywords.filter(keyword => text.includes(keyword));
  };

  const generateSpecialties = (keywords: string[], baseSpecialties: string[]): string[] => {
    const specialtyMap: { [key: string]: string } = {
      '胃痛': '脾胃病',
      '腹胀': '消化系统疾病',
      '消化不良': '胃肠疾病',
      '头痛': '神经内科',
      '失眠': '心理调理',
      '咳嗽': '呼吸系统',
      '腰痛': '骨伤科',
      '关节痛': '风湿免疫',
      '高血压': '心血管疾病'
    };

    const matchedSpecialties = keywords.map(keyword => specialtyMap[keyword]).filter(Boolean);
    const combined = [...new Set([...baseSpecialties, ...matchedSpecialties])];
    return combined.slice(0, 3); // 最多显示3个专长
  };

  const handleBookAppointment = (doctor: Doctor) => {
    if (!reportData) return;
    
    // 创建预约
    const appointmentId = addAppointment({
      doctorId: doctor.id,
      patientName: '患者', // 实际应用中应该从用户信息获取
      symptoms: reportData.symptoms,
      diagnosis: reportData.diagnosis,
      appointmentTime: generateAvailableTimeSlots()[0], // 选择第一个可用时间
      type: activeTab,
      fee: doctor.fee,
      status: 'confirmed'
    });
    
    navigate(`/appointment/success?appointmentId=${appointmentId}&doctorId=${doctor.id}&type=${activeTab}`);
  };

  const formatSymptoms = (symptoms: string): string => {
    if (!symptoms) return '暂无症状描述';
    return symptoms.length > 100 ? symptoms.substring(0, 100) + '...' : symptoms;
  };

  const formatDiagnosis = (diagnosis: string): string => {
    if (!diagnosis) return '暂无诊断信息';
    return diagnosis.length > 150 ? diagnosis.substring(0, 150) + '...' : diagnosis;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">医</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">在线寻医预约</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：病情总结 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">病情总结</h2>
              
              <div className="space-y-4">
                {patientSummary ? (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{patientSummary}</pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">主要症状</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {reportData ? formatSymptoms(reportData.symptoms) : '正在加载症状信息...'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">AI诊断分析</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {reportData ? formatDiagnosis(reportData.diagnosis) : '正在加载诊断信息...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    💡 系统已根据您的病情智能匹配相关专科医生
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：医生列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              {/* 标签页 */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('local')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'local'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    本地问诊
                  </button>
                  <button
                    onClick={() => setActiveTab('online')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'online'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    在线问诊
                  </button>
                </nav>
              </div>

              {/* 医生列表 */}
              <div className="p-6">
                <div className="space-y-6">
                  {(activeTab === 'local' ? matchedDoctors.local : matchedDoctors.online).map((doctor) => (
                    <div key={doctor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                      <div className="flex items-start space-x-4">
                        <img
                          src={doctor.avatar}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(doctor.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1 font-medium">{doctor.rating}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <span className="font-medium text-gray-700 w-12">医龄：</span>
                                <span className="text-gray-600">{doctor.experience}年</span>
                              </div>
                              <div className="flex items-start text-sm">
                                <span className="font-medium text-gray-700 w-12 flex-shrink-0">擅长：</span>
                                <div className="flex flex-wrap gap-1">
                                  {doctor.specialties.map((specialty, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-start text-sm">
                                <span className="font-medium text-gray-700 w-12 flex-shrink-0">医院：</span>
                                <span className="text-gray-600">{doctor.hospital}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {activeTab === 'local' ? (
                                <>
                                  <div className="flex items-start text-sm">
                                    <span className="font-medium text-gray-700 w-12 flex-shrink-0">地址：</span>
                                    <span className="text-gray-600">{doctor.address}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <span className="font-medium text-gray-700 w-12">距离：</span>
                                    <span className="text-blue-600 font-medium">{doctor.distance}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center text-sm">
                                  <span className="font-medium text-gray-700 w-16 flex-shrink-0">在线问诊：</span>
                                  <span className="text-green-600 font-medium">{doctor.onlineConsultations}次</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm">
                                <span className="font-medium text-gray-700 w-12">挂号费：</span>
                                <span className="text-green-600 font-semibold">¥{doctor.fee}</span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleBookAppointment(doctor)}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 shadow-md ${
                              activeTab === 'local'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {activeTab === 'local' ? (
                              <><Phone className="w-4 h-4 inline-block mr-1" />立即预约</>
                            ) : (
                              <><Video className="w-4 h-4 inline-block mr-1" />在线咨询</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentHome;