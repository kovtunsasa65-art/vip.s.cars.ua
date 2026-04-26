import SEOHead from '../components/SEOHead';

export default function Terms() {
  return (
    <>
      <SEOHead title="Умови використання — VIP.S CARS" url="/terms" />
      <div className="min-h-screen bg-slate-50 py-16 pb-32">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Умови використання</h1>
            
            <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 leading-relaxed">
              <p className="text-lg font-semibold text-slate-700 mb-6">
                Використовуючи цей сайт, ви погоджуєтеся з наведеними нижче умовами.
              </p>

              <h2>1. Загальні положення</h2>
              <p>Цей сайт надає інформаційні послуги щодо пошуку, перевірки та викупу автомобілів.</p>

              <h2>2. Використання контенту</h2>
              <p>Всі матеріали на сайті (тексти, фото, логотипи) є власністю VIP.S CARS. Копіювання без дозволу заборонено.</p>

              <h2>3. Відповідальність</h2>
              <p>Ми докладаємо всіх зусиль для актуальності даних, проте не несемо відповідальності за можливі неточності в оголошеннях, наданих третіми особами.</p>

              <h2>4. Права користувача</h2>
              <p>Ви маєте право використовувати сайт для особистих некомерційних цілей, створювати заявки та зберігати авто в обране.</p>
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
