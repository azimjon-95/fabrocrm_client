# Express API Router

Bu loyiha Express.js yordamida yaratilgan backend API routerlarini o‘z ichiga oladi.

## API Endpointlar

### **1. Admin**
- `GET /admin/all` - Barcha adminlarni olish
- `POST /admin/create` - Yangi admin yaratish
- `POST /admin/login` - Admin tizimga kirishi
- `DELETE /admin/delete/:id` - Adminni o‘chirish
- `PUT /admin/update/:id` - Admin ma'lumotlarini yangilash

### **2. Worker**
- `GET /worker/all` - Barcha ishchilarni olish
- `POST /worker/create` - Yangi ishchi qo‘shish
- `DELETE /worker/delete/:id` - Ishchini o‘chirish
- `PUT /worker/update/:id` - Ishchi ma'lumotlarini yangilash

### **3. Attendance (Davomat)**
- `GET /attendance/all` - Barcha davomatlarni olish
- `GET /attendance/date/:date` - Berilgan sana bo‘yicha davomat
- `GET /attendance/monthly/:year/:month` - Oylik davomat ma'lumotlari
- `POST /attendance/create` - Davomat qo‘shish
- `PUT /attendance/update/:id` - Davomatni yangilash

### **4. Store (Ombor)**
- `GET /store/all` - Barcha mahsulotlarni olish
- `POST /store/create` - Yangi mahsulot qo‘shish
- `DELETE /store/delete/:id` - Mahsulotni o‘chirish
- `PUT /store/update/:id` - Mahsulotni yangilash
- `GET /store/category/:category` - Kategoriya bo‘yicha mahsulotlarni olish
- `PUT /store/decrement/:id` - Mahsulot miqdorini kamaytirish
- `GET /store/byId/:id` - Mahsulotni ID bo‘yicha olish
- `POST /store/update-many` - Ko‘p mahsulotlarni yangilash yoki qo‘shish

### **5. Working Hours (Ish vaqtlari)**
- `POST /workingHours/create` - Ish vaqtini qo‘shish
- `GET /workingHours/` - Barcha ish vaqtlarini olish
- `GET /workingHours/:id` - Ish vaqtini ID bo‘yicha olish
- `PUT /workingHours/:id` - Ish vaqtini yangilash
- `DELETE /workingHours/:id` - Ish vaqtini o‘chirish

### **6. Salaries (Ish haqi)**
- `POST /salaries` - Ish haqini yaratish
- `GET /salaries` - Barcha ish haqilarni olish
- `GET /salaries/:id` - Ish haqini ID bo‘yicha olish
- `PUT /salaries/:id` - Ish haqini yangilash
- `DELETE /salaries/:id` - Ish haqini o‘chirish

### **7. Expenses (Xarajatlar)**
- `POST /expenses` - Yangi xarajat qo‘shish
- `GET /expenses` - Barcha xarajatlarni olish
- `GET /expenses/:id` - Xarajatni ID bo‘yicha olish
- `PUT /expenses/:id` - Xarajatni yangilash
- `DELETE /expenses/:id` - Xarajatni o‘chirish
- `POST /expenses/period` - Ma'lum vaqt oralig‘idagi xarajatlarni olish
- `POST /expenses/report` - Balans hisobotini olish

### **8. Orders (Buyurtmalar)**
- `GET /order/` - Barcha buyurtmalarni olish
- `GET /order/:id` - Buyurtmani ID bo‘yicha olish
- `POST /order/` - Yangi buyurtma yaratish
- `PUT /order/:id` - Buyurtmani yangilash
- `DELETE /order/:id` - Buyurtmani o‘chirish
- `POST /order/giveMaterial` - Buyurtmaga material berish
- `GET /order/progress/:orderId` - Buyurtma jarayonini olish
- `GET /order/get-material/:orderId/:materialId` - Buyurtma materialini ID bo‘yicha olish
- `GET /order/get-all-material/:orderId` - Buyurtmadagi barcha materiallarni olish
- `GET /order-debt` - Buyurtma qarzlarini hisoblash

### **9. New Order List (Yangi buyurtmalar ro‘yxati)**
- `POST /list` - Yangi buyurtma yaratish
- `GET /list` - Barcha buyurtmalarni olish
- `GET /list/:id` - Buyurtmani ID bo‘yicha olish
- `PATCH /list/:id` - Buyurtmani yangilash
- `DELETE /list/:id` - Buyurtmani o‘chirish
- `GET /list-history` - Buyurtmalar tarixi
- `DELETE /list/:orderId/materials/:materialId` - Buyurtmadan ma'lum materialni o‘chirish
- `DELETE /list/:orderId/materials` - Buyurtmadagi barcha materiallarni o‘chirish
- `POST /list/:orderId/materials` - Buyurtmaga material qo‘shish

### **10. Balance (Balans)**
- `GET /balance` - Joriy balansni olish
- `POST /balance/update` - Balansni yangilash

## Umumiy API endpointlar soni: **60 ta**