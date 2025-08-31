import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, Phone, Calendar, Clock, ArrowLeft, Download, Share2 } from 'lucide-react';

interface OrderData {
  items: any[];
  address: any;
  paymentMethod: string;
  totalPrice: number;
  orderNumber: string;
  orderTime: string;
}

const PharmacyOrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
      
      // 计算预计送达时间（当前时间 + 1-2天）
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 2) + 1);
      setEstimatedDelivery(deliveryDate.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }));
    } else {
      navigate('/pharmacy/cart');
    }
  }, [location.state, navigate]);

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'alipay': '支付宝',
      'wechat': '微信支付',
      'unionpay': '银联支付',
      'cod': '货到付款'
    };
    return methods[method] || method;
  };

  const handleDownloadReceipt = () => {
    // 模拟下载收据
    alert('收据下载功能开发中...');
  };

  const handleShareOrder = () => {
    // 模拟分享订单
    if (navigator.share) {
      navigator.share({
        title: '中药配药订单',
        text: `我在AI智能配药平台下单了，订单号：${orderData?.orderNumber}`,
        url: window.location.href
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(`订单号：${orderData?.orderNumber}`);
      alert('订单信息已复制到剪贴板');
    }
  };

  const orderSteps = [
    { id: 1, name: '订单确认', icon: CheckCircle, status: 'completed', time: '刚刚' },
    { id: 2, name: '药材配制', icon: Package, status: 'current', time: '预计30分钟' },
    { id: 3, name: '质量检验', icon: CheckCircle, status: 'upcoming', time: '预计1小时' },
    { id: 4, name: '配送发货', icon: Truck, status: 'upcoming', time: '预计2小时' }
  ];

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
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
              <button
                onClick={() => navigate('/')}
                className="text-yellow-200 hover:text-white transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回首页</span>
              </button>
              <h1 className="text-xl font-bold text-yellow-200">订单详情</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownloadReceipt}
                className="p-2 hover:bg-green-600 rounded-lg transition-colors"
                title="下载收据"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleShareOrder}
                className="p-2 hover:bg-green-600 rounded-lg transition-colors"
                title="分享订单"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 成功提示 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">订单提交成功！</h2>
            <p className="text-gray-600 mb-4">感谢您选择AI智能配药服务，我们将为您精心配制每一味药材</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <div className="text-sm text-gray-600">订单号</div>
              <div className="text-xl font-bold text-green-600">{orderData.orderNumber}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 订单进度 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">订单进度</h3>
              <div className="space-y-4">
                {orderSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'current' ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          step.status === 'completed' ? 'text-green-600' :
                          step.status === 'current' ? 'text-blue-600' :
                          'text-gray-400'
                        }`}>
                          {step.name}
                        </div>
                        <div className="text-sm text-gray-500">{step.time}</div>
                      </div>
                      {step.status === 'current' && (
                        <div className="flex-shrink-0">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 商品信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">商品信息</h3>
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-green-600 font-medium">用量: {item.dosage}</span>
                        <span className="text-gray-500">数量: {item.quantity}</span>
                        <span className="text-gray-500">单价: ¥{item.price}/{item.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">¥{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 配送信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-green-600" />
                配送信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-800">收货地址</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>{orderData.address.name} {orderData.address.phone}</div>
                        <div>{orderData.address.province} {orderData.address.city} {orderData.address.district}</div>
                        <div>{orderData.address.detail}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-800">预计送达</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="text-green-600 font-medium">{estimatedDelivery}</div>
                        <div>上午9:00 - 下午18:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧订单摘要 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">订单摘要</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">订单号</span>
                  <span className="font-medium">{orderData.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">下单时间</span>
                  <span className="font-medium">{new Date(orderData.orderTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">支付方式</span>
                  <span className="font-medium">{getPaymentMethodName(orderData.paymentMethod)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">商品数量</span>
                  <span className="font-medium">{orderData.items.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">支付金额</span>
                    <span className="font-bold text-xl text-green-600">¥{orderData.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/pharmacy/home')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                >
                  继续选购
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                >
                  返回AI诊断
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  客服联系
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>客服热线：400-888-9999</div>
                  <div>服务时间：9:00-21:00</div>
                  <div>微信客服：TCM_Service</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 温馨提示</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 药材均经过严格质检</li>
                  <li>• 支持7天无理由退换</li>
                  <li>• 请按医嘱正确服用</li>
                  <li>• 如有不适请及时就医</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacyOrderSuccess;