import React, { useMemo, useState } from 'react';
import { Animal, WeightLog, CircularEconomyMetrics } from '../types/schema';
import { calculateCircularEconomy } from '../engine/genetics';
import {
  Recycle,
  Coins,
  Scale,
  Leaf,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Truck,
  ArrowUpRight,
} from 'lucide-react';

interface CircularEconomyProps {
  animals: Animal[];
  weightLogs: WeightLog[];
  onSellAnimal: (animalId: string, salePriceDzd: number, notes?: string) => void;
  onSelectAnimalForDetails: (animal: Animal) => void;
}

export const CircularEconomy: React.FC<CircularEconomyProps> = ({
  animals,
  weightLogs,
  onSellAnimal,
  onSelectAnimalForDetails,
}) => {
  const [successMsg, setSuccessMsg] = useState('');

  const metrics: CircularEconomyMetrics = useMemo(() => {
    return calculateCircularEconomy(animals, weightLogs);
  }, [animals, weightLogs]);

  // Candidate animals for culling/sale:
  // 1. All Active animals with category 'Reject'
  // 2. Active non-breeding males weighing >= 50kg
  const cullingCandidates = useMemo(() => {
    return animals.filter((a) => {
      if (a.status !== 'Active') return false;
      if (a.category === 'Reject') return true;
      return false;
    });
  }, [animals]);

  const handleSell = (animal: Animal, estimatedPrice: number) => {
    onSellAnimal(
      animal.id,
      estimatedPrice,
      `بيع تصفية لتأمين السيولة النقدية للأعلاف (${animal.category})`
    );
    setSuccessMsg(`تم تسجيل بيع الحيوان ${animal.tag_number} بنجاح وإيداع ${estimatedPrice.toLocaleString()} دج في ميزانية المزرعة!`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-100 flex items-center gap-2">
          <Recycle className="w-5 h-5 text-emerald-400" />
          <span>لوحة الاقتصاد الدائري والمالية (Circular Economy & Flow Tracker)</span>
        </h1>
        <p className="text-xs text-stone-400">
          تتبع كفاءة تحويل الأعلاف إلى لحوم، استثمار السماد العضوي، وإدارة التصفية لتأمين السيولة النقدية المستمرة
        </p>
      </div>

      {/* Input / Output Transformation Diagram */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>مخطط تدفق المدخلات والمخرجات الحيوية (Mass Balance Flow)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Feed Input */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2 text-right">
            <span className="text-[11px] text-stone-400 font-bold block">
              المدخلات: العلف المستهلك
            </span>
            <div className="text-2xl font-black font-mono text-amber-400">
              {metrics.totalFeedConsumedTons} <span className="text-xs font-sans text-stone-400 font-normal">طن علف</span>
            </div>
            <p className="text-[11px] text-stone-500">
              مزيج الشعير، النخالة، الدريس والشوفان المغذي للقطيع
            </p>
          </div>

          {/* Transformation Arrow */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2 text-right">
            <span className="text-[11px] text-stone-400 font-bold block">
              مخرجات اللحوم المنتجة (Gain)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {metrics.totalLiveWeightProducedKg} <span className="text-xs font-sans text-stone-400 font-normal">كغ وزن قائم</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-400">
              <span>كفاءة التحويل (FCR):</span>
              <strong className="text-stone-200 font-mono">{metrics.overallFcr}</strong>
            </div>
          </div>

          {/* Card 3: Organic Fertilizer Output */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2 text-right">
            <span className="text-[11px] text-stone-400 font-bold block">
              السماد العضوي المسترجع (Compost)
            </span>
            <div className="text-2xl font-black font-mono text-teal-400">
              {metrics.organicManureProducedM3} <span className="text-xs font-sans text-stone-400 font-normal">متر مكعب (m³)</span>
            </div>
            <p className="text-[11px] text-stone-500">
              يعاد تدويره لتسميد حقول الأعلاف أو يباع للمزارع المجاورة
            </p>
          </div>
        </div>
      </div>

      {/* Organic Fertilizer Distribution Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fertilizer split */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>توزيع السماد العضوي (Organic Fertilizer Routing)</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono">
              إجمالي: {metrics.organicManureProducedM3} م³
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-stone-200 block">
                  سماد موجه للمزرعة (مساحات الأعلاف):
                </span>
                <span className="text-[11px] text-stone-500">
                  تسميد تربة الفصة والشعير لتحقيق الاكتفاء الذاتي
                </span>
              </div>
              <div className="text-right font-mono font-bold text-sm text-emerald-400">
                {metrics.manureForFarmM3} م³ (65%)
              </div>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-stone-200 block">
                  سماد عضوي موجه للبيع التجاري:
                </span>
                <span className="text-[11px] text-stone-500">
                  مبيعات للأشجار المثمرة والبيوت البلاستيكية
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-teal-300">
                  {metrics.manureSoldM3} م³ (35%)
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                  + {metrics.fertilizerRevenueDzd.toLocaleString()} دج عوائد
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liquidity Potential Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>إمكانات السيولة النقدية المتاحة (Liquidity Forecast)</span>
            </h3>
            <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              دعم صندوق الأعلاف
            </span>
          </div>

          <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="text-xs text-stone-400">
              إجمالي السيولة النقدية المتوقعة من تصفية الحيوانات غير المنتجة (Reject) فوراً:
            </div>
            <div className="text-3xl font-black font-mono text-amber-400">
              {metrics.projectedLiquidityRevenueDzd.toLocaleString()}{' '}
              <span className="text-xs font-sans text-stone-400 font-normal">دينار جزائري (DZD)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-[11px] text-stone-400">
              <div>
                <span>رؤوس جاهزة للتصفية:</span>
                <strong className="block text-stone-200 font-mono text-xs">
                  {metrics.rejectAnimalsReadyCount} رأس
                </strong>
              </div>
              <div>
                <span>لحم صافي مقدر (50% تصافي):</span>
                <strong className="block text-stone-200 font-mono text-xs">
                  ~{metrics.projectedMeatYieldKg} كغ
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Culling & Cash Flow Operations Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>إدارة التصفية والسيولة النقدية (Cash Flow Operations)</span>
            </h3>
            <p className="text-xs text-stone-400">
              قائمة الحيوانات المصنفة كـ Reject وفق خوارزمية الانتخاب، الموجهة للبيع السريع لتمويل مشتريات الأعلاف
            </p>
          </div>

          <span className="text-xs font-mono bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 text-stone-300">
            {cullingCandidates.length} حيوان مرشح للتصفية
          </span>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {cullingCandidates.length > 0 ? (
          <div className="divide-y divide-stone-800 overflow-x-auto">
            {cullingCandidates.map((animal) => {
              const logs = weightLogs.filter((l) => l.animal_id === animal.id);
              const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : animal.birth_weight || 35;
              const estimatedPrice = Math.round(latestWeight * 1050); // 1050 DZD/kg
              const estimatedCarcassKg = Math.round(latestWeight * 0.5);

              return (
                <div
                  key={animal.id}
                  className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-stone-100">
                        {animal.tag_number}
                      </span>
                      {animal.name && (
                        <span className="text-stone-300 font-semibold">({animal.name})</span>
                      )}
                      <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-800">
                        {animal.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      السلالة: {animal.breed} · سبب التصفية: ضعف معدل النمو أو تكرار الأمراض
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left font-mono">
                      <div className="text-stone-200 font-bold">
                        {latestWeight} كغ (قائم) · ~{estimatedCarcassKg} كغ سقط
                      </div>
                      <div className="text-amber-400 font-bold text-sm">
                        {estimatedPrice.toLocaleString()} دج تقديري
                      </div>
                    </div>

                    <button
                      onClick={() => handleSell(animal, estimatedPrice)}
                      className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-md"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>تأكيد البيع والسيولة</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-stone-500">
            لا توجد حالياً حيوانات مصنفة كـ Reject بانتظار التصفية في القطيع.
          </div>
        )}
      </div>
    </div>
  );
};
