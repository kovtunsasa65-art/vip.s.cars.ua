// Псевдоніми бренд-назв: UA/RU транслітерація → офіційна назва
export const BRAND_ALIASES: Record<string, string> = {
  'бмв': 'BMW', 'бем': 'BMW',
  'тойота': 'Toyota', 'тайота': 'Toyota', 'тоіота': 'Toyota',
  'мерседес': 'Mercedes-Benz', 'мерс': 'Mercedes-Benz', 'мерседес-бенц': 'Mercedes-Benz',
  'ауді': 'Audi', 'ауди': 'Audi',
  'фольксваген': 'Volkswagen', 'вольксваген': 'Volkswagen',
  'фольк': 'Volkswagen', 'вв': 'Volkswagen',
  'рено': 'Renault',
  'пежо': 'Peugeot', 'пижо': 'Peugeot',
  'ситроен': 'Citroën',
  'хонда': 'Honda',
  'хюндай': 'Hyundai', 'хундай': 'Hyundai', 'хьондай': 'Hyundai',
  'кіа': 'KIA', 'киа': 'KIA',
  'лексус': 'Lexus',
  'нісан': 'Nissan', 'нисан': 'Nissan', 'ніссан': 'Nissan',
  'мазда': 'Mazda',
  'субару': 'Subaru',
  'міцубіші': 'Mitsubishi', 'мітсубісі': 'Mitsubishi', 'мітсубіші': 'Mitsubishi',
  'шевроле': 'Chevrolet', 'шевролет': 'Chevrolet',
  'форд': 'Ford',
  'опель': 'Opel',
  'скода': 'Škoda', 'шкода': 'Škoda',
  'ягуар': 'Jaguar',
  'ленд ровер': 'Land Rover', 'лендровер': 'Land Rover',
  'порше': 'Porsche', 'порш': 'Porsche',
  'тесла': 'Tesla',
  'вольво': 'Volvo',
  'фіат': 'Fiat',
  'сеат': 'SEAT',
  'альфа ромео': 'Alfa Romeo',
  'сузукі': 'Suzuki', 'сузуки': 'Suzuki',
  'інфініті': 'Infiniti',
  'акура': 'Acura',
  'кадилак': 'Cadillac',
  'лінкольн': 'Lincoln',
  'джип': 'Jeep',
  'крайслер': 'Chrysler',
  'додж': 'Dodge',
  'бентлі': 'Bentley',
  'роллс ройс': 'Rolls-Royce',
  'бугатті': 'Bugatti',
  'астон мартін': 'Aston Martin',
  'міні': 'MINI',
  'альфа': 'Alfa Romeo',
  'ровер': 'Land Rover',
  'рейндж ровер': 'Land Rover',
};

// Повертає офіційну назву бренду якщо збіг є, інакше — оригінальний запит
export function normalizeQuery(q: string): string {
  const lower = q.toLowerCase().trim();
  return BRAND_ALIASES[lower] ?? q;
}

// Визначає, чи є запит транслітерацією бренду
export function matchBrand(q: string): string | null {
  return BRAND_ALIASES[q.toLowerCase().trim()] ?? null;
}
