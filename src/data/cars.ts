export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine: string;
  fuel: 'Бензин' | 'Дизель' | 'Електро' | 'Гібрид' | 'Газ/Бензин';
  transmission: 'Автомат' | 'Механіка';
  city: string;
  images: string[];
  description: string;
  features: string[];
  isVerified: boolean;
  status: 'available' | 'sold';
}

export const CARS_DATA: Car[] = [
  {
    id: '1',
    make: 'BMW',
    model: 'X5',
    year: 2018,
    price: 45000,
    mileage: 85000,
    engine: '3.0L',
    fuel: 'Дизель',
    transmission: 'Автомат',
    city: 'Київ',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1556182330-ad254d32e9ff?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Офіційне авто, перший власник. Повна сервісна історія. Жодного підкрасу.',
    features: ['Шкіряний салон', 'Панорамний дах', 'Адаптивний круїз'],
    isVerified: true,
    status: 'available'
  },
  {
    id: '2',
    make: 'Audi',
    model: 'A6',
    year: 2019,
    price: 38000,
    mileage: 62000,
    engine: '2.0L',
    fuel: 'Бензин',
    transmission: 'Автомат',
    city: 'Львів',
    images: [
      'https://images.unsplash.com/photo-1606154316972-23910f5451ec?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Ідеальний стан, S-line пакет. Пригнана з Німеччини.',
    features: ['Matrix LED', 'Virtual Cockpit', 'B&O Sound'],
    isVerified: true,
    status: 'available'
  },
  {
    id: '3',
    make: 'Tesla',
    model: 'Model 3',
    year: 2021,
    price: 32000,
    mileage: 45000,
    engine: 'Electric',
    fuel: 'Електро',
    transmission: 'Автомат',
    city: 'Одеса',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Long Range. Стан нового авто. Автопілот активний.',
    features: ['Autopilot', 'Premium Interior', 'Glass Roof'],
    isVerified: true,
    status: 'available'
  },
  {
    id: '4',
    make: 'Volkswagen',
    model: 'Passat B8',
    year: 2017,
    price: 18500,
    mileage: 145000,
    engine: '2.0L',
    fuel: 'Дизель',
    transmission: 'Автомат',
    city: 'Київ',
    images: [
      'https://images.unsplash.com/photo-1621508611110-891d9e2617f6?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Економний та надійний автомобіль. Максимальна комплектація Highline.',
    features: ['Webasto', 'ErgoComfort', 'LED High'],
    isVerified: true,
    status: 'available'
  },
  {
    id: '5',
    make: 'Toyota',
    model: 'RAV4',
    year: 2020,
    price: 31000,
    mileage: 55000,
    engine: '2.5L Hybrid',
    fuel: 'Гібрид',
    transmission: 'Автомат',
    city: 'Дніпро',
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Гібридна версія, дуже економна. Обслуговування тільки на офіційному сервісі.',
    features: ['Hybrid Tech', 'Safety Sense', 'CarPlay'],
    isVerified: true,
    status: 'available'
  },
  {
    id: '6',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2016,
    price: 27500,
    mileage: 180000,
    engine: '2.0L',
    fuel: 'Дизель',
    transmission: 'Автомат',
    city: 'Київ',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'W213 кузов. Елегантний та комфортний. Хороша комплектація.',
    features: ['Widescreen', 'Ambient Light', 'Parking Pilot'],
    isVerified: true,
    status: 'available'
  }
];
