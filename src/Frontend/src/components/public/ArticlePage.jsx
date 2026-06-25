import {
  AlertTriangle,
  Banknote,
  Clock,
  DoorOpen,
  Home,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench
} from 'lucide-react';

const rules = [
  {
    title: 'Giờ giấc sinh hoạt',
    icon: Clock,
    items: [
      'Giữ yên lặng sau 22:00 để không ảnh hưởng đến các phòng xung quanh.',
      'Không mở nhạc, hát karaoke hoặc tụ tập gây ồn trong khu trọ.',
      'Ra vào khu trọ cần đóng cổng cẩn thận, đặc biệt vào buổi tối.'
    ]
  },
  {
    title: 'Thanh toán tiền phòng',
    icon: Banknote,
    items: [
      'Tiền phòng và các khoản dịch vụ được thanh toán đúng hạn theo thỏa thuận trong hợp đồng.',
      'Người thuê cần kiểm tra hóa đơn trước khi thanh toán và báo ngay nếu có sai sót.',
      'Trường hợp chậm thanh toán, vui lòng liên hệ quản lý trước để được ghi nhận.'
    ]
  },
  {
    title: 'Vệ sinh và tài sản chung',
    icon: Sparkles,
    items: [
      'Giữ vệ sinh trong phòng, hành lang, khu vực để xe và khu sinh hoạt chung.',
      'Rác sinh hoạt cần bỏ đúng nơi quy định, không để rác trước cửa phòng quá lâu.',
      'Không tự ý làm hư hỏng, di chuyển hoặc chiếm dụng tài sản chung của nhà trọ.'
    ]
  },
  {
    title: 'An ninh và an toàn',
    icon: ShieldCheck,
    items: [
      'Tự bảo quản tài sản cá nhân, khóa cửa phòng khi ra ngoài hoặc đi ngủ.',
      'Không tàng trữ chất cấm, vật dễ cháy nổ hoặc các vật dụng vi phạm pháp luật.',
      'Báo ngay cho quản lý khi phát hiện người lạ, sự cố điện nước hoặc dấu hiệu mất an toàn.'
    ]
  },
  {
    title: 'Khách đến thăm',
    icon: UserCheck,
    items: [
      'Khách đến chơi cần giữ trật tự và không ảnh hưởng đến người thuê khác.',
      'Không tự ý cho người khác ở lại dài ngày khi chưa thông báo với quản lý.',
      'Người thuê chịu trách nhiệm về hành vi và tài sản của khách do mình mời đến.'
    ]
  },
  {
    title: 'Sửa chữa và bảo trì',
    icon: Wrench,
    items: [
      'Khi có hư hỏng điện, nước, khóa cửa hoặc thiết bị trong phòng, hãy báo quản lý sớm.',
      'Không tự ý sửa chữa, khoan đục, thay đổi kết cấu phòng khi chưa được đồng ý.',
      'Các hư hỏng do sử dụng sai cách có thể phát sinh chi phí bồi hoàn theo thực tế.'
    ]
  },
  {
    title: 'Chuyển vào và chuyển đi',
    icon: DoorOpen,
    items: [
      'Người thuê cần cung cấp thông tin cá nhân chính xác khi làm hồ sơ thuê trọ.',
      'Khi muốn chuyển đi, vui lòng báo trước theo thời hạn đã ghi trong hợp đồng.',
      'Trước khi bàn giao phòng, cần thanh toán đầy đủ chi phí và trả lại hiện trạng phòng sạch sẽ.'
    ]
  }
];

const quickNotes = [
  'Nội quy áp dụng cho tất cả người thuê và khách đến thăm.',
  'Mọi thay đổi quan trọng sẽ được quản lý thông báo trước.',
  'Người thuê có thể liên hệ quản lý nếu cần hỗ trợ hoặc giải thích thêm.'
];

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              <Home className="h-4 w-4" />
              Nhà trọ Trang Thông
            </div>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">Nội quy dành cho người thuê trọ</h1>
            <p className="mt-4 max-w-2xl text-lg text-blue-50">
              Vui lòng đọc kỹ nội quy trước khi thuê phòng để sinh hoạt thuận tiện, an toàn và tôn trọng không gian chung.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
            <div>
              <h2 className="text-lg font-bold text-amber-900">Lưu ý chung</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {quickNotes.map((note) => (
                  <p key={note} className="rounded-lg bg-white/70 px-3 py-2 text-sm text-amber-900">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <article key={rule.title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{rule.title}</h2>
                </div>

                <ul className="space-y-3">
                  {rule.items.map((item) => (
                    <li key={item} className="flex gap-3 text-gray-700">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Cần hỗ trợ thêm?</h2>
          <p className="mt-2 text-gray-600">
            Nếu có thắc mắc về nội quy hoặc cần trao đổi trước khi thuê phòng, hãy liên hệ quản lý nhà trọ.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="tel:0795473012"
              className="public-cta public-cta-success rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Gọi 0795 473 012
            </a>
            <a
              href="https://zalo.me/0795473012"
              target="_blank"
              rel="noopener noreferrer"
              className="public-cta public-cta-primary rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Nhắn Zalo
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
