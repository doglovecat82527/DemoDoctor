import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '../components/ChatInterface';
import DiagnosisReport from '../components/DiagnosisReport';
import { useLanguageStore, useTexts } from '../store/languageStore';
import { ChevronDown, TestTube, Copy, X } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

const Diagnosis: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();
  const t = useTexts();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t.diagnosis.initialMessage,
      type: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [currentReport, setCurrentReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [presetData, setPresetData] = useState<any[]>([]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 加载预设数据
  const loadPresetData = async () => {
    try {
      const response = await fetch('/api/data/preset-diagnosis.json');
      const data = await response.json();
      if (Array.isArray(data)) {
        setPresetData(data);
      } else {
        console.error('预设数据格式错误，不是数组:', data);
        setPresetData([]);
      }
    } catch (error) {
      console.error('加载预设数据失败:', error);
      // 如果API路径不可用，尝试直接导入
      try {
        const module = await import('../../api/data/preset-diagnosis.json');
        if (Array.isArray(module.default)) {
          setPresetData(module.default);
        } else {
          console.error('导入的预设数据格式错误，不是数组:', module.default);
          setPresetData([]);
        }
      } catch (importError) {
        console.error('导入预设数据失败:', importError);
        setPresetData([]);
      }
    }
  };

  // 处理测试按钮点击
  const handleTestButtonClick = () => {
    setShowTestModal(true);
    if (presetData.length === 0) {
      loadPresetData();
    }
  };

  // 复制预设数据到输入框
  const copyToInput = (inputText: string) => {
    // 通过ref直接设置ChatInterface的输入值
    const event = new CustomEvent('fillInput', { detail: inputText });
    window.dispatchEvent(event);
    setShowTestModal(false);
  };

  const handleSendMessage = async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 根据部署平台选择API路径
      const isNetlify = window.location.hostname.includes('netlify.app');
      const isVercel = window.location.hostname.includes('vercel.app');
      
      let apiUrl: string;
      if (isNetlify) {
        apiUrl = '/.netlify/functions/diagnosis';
      } else if (isVercel) {
        apiUrl = '/api/diagnosis';
      } else {
        // 本地开发环境，默认使用后端API
        apiUrl = '/api/diagnosis';
      }
      
      // 调用诊断API
      const response = await axios.post(apiUrl, {
        input: content,
        language
      });

      if (response.data.success) {
        const report = response.data.data.report;
        const source = response.data.data.source;
        
        // 添加助手回复
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: language === 'zh' ? 
            `我已经为您生成了详细的中医诊断报告。${source === 'preset' ? '基于我的专业知识库' : '结合最新的AI分析'}，请查看下方的诊断结果。` :
            language === 'en' ?
            `I have generated a detailed TCM diagnosis report for you. ${source === 'preset' ? 'Based on my professional knowledge base' : 'Combined with the latest AI analysis'}, please check the diagnosis results below.` :
            `詳細な中医学診断レポートを生成いたしました。${source === 'preset' ? '専門知識ベースに基づいて' : '最新のAI分析と組み合わせて'}、以下の診断結果をご確認ください。`,
          type: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentReport(report);
      } else {
        throw new Error(response.data.error || '诊断失败');
      }
    } catch (error) {
      console.error('诊断请求失败:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'zh' ? 
          '抱歉，诊断服务暂时不可用。请稍后重试，或联系专业医师进行诊断。' :
          language === 'en' ?
          'Sorry, the diagnosis service is temporarily unavailable. Please try again later or consult a professional physician.' :
          '申し訳ございませんが、診断サービスは一時的に利用できません。後でもう一度お試しいただくか、専門医師にご相談ください。',
        type: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">中</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {t.diagnosis.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleTestButtonClick}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors shadow-sm"
                title="测试数据"
              >
                <TestTube className="w-4 h-4" />
                <span className="text-sm font-medium">
                  测试
                </span>
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  <span>
                    {language === 'zh' ? '中文' : language === 'en' ? 'English' : '日本語'}
                  </span>
                  <ChevronDown size={16} className={`transform transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        setLanguage('zh');
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        language === 'zh' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      中文
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ja');
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors rounded-b-lg ${
                        language === 'ja' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      日本語
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 聊天界面 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {t.diagnosis.symptomDescription}
              </h2>
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
            
            {/* 使用提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                {t.diagnosis.tips}
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  {t.diagnosis.tip1}
                </li>
                <li>
                  {t.diagnosis.tip2}
                </li>
                <li>
                  {t.diagnosis.tip3}
                </li>
              </ul>
            </div>
          </div>

          {/* 诊断报告 */}
          <div className="space-y-6">
            {currentReport ? (
              <DiagnosisReport 
                report={currentReport}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t.diagnosis.waitingTitle}
                </h3>
                <p className="text-gray-600">
                  {t.diagnosis.waitingDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              {t.diagnosis.disclaimer}
            </p>
          </div>
        </div>
      </footer>

      {/* 预设数据弹窗 */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">预设病症数据</h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {presetData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : (
                <div className="space-y-4">
                  {presetData.map((item, index) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">案例 {index + 1}</h4>
                        <button
                          onClick={() => copyToInput(item.input)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          <span>复制</span>
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {item.input}
                      </div>
                      {item.keywords && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.keywords.map((keyword: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;