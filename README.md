# HƯỚNG DẪN CÀI ĐẶT, CHẠY VÀ KIỂM TRA ỨNG DỤNG

## 1. Thông tin chung về sản phẩm

Tên sản phẩm: Hệ thống quản lý tài chính cá nhân

Mục đích của hệ thống:
Ứng dụng hỗ trợ người dùng quản lý thu nhập, chi tiêu, báo cáo tài chính và ngân sách cá nhân theo từng danh mục.

Các chức năng chính:

* Đăng ký, đăng nhập và đăng xuất tài khoản.
* Đồng bộ người dùng từ Bubble.io sang MongoDB.
* Quản lý giao dịch thu/chi.
* Thêm, sửa, xóa giao dịch.
* Lọc giao dịch theo tháng và năm.
* Xem dashboard tổng quan tài chính.
* Xem báo cáo tài chính theo tháng/năm.
* Xem biểu đồ chi tiêu theo năm.
* Xem cơ cấu chi tiêu theo danh mục bằng biểu đồ donut.
* Quản lý ngân sách theo danh mục.
* Theo dõi số tiền đã chi, số tiền còn lại và phần trăm sử dụng ngân sách.

Công nghệ sử dụng:

* Frontend: Bubble.io
* Backend: Node.js, Express.js
* Database: MongoDB Atlas
* API connection: Bubble API Connector
* Công cụ public backend local: ngrok
* Công cụ deploy backend online: Render hoặc nền tảng tương đương

---

## 2. Cách kiểm tra nhanh ứng dụng online

Đây là cách kiểm tra được khuyến nghị vì người kiểm tra không cần cài đặt môi trường lập trình.

### 2.1. Link truy cập ứng dụng

Link ứng dụng Bubble:

```text
https://truonggiangdinh1303.bubbleapps.io/version-test/
```

Link backend API online:

```text
https://expense-management-backend-lqzl.onrender.com/
```

Link kiểm tra backend:

```text
https://expense-management-backend-lqzl.onrender.com/api/health
```

Ví dụ:

```Link GitHub backend:
https://github.com/giangdinh1303/expense-management-backend
```

Nếu backend hoạt động bình thường, trình duyệt sẽ hiển thị kết quả dạng:

```json
{
  "success": true,
  "message": "Backend is running"
}
```

### 2.2. Tài khoản đăng nhập thử nghiệm

Người kiểm tra có thể sử dụng tài khoản demo sau:

```text
Email: test1@gmail.com
Password: 12345678
```

### 2.3. Các bước kiểm tra nhanh

Bước 1: Mở link ứng dụng Bubble.

Bước 2: Đăng nhập bằng tài khoản demo.

Bước 3: Kiểm tra trang Tổng quan:

* Xem số dư tháng hiện tại.
* Xem tổng thu tháng hiện tại.
* Xem tổng chi tháng hiện tại.
* Xem số dư trong năm.
* Xem tổng thu trong năm.
* Xem tổng chi trong năm.
* Chọn năm trên biểu đồ để kiểm tra dữ liệu theo năm.

Bước 4: Kiểm tra trang Giao dịch:

* Xem danh sách giao dịch.
* Thêm một giao dịch mới.
* Sửa một giao dịch có sẵn.
* Xóa một giao dịch thử nghiệm.
* Kiểm tra chức năng lọc giao dịch theo tháng/năm.

Bước 5: Kiểm tra trang Báo cáo:

* Chọn tháng/năm cần xem báo cáo.
* Kiểm tra tổng thu, tổng chi và số dư.
* Kiểm tra biểu đồ đường theo năm.
* Kiểm tra biểu đồ donut cơ cấu chi tiêu theo danh mục.
* Kiểm tra bảng chi tiêu theo danh mục.

Bước 6: Kiểm tra trang Ngân sách:

* Xem tổng ngân sách.
* Xem số tiền đã chi.
* Xem số tiền còn lại.
* Xem ngân sách theo từng danh mục.
* Kiểm tra thanh tiến độ phần trăm sử dụng ngân sách.
* Thêm ngân sách mới nếu cần.

---

## 3. Cấu trúc thư mục mã nguồn backend

