# Firebase Setup Guide

## Cấu hình Firebase cho Smart Exam Proctoring

### 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Firestore Database trong project

### 2. Cấu hình Web App

1. Trong Firebase Console, chọn "Add app" > "Web"
2. Đặt tên app (ví dụ: "smart-exam-proctoring")
3. Copy thông tin cấu hình

### 3. Cập nhật Environment Variables

Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Cấu hình Firestore Rules

Trong Firebase Console > Firestore Database > Rules, cập nhật rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{document} {
      allow read, write: if true; // Cho phép đọc/ghi cho demo
    }
  }
}
```

### 5. Cấu trúc Collection

Collection `students` sẽ có cấu trúc:

```javascript
{
  id: "auto-generated",
  imageUrl: "",
  name: "Nguyễn Văn An",
  status: "Đầu lắc qua lắc lại",
  studentNo: "SE123456",
  timestamp: Timestamp
}
```

### 6. Test Data

Để test, bạn có thể:

1. Vào Live Monitoring
2. Click "Add Firestore Student"
3. Student sẽ được thêm vào Firestore và hiển thị realtime

### 7. Tính năng

- **Realtime Updates**: Dữ liệu từ Firestore sẽ tự động cập nhật
- **Risk Level Calculation**: Tự động tính toán risk level dựa trên status
- **Integration**: Tích hợp với API students hiện có
- **Visual Indicators**: Badge "Firestore" để phân biệt nguồn dữ liệu

### 8. Troubleshooting

Nếu gặp lỗi:

1. Kiểm tra cấu hình Firebase trong `.env.local`
2. Đảm bảo Firestore Database đã được bật
3. Kiểm tra Firestore Rules
4. Xem console log để debug
