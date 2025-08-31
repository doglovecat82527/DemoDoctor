import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Clock, Phone, Download, Share2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAppointmentStore, Doctor, Appointment } from '../stores/appointmentStore';

interface AppointmentDetails {
  appointmentId: string;
  doctorName: string;
  doctorHospital: string;
  appointmentType: 'local' | 'online';
  appointmentDate: string;
  appointmentTime: string;
  fee: number;
  address?: string;
  notes: string[];
}

const AppointmentSuccess: React.FC = () => {
  const [appointmentData, setAppointmentData] = useState<Appointment | null>(null);
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const navigate = useNavigate();
  const { getAppointmentById, getDoctorById } = useAppointmentStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 解析URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('appointmentId');
    const doctorId = urlParams.get('doctorId');
    
    if (appointmentId && doctorId) {
      // 获取预约数据
      const appointment = getAppointmentById(appointmentId);
      const doctor = getDoctorById(doctorId);
      
      if (appointment && doctor) {
        setAppointmentData(appointment);
        setDoctorData(doctor);
        
        // 生成预约详情
        const details: AppointmentDetails = {
          appointmentId: appointment.id,
          doctorName: doctor.name,
          doctorHospital: doctor.hospital,
          appointmentType: appointment.type,
          appointmentDate: appointment.appointmentTime.split(' ')[0],
          appointmentTime: appointment.appointmentTime,
          fee: appointment.fee,
          address: appointment.type === 'local' ? doctor.address : undefined,
          notes: appointment.type === 'local' ? [
            '请提前15分钟到达医院，携带身份证件',
            '如需调整预约时间，请提前24小时联系医院',
            '就诊时请携带相关病历资料和检查报告',
            '医院提供免费停车位，建议绿色出行',
            '就诊当日请避免饮酒和剧烈运动'
          ] : [
            '请确保网络连接稳定，建议使用WiFi',
            '提前5分钟进入在线诊室等候',
            '准备好相关病历资料的清晰照片',
            '在线问诊时长为30分钟，请合理安排时间',
            '如遇技术问题，请及时联系客服：400-123-4567'
          ]
        };
        
        setAppointmentDetails(details);
        setIsLoading(false);
      }
    }
  }, [getAppointmentById, getDoctorById]);



  const handleShare = () => {
    if (appointmentDetails) {
      const shareText = `我已成功预约${appointmentDetails.doctorName}医生的${appointmentDetails.appointmentType === 'local' ? '门诊' : '在线'}问诊，预约时间：${appointmentDetails.appointmentDate} ${appointmentDetails.appointmentTime}`;
      
      if (navigator.share) {
        navigator.share({
          title: '预约成功',
          text: shareText
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('预约信息已复制到剪贴板');
      }
    }
  };

  const handleDownload = () => {
    if (appointmentDetails) {
      const content = `
预约确认单

预约编号：${appointmentDetails.appointmentId}
医生姓名：${appointmentDetails.doctorName}
所属医院：${appointmentDetails.doctorHospital}
预约类型：${appointmentDetails.appointmentType === 'local' ? '门诊问诊' : '在线问诊'}
预约时间：${appointmentDetails.appointmentDate} ${appointmentDetails.appointmentTime}
费用：¥${appointmentDetails.fee}
${appointmentDetails.address ? `就诊地址：${appointmentDetails.address}` : ''}

注意事项：
${appointmentDetails.notes.map((note, index) => `${index + 1}. ${note}`).join('\n')}

预约时间：${new Date().toLocaleString('zh-CN')}
      `;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `预约确认单_${appointmentDetails.appointmentId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">正在处理预约...</h2>
            <p className="text-gray-600">请稍候，我们正在为您确认预约信息</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointmentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">预约信息错误</h2>
          <p className="text-gray-600 mb-4">无法获取预约详情，请重新尝试</p>
          <button
            onClick={() => window.close()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            关闭页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">预约成功</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 成功提示 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">预约成功！</h2>
            <p className="text-gray-600">您的预约已确认，请按时{appointmentData?.type === 'local' ? '就诊' : '参加在线问诊'}</p>
          </div>

          {/* 预约详情 */}
          <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-gradient-to-r from-blue-50 to-green-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              预约详情
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={doctorData?.avatar}
                    alt={doctorData?.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{doctorData?.name}</h4>
                    <p className="text-sm text-gray-600">{doctorData?.hospital}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-20">预约类型：</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointmentData?.type === 'local' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {appointmentData?.type === 'local' ? '本地问诊' : '在线问诊'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-20">预约时间：</span>
                    <span className="text-gray-600">{appointmentData?.appointmentTime}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-20">费用：</span>
                    <span className="text-green-600 font-semibold">¥{appointmentData?.fee}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">联系方式</h4>
                <div className="space-y-3">
                  {appointmentData?.type === 'local' ? (
                    <>
                      <div className="flex items-start text-sm">
                        <span className="font-medium text-gray-700 w-20 flex-shrink-0">医院地址：</span>
                        <span className="text-gray-600">{doctorData?.address}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 w-20">联系电话：</span>
                        <span className="text-blue-600 font-medium">010-8888-8888</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 w-20">会议室：</span>
                        <span className="text-blue-600 font-medium">在线诊室-{appointmentData?.id.slice(-4)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 w-20">会议密码：</span>
                        <span className="text-gray-600 font-mono">123456</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {appointmentDetails?.address && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-800">就诊地址</span>
              </div>
              <p className="text-blue-700">{appointmentDetails.address}</p>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">📋</span>
              <span className="font-semibold text-yellow-800">预约编号</span>
            </div>
            <p className="text-yellow-700 font-mono text-lg">{appointmentDetails?.appointmentId}</p>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            注意事项
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            {appointmentDetails?.notes.map((note, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>下载预约确认单</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Share2 className="w-5 h-5" />
            <span>分享预约信息</span>
          </button>
          
          <button
            onClick={() => window.close()}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            <span>完成</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AppointmentSuccess;