Thư mục backend có cấu trúc như sau:

```text
expense-backend
│
├── config
│   └── db.js
│
├── models
│   ├── Budget.js
│   ├── Category.js
│   ├── Transaction.js
│   ├── User.js
│   └── Wallet.js
│
├── routes
│   ├── budgets.js
│   ├── categories.js
│   ├── reports.js
│   ├── transactions.js
│   ├── users.js
│   └── wallets.js
│
├── services
│   └── bubble.js
│
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

Ý nghĩa các thư mục chính:

```text
config/      Chứa file cấu hình kết nối MongoDB.
models/      Chứa các schema/model của MongoDB.
routes/      Chứa các API route xử lý người dùng, giao dịch, báo cáo và ngân sách.
services/    Chứa các hàm hỗ trợ đồng bộ hoặc xử lý dữ liệu liên quan đến Bubble.
server.js    File khởi động backend.
package.json Khai báo thông tin project, thư viện và script chạy chương trình.
.env.example File mẫu mô tả các biến môi trường cần thiết.
```

Lưu ý: Thư mục `node_modules` không được đưa vào bản nộp vì dung lượng lớn. Khi cần chạy local, thư mục này sẽ được tạo lại bằng lệnh `npm install`.

---

## 4. Hướng dẫn chạy backend trên máy local

Phần này chỉ cần thực hiện nếu người kiểm tra muốn chạy mã nguồn backend trực tiếp trên máy cá nhân.

### 4.1. Yêu cầu trước khi chạy

Máy tính cần có:

* Node.js
* npm
* Kết nối Internet
* Quyền truy cập MongoDB Atlas hoặc chuỗi kết nối MongoDB được cung cấp

Kiểm tra Node.js bằng lệnh:

```bash
node -v
```

Kiểm tra npm bằng lệnh:

```bash
npm -v
```

Nếu hai lệnh trên hiển thị phiên bản, nghĩa là Node.js và npm đã được cài đặt.

---

### 4.2. Mở đúng thư mục backend

Mở Visual Studio Code hoặc terminal.

Di chuyển vào thư mục backend:

```bash
cd đường-dẫn-tới-thư-mục/expense-backend
```

Ví dụ trên Windows:

```bash
cd C:\Users\Admin\Desktop\QLCT\expense-backend
```

---

### 4.3. Cài đặt thư viện

Chạy lệnh:

```bash
npm install
```

Lệnh này sẽ đọc file `package.json` và cài đặt các thư viện cần thiết cho backend.

Sau khi chạy xong, thư mục `node_modules` sẽ được tạo tự động.

---

### 4.4. Tạo file môi trường `.env`

Trong thư mục `expense-backend`, tạo file mới tên:

```text
.env
```

Có thể dựa vào file `.env.example`.

Nội dung file `.env` cần có dạng:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
```

Trong đó:

* `PORT=3000`: backend sẽ chạy tại cổng 3000 khi chạy local.
* `MONGO_URI`: chuỗi kết nối MongoDB Atlas.

Lưu ý: File `.env` chứa thông tin kết nối database nên không nên công khai trên GitHub. Nếu Hội đồng cần chạy local, sinh viên cần cung cấp chuỗi kết nối phù hợp trong file hướng dẫn riêng hoặc trong bản nộp nội bộ.

---

### 4.5. Chạy backend

Sau khi cài thư viện và tạo file `.env`, chạy lệnh:

```bash
npm run dev
```

Nếu backend chạy thành công, terminal sẽ hiển thị:

```text
Backend is running on port 3000
MongoDB connected successfully
```

Khi đó backend đã chạy tại địa chỉ:

```text
http://localhost:3000
```

---

### 4.6. Kiểm tra backend

Mở trình duyệt và truy cập:

```text
http://localhost:3000/api/health
```

Nếu backend hoạt động, trình duyệt sẽ hiển thị dạng:

```json
{
  "success": true,
  "message": "Backend is running"
}
```

Nếu không hiển thị kết quả trên, cần kiểm tra lại:

* Backend đã chạy chưa.
* File `.env` đã đúng chưa.
* MongoDB Atlas có cho phép IP hiện tại truy cập chưa.
* Cổng 3000 có đang bị chương trình khác sử dụng không.

