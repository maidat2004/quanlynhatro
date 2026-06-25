export const vietnamProvinceOptions = [
  'An Giang',
  'Bắc Ninh',
  'Cà Mau',
  'Cao Bằng',
  'Cần Thơ',
  'Đà Nẵng',
  'Đắk Lắk',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Phòng',
  'Huế',
  'Hưng Yên',
  'Khánh Hòa',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sơn La',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'TP. Hồ Chí Minh',
  'Tuyên Quang',
  'Vĩnh Long'
];

export const currentAddressOptions = [
  'Tại phòng trọ được cấp',
  'Ở cùng gia đình',
  'Ở nhà người thân',
  'Ký túc xá',
  'Trọ khác gần trường',
  'Nhà riêng',
  'Khác'
];

export const occupationOptions = [
  'Sinh viên',
  'Học sinh',
  'Công nhân',
  'Nhân viên văn phòng',
  'Kinh doanh tự do',
  'Người thuê',
  'Khác'
];

export const includeCurrentOption = (options, value) => {
  if (!value || options.includes(value)) return options;
  return [value, ...options];
};

export const parseDateParts = (dateValue) => {
  if (!dateValue) return { day: '', month: '', year: '' };

  const normalized = String(dateValue).slice(0, 10);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { day: '', month: '', year: '' };

  return {
    year: match[1],
    month: match[2],
    day: match[3]
  };
};

export const composeDateValue = ({ day, month, year }) => {
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
};

export const getDaysInMonth = (year, month) => {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
};
