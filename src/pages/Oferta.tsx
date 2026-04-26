import SEOHead from '../components/SEOHead';

export default function Oferta() {
  return (
    <>
      <SEOHead title="Публічна оферта — VIP.S CARS" url="/oferta" />
      <div className="min-h-screen bg-slate-50 py-16 pb-32">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Публічна оферта</h1>
            
            <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 leading-relaxed">
              <p className="text-lg font-semibold text-slate-700 mb-6">
                Даний документ є офіційною пропозицією на надання послуг VIP.S CARS.
              </p>

              <h2>1. Предмет договору</h2>
              <p>Виконавець зобов'язується надати послуги з автопідбору, перевірки або викупу авто, а Замовник зобов'язується їх оплатити згідно з тарифами.</p>

              <h2>2. Порядок надання послуг</h2>
              <p>Послуги надаються на підставі заявки, залишеної на сайті або за телефоном. Деталі кожної послуги обговорюються індивідуально.</p>

              <h2>3. Оплата</h2>
              <p>Оплата послуг здійснюється у готівковій або безготівковій формі за домовленістю сторін після надання послуги або її етапів.</p>

              <h2>4. Форс-мажор</h2>
              <p>Сторони звільняються від відповідальності у разі виникнення обставин непереборної сили, що перешкоджають виконанню договору.</p>
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