---

## 5. Hướng dẫn public backend local bằng ngrok

Phần này chỉ cần dùng khi muốn Bubble gọi backend đang chạy trên máy local.

### 5.1. Chạy backend trước

Đảm bảo backend đã chạy bằng lệnh:

```bash
npm run dev
```

Terminal cần hiển thị:

```text
Backend is running on port 3000
MongoDB connected successfully
```

Không tắt terminal này.

---

### 5.2. Mở terminal thứ hai

Mở một terminal khác trong cùng thư mục backend.

Nếu có file `ngrok.exe` trong thư mục backend, chạy:

```bash
.\ngrok.exe http 3000
```

Nếu ngrok đã được cài vào PATH, có thể chạy:

```bash
ngrok http 3000
```

Sau đó ngrok sẽ tạo một link HTTPS dạng:

```text
https://example-ngrok-url.ngrok-free.dev
```

Copy link HTTPS này.

---

### 5.3. Cập nhật link backend trong Bubble

Vào Bubble editor:

```text
Plugins → API Connector → Expense Backend API
```

Thay phần đầu URL cũ bằng link ngrok mới.

Ví dụ URL cũ:

```text
https://old-ngrok-url.ngrok-free.dev/api/transactions
```

Đổi thành:

```text
https://new-ngrok-url.ngrok-free.dev/api/transactions
```

Chỉ thay phần domain:

```text
https://new-ngrok-url.ngrok-free.dev
```

Giữ nguyên các phần API phía sau như:

```text
/api/users/sync
/api/categories
/api/wallets
/api/transactions
/api/reports/monthly
/api/reports/yearly
/api/budgets/status
/api/budgets
```

Lưu ý: Mỗi lần chạy lại ngrok, link có thể thay đổi. Khi link thay đổi, cần cập nhật lại trong Bubble API Connector.

---

## 6. Hướng dẫn chạy bằng file `.bat` nếu có

Nếu trong thư mục backend có các file:

```text
start_backend.bat
start_ngrok.bat
run_app.bat
```

người kiểm tra có thể chạy nhanh như sau:

### 6.1. Chạy backend

Double click file:

```text
start_backend.bat
```

File này sẽ mở terminal và chạy backend.

Nếu thành công, terminal sẽ hiển thị:

```text
Backend is running on port 3000
MongoDB connected successfully
```

### 6.2. Chạy ngrok

Double click file:

```text
start_ngrok.bat
```

Sau đó copy link HTTPS do ngrok tạo ra và cập nhật vào Bubble API Connector.

### 6.3. Chạy cả backend và ngrok cùng lúc

Nếu có file:

```text
run_app.bat
```

có thể double click để mở đồng thời:

* Một cửa sổ chạy backend.
* Một cửa sổ chạy ngrok.

Sau đó copy link ngrok để cấu hình trong Bubble.

---

## 7. Hướng dẫn kiểm tra database MongoDB Atlas

Dữ liệu của hệ thống được lưu trên MongoDB Atlas.

Các collection chính gồm:

```text
users
categories
wallets
transactions
budgets
```

Ý nghĩa:

* `users`: lưu thông tin người dùng đồng bộ từ Bubble.
* `categories`: lưu danh mục thu nhập và chi tiêu.
* `wallets`: lưu ví tiền hoặc nguồn tiền.
* `transactions`: lưu các giao dịch thu/chi.
* `budgets`: lưu ngân sách theo danh mục.

Khi người dùng thêm giao dịch trên Bubble, dữ liệu sẽ được gửi đến backend Node.js, sau đó backend lưu vào collection `transactions` trong MongoDB.

Khi người dùng thêm ngân sách, dữ liệu sẽ được lưu vào collection `budgets`.

---

## 8. Các API chính của backend

### 8.1. API kiểm tra backend

```text
GET /api/health
```

Dùng để kiểm tra backend có đang chạy không.

---

### 8.2. API đồng bộ người dùng

```text
POST /api/users/sync
```

Dùng để đồng bộ người dùng từ Bubble sang MongoDB.

