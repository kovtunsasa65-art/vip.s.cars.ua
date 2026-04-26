import SEOHead from '../components/SEOHead';

export default function Cookie() {
  return (
    <>
      <SEOHead title="Політика Cookie — VIP.S CARS" url="/cookie" />
      <div className="min-h-screen bg-slate-50 py-16 pb-32">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Використання файлів Cookie</h1>
            
            <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 leading-relaxed">
              <p className="text-lg font-semibold text-slate-700 mb-6">
                Ми використовуємо файли cookie, щоб покращити ваш досвід на нашому сайті.
              </p>

              <h2>Що таке файли cookie?</h2>
              <p>Це невеликі текстові файли, які зберігаються на вашому пристрої при відвідуванні веб-сайту. Вони допомагають сайту запам'ятати ваші налаштування та дії.</p>

              <h2>Як ми їх використовуємо?</h2>
              <ul>
                <li><strong>Технічні:</strong> необхідні для роботи сайту та авторизації.</li>
                <li><strong>Аналітичні:</strong> допомагають нам зрозуміти, які сторінки популярні та як користувачі взаємодіють з сайтом.</li>
                <li><strong>Функціональні:</strong> запам'ятовують ваші обрані авто (favorites) для зручного доступу пізніше.</li>
              </ul>

              <h2>Керування cookie</h2>
              <p>Ви можете вимкнути файли cookie у налаштуваннях вашого браузера, однак це може вплинути на функціональність деяких розділів сайту.</p>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-widest">
              Останнє оновлення: 26 квітня 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
