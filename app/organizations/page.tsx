import Link from 'next/link'

const organizations = [
  {
    id: 1,
    name: 'T.C. Sanayi ve Teknoloji Bakanlığı',
    type: 'Resmi Kurum',
    description: 'Sanayi ve teknoloji alanında politika geliştirme ve uygulama',
    eventsCount: 12,
    verified: true,
  },
  {
    id: 2,
    name: 'T.C. Kültür ve Turizm Bakanlığı',
    type: 'Resmi Kurum',
    description: 'Kültür ve turizm alanında faaliyet gösteren resmi kurum',
    eventsCount: 8,
    verified: true,
  },
  {
    id: 3,
    name: 'T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı',
    type: 'Resmi Kurum',
    description: 'Çevre koruma ve sürdürülebilirlik konularında çalışmalar yürüten kurum',
    eventsCount: 15,
    verified: true,
  },
  {
    id: 4,
    name: 'T.C. Gençlik ve Spor Bakanlığı',
    type: 'Resmi Kurum',
    description: 'Gençlik ve spor alanında faaliyet gösteren resmi kurum',
    eventsCount: 20,
    verified: true,
  },
]

export default function Organizations() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kurumlar</h1>
        <p className="text-gray-600">
          Etkinlik düzenleyen resmi kurumları keşfedin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organizations.map((org) => (
          <Link key={org.id} href={`/organizations/${org.id}`}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-xl">
                    {org.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {org.name}
                    </h2>
                    {org.verified && (
                      <span className="text-primary-600" title="Doğrulanmış Kurum">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{org.type}</p>
                  <p className="text-gray-700 mb-4 text-sm">{org.description}</p>
                  <div className="flex items-center text-primary-600 text-sm font-semibold">
                    <span>📅 {org.eventsCount} etkinlik</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

