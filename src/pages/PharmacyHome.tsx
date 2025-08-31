import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Star, Clock, Truck } from 'lucide-react';

interface HerbProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  rating: number;
  sales: number;
  description: string;
  category: string;
}

const PharmacyHome: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模拟中药材数据
  const herbProducts: HerbProduct[] = [
    {
      id: '1',
      name: '人参',
      price: 128,
      unit: '50g',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=ginseng%20root%20traditional%20chinese%20medicine%20herb%20on%20white%20background&image_size=square',
      rating: 4.8,
      sales: 1256,
      description: '补气固脱，健脾益肺，宁心益智，养血生津',
      category: '补益类'
    },
    {
      id: '2',
      name: '当归',
      price: 45,
      unit: '100g',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=angelica%20sinensis%20traditional%20chinese%20medicine%20herb%20dried%20slices&image_size=square',
      rating: 4.7,
      sales: 892,
      description: '补血活血，调经止痛，润肠通便',
      category: '补血类'
    },
    {
      id: '3',
      name: '黄芪',
      price: 32,
      unit: '100g',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=astragalus%20root%20traditional%20chinese%20medicine%20herb%20slices&image_size=square',
      rating: 4.6,
      sales: 1034,
      description: '补气升阳，固表止汗，利水消肿',
      category: '补气类'
    },
    {
      id: '4',
      name: '枸杞子',
      price: 28,
      unit: '250g',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=goji%20berries%20wolfberry%20traditional%20chinese%20medicine%20red%20dried&image_size=square',
      rating: 4.9,
      sales: 2156,
      description: '滋补肝肾，益精明目',
      category: '补益类'
    },
    {
      id: '5',
      name: '甘草',
      price: 18,
      unit: '100g',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=licorice%20root%20traditional%20chinese%20medicine%20herb%20slices&image_size=square',
      rating: 4.5,
      sales: 756,
      description: '补脾益气，清热解毒，祛痰止咳',
      category: '清热类'
    },
    {
      id: '6',
      name: '川芎',
      price: 38,
      unit: '100g',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=ligusticum%20chuanxiong%20traditional%20chinese%20medicine%20herb%20rhizome&image_size=square',
      rating: 4.4,
      sales: 623,
      description: '活血行气，祛风止痛',
      category: '活血类'
    }
  ];

  const categories = [
    { id: 'all', name: '全部' },
    { id: '补益类', name: '补益类' },
    { id: '补血类', name: '补血类' },
    { id: '补气类', name: '补气类' },
    { id: '清热类', name: '清热类' },
    { id: '活血类', name: '活血类' }
  ];

  const filteredProducts = herbProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId: string) => {
    navigate(`/pharmacy/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      {/* 头部导航 */}
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-yellow-200 hover:text-white transition-colors"
              >
                ← 返回诊断
              </button>
              <h1 className="text-xl font-bold text-yellow-200">德仁堂在线药房</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-green-600 rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/pharmacy/cart')}
                className="p-2 hover:bg-green-600 rounded-lg transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 搜索栏 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索中药材..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 特色服务 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">快速配药</h3>
            <p className="text-gray-600 text-sm">专业药师30分钟内完成配药</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">品质保证</h3>
            <p className="text-gray-600 text-sm">正宗道地药材，质量有保障</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">送药上门</h3>
            <p className="text-gray-600 text-sm">同城2小时内免费配送</p>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 药材列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            >
              <div className="aspect-square bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA1LjUyMyA3MCAxMTAgNzQuNDc3IDExMCA4MFYxMjBDMTEwIDEyNS41MjMgMTA1LjUyMyAxMzAgMTAwIDEzMEM5NC40NzcgMTMwIDkwIDEyNS41MjMgOTAgMTIwVjgwQzkwIDc0LjQ3NyA5NC40NzcgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNzAgMTAwQzc1LjUyMyAxMDAgODAgOTUuNTIzIDgwIDkwSDEyMEMxMjUuNTIzIDkwIDEzMCA5NC40NzcgMTMwIDEwMEMxMzAgMTA1LjUyMyAxMjUuNTIzIDExMCAxMjAgMTEwSDgwQzc0LjQ3NyAxMTAgNzAgMTA1LjUyMyA3MCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.sales})</span>
                  </div>
                  <span className="text-sm text-gray-500">{product.unit}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">¥{product.price}</span>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    加入购物车
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PharmacyHome;