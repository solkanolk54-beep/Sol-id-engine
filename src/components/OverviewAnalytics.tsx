import React, { useState, useMemo } from 'react';
import { Animal, WeightLog, Breed } from '../types/schema';
import { BREED_BENCHMARKS } from '../engine/genetics';
import {
  TrendingUp,
  Activity,
  Layers,
  PieChart,
  Award,
  Sparkles,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface OverviewAnalyticsProps {
  animals: Animal[];
  weightLogs: WeightLog[];
  onSelectAnimal: (animal: Animal) => void;
}

export const OverviewAnalytics: React.FC<OverviewAnalyticsProps> = ({
  animals,
  weightLogs,
  onSelectAnimal,
}) => {
  const [selectedBreedFilter, setSelectedBreedFilter] = useState<Breed | 'ALL'>('ALL');
  const [highlightAnimalId, setHighlightAnimalId] = useState<string>('sol-oj-082');

  const activeAnimals = useMemo(() => animals.filter((a) => a.status === 'Active'), [animals]);

  // Breed breakdown counts
  const breedCounts = useMemo(() => {
    const counts: Record<Breed, number> = {
      Ouled_Djellal: 0,
      Rembi: 0,
      Hamra: 0,
      Dman: 0,
      Tazegzawt: 0,
    };
    activeAnimals.forEach((a) => {
      if (counts[a.breed] !== undefined) counts[a.breed]++;
    });
    return counts;
  }, [activeAnimals]);

  // Genetic category distribution
  const categoryCounts = useMemo(() => {
    const counts = { Elite: 0, Normal: 0, Reject: 0 };
    activeAnimals.forEach((a) => {
      counts[a.category]++;
    });
    const total = activeAnimals.length || 1;
    return {
      counts,
      percentages: {
        Elite: Math.round((counts.Elite / total) * 100),
        Normal: Math.round((counts.Normal / total) * 100),
        Reject: Math.round((counts.Reject / total) * 100),
      },
    };
  }, [activeAnimals]);

  // Mean ADG for herd
  const meanAdg = useMemo(() => {
    const validLogs = weightLogs.filter((l) => l.adg_since_last > 0);
    if (validLogs.length === 0) return 245;
    const sum = validLogs.reduce((acc, curr) => acc + curr.adg_since_last, 0);
    return Math.round(sum / validLogs.length);
  }, [weightLogs]);

  // Selected animal data for chart comparison
  const highlightAnimal = useMemo(() => {
    return animals.find((a) => a.id === highlightAnimalId) || animals[0];
  }, [animals, highlightAnimalId]);

  const highlightLogs = useMemo(() => {
    if (!highlightAnimal) return [];
    return weightLogs
      .filter((l) => l.animal_id === highlightAnimal.id)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  }, [weightLogs, highlightAnimal]);

  // Chart benchmark points based on selected animal's breed
  const benchmark = highlightAnimal
    ? BREED_BENCHMARKS[highlightAnimal.breed]
    : BREED_BENCHMARKS.Ouled_Djellal;

  // Chart data: Age in days (0, 30, 60, 90, 150, 210) and standard curve vs animal curve
  const chartPoints = useMemo(() => {
    const ageDays = [0, 30, 60, 90, 150, 210];
    const bWeight = benchmark.avg_birth_weight;
    const bDailyKg = benchmark.avg_adg_g_day / 1000;

    // Ideal benchmark curve
    const benchmarkData = ageDays.map((days) => ({
      days,
      weight: Number((bWeight + days * bDailyKg).toFixed(1)),
    }));

    // Animal actual data points calculated by days from birth
    const actualData = highlightLogs.map((log) => {
      const birth = new Date(highlightAnimal.birth_date).getTime();
      const rec = new Date(log.recorded_at).getTime();
      const days = Math.max(0, Math.round((rec - birth) / (1000 * 60 * 60 * 24)));
      return {
        days,
        weight: log.weight_kg,
        adg: log.adg_since_last,
      };
    });

    return { benchmarkData, actualData };
  }, [benchmark, highlightLogs, highlightAnimal]);

  // SVG Chart Dimensions
  const svgWidth = 680;
  const svgHeight = 280;
  const padding = { top: 25, right: 35, bottom: 45, left: 55 };
  const maxDays = 220;
  const maxWeight = 100;

  const getX = (days: number) =>
    padding.left + (days / maxDays) * (svgWidth - padding.left - padding.right);
  const getY = (weight: number) =>
    svgHeight - padding.bottom - (weight / maxWeight) * (svgHeight - padding.top - padding.bottom);

  // Path generators
  const benchmarkPath = chartPoints.benchmarkData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.days)} ${getY(p.weight)}`)
    .join(' ');

  const actualPath = chartPoints.actualData.length > 0
    ? chartPoints.actualData
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.days)} ${getY(p.weight)}`)
        .join(' ')
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Scope Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>لوحة التحكم والتحليل الاستراتيجي (SOL Command)</span>
          </h1>
          <p className="text-xs text-stone-400">
            مؤشرات النمو الحيوي، توزيع السلالات، والكفاءة الوراثية للقطيع في الوقت الحقيقي
          </p>
        </div>

        {/* Breed Filter Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSelectedBreedFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedBreedFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            كافة السلالات
          </button>
          {Object.keys(BREED_BENCHMARKS).map((bKey) => {
            const b = BREED_BENCHMARKS[bKey as Breed];
            const isSel = selectedBreedFilter === bKey;
            return (
              <button
                key={bKey}
                onClick={() => setSelectedBreedFilter(bKey as Breed)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isSel
                    ? 'bg-stone-800 text-emerald-400 border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {b.name_ar}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Vital KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Active Herd */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>إجمالي رؤوس القطيع</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-stone-100 mb-2">
            {activeAnimals.length} <span className="text-xs font-sans text-stone-400 font-normal">رأس نشط</span>
          </div>
          {/* Breed micro breakdown */}
          <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-2 border-t border-stone-800/80">
            <span>أولاد جلال: <strong className="text-stone-200">{breedCounts.Ouled_Djellal}</strong></span>
            <span>·</span>
            <span>الرمبي: <strong className="text-stone-200">{breedCounts.Rembi}</strong></span>
            <span>·</span>
            <span>أخرى: <strong className="text-stone-200">{breedCounts.Dman + breedCounts.Hamra + breedCounts.Tazegzawt}</strong></span>
          </div>
        </div>

        {/* KPI 2: Mean ADG */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>متوسط النمو اليومي (Mean ADG)</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black font-mono text-teal-300 mb-2">
            +{meanAdg} <span className="text-xs font-sans text-stone-400 font-normal">غرام / يوم</span>
          </div>
          <div className="text-[11px] text-teal-400/90 flex items-center gap-1 pt-2 border-t border-stone-800/80">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>متوسط عالي يفوق المعيار الإقليمي (+14%)</span>
          </div>
        </div>

        {/* KPI 3: Genetic Classification Ratio */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>التصنيف الوراثي للقطيع</span>
            <PieChart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black font-mono text-amber-300">
              {categoryCounts.percentages.Elite}%
            </span>
            <span className="text-xs text-stone-400">نخبة وراثية (Elite)</span>
          </div>
          {/* Progress bar split */}
          <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${categoryCounts.percentages.Elite}%` }}
              className="bg-amber-400"
              title={`نخبة: ${categoryCounts.percentages.Elite}%`}
            />
            <div
              style={{ width: `${categoryCounts.percentages.Normal}%` }}
              className="bg-emerald-500"
              title={`عادي: ${categoryCounts.percentages.Normal}%`}
            />
            <div
              style={{ width: `${categoryCounts.percentages.Reject}%` }}
              className="bg-rose-500"
              title={`تصفية: ${categoryCounts.percentages.Reject}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2">
            <span className="text-amber-400">نخبة ({categoryCounts.counts.Elite})</span>
            <span className="text-emerald-400">تجاري ({categoryCounts.counts.Normal})</span>
            <span className="text-rose-400">تصفية ({categoryCounts.counts.Reject})</span>
          </div>
        </div>

        {/* KPI 4: FCR Efficiency */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>كفاءة التحويل الغذائي (FCR)</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black font-mono text-indigo-300 mb-2">
            5.2 <span className="text-xs font-sans text-stone-400 font-normal">كغ علف / كغ نمو</span>
          </div>
          <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-800/80">
            معدل مثالي لسلالات اللحم في مرحلة التسمين المركّز
          </div>
        </div>
      </div>

      {/* Interactive Growth Curves Chart */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>مخطط منحنى النمو الزمني (Growth Curves Chart)</span>
            </h3>
            <p className="text-xs text-stone-400">
              مقارنة مسار الوزن الفعلي للحيوان مقابل المنحنى المعياري لسلالة {benchmark.name_ar}
            </p>
          </div>

          {/* Quick Animal Switcher for Growth Curve */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">مقارنة منحنى:</span>
            <select
              value={highlightAnimalId}
              onChange={(e) => setHighlightAnimalId(e.target.value)}
              className="bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-1.5 outline-none font-mono"
            >
              {animals
                .filter((a) => a.status === 'Active')
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag_number} - {a.name || a.breed} ({a.category})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative bg-stone-950/80 border border-stone-800/90 rounded-xl p-3 overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[580px]">
            {/* Grid lines */}
            {[20, 40, 60, 80, 100].map((w) => (
              <g key={w}>
                <line
                  x1={padding.left}
                  y1={getY(w)}
                  x2={svgWidth - padding.right}
                  y2={getY(w)}
                  stroke="#292524"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={getY(w) + 4}
                  fill="#78716c"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {w} كغ
                </text>
              </g>
            ))}

            {/* X Axis days labels */}
            {[0, 30, 60, 90, 120, 150, 180, 210].map((d) => (
              <g key={d}>
                <line
                  x1={getX(d)}
                  y1={svgHeight - padding.bottom}
                  x2={getX(d)}
                  y2={padding.top}
                  stroke="#1c1917"
                />
                <text
                  x={getX(d)}
                  y={svgHeight - padding.bottom + 18}
                  fill="#78716c"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {d} يوم
                </text>
              </g>
            ))}

            {/* Benchmark Curve Line (Dashed) */}
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#57534e"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />

            {/* Actual Animal Curve Line */}
            {actualPath && (
              <path
                d={actualPath}
                fill="none"
                stroke={
                  highlightAnimal.category === 'Elite'
                    ? '#10b981'
                    : highlightAnimal.category === 'Normal'
                    ? '#38bdf8'
                    : '#f43f5e'
                }
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Actual Data Points */}
            {chartPoints.actualData.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={getX(pt.days)}
                  cy={getY(pt.weight)}
                  r="5"
                  fill="#0c0a09"
                  stroke={
                    highlightAnimal.category === 'Elite'
                      ? '#10b981'
                      : highlightAnimal.category === 'Normal'
                      ? '#38bdf8'
                      : '#f43f5e'
                  }
                  strokeWidth="3"
                />
                <text
                  x={getX(pt.days)}
                  y={getY(pt.weight) - 10}
                  fill="#f5f5f4"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {pt.weight} كغ
                </text>
              </g>
            ))}
          </svg>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-400 px-3 pt-3 border-t border-stone-800/80">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-stone-500" />
                <span>المعدل المعياري لسلالة {benchmark.name_ar}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      highlightAnimal.category === 'Elite'
                        ? '#10b981'
                        : highlightAnimal.category === 'Normal'
                        ? '#38bdf8'
                        : '#f43f5e',
                  }}
                />
                <span className="font-bold text-stone-200">
                  {highlightAnimal.tag_number} ({highlightAnimal.name || highlightAnimal.category})
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectAnimal(highlightAnimal)}
              className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
            >
              عرض السجل التفصيلي لهذا الخروف ↗
            </button>
          </div>
        </div>
      </div>

      {/* Algerian Sheep Breeds Reference & Benchmark Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>السلالات الأصيلة المعتمدة في خوارزمية SOL Engine</span>
          </h3>
          <span className="text-xs text-stone-400">معايير الانتخاب المحددة برمجياً</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(BREED_BENCHMARKS).map(([key, b]) => {
            const count = breedCounts[key as Breed] || 0;
            return (
              <div
                key={key}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-100 text-sm">{b.name_ar}</h4>
                    <span className="text-[11px] text-stone-500 font-mono">{b.name_en}</span>
                  </div>
                  <span className="text-xs bg-stone-950 px-2.5 py-1 rounded-lg text-emerald-400 border border-stone-800 font-mono">
                    {count} رؤوس مسجلة
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                  {b.characteristics_ar}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-stone-800 text-stone-300 font-mono">
                  <div>
                    <span className="text-stone-500">معدل ADG المستهدف:</span>
                    <div className="font-bold text-emerald-400">{b.avg_adg_g_day} غ/يوم</div>
                  </div>
                  <div>
                    <span className="text-stone-500">الوزن البالغ (الفحل):</span>
                    <div className="font-bold text-stone-100">{b.target_adult_weight_male} كغ</div>
                  </div>
                  <div>
                    <span className="text-stone-500">وزن الولادة:</span>
                    <div className="font-bold text-stone-100">{b.avg_birth_weight} كغ</div>
                  </div>
                  <div>
                    <span className="text-stone-500">الموطن:</span>
                    <div className="font-bold text-stone-400 text-[10px]">{b.origin_ar}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
