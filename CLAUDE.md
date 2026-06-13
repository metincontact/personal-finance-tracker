# Personal Finance Tracker — CLAUDE.md

## Proje Özeti
Santander banka kartına GoCardless Nordigen Open Banking API üzerinden bağlanan, harcamaları otomatik çeken, kategorize eden ve görselleştiren kişisel finans takip uygulaması.

## Hedef
Portfolio projesi olarak junior developer iş başvurularında kullanılacak. Kullanışlı olursa gerçek hayatta da kullanılacak.

## Kullanıcı
Şimdilik tek kullanıcı (uygulama sahibi). Kayıt/login sistemi yok. İleride çok kullanıcılı yapıya geçilebilir.

---

## Tech Stack

### Frontend
- **React + Vite** — UI framework
- **TypeScript** — Tip güvenliği
- **Tailwind CSS** — Stil
- **Recharts** — Grafik ve veri görselleştirme
- **React Router** — Sayfa yönlendirme
- **Axios** — API istekleri

### Backend
- **Node.js + Express** — API sunucusu
- **TypeScript** — Tip güvenliği
- **Prisma** — ORM (PostgreSQL ile)
- **PostgreSQL** — Veritabanı
- **GoCardless Nordigen** — Open Banking API (Santander entegrasyonu)

---

## Özellikler

### Temel
- [ ] Santander hesabı bağlama (GoCardless Nordigen OAuth)
- [ ] Harcamaları otomatik çekme ve kaydetme
- [ ] Otomatik kategorizasyon (market, yemek, ulaşım vs.)
- [ ] Kategori bazlı bütçe belirleme
- [ ] Bütçe aşımı uyarısı

### Görselleştirme
- [ ] Aylık harcama trendi (çizgi grafik)
- [ ] Kategori dağılımı (pasta grafik)
- [ ] Bütçe vs gerçek harcama (çubuk grafik)
- [ ] Özet dashboard ("bu ay en çok X'e harcadın")

### Raporlama
- [ ] Aylık özet
- [ ] Geçen ay karşılaştırması
- [ ] Kategori bazlı detay

---

## Proje Yapısı

```
personal-finance-tracker/
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/        # Yeniden kullanılabilir UI bileşenleri
│   │   ├── pages/             # Sayfa bileşenleri (Dashboard, Budget, Reports)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API çağrı fonksiyonları (axios)
│   │   ├── types/             # TypeScript tip tanımları
│   │   └── utils/             # Yardımcı fonksiyonlar
│   └── ...
│
├── backend/                   # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/            # API endpoint'leri
│   │   ├── controllers/       # İş mantığı
│   │   ├── services/          # GoCardless, hesaplama servisleri
│   │   ├── prisma/            # Veritabanı şeması
│   │   └── types/             # TypeScript tip tanımları
│   └── ...
│
└── CLAUDE.md
```

---

## Geliştirme Aşamaları

### Aşama 1 — Temel Yapı
- Frontend ve backend proje iskeletleri
- PostgreSQL bağlantısı + Prisma şeması
- Mock data ile temel CRUD işlemleri
- Dashboard, Budget, Reports sayfaları (mock data ile)

### Aşama 2 — Görselleştirme
- Recharts entegrasyonu
- Tüm grafiklerin mock data ile çalışması
- Responsive tasarım

### Aşama 3 — GoCardless Entegrasyonu
- GoCardless Nordigen hesap açma
- OAuth flow implementasyonu
- Santander bağlantısı
- Gerçek işlem verisi çekme

### Aşama 4 — Polish
- Hata yönetimi
- Loading state'leri
- Son testler
- Portfolio'ya hazır hale getirme

---

## Önemli Kararlar

- **Tek kullanıcı:** Auth sistemi yok, ileride eklenebilir
- **Ayrı frontend/backend:** Profesyonel mimari, farklı portlarda çalışır
- **Mock data önce:** GoCardless hesabı yokken geliştirme devam edebilir
- **TypeScript her yerde:** Junior pozisyon için ayrıştırıcı özellik
- **Prisma ORM:** TypeScript ile tam uyumlu, modern yaklaşım

---

## Portlar
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Ortam Değişkenleri (backend .env)
```
DATABASE_URL=postgresql://...
NORDIGEN_SECRET_ID=...
NORDIGEN_SECRET_KEY=...
PORT=3000
```
