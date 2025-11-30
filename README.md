# Eventurk - Etkinlik Platformu

Resmi kurumların düzenlediği etkinlikleri keşfetmek ve takip etmek için modern bir platform.

## Özellikler

- ✅ Etkinlik listesi ve detay sayfaları
- ✅ Resmi kurum profilleri
- ✅ Kategori bazlı etkinlik keşfi
- ✅ Etkinlik ilgi gösterme ve katılım takibi
- ✅ Doğrulanmış kurum sistemi
- ✅ Modern ve responsive tasarım

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Teknolojiler

- **Next.js 14** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Stil framework'ü

## Proje Yapısı

```
eventurk/
├── app/                    # Next.js App Router sayfaları
│   ├── page.tsx           # Ana sayfa (etkinlikler listesi)
│   ├── explore/           # Keşfet sayfası
│   ├── organizations/     # Kurumlar listesi ve detay
│   └── events/            # Etkinlik detay sayfaları
├── components/             # React bileşenleri
│   ├── EventCard.tsx      # Etkinlik kartı
│   └── Navigation.tsx     # Navigasyon menüsü
└── package.json           # Bağımlılıklar
```

## Sayfalar

- **Ana Sayfa** (`/`) - Tüm etkinliklerin listelendiği sayfa
- **Kurumlar** (`/organizations`) - Etkinlik düzenleyen resmi kurumlar
- **Kurum Profili** (`/organizations/[id]`) - Kurum detayları ve etkinlikleri
- **Etkinlik Detay** (`/events/[id]`) - Etkinlik detay sayfası
- **Keşfet** (`/explore`) - Kategorilere göre etkinlik keşfi

## Sonraki Adımlar

- [ ] Kurum kayıt ve doğrulama sistemi
- [ ] Veritabanı entegrasyonu
- [ ] Kullanıcı hesapları ve etkinlik kayıt sistemi
- [ ] Etkinlik arama ve filtreleme
- [ ] Bildirimler sistemi
- [ ] Takvim entegrasyonu
- [ ] Harita entegrasyonu (konum gösterimi)
