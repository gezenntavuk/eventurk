export default function Explore() {
  const trendingCategories = [
    { name: 'Teknoloji', count: '45', icon: '💻' },
    { name: 'Kültür & Sanat', count: '32', icon: '🎨' },
    { name: 'Çevre', count: '28', icon: '🌱' },
    { name: 'Spor', count: '38', icon: '⚽' },
    { name: 'Eğitim', count: '41', icon: '📚' },
    { name: 'Sağlık', count: '25', icon: '🏥' },
  ]

  const upcomingEvents = [
    { title: 'Yapay Zeka Konferansı', date: '15 Mart', location: 'Ankara' },
    { title: 'Geleneksel Sanatlar Festivali', date: '20 Mart', location: 'İstanbul' },
    { title: 'Çevre Bilinci Semineri', date: '25 Mart', location: 'İzmir' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Keşfet</h1>
        <p className="text-gray-600">
          Kategorilere göre etkinlikleri keşfedin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Popüler Kategoriler
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {trendingCategories.map((category, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-semibold text-gray-900">{category.name}</div>
              <div className="text-sm text-gray-500">{category.count} etkinlik</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Yaklaşan Etkinlikler
        </h2>
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <div>
                <div className="font-semibold text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-500">
                  {event.date} · {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
