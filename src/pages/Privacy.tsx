import SEOHead from '../components/SEOHead';

export default function Privacy() {
  return (
    <>
      <SEOHead title="Політика конфіденційності — VIP.S CARS" url="/privacy" />
      <div className="min-h-screen bg-slate-50 py-16 pb-32">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Політика конфіденційності</h1>
            
            <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 leading-relaxed">
              <p className="text-lg font-semibold text-slate-700 mb-6">
                Ваша конфіденційність важлива для нас. Ця Політика пояснює, як ми збираємо, використовуємо та захищаємо ваші персональні дані.
              </p>

              <h2>1. Збір інформації</h2>
              <p>Ми збираємо дані, які ви надаєте добровільно: ім'я, номер телефону, логін Telegram та інформацію про ваш автомобіль при заповненні форм на сайті.</p>

              <h2>2. Використання даних</h2>
              <p>Ваші дані використовуються виключно для надання послуг (автопідбір, викуп, перевірка) та зв'язку з вами щодо ваших заявок.</p>

              <h2>3. Захист інформації</h2>
              <p>Ми використовуємо сучасні методи шифрування (SSL) та надійні бази даних (Supabase) для забезпечення безпеки вашої інформації.</p>

              <h2>4. Передача третім особам</h2>
              <p>Ми не передаємо ваші персональні дані третім особам, крім випадків, передбачених законодавством України.</p>

              <h2>5. Зміни в політиці</h2>
              <p>Ми залишаємо за собою право оновлювати цю політику. Будь ласка, періодично перевіряйте цю сторінку.</p>
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
