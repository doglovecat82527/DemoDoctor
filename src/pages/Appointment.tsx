import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useTexts } from '../store/languageStore';

const Appointment: React.FC = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguageStore();
  const t = useTexts();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    symptoms: ''
  });

  const doctors = {
    zh: [
      {
        id: '1',
        name: '李明华',
        title: '主任医师',
        specialty: '内科、脾胃病',
        experience: '30年',
        hospital: '北京中医医院',
        rating: 4.9,
        price: '200元',
        avatar: '👨‍⚕️'
      },
      {
        id: '2',
        name: '王雅琴',
        title: '副主任医师',
        specialty: '妇科、不孕不育',
        experience: '25年',
        hospital: '中国中医科学院',
        rating: 4.8,
        price: '180元',
        avatar: '👩‍⚕️'
      },
      {
        id: '3',
        name: '张德胜',
        title: '主治医师',
        specialty: '骨科、风湿病',
        experience: '15年',
        hospital: '东直门医院',
        rating: 4.7,
        price: '150元',
        avatar: '👨‍⚕️'
      }
    ],
    en: [
      {
        id: '1',
        name: 'Dr. Li Minghua',
        title: 'Chief Physician',
        specialty: 'Internal Medicine, Gastroenterology',
        experience: '30 years',
        hospital: 'Beijing Hospital of TCM',
        rating: 4.9,
        price: '$30',
        avatar: '👨‍⚕️'
      },
      {
        id: '2',
        name: 'Dr. Wang Yaqin',
        title: 'Associate Chief Physician',
        specialty: 'Gynecology, Infertility',
        experience: '25 years',
        hospital: 'China Academy of TCM',
        rating: 4.8,
        price: '$27',
        avatar: '👩‍⚕️'
      },
      {
        id: '3',
        name: 'Dr. Zhang Desheng',
        title: 'Attending Physician',
        specialty: 'Orthopedics, Rheumatism',
        experience: '15 years',
        hospital: 'Dongzhimen Hospital',
        rating: 4.7,
        price: '$22',
        avatar: '👨‍⚕️'
      }
    ]
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];


  const doctorList = doctors[language];

  // 生成未来7天的日期
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        })
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) {
      alert(t.appointment.selectDoctorFirst);
      return;
    }
    
    if (!selectedDate) {
      alert(t.appointment.selectDateFirst);
      return;
    }
    
    if (!selectedTime) {
      alert(t.appointment.selectTimeFirst);
      return;
    }
    
    if (!patientInfo.name || !patientInfo.phone || !patientInfo.age || !patientInfo.gender) {
      alert(t.appointment.fillAllFields);
      return;
    }

    try {
      // 模拟提交请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(t.appointment.submitSuccess);
      navigate('/');
    } catch (error) {
      alert(t.appointment.submitError);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← {t.appointment.back}
              </button>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              {language === 'zh' ? 'English' : '中文'}
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.appointment.title}</h1>
          <p className="text-gray-600">{t.appointment.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 选择医师 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.appointment.selectDoctor}</h2>
            <div className="grid gap-4">
              {doctorList.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDoctor === doctor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDoctor(doctor.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{doctor.avatar}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-blue-600 text-sm">{doctor.title}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">{doctor.price}</div>
                          <div className="text-sm text-gray-600">⭐ {doctor.rating}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">{t.appointment.specialty}:</span> {doctor.specialty}
                      </p>
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">{t.appointment.hospital}:</span> {doctor.hospital}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">{t.appointment.experience}:</span> {doctor.experience}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 选择时间 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.appointment.selectDateTime}</h2>
            
            {/* 日期选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">{t.appointment.date}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => setSelectedDate(date.value)}
                    className={`p-3 text-sm rounded-lg border transition-all ${
                      selectedDate === date.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 时间选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t.appointment.time}</label>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      selectedTime === time
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 患者信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.appointment.patientInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.appointment.name} *
                </label>
                <input
                  type="text"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.appointment.namePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.appointment.phone} *
                </label>
                <input
                  type="tel"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t.appointment.phonePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.appointment.age} *
                </label>
                <input
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
                  placeholder={t.appointment.agePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.appointment.gender} *
                </label>
                <select
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{language === 'zh' ? '请选择' : 'Please select'}</option>
                  <option value="male">{t.appointment.male}</option>
                  <option value="female">{t.appointment.female}</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.appointment.symptoms}
                </label>
                <textarea
                  value={patientInfo.symptoms}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder={t.appointment.symptomsPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
            >
              {t.appointment.submit}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Appointment;