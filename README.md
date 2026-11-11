# Quản lý giảng viên bằng PHP và MySQL

Ứng dụng CRUD quản lý giảng viên bằng PHP thuần, PDO, MySQL và HTML/CSS/JavaScript. Dữ liệu được đọc trực tiếp từ bảng `GiangVien`, không dùng mock data ở frontend.

## Chức năng

- Hiển thị và tìm kiếm giảng viên theo họ tên.
- Thêm, sửa và xóa giảng viên.
- Lưu ảnh bằng URL hoặc chọn tệp ảnh (data URL trong cột `LONGTEXT`).
- Tổng hợp số giảng viên và tổng số lớp từ dữ liệu thật.
- Giao diện responsive cho desktop, tablet và điện thoại.

## Yêu cầu

- PHP 8.1 trở lên với extension `pdo_mysql`.
- MySQL 8 trở lên hoặc MariaDB.
- Apache (XAMPP) hoặc PHP built-in server.

## 1. Tạo cơ sở dữ liệu

Import file `database/schema.sql` bằng phpMyAdmin hoặc MySQL:

```bash
mysql -u root -p < database/schema.sql
```

File này tạo database `QLHocPhan` và bảng:

```text
GiangVien(IDGV, Fullname, Image, SumClass)
```

## 2. Cấu hình kết nối

Mở `backend/config/database.php` và cập nhật `host`, `port`, `username`, `password` nếu cấu hình MySQL trên máy khác giá trị hiện tại. Tên database phải là `QLHocPhan`.

## 3. Chạy backend

Từ thư mục gốc dự án:

```bash
php -S localhost:8000 -t backend/public
```

Kiểm tra API:

- `http://localhost:8000/api/health`
- `http://localhost:8000/api/lecturers`

## 4. Chạy frontend

Mở terminal thứ hai:

```bash
php -S localhost:5500 -t frontend
```

Sau đó truy cập `http://localhost:5500`.

Frontend mặc định gọi API tại `http://localhost:8000/api`. Nếu đổi cổng backend, cập nhật `API_BASE_URL` trong `frontend/js/api.js`.

## API

| Method | Endpoint | Ý nghĩa |
|---|---|---|
| GET | `/api/health` | Kiểm tra backend |
| GET | `/api/lecturers` | Lấy danh sách giảng viên |
| GET | `/api/lecturers?keyword=An` | Tìm theo họ tên |
| GET | `/api/lecturers?id=1` | Lấy chi tiết |
| POST | `/api/lecturers` | Thêm giảng viên |
| PUT | `/api/lecturers?id=1` | Cập nhật giảng viên |
| DELETE | `/api/lecturers?id=1` | Xóa giảng viên |

POST/PUT nhận JSON:

```json
{
  "Fullname": "Nguyễn Văn An",
  "Image": "https://example.com/anh.jpg",
  "SumClass": 4
}
```

## Cấu trúc dự án

- `backend/public`: điểm vào HTTP và CORS.
- `backend/routes`: khai báo endpoint.
- `backend/controllers`: validate request và trả response.
- `backend/models`: truy vấn PDO đến bảng `GiangVien`.
- `backend/config`: cấu hình kết nối MySQL.
- `backend/helpers`: hàm JSON dùng chung.
- `database`: schema database `QLHocPhan`.
- `frontend`: giao diện responsive và JavaScript gọi API.

