const features = [
  {
    title: "Sıfırdan Temiz Başlangıç",
    description: "Tüm karmaşık veri akışlarını kaldırdık. Proje artık tek sayfalık, anlaşılır bir temel ile ilerliyor."
  },
  {
    title: "Hızlı Geliştirme",
    description: "Yeni özellikleri modüler bölümler halinde ekleyebilmek için yalın bir yapı oluşturuldu."
  },
  {
    title: "Yeni Yol Haritası",
    description: "İlk adım: iskelet. Sonraki adım: veri kaynakları, filtreler, grafikler ve detay ekranları."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-12">
      <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">ClawBound</p>
      <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Proje yeniden kuruldu.</h1>
      <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
        İstek doğrultusunda mevcut yapı temizlenip sıfırdan yeni bir başlangıç yapıldı. Buradan itibaren ihtiyaca göre adım adım ilerleyebiliriz.
      </p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-medium text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
