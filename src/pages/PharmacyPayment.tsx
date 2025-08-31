import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowLeft, CreditCard, Clock } from 'lucide-react';

interface OrderData {
  items: any[];
  address: any;
  paymentMethod: string;
  totalPrice: number;
  orderNumber: string;
  orderTime: string;
}

type PaymentStatus = 'processing' | 'success' | 'failed' | 'timeout';

const PharmacyPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [countdown, setCountdown] = useState(300); // 5分钟倒计时
  const [paymentProgress, setPaymentProgress] = useState(0);

  useEffect(() => {
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
    } else {
      navigate('/pharmacy/cart');
      return;
    }

    // 模拟支付处理过程
    const paymentTimer = setTimeout(() => {
      // 90% 概率支付成功，10% 概率失败（用于演示）
      const success = Math.random() > 0.1;
      setPaymentStatus(success ? 'success' : 'failed');
    }, 3000);

    // 进度条动画
    const progressTimer = setInterval(() => {
      setPaymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // 倒计时
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setPaymentStatus('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(paymentTimer);
      clearInterval(progressTimer);
      clearInterval(countdownTimer);
    };
  }, [location.state, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'alipay': '支付宝',
      'wechat': '微信支付',
      'unionpay': '银联支付',
      'cod': '货到付款'
    };
    return methods[method] || method;
  };

  const handleRetry = () => {
    setPaymentStatus('processing');
    setPaymentProgress(0);
    setCountdown(300);
    
    // 重新开始支付流程
    setTimeout(() => {
      const success = Math.random() > 0.1;
      setPaymentStatus(success ? 'success' : 'failed');
    }, 3000);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    navigate('/pharmacy/order-success', { state: { orderData } });
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      {/* 头部导航 */}
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {paymentStatus === 'processing' ? (
                <div className="text-yellow-200 flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>支付处理中</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/pharmacy/checkout')}
                  className="text-yellow-200 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回</span>
                </button>
              )}
              <h1 className="text-xl font-bold text-yellow-200">支付页面</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-yellow-200">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">安全支付</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {paymentStatus === 'processing' && (
            <div className="text-center">
              <div className="mb-6">
                <Loader className="w-16 h-16 animate-spin mx-auto mb-4 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">支付处理中</h2>
                <p className="text-gray-600">请稍候，正在为您处理支付...</p>
              </div>
              
              {/* 进度条 */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${paymentProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{paymentProgress}% 完成</p>
              </div>
              
              {/* 订单信息 */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">订单号：</span>
                    <span className="font-medium">{orderData.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">支付方式：</span>
                    <span className="font-medium">{getPaymentMethodName(orderData.paymentMethod)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">支付金额：</span>
                    <span className="font-bold text-green-600">¥{orderData.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-orange-500" />
                    <span className="text-gray-600">剩余时间：</span>
                    <span className="font-medium text-orange-600 ml-1">{formatTime(countdown)}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">请不要关闭此页面，支付完成后将自动跳转</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">支付成功！</h2>
              <p className="text-gray-600 mb-6">您的订单已支付成功，我们将尽快为您配药发货</p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">订单号：</span>
                    <span className="font-medium">{orderData.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">支付方式：</span>
                    <span className="font-medium">{getPaymentMethodName(orderData.paymentMethod)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">支付金额：</span>
                    <span className="font-bold text-green-600">¥{orderData.totalPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">支付时间：</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleViewOrder}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                >
                  查看订单详情
                </button>
                <button
                  onClick={handleBackToHome}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                >
                  返回首页
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center">
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">支付失败</h2>
              <p className="text-gray-600 mb-6">很抱歉，您的支付未能成功完成，请重试或选择其他支付方式</p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">订单号：</span>
                    <span className="font-medium">{orderData.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">失败原因：</span>
                    <span className="font-medium text-red-600">网络异常，请重试</span>
                  </div>
                  <div>
                    <span className="text-gray-600">支付金额：</span>
                    <span className="font-bold text-green-600">¥{orderData.totalPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">失败时间：</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                >
                  重新支付
                </button>
                <button
                  onClick={() => navigate('/pharmacy/checkout')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                >
                  修改支付方式
                </button>
                <button
                  onClick={handleBackToHome}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                >
                  返回首页
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'timeout' && (
            <div className="text-center">
              <Clock className="w-20 h-20 text-orange-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">支付超时</h2>
              <p className="text-gray-600 mb-6">支付时间已超时，请重新发起支付</p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">订单号：</span>
                    <span className="font-medium">{orderData.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">超时时间：</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600">说明：</span>
                    <span className="font-medium">为了您的资金安全，支付页面已超时，请重新发起支付</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/pharmacy/checkout')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                >
                  重新下单
                </button>
                <button
                  onClick={handleBackToHome}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
                >
                  返回首页
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PharmacyPayment;