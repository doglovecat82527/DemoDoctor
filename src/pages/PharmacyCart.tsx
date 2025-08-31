import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Package, User } from 'lucide-react';
import { usePharmacyStore, HerbItem } from '../stores/pharmacyStore';

interface CartItem {
  id: string;
  name: string;
  dosage: string;
  price: number;
  unit: string;
  quantity: number;
  description: string;
}

const PharmacyCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    cartItems, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = usePharmacyStore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 购物车为空时的处理
  const isEmpty = cartItems.length === 0;

  useEffect(() => {
    // 初始化选中所有商品
    setSelectedItems(cartItems.map(item => item.id));
  }, [cartItems]);

  const updateQuantity = (id: string, change: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateCartItemQuantity(id, newQuantity);
    }
  };

  const removeItem = (id: string) => {
    removeFromCart(id);
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert('请选择要结算的商品');
      return;
    }
    // 传递选中的商品数据到结算页面
    navigate('/pharmacy/checkout', {
      state: {
        cartItems: selectedCartItems
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      {/* 头部导航 */}
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-yellow-200 hover:text-white transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回</span>
              </button>
              <h1 className="text-xl font-bold text-yellow-200">购物车 ({getCartItemCount()})</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-green-600 rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-yellow-200">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm">{cartItems.length}件商品</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          // 空购物车状态
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-lg p-12 max-w-md mx-auto">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">购物车是空的</h2>
              <p className="text-gray-500 mb-6">快去选购您需要的中药材吧</p>
              <button
                onClick={() => navigate('/pharmacy/home')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                去选购
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 购物车商品列表 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg">
                {/* 全选头部 */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700 font-medium">全选 ({cartItems.length})</span>
                    </label>
                    <div className="text-sm text-gray-500">
                      已选择 {selectedItems.length} 件商品
                    </div>
                  </div>
                </div>

                {/* 商品列表 */}
                <div className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-green-600 font-medium">用量: {item.dosage}</span>
                                <span className="text-sm text-gray-500">单价: ¥{item.price}/{item.unit}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              {/* 数量控制 */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* 价格 */}
                              <div className="text-right min-w-[80px]">
                                <div className="font-bold text-gray-800">¥{(item.price * item.quantity).toFixed(2)}</div>
                              </div>
                              
                              {/* 删除按钮 */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 结算信息 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">结算信息</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">商品数量</span>
                    <span className="font-medium">{totalQuantity} 件</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">商品总价</span>
                    <span className="font-medium">¥{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">配送费</span>
                    <span className="font-medium text-green-600">免费</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800">合计</span>
                      <span className="font-bold text-xl text-green-600">¥{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                >
                  去结算 ({selectedItems.length})
                </button>
                
                <button
                  onClick={() => navigate('/pharmacy/home')}
                  className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                >
                  继续选购
                </button>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🚚 配送服务</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 满99元免配送费</li>
                    <li>• 当日下单，次日送达</li>
                    <li>• 专业药师质量把关</li>
                    <li>• 支持货到付款</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PharmacyCart;