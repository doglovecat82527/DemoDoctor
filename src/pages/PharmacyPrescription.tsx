import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, Plus, Minus, ArrowLeft } from 'lucide-react';
import { usePharmacyStore, HerbItem, PrescriptionData } from '../stores/pharmacyStore';
import { parsePrescriptionFromURL } from '../utils/prescriptionParser';

interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  price: number;
  unit: string;
  quantity: number;
  description: string;
}

const PharmacyPrescription: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [prescriptionText, setPrescriptionText] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [cartItems, setCartItems] = useState<PrescriptionItem[]>([]);
  
  const { 
    addToCart, 
    setPrescription, 
    getCartItemCount 
  } = usePharmacyStore();

  useEffect(() => {
    // 从URL参数解析药方数据
    const parsedPrescription = parsePrescriptionFromURL(searchParams);
    
    if (parsedPrescription) {
      const prescription = searchParams.get('prescription');
      if (prescription) {
        const decodedPrescription = decodeURIComponent(prescription);
        setPrescriptionText(decodedPrescription);
        
        // 使用解析器返回的药材数据，转换为PrescriptionItem格式
        const items: PrescriptionItem[] = parsedPrescription.herbs.map((herb, index) => ({
          id: herb.id || `herb_${index}`,
          name: herb.name,
          dosage: herb.dosage,
          price: herb.price,
          unit: herb.unit,
          quantity: herb.quantity,
          description: herb.description
        }));
        
        setPrescriptionItems(items);
      }
      setPrescription(parsedPrescription);
    } else {
      const prescription = searchParams.get('prescription');
      if (prescription) {
        const decodedPrescription = decodeURIComponent(prescription);
        setPrescriptionText(decodedPrescription);
        parsePrescription(decodedPrescription);
      }
    }
  }, [searchParams, setPrescription]);

  // 解析药方文本，提取药材信息
  const parsePrescription = (text: string) => {
    // 模拟解析药方，实际项目中可能需要更复杂的解析逻辑
    const commonHerbs = [
      { name: '人参', price: 128, unit: '10g', description: '补气固脱，健脾益肺' },
      { name: '当归', price: 45, unit: '15g', description: '补血活血，调经止痛' },
      { name: '黄芪', price: 32, unit: '20g', description: '补气升阳，固表止汗' },
      { name: '白术', price: 25, unit: '12g', description: '健脾益气，燥湿利水' },
      { name: '茯苓', price: 22, unit: '15g', description: '利水渗湿，健脾宁心' },
      { name: '甘草', price: 18, unit: '6g', description: '补脾益气，清热解毒' },
      { name: '川芎', price: 38, unit: '10g', description: '活血行气，祛风止痛' },
      { name: '白芍', price: 35, unit: '12g', description: '养血调经，敛阴止汗' },
      { name: '熟地黄', price: 42, unit: '15g', description: '滋阴补血，益精填髓' },
      { name: '枸杞子', price: 28, unit: '10g', description: '滋补肝肾，益精明目' }
    ];

    const items: PrescriptionItem[] = [];
    
    // 根据药方文本匹配药材
    commonHerbs.forEach((herb, index) => {
      if (text.includes(herb.name)) {
        // 尝试提取剂量信息
        const dosageMatch = text.match(new RegExp(`${herb.name}[\s]*([0-9]+[g克]?)`, 'i'));
        const dosage = dosageMatch ? dosageMatch[1] : herb.unit;
        
        items.push({
          id: `herb_${index}`,
          name: herb.name,
          dosage: dosage,
          price: herb.price,
          unit: herb.unit,
          quantity: 1,
          description: herb.description
        });
      }
    });

    // 如果没有匹配到具体药材，添加一些常用的
    if (items.length === 0) {
      items.push(
        {
          id: 'herb_default_1',
          name: '人参',
          dosage: '10g',
          price: 128,
          unit: '10g',
          quantity: 1,
          description: '补气固脱，健脾益肺'
        },
        {
          id: 'herb_default_2',
          name: '当归',
          dosage: '15g',
          price: 45,
          unit: '15g',
          quantity: 1,
          description: '补血活血，调经止痛'
        },
        {
          id: 'herb_default_3',
          name: '黄芪',
          dosage: '20g',
          price: 32,
          unit: '20g',
          quantity: 1,
          description: '补气升阳，固表止汗'
        }
      );
    }

    setPrescriptionItems(items);
  };

  const updateQuantity = (id: string, change: number) => {
    setPrescriptionItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleAddToCart = (item: PrescriptionItem) => {
    const herbItem = { 
      ...item, 
      quantity: item.quantity,
      category: '处方药材',
      effects: [item.description || '按医嘱使用']
    };
    addToCart(herbItem);
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        return [...prev, herbItem];
      }
    });
  };

  const addAllToCart = () => {
    prescriptionItems.forEach(item => {
      handleAddToCart(item);
    });
    navigate('/pharmacy/cart');
  };

  const totalPrice = prescriptionItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
                <span>返回诊断</span>
              </button>
              <h1 className="text-xl font-bold text-yellow-200">AI智能配药</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-green-600 rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/pharmacy/cart')}
                className="p-2 hover:bg-green-600 rounded-lg transition-colors relative"
                title="购物车"
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 药方信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">AI诊断药方</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {prescriptionText || '暂无药方信息'}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 温馨提示</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 请按医嘱服用，不可随意增减剂量</li>
                  <li>• 孕妇、儿童用药请咨询专业医师</li>
                  <li>• 如有不适反应请立即停药就医</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 药材列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">配药清单</h2>
                <div className="text-right">
                  <div className="text-sm text-gray-600">总计</div>
                  <div className="text-2xl font-bold text-green-600">¥{totalPrice.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-4">
                {prescriptionItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-green-600 font-medium">用量: {item.dosage}</span>
                          <span className="text-sm text-gray-500">单价: ¥{item.price}/{item.unit}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
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
                        
                        <div className="text-right">
                          <div className="font-bold text-gray-800">¥{(item.price * item.quantity).toFixed(2)}</div>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="mt-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            加入购物车
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={addAllToCart}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingCart className="w-5 h-5" />
                  全部加入购物车 (¥{totalPrice.toFixed(2)})
                </button>
                
                <button
                  onClick={() => navigate('/pharmacy/home')}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                >
                  继续选购其他药材
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacyPrescription;