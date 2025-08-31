import { create } from 'zustand';

export interface Doctor {
  id: string;
  name: string;
  experience: number; // 医龄
  specialties: string[]; // 擅长领域
  hospital: string; // 医院/诊所
  address?: string; // 地址（本地问诊）
  distance?: string; // 距离（本地问诊）
  onlineConsultations?: number; // 在线问诊次数
  fee: number; // 挂号费用
  rating: number; // 评分
  avatar: string;
  type: 'local' | 'online';
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  symptoms: string;
  diagnosis: string;
  appointmentTime: string;
  type: 'local' | 'online';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  notes?: string;
}

interface AppointmentStore {
  doctors: Doctor[];
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => string;
  getDoctorById: (id: string) => Doctor | undefined;
  getAppointmentById: (id: string) => Appointment | undefined;
}

// 模拟医生数据
const mockDoctors: Doctor[] = [
  // 本地问诊医生
  {
    id: 'local_1',
    name: '张明华',
    experience: 15,
    specialties: ['脾胃病', '消化系统', '中医内科'],
    hospital: '北京中医医院',
    address: '北京市东城区美术馆后街23号',
    distance: '2.3公里',
    fee: 120,
    rating: 4.8,
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20male%20middle%20aged%20wearing%20white%20coat%20friendly%20smile&image_size=square',
    type: 'local'
  },
  {
    id: 'local_2',
    name: '李慧敏',
    experience: 22,
    specialties: ['心血管疾病', '高血压', '中医养生'],
    hospital: '东直门医院',
    address: '北京市东城区海运仓5号',
    distance: '3.7公里',
    fee: 150,
    rating: 4.9,
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20female%20middle%20aged%20wearing%20white%20coat%20kind%20expression&image_size=square',
    type: 'local'
  },
  {
    id: 'local_3',
    name: '王建国',
    experience: 18,
    specialties: ['呼吸系统', '咳嗽', '肺部疾病'],
    hospital: '广安门医院',
    address: '北京市西城区北线阁5号',
    distance: '5.1公里',
    fee: 100,
    rating: 4.7,
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20male%20senior%20wearing%20white%20coat%20experienced%20look&image_size=square',
    type: 'local'
  },
  // 在线问诊医生
  {
    id: 'online_1',
    name: '陈雅琴',
    experience: 12,
    specialties: ['妇科疾病', '月经不调', '中医妇科'],
    hospital: '北京妇产医院',
    onlineConsultations: 1580,
    fee: 80,
    rating: 4.6,
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20female%20young%20wearing%20white%20coat%20gentle%20smile&image_size=square',
    type: 'online'
  },
  {
    id: 'online_2',
    name: '刘志强',
    experience: 25,
    specialties: ['骨科疾病', '关节炎', '中医正骨'],
    hospital: '中国中医科学院',
    onlineConsultations: 2340,
    fee: 120,
    rating: 4.8,
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20male%20experienced%20wearing%20white%20coat%20confident%20expression&image_size=square',
    type: 'online'
  },
  {
    id: 'online_3',
    name: '赵美玲',
    experience: 16,
    specialties: ['皮肤疾病', '湿疹', '中医皮科'],
    hospital: '北京皮肤病医院',
    onlineConsultations: 980,
    fee: 90,
    rating: 4.5,
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20doctor%20portrait%20female%20middle%20aged%20wearing%20white%20coat%20caring%20expression&image_size=square',
    type: 'online'
  }
];

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  doctors: mockDoctors,
  appointments: [],
  currentAppointment: null,
  
  addAppointment: (appointmentData) => {
    const id = `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const appointment: Appointment = {
      ...appointmentData,
      id,
      status: 'pending'
    };
    
    set((state) => ({
      appointments: [...state.appointments, appointment],
      currentAppointment: appointment
    }));
    
    return id;
  },
  
  getDoctorById: (id) => {
    return get().doctors.find(doctor => doctor.id === id);
  },
  
  getAppointmentById: (id) => {
    return get().appointments.find(appointment => appointment.id === id);
  }
}));