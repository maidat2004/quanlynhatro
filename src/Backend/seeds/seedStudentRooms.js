import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import connectDB from '../config/database.js';

dotenv.config();

const address = {
  address: 'Nhà trọ Trang Thông',
  ward: 'Trà Vinh',
  district: 'Trà Vinh',
  city: 'Trà Vinh'
};

const rooms = [
  {
    roomNumber: 'NC101',
    floor: 1,
    area: 30,
    length: 7.5,
    width: 4,
    price: 2500000,
    capacity: 3,
    status: 'available',
    description: 'Phòng riêng rộng ở tầng trệt, có lối đi thuận tiện và không gian sinh hoạt khá thoải mái. Phòng phù hợp cho 2-3 sinh viên muốn ở riêng tư hơn, có thể nấu ăn nhẹ trong phòng và để xe ngay trong khu trọ.',
    amenities: ['Phòng riêng', 'WiFi', 'WC riêng', 'Bếp riêng', 'Chỗ để xe', 'Khu phơi đồ', 'Cửa riêng'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'NC102',
    floor: 1,
    area: 30,
    length: 7.5,
    width: 4,
    price: 2500000,
    capacity: 3,
    status: 'available',
    description: 'Phòng riêng thoáng mát, diện tích rộng hơn phòng trọ thường, phù hợp nhóm nhỏ cần sự yên tĩnh và riêng tư. Phòng có khu bếp riêng, WC riêng và cửa sổ lấy sáng tự nhiên.',
    amenities: ['Phòng riêng', 'WiFi', 'WC riêng', 'Bếp riêng', 'Cửa sổ', 'Chỗ để xe', 'Khu phơi đồ'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P101',
    floor: 1,
    area: 24,
    length: 6,
    width: 4,
    price: 2000000,
    capacity: 3,
    status: 'available',
    description: 'Phòng tầng trệt dễ ra vào, phù hợp 2-3 sinh viên ở ghép để chia chi phí. Phòng có WC riêng, khu bếp nhỏ và vị trí gần chỗ để xe nên thuận tiện cho sinh hoạt hằng ngày.',
    amenities: ['WiFi', 'WC riêng', 'Bếp nhỏ', 'Quạt trần', 'Chỗ để xe', 'Kệ bếp'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P102',
    floor: 1,
    area: 24,
    length: 6,
    width: 4,
    price: 2000000,
    capacity: 3,
    status: 'available',
    description: 'Phòng rộng vừa phải, sạch sẽ và phù hợp cho nhóm 2-3 người. Không gian trong phòng đủ đặt giường, bàn học và khu nấu ăn gọn, thích hợp sinh viên muốn ở lâu dài.',
    amenities: ['WiFi', 'WC riêng', 'Bếp nhỏ', 'Quạt', 'Bàn học', 'Khu phơi đồ'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P103',
    floor: 1,
    area: 24,
    length: 6,
    width: 4,
    price: 2000000,
    capacity: 3,
    status: 'available',
    description: 'Phòng tầng trệt thoáng, chi phí thấp hơn nhóm phòng 2 triệu nhưng vẫn có WC riêng và quạt trần. Phù hợp 2-3 sinh viên cần phòng rộng vừa, dễ di chuyển và gần khu sinh hoạt chung.',
    amenities: ['WiFi', 'WC riêng', 'Quạt trần', 'Chỗ để xe', 'Khu phơi đồ'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P104',
    floor: 1,
    area: 20,
    length: 5,
    width: 4,
    price: 1800000,
    capacity: 2,
    status: 'available',
    description: 'Phòng sạch, gọn và vừa đủ cho 1-2 người ở. Mức giá phù hợp sinh viên cần tiết kiệm nhưng vẫn muốn có WC riêng, WiFi ổn định và không gian học tập cơ bản.',
    amenities: ['WiFi', 'WC riêng', 'Quạt', 'Bàn học', 'Chỗ để xe'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P201',
    floor: 2,
    area: 20,
    length: 5,
    width: 4,
    price: 1800000,
    capacity: 2,
    status: 'available',
    description: 'Phòng tầng 2 yên tĩnh, phù hợp 1-2 sinh viên cần không gian học bài. Phòng có cửa sổ đón gió, WC riêng và khu phơi đồ gần phòng nên sinh hoạt khá thuận tiện.',
    amenities: ['WiFi', 'WC riêng', 'Quạt trần', 'Cửa sổ', 'Khu phơi đồ'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P202',
    floor: 2,
    area: 20,
    length: 5,
    width: 4,
    price: 1800000,
    capacity: 2,
    status: 'available',
    description: 'Phòng gọn, thoáng và phù hợp 1-2 người. Đây là lựa chọn vừa túi tiền cho sinh viên muốn có WC riêng, WiFi và khu vực sinh hoạt đủ dùng trong tháng.',
    amenities: ['WiFi', 'WC riêng', 'Quạt', 'Khu phơi đồ'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P203',
    floor: 2,
    area: 20,
    length: 5,
    width: 4,
    price: 1800000,
    capacity: 2,
    status: 'available',
    description: 'Phòng diện tích vừa, dễ bố trí giường và bàn học cho 1-2 người. Mức giá phù hợp sinh viên muốn tiết kiệm, ưu tiên nơi ở yên tĩnh và có các tiện nghi cơ bản.',
    amenities: ['WiFi', 'WC riêng', 'Quạt', 'Bàn học'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P204',
    floor: 2,
    area: 18,
    length: 4.5,
    width: 4,
    price: 1500000,
    capacity: 2,
    status: 'available',
    description: 'Phòng nhỏ gọn, dễ dọn dẹp, phù hợp 1 người ở thoải mái hoặc 2 người ở tiết kiệm. Phòng có WiFi, quạt và WC riêng, thích hợp sinh viên cần chi phí ổn định.',
    amenities: ['WiFi', 'WC riêng', 'Quạt'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P301',
    floor: 3,
    area: 18,
    length: 4.5,
    width: 4,
    price: 1500000,
    capacity: 2,
    status: 'available',
    description: 'Phòng tầng cao thoáng gió, ít ồn và phù hợp 1-2 người. Khu phơi đồ gần phòng, có WC riêng và WiFi, phù hợp sinh viên cần không gian nghỉ ngơi yên tĩnh.',
    amenities: ['WiFi', 'WC riêng', 'Quạt trần', 'Khu phơi đồ'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P302',
    floor: 3,
    area: 18,
    length: 4.5,
    width: 4,
    price: 1500000,
    capacity: 2,
    status: 'available',
    description: 'Phòng sáng, có cửa sổ và giá mềm cho sinh viên. Phù hợp 1 người ở rộng rãi hoặc 2 người ở tiết kiệm, tiện nghi ở mức cơ bản nhưng đủ dùng hằng ngày.',
    amenities: ['WiFi', 'Quạt', 'Cửa sổ', 'WC riêng'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P303',
    floor: 3,
    area: 15,
    length: 5,
    width: 3,
    price: 1200000,
    capacity: 1,
    status: 'available',
    description: 'Phòng tiết kiệm cho một sinh viên, diện tích nhỏ nhưng dễ sắp xếp đồ đạc. Phòng phù hợp người ở một mình, cần WiFi, quạt và chỗ học tập cơ bản.',
    amenities: ['WiFi', 'Quạt', 'Bàn học', 'WC chung sạch'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P304',
    floor: 3,
    area: 15,
    length: 5,
    width: 3,
    price: 1200000,
    capacity: 1,
    status: 'available',
    description: 'Phòng giá rẻ cho sinh viên muốn tối ưu chi phí sinh hoạt. Diện tích vừa đủ cho một người, có WiFi và quạt, phù hợp người ít đồ và ưu tiên nơi ở yên tĩnh.',
    amenities: ['WiFi', 'Quạt', 'WC chung sạch'],
    images: [],
    currentTenants: []
  },
  {
    roomNumber: 'P305',
    floor: 3,
    area: 15,
    length: 5,
    width: 3,
    price: 1200000,
    capacity: 1,
    status: 'available',
    description: 'Phòng cơ bản có mức giá thấp nhất, phù hợp sinh viên cần một chỗ ở gọn, an toàn và tiết kiệm. Tiện nghi đơn giản nhưng đáp ứng nhu cầu ngủ nghỉ, học tập và dùng WiFi.',
    amenities: ['WiFi', 'Quạt', 'WC chung sạch'],
    images: [],
    currentTenants: []
  }
].map((room) => ({ ...address, ...room }));

const syncStudentRooms = async () => {
  try {
    await connectDB();

    const desiredRoomNumbers = rooms.map((room) => room.roomNumber);
    const existingRooms = await Room.find({ roomNumber: { $in: desiredRoomNumbers } }).lean();
    const existingByNumber = new Map(existingRooms.map((room) => [room.roomNumber, room]));

    let created = 0;
    let updated = 0;

    for (const room of rooms) {
      const existing = existingByNumber.get(room.roomNumber);

      if (existing) {
        await Room.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...room,
              images: existing.images?.length ? existing.images : room.images,
              currentTenants: existing.currentTenants?.length ? existing.currentTenants : room.currentTenants,
              status: existing.currentTenants?.length ? 'occupied' : room.status
            }
          }
        );
        updated += 1;
      } else {
        await Room.create(room);
        created += 1;
      }
    }

    const cleanupResult = await Room.deleteMany({
      roomNumber: /^SV/i,
      $or: [
        { currentTenants: { $exists: false } },
        { currentTenants: { $size: 0 } }
      ]
    });

    const totalRooms = await Room.countDocuments();

    console.log(`Synced ${rooms.length} rooms for Nhà trọ Trang Thông.`);
    console.log(`Created: ${created}. Updated: ${updated}. Total rooms in DB: ${totalRooms}.`);
    console.log(`Removed old sample rooms: ${cleanupResult.deletedCount}.`);
  } catch (error) {
    console.error('Failed to sync student rooms:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

syncStudentRooms();
