import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useTexts } from '../store/languageStore';

const Pharmacy: React.FC = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguageStore();
  const t = useTexts();
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const pharmacies = {
    zh: [
      {
        id: '1',
        name: '同仁堂药房',
        address: '北京市东城区王府井大街40号',
        phone: '010-65252288',
        distance: '1.2km',
        rating: 4.8,
        features: ['老字号', '品质保证', '专业配药']
      },
      {
        id: '2',
        name: '德仁堂中医药房',
        address: '北京市朝阳区建国门外大街甲6号',
        phone: '010-85251234',
        distance: '2.1km',
        rating: 4.6,
        features: ['24小时营业', '送药上门', '在线咨询']
      },
      {
        id: '3',
        name: '百草堂药房',
        address: '北京市海淀区中关村大街27号',
        phone: '010-62551888',
        distance: '3.5km',
        rating: 4.7,
        features: ['药材齐全', '价格优惠', '专家坐诊']
      }
    ],
    en: [
      {
        id: '1',
        name: 'Tongrentang Pharmacy',
        address: '40 Wangfujing Street, Dongcheng District, Beijing',
        phone: '010-65252288',
        distance: '1.2km',
        rating: 4.8,
        features: ['Time-honored Brand', 'Quality Assurance', 'Professional Dispensing']
      },
      {
        id: '2',
        name: 'Derentang TCM Pharmacy',
        address: 'Building A6, Jianguomenwai Street, Chaoyang District, Beijing',
        phone: '010-85251234',
        distance: '2.1km',
        rating: 4.6,
        features: ['24/7 Service', 'Home Delivery', 'Online Consultation']
      },
      {
        id: '3',
        name: 'Baicaotang Pharmacy',
        address: '27 Zhongguancun Street, Haidian District, Beijing',
        phone: '010-62551888',
        distance: '3.5km',
        rating: 4.7,
        features: ['Complete Herbs', 'Competitive Prices', 'Expert Consultation']
      }
    ]
  };


  const pharmacyList = pharmacies[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPharmacy) {
      alert(t.pharmacy.selectPharmacyFirst);
      return;
    }
    
    if (!contactInfo.name || !contactInfo.phone || !contactInfo.address) {
      alert(t.pharmacy.fillAllFields);
      return;
    }

    try {
      // 模拟提交请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(t.pharmacy.submitSuccess);
      navigate('/');
    } catch (error) {
      alert(t.pharmacy.submitError);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← {t.pharmacy.back}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.pharmacy.title}</h1>
          <p className="text-gray-600">{t.pharmacy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 选择药房 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.pharmacy.selectPharmacy}</h2>
            <div className="grid gap-4">
              {pharmacyList.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPharmacy === pharmacy.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>⭐ {pharmacy.rating}</span>
                      <span>📍 {pharmacy.distance}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{pharmacy.address}</p>
                  <p className="text-gray-600 text-sm mb-3">📞 {pharmacy.phone}</p>
                  <div className="flex flex-wrap gap-2">
                    {pharmacy.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 联系信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.pharmacy.contactInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.pharmacy.name} *
                </label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.pharmacy.namePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.pharmacy.phone} *
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t.pharmacy.phonePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.pharmacy.address} *
                </label>
                <textarea
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={t.pharmacy.addressPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
            >
              {t.pharmacy.submit}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Pharmacy;