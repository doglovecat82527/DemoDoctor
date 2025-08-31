import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Smartphone, Banknote, Shield } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  dosage: string;
  price: number;
  unit: string;
  quantity: number;
  description: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

const PharmacyCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: ''
  });

  // 模拟地址数据
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      name: '张先生',
      phone: '138****8888',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '三里屯街道工体北路8号院',
      isDefault: true
    },
    {
      id: '2',
      name: '李女士',
      phone: '139****9999',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴金融贸易区世纪大道100号',
      isDefault: false
    }
  ]);

  useEffect(() => {
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
    } else {
      // 如果没有购物车数据，返回购物车页面
      navigate('/pharmacy/cart');
    }
    
    // 设置默认地址
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [location.state, navigate, addresses]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = totalPrice >= 99 ? 0 : 10;
  const finalPrice = totalPrice + deliveryFee;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: false
    };
    setSelectedAddress(address);
    setShowAddressForm(false);
    setNewAddress({
      name: '',
      phone: '',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: ''
    });
  };

  const handlePayment = () => {
    if (!selectedAddress) {
      alert('请选择收货地址');
      return;
    }
    
    // 模拟支付处理
    const orderData = {
      items: cartItems,
      address: selectedAddress,
      paymentMethod,
      totalPrice: finalPrice,
      orderNumber: `TCM${Date.now()}`,
      orderTime: new Date().toISOString()
    };
    
    navigate('/pharmacy/payment', { state: { orderData } });
  };

  const paymentMethods = [
    { id: 'alipay', name: '支付宝', icon: '💰', description: '推荐使用' },
    { id: 'wechat', name: '微信支付', icon: '💚', description: '安全便捷' },
    { id: 'unionpay', name: '银联支付', icon: '💳', description: '银行卡支付' },
    { id: 'cod', name: '货到付款', icon: '📦', description: '验货后付款' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      {/* 头部导航 */}
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/pharmacy/cart')}
                className="text-yellow-200 hover:text-white transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回购物车</span>
              </button>
              <h1 className="text-xl font-bold text-yellow-200">确认订单</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-yellow-200">
              <Shield className="w-5 h-5" />
              <span className="text-sm">安全支付</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 收货地址 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  收货地址
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  {showAddressForm ? '取消' : '新增地址'}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="收货人姓名"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="手机号码"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <select
                      value={newAddress.province}
                      onChange={(e) => setNewAddress({...newAddress, province: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="北京市">北京市</option>
                      <option value="上海市">上海市</option>
                      <option value="广东省">广东省</option>
                      <option value="浙江省">浙江省</option>
                    </select>
                    <input
                      type="text"
                      placeholder="详细地址"
                      value={newAddress.detail}
                      onChange={(e) => setNewAddress({...newAddress, detail: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      保存地址
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {addresses.map(address => (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddress(address)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress?.id === address.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800">{address.name}</span>
                          <span className="text-gray-600">{address.phone}</span>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">默认</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {address.province} {address.city} {address.district} {address.detail}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAddress?.id === address.id
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAddress?.id === address.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 支付方式 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                支付方式
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800">{method.name}</div>
                          <div className="text-sm text-gray-500">{method.description}</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        paymentMethod === method.id
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧订单信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">订单信息</h3>
              
              {/* 商品列表 */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-gray-500">{item.dosage} × {item.quantity}</div>
                    </div>
                    <div className="font-medium text-gray-800">
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 费用明细 */}
              <div className="space-y-2 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">商品总价</span>
                  <span className="font-medium">¥{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">配送费</span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {deliveryFee === 0 ? '免费' : `¥${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">应付总额</span>
                  <span className="font-bold text-xl text-green-600">¥{finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
              >
                立即支付 ¥{finalPrice.toFixed(2)}
              </button>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-1 text-sm">💡 温馨提示</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• 请确认收货地址和联系方式</li>
                  <li>• 中药材均为正品保证</li>
                  <li>• 支持7天无理由退换货</li>
                  <li>• 如有疑问请联系客服</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacyCheckout;