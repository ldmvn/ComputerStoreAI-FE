# ComputerStoreAI — Frontend

Giao diện web cho hệ thống bán hàng máy tính **DUCMANHPC**, xây dựng trên Next.js 15 và React.

## Công nghệ sử dụng

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **State Management:** React Hooks + SWR
- **Rich Text Editor:** TipTap
- **HTTP Client:** Fetch API (custom service layer)

## Cấu trúc thư mục

```
src/
├── app/                # Pages và routing (App Router)
│   ├── admin/          # Trang quản trị
│   ├── customer/       # Trang khách hàng (sản phẩm, giỏ hàng, ...)
│   └── ...
├── components/         # React components
│   ├── admin/          # Components trang quản trị
│   ├── home/           # Trang chủ (banner, sản phẩm nổi bật)
│   ├── build-pc/       # Tính năng Build PC
│   ├── checkout/       # Thanh toán
│   └── ...
├── hooks/              # Custom React Hooks
├── services/           # Service layer (gọi API)
├── store/              # State management
├── types/              # TypeScript types/interfaces
├── lib/                # Utilities
└── styles/             # Global styles
tests/                  # Unit test và E2E test
public/                 # Static assets
```

## Tính năng chính

- Trang chủ với banner, sản phẩm nổi bật, mega menu
- Danh sách sản phẩm với bộ lọc (danh mục, thương hiệu, giá, ...)
- Chi tiết sản phẩm (ảnh, thông số, đánh giá)
- Giỏ hàng và checkout
- Thanh toán (COD, VNPay, MoMo, chuyển khoản QR)
- Tài khoản khách hàng (đơn hàng, địa chỉ, wishlist)
- Đăng nhập / Đăng ký (email, Google OAuth)
- AI Chatbot tư vấn mua hàng
- AI Build PC (gợi ý cấu hình)
- Tìm kiếm sản phẩm (gợi ý, trending)
- Trang quản trị Admin (quản lý sản phẩm, đơn hàng, khách hàng, ...)
- Responsive design (mobile, tablet, desktop)

## Cài đặt

```bash
# Clone repo
git clone https://github.com/ldmvn/ComputerStoreAI-Frontend.git
cd ComputerStoreAI-Frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local từ template
cp .env.example .env.local

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`.

## Biến môi trường

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `NEXT_PUBLIC_API_URL` | Đường dẫn API (phía browser) | `/api` |
| `BACKEND_INTERNAL_URL` | URL Backend (phía server) | `http://127.0.0.1:5000` |

## Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm start            # Chạy production server
npm run lint         # Kiểm tra linting
npm run type-check   # Kiểm tra TypeScript
```

## Yêu cầu

- Node.js >= 18
- Backend API đang chạy tại `http://localhost:5000` (xem [ComputerStoreAI-Backend](https://github.com/ldmvn/ComputerStoreAI-Backend))
