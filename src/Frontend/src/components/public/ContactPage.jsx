import { Clock, ExternalLink, MapPin, MessageCircle, Phone, UserRound } from 'lucide-react';

const contact = {
  name: 'Tuấn Đạt',
  phone: '0795473012',
  displayPhone: '0795 473 012',
  zalo: '0795473012',
  address: 'Nhà trọ Trang Thông, Trà Vinh',
  joinedAt: '19/06/2018',
  listingCount: 15
};

const mapEmbedUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d933.8877404249952!2d106.34579350000003!3d9.933599199999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a01768258ce4b1%3A0x508e7ee94c09b0eb!2zTmjDoCB0cuG7jSBUcmFuZyBUaMO0bmc!5e1!3m2!1sen!2s!4v1778945284735!5m2!1sen!2s';

export default function ContactPage() {
  return (
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">Liên hệ và tìm đường</h1>
            <p className="mt-2 text-gray-600">
              Người thuê có thể gọi điện, nhắn Zalo hoặc mở Google Maps để đến xem phòng trực tiếp.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vị trí và bản đồ</h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span>Địa điểm: {contact.address}</span>
                </p>
              </div>
              <a
                href="https://www.google.com/maps/place/Nh%C3%A0+tr%E1%BB%8D+Trang+Th%C3%B4ng"
                target="_blank"
                rel="noopener noreferrer"
                className="public-cta public-cta-primary inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                Xem bản đồ lớn
              </a>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100" style={{ aspectRatio: '16 / 8' }}>
              <iframe
                title="Bản đồ nhà trọ Trang Thông"
                src={mapEmbedUrl}
                className="h-full w-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Thông tin liên hệ</h2>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 border-gray-200 bg-gray-100">
                <UserRound className="h-12 w-12 text-gray-300" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Đang hoạt động</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {contact.listingCount} tin đăng • Tham gia từ: {contact.joinedAt}
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`tel:${contact.phone}`}
                    className="public-cta public-cta-success inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.displayPhone}
                  </a>
                  <a
                    href={`https://zalo.me/${contact.zalo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-cta public-cta-primary inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Nhắn Zalo Tuấn Đạt
                  </a>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <div className="flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4" />
                  Giờ hỗ trợ
                </div>
                <p className="mt-1">8:00 - 22:00 hằng ngày</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
