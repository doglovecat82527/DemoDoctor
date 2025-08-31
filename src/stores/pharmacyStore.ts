import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HerbItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  dosage: string;
  quantity: number;
  image?: string;
  category: string;
  effects: string[];
  contraindications?: string[];
}

export interface PrescriptionData {
  patientName?: string;
  symptoms?: string;
  diagnosis?: string;
  herbs: HerbItem[];
  instructions?: string;
  duration?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface OrderData {
  orderNumber: string;
  items: HerbItem[];
  totalPrice: number;
  address: Address;
  paymentMethod: string;
  orderTime: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface PharmacyState {
  // 购物车相关
  cartItems: HerbItem[];
  addToCart: (item: HerbItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // 药方相关
  currentPrescription: PrescriptionData | null;
  setPrescription: (prescription: PrescriptionData) => void;
  clearPrescription: () => void;
  
  // 地址相关
  addresses: Address[];
  selectedAddress: Address | null;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setSelectedAddress: (address: Address) => void;
  
  // 订单相关
  orders: OrderData[];
  currentOrder: OrderData | null;
  createOrder: (orderData: Omit<OrderData, 'orderNumber' | 'orderTime' | 'status'>) => OrderData;
  setCurrentOrder: (order: OrderData) => void;
  
  // 支付相关
  selectedPaymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

// 模拟中药材数据
export const mockHerbs: HerbItem[] = [
  {
    id: '1',
    name: '人参',
    description: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智',
    price: 120,
    unit: '克',
    dosage: '3-9g',
    quantity: 1,
    category: '补益药',
    effects: ['大补元气', '补脾益肺', '生津养血', '安神益智'],
    contraindications: ['实热证', '湿热证']
  },
  {
    id: '2',
    name: '当归',
    description: '补血活血，调经止痛，润肠通便',
    price: 25,
    unit: '克',
    dosage: '6-12g',
    quantity: 1,
    category: '补血药',
    effects: ['补血活血', '调经止痛', '润肠通便'],
    contraindications: ['湿盛中满', '大便溏泄']
  },
  {
    id: '3',
    name: '黄芪',
    description: '补气升阳，固表止汗，利水消肿，生津养血',
    price: 18,
    unit: '克',
    dosage: '9-30g',
    quantity: 1,
    category: '补气药',
    effects: ['补气升阳', '固表止汗', '利水消肿'],
    contraindications: ['表实邪盛', '气滞湿阻']
  },
  {
    id: '4',
    name: '白术',
    description: '健脾益气，燥湿利水，止汗，安胎',
    price: 22,
    unit: '克',
    dosage: '6-12g',
    quantity: 1,
    category: '补气药',
    effects: ['健脾益气', '燥湿利水', '止汗安胎'],
    contraindications: ['阴虚内热', '津液亏耗']
  },
  {
    id: '5',
    name: '茯苓',
    description: '利水渗湿，健脾，宁心',
    price: 15,
    unit: '克',
    dosage: '10-15g',
    quantity: 1,
    category: '利水渗湿药',
    effects: ['利水渗湿', '健脾宁心'],
    contraindications: ['肾虚小便不利', '虚寒精滑']
  },
  {
    id: '6',
    name: '甘草',
    description: '补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药',
    price: 12,
    unit: '克',
    dosage: '2-10g',
    quantity: 1,
    category: '补气药',
    effects: ['补脾益气', '清热解毒', '调和诸药'],
    contraindications: ['湿盛胀满', '浮肿']
  },
  {
    id: '7',
    name: '川芎',
    description: '活血行气，祛风止痛',
    price: 28,
    unit: '克',
    dosage: '3-10g',
    quantity: 1,
    category: '活血化瘀药',
    effects: ['活血行气', '祛风止痛'],
    contraindications: ['阴虚火旺', '上盛下虚']
  },
  {
    id: '8',
    name: '白芍',
    description: '养血调经，敛阴止汗，柔肝止痛，平抑肝阳',
    price: 20,
    unit: '克',
    dosage: '6-15g',
    quantity: 1,
    category: '补血药',
    effects: ['养血调经', '柔肝止痛', '平抑肝阳'],
    contraindications: ['虚寒腹痛泄泻']
  },
  {
    id: '9',
    name: '熟地黄',
    description: '滋阴补血，益精填髓',
    price: 32,
    unit: '克',
    dosage: '10-30g',
    quantity: 1,
    category: '补血药',
    effects: ['滋阴补血', '益精填髓'],
    contraindications: ['脾胃虚弱', '痰湿内盛']
  },
  {
    id: '10',
    name: '党参',
    description: '补中益气，健脾益肺',
    price: 24,
    unit: '克',
    dosage: '9-30g',
    quantity: 1,
    category: '补气药',
    effects: ['补中益气', '健脾益肺'],
    contraindications: ['气滞', '怒火']
  },
  {
    id: '11',
    name: '柴胡',
    description: '疏散退热，疏肝解郁，升举阳气',
    price: 18,
    unit: '克',
    dosage: '3-12g',
    quantity: 1,
    category: '解表药',
    effects: ['疏散退热', '疏肝解郁', '升举阳气'],
    contraindications: ['肝阳上亢', '肝风内动']
  },
  {
    id: '12',
    name: '黄芩',
    description: '清热燥湿，泻火解毒，止血，安胎',
    price: 16,
    unit: '克',
    dosage: '3-12g',
    quantity: 1,
    category: '清热药',
    effects: ['清热燥湿', '泻火解毒', '止血安胎'],
    contraindications: ['脾胃虚寒']
  },
  {
    id: '13',
    name: '连翘',
    description: '清热解毒，消肿散结',
    price: 14,
    unit: '克',
    dosage: '6-15g',
    quantity: 1,
    category: '清热药',
    effects: ['清热解毒', '消肿散结'],
    contraindications: ['脾胃虚弱', '气虚发热']
  },
  {
    id: '14',
    name: '金银花',
    description: '清热解毒，疏散风热',
    price: 22,
    unit: '克',
    dosage: '6-15g',
    quantity: 1,
    category: '清热药',
    effects: ['清热解毒', '疏散风热'],
    contraindications: ['脾胃虚寒', '泄泻']
  },
  {
    id: '15',
    name: '桔梗',
    description: '宣肺，利咽，祛痰，排脓',
    price: 12,
    unit: '克',
    dosage: '3-9g',
    quantity: 1,
    category: '化痰药',
    effects: ['宣肺利咽', '祛痰排脓'],
    contraindications: ['阴虚久咳', '气逆']
  },
  {
    id: '16',
    name: '陈皮',
    description: '理气健脾，燥湿化痰',
    price: 10,
    unit: '克',
    dosage: '3-9g',
    quantity: 1,
    category: '理气药',
    effects: ['理气健脾', '燥湿化痰'],
    contraindications: ['气虚', '阴虚燥咳']
  },
  {
    id: '17',
    name: '半夏',
    description: '燥湿化痰，降逆止呕，消痞散结',
    price: 15,
    unit: '克',
    dosage: '3-9g',
    quantity: 1,
    category: '化痰药',
    effects: ['燥湿化痰', '降逆止呕', '消痞散结'],
    contraindications: ['阴虚燥咳', '津伤口渴']
  },
  {
    id: '18',
    name: '桂枝',
    description: '发汗解肌，温通经脉，助阳化气',
    price: 8,
    unit: '克',
    dosage: '3-9g',
    quantity: 1,
    category: '解表药',
    effects: ['发汗解肌', '温通经脉', '助阳化气'],
    contraindications: ['温热病', '阴虚火旺']
  },
  {
    id: '19',
    name: '麦冬',
    description: '养阴生津，润肺清心',
    price: 26,
    unit: '克',
    dosage: '6-12g',
    quantity: 1,
    category: '补阴药',
    effects: ['养阴生津', '润肺清心'],
    contraindications: ['脾胃虚寒', '泄泻']
  },
  {
    id: '20',
    name: '丹参',
    description: '活血祛瘀，通经止痛，清心除烦，凉血消痈',
    price: 18,
    unit: '克',
    dosage: '6-15g',
    quantity: 1,
    category: '活血化瘀药',
    effects: ['活血祛瘀', '通经止痛', '清心除烦'],
    contraindications: ['无瘀血者', '孕妇慎用']
  }
];

// 模拟地址数据
const mockAddresses: Address[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路88号SOHO现代城A座1001室',
    isDefault: true
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '陆家嘴环路1000号恒生银行大厦20楼',
    isDefault: false
  }
];

export const usePharmacyStore = create<PharmacyState>()(persist(
  (set, get) => ({
    // 购物车状态
    cartItems: [],
    
    addToCart: (item: HerbItem) => {
      const { cartItems } = get();
      const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        set({
          cartItems: cartItems.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          )
        });
      } else {
        set({ cartItems: [...cartItems, item] });
      }
    },
    
    removeFromCart: (itemId: string) => {
      set({
        cartItems: get().cartItems.filter(item => item.id !== itemId)
      });
    },
    
    updateCartItemQuantity: (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        get().removeFromCart(itemId);
        return;
      }
      
      set({
        cartItems: get().cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      });
    },
    
    clearCart: () => {
      set({ cartItems: [] });
    },
    
    getCartTotal: () => {
      return get().cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getCartItemCount: () => {
      return get().cartItems.reduce((count, item) => count + item.quantity, 0);
    },
    
    // 药方状态
    currentPrescription: null,
    
    setPrescription: (prescription: PrescriptionData) => {
      set({ currentPrescription: prescription });
    },
    
    clearPrescription: () => {
      set({ currentPrescription: null });
    },
    
    // 地址状态
    addresses: mockAddresses,
    selectedAddress: mockAddresses[0],
    
    addAddress: (address: Omit<Address, 'id'>) => {
      const newAddress: Address = {
        ...address,
        id: Date.now().toString()
      };
      
      set({
        addresses: [...get().addresses, newAddress]
      });
    },
    
    updateAddress: (id: string, addressUpdate: Partial<Address>) => {
      set({
        addresses: get().addresses.map(addr =>
          addr.id === id ? { ...addr, ...addressUpdate } : addr
        )
      });
    },
    
    deleteAddress: (id: string) => {
      const { addresses, selectedAddress } = get();
      const newAddresses = addresses.filter(addr => addr.id !== id);
      
      set({
        addresses: newAddresses,
        selectedAddress: selectedAddress?.id === id ? newAddresses[0] || null : selectedAddress
      });
    },
    
    setSelectedAddress: (address: Address) => {
      set({ selectedAddress: address });
    },
    
    // 订单状态
    orders: [],
    currentOrder: null,
    
    createOrder: (orderData: Omit<OrderData, 'orderNumber' | 'orderTime' | 'status'>) => {
      const orderNumber = `TCM${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const newOrder: OrderData = {
        ...orderData,
        orderNumber,
        orderTime: new Date().toISOString(),
        status: 'pending'
      };
      
      set({
        orders: [...get().orders, newOrder],
        currentOrder: newOrder
      });
      
      return newOrder;
    },
    
    setCurrentOrder: (order: OrderData) => {
      set({ currentOrder: order });
    },
    
    // 支付状态
    selectedPaymentMethod: 'alipay',
    
    setPaymentMethod: (method: string) => {
      set({ selectedPaymentMethod: method });
    }
  }),
  {
    name: 'pharmacy-store',
    partialize: (state) => ({
      cartItems: state.cartItems,
      addresses: state.addresses,
      selectedAddress: state.selectedAddress,
      orders: state.orders,
      selectedPaymentMethod: state.selectedPaymentMethod
    })
  }
));