---

### 8.3. API danh mục

```text
GET /api/categories
```

Dùng để lấy danh sách danh mục thu nhập và chi tiêu.

---

### 8.4. API ví tiền

```text
GET /api/wallets
```

Dùng để lấy danh sách ví tiền/nguồn tiền.

---

### 8.5. API giao dịch

```text
GET /api/transactions
POST /api/transactions
PUT /api/transactions/:transactionId
DELETE /api/transactions/:transactionId
```

Chức năng:

* Lấy danh sách giao dịch.
* Thêm giao dịch mới.
* Cập nhật giao dịch.
* Xóa giao dịch.

---

### 8.6. API báo cáo

```text
GET /api/reports/monthly
GET /api/reports/yearly
```

Chức năng:

* Lấy báo cáo tài chính theo tháng.
* Lấy dữ liệu biểu đồ theo năm.
* Tính tổng thu, tổng chi, số dư và chi tiêu theo danh mục.

---

### 8.7. API ngân sách

```text
GET /api/budgets/status
POST /api/budgets
```

Chức năng:

* Lấy tình trạng ngân sách theo tháng/năm.
* Thêm ngân sách cho từng danh mục.

---

## 9. Lỗi thường gặp và cách xử lý

### 9.1. Lỗi port 3000 đã được sử dụng

Thông báo lỗi:

```text
EADDRINUSE: address already in use :::3000
```

Nguyên nhân: Có một backend khác đang chạy ở port 3000.

Cách xử lý trên Windows:

```bash
netstat -ano | findstr :3000
```

Sau đó lấy PID ở cột cuối và chạy:

```bash
taskkill /PID <PID> /F
```

Hoặc có thể tắt toàn bộ tiến trình Node.js:

```bash
taskkill /IM node.exe /F
```

Sau đó chạy lại:

```bash
npm run dev
```

---

### 9.2. Lỗi không kết nối được MongoDB

Thông báo thường gặp:

```text
MongoDB connection failed
```

Nguyên nhân có thể là:

* Sai `MONGO_URI`.
* Sai username/password MongoDB.
* MongoDB Atlas chưa cho phép IP hiện tại truy cập.
* Mạng Internet bị lỗi.

Cách xử lý:

* Kiểm tra lại file `.env`.
* Vào MongoDB Atlas → Network Access → Add IP Address.
* Có thể thêm `0.0.0.0/0` để cho phép truy cập từ mọi IP trong quá trình kiểm tra/demo.
* Kiểm tra lại database user và password.

---

### 9.3. Bubble không hiển thị dữ liệu

Nguyên nhân có thể là:

* Backend chưa chạy.
* Link ngrok đã thay đổi.
* API Connector trong Bubble đang dùng URL cũ.
* MongoDB chưa kết nối thành công.
* Người dùng chưa đăng nhập hoặc chưa được đồng bộ.

Cách xử lý:

* Kiểm tra backend bằng `/api/health`.
* Kiểm tra terminal backend.
* Kiểm tra link API trong Bubble API Connector.
* Đăng nhập lại tài khoản demo.
* Bấm kiểm tra lại API trong Bubble API Connector.

---

## 10. Ghi chú dành cho người kiểm tra

Phiên bản khuyến nghị để kiểm tra là phiên bản online thông qua link Bubble app và backend đã deploy. Với cách này, người kiểm tra chỉ cần:

1. Mở link ứng dụng Bubble.
2. Đăng nhập bằng tài khoản demo.
3. Sử dụng trực tiếp các chức năng của hệ thống.

Việc chạy local chỉ cần thiết nếu người kiểm tra muốn kiểm tra trực tiếp mã nguồn backend hoặc kiểm thử API ở môi trường máy cá nhân.

---

## 11. Thông tin liên hệ và tác giả

Sinh viên thực hiện: Đinh Trường Giang

Mã sinh viên: 2722212702

Lớp: PM27.21

Trường: Đại học Kinh doanh và Công nghệ Hà Nội

Tên đề tài: Xây dựng hệ thống quản lý tài chính cá nhân sử dụng Bubble.io, Node.js và MongoDB

Năm thực hiện: 2026
