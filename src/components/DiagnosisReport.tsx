import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useTexts } from '../store/languageStore';
import axios from 'axios';

interface DiagnosisReportProps {
  report: string;
}

const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ report }) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = useTexts();

  const handlePharmacy = () => {
    // 从诊断报告中提取药方信息
    const prescriptionMatch = report.match(/(?:治疗方案|处方|药方)[\s\S]*?(?=##|$)/i);
    const prescription = prescriptionMatch ? prescriptionMatch[0] : '';
    
    // 将药方信息作为URL参数传递，在新窗口打开配药网站
    const encodedPrescription = encodeURIComponent(prescription);
    const pharmacyUrl = `${window.location.origin}/pharmacy/prescription?prescription=${encodedPrescription}`;
    window.open(pharmacyUrl, '_blank');
  };

  const handleAppointment = () => {
    // 从诊断报告中提取关键信息
    const symptomsMatch = report.match(/(?:症状|主诉|现病史)([\s\S]*?)(?=##|$)/i);
    const diagnosisMatch = report.match(/(?:诊断|病情分析|中医诊断)([\s\S]*?)(?=##|$)/i);
    
    const symptoms = symptomsMatch ? symptomsMatch[1].trim() : '';
    const diagnosis = diagnosisMatch ? diagnosisMatch[1].trim() : '';
    
    // 将诊断信息作为URL参数传递，在新窗口打开预约网站
    const reportData = {
      symptoms,
      diagnosis,
      fullReport: report
    };
    
    const encodedReportData = encodeURIComponent(JSON.stringify(reportData));
    const appointmentUrl = `${window.location.origin}/appointment/home?report=${encodedReportData}`;
    window.open(appointmentUrl, '_blank');
  };

  const handleDownload = async () => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = language === 'zh' ? 
        `中医诊断报告_${timestamp}.md` : 
        `TCM_Diagnosis_Report_${timestamp}.md`;
      
      const response = await axios.post('/.netlify/functions/download-report', {
        report,
        filename
      }, {
        responseType: 'blob'
      });
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert(t.report.downloadError);
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.report.title}</h2>
        <div className="prose prose-lg max-w-none text-gray-700">
          <ReactMarkdown 
            components={{
              h1: ({children}) => <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-6">{children}</h1>,
              h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-5">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">{children}</h3>,
              p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
              li: ({children}) => <li className="ml-2">{children}</li>,
              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">{children}</blockquote>
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
        <button
          onClick={handlePharmacy}
          className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          <span>🏥</span>
          {t.report.pharmacy}
        </button>
        
        <button
          onClick={handleAppointment}
          className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          <span>📅</span>
          {t.report.appointment}
        </button>
        
        <button
          onClick={handleDownload}
          className="flex-1 min-w-[200px] bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          <span>📄</span>
          {t.report.download}
        </button>
      </div>
    </div>
  );
};

export default DiagnosisReport;