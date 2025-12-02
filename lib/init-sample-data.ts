// Örnek kurum hesabı oluşturma

export function initSampleOrganization() {
  if (typeof window === 'undefined') return

  // Örnek kurum verisi
  const sampleOrg = {
    id: 999999,
    name: 'Örnek Eğitim Kurumu',
    email: 'ornek@egitimkurumu.gov.tr',
    type: 'Resmi Kurum',
    description: 'Eğitim ve öğretim alanında faaliyet gösteren örnek bir kurum. Maarif modeli uyumlu içerikler oluşturmak için kullanılabilir.',
    website: 'https://www.ornekegitimkurumu.gov.tr',
    phone: '+90 312 123 45 67',
    verified: true,
    createdAt: new Date().toISOString(),
    isOrganization: true,
  }

  // Mevcut kurumları kontrol et
  const existingOrgs = JSON.parse(localStorage.getItem('organizations') || '[]')
  const orgExists = existingOrgs.find((org: any) => org.id === sampleOrg.id)

  if (!orgExists) {
    existingOrgs.push(sampleOrg)
    localStorage.setItem('organizations', JSON.stringify(existingOrgs))
  }

  return sampleOrg
}

