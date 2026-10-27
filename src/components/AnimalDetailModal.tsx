import React, { useState, useMemo } from 'react';
import { Animal, WeightLog, HealthRecord, BreedingRecord, GeneticCategory } from '../types/schema';
import { calculateAge, BREED_BENCHMARKS } from '../engine/genetics';
import {
  X,
  Dna,
  Tag,
  Calendar,
  Scale,
  Activity,
  Syringe,
  Heart,
  TrendingUp,
  Shield,
  Edit2,
  Check,
} from 'lucide-react';

interface AnimalDetailModalProps {
  animal: Animal | null;
  allAnimals: Animal[];
  weightLogs: WeightLog[];
  healthRecords: HealthRecord[];
  breedingRecords: BreedingRecord[];
  onClose: () => void;
  onUpdateCategory: (animalId: string, newCategory: GeneticCategory, reason?: string) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  allAnimals,
  weightLogs,
  healthRecords,
  breedingRecords,
  onClose,
  onUpdateCategory,
}) => {
  if (!animal) return null;

  const [activeTab, setActiveTab] = useState<'weights' | 'health' | 'breeding' | 'meta'>('weights');
  const [editingCategory, setEditingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GeneticCategory>(animal.category);
  const [overrideReason, setOverrideReason] = useState('');

  const age = calculateAge(animal.birth_date);
  const benchmark = BREED_BENCHMARKS[animal.breed] || BREED_BENCHMARKS.Ouled_Djellal;

  const sire = animal.sire_id ? allAnimals.find((a) => a.id === animal.sire_id) : null;
  const dam = animal.dam_id ? allAnimals.find((a) => a.id === animal.dam_id) : null;

  const animalLogs = useMemo(() => {
    return weightLogs
      .filter((l) => l.animal_id === animal.id)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  }, [weightLogs, animal]);

  const animalHealth = useMemo(() => {
    return healthRecords
      .filter((h) => h.animal_id === animal.id)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  }, [healthRecords, animal]);

  const animalBreeding = useMemo(() => {
    return breedingRecords.filter(
      (b) => b.dam_id === animal.id || b.sire_id === animal.id
    );
  }, [breedingRecords, animal]);

  const latestLog = animalLogs[animalLogs.length - 1];

  const handleSaveCategoryOverride = () => {
    onUpdateCategory(animal.id, selectedCategory, overrideReason);
    setEditingCategory(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100 font-mono">{animal.tag_number}</h2>
                {animal.name && <span className="text-emerald-400 font-bold">({animal.name})</span>}
                <span className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                  {benchmark.name_ar}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">SOL-ID: {animal.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
            <div>
              <span className="text-stone-500 block">الجنس:</span>
              <strong className="text-stone-200 font-mono">
                {animal.gender === 'Male' ? 'ذكر ♂ (كبش/خروف)' : 'أنثى ♀ (نعجة/خروفة)'}
              </strong>
            </div>

            <div>
              <span className="text-stone-500 block">العمر:</span>
              <strong className="text-stone-200 font-mono">{age.formatted}</strong>
            </div>

            <div>
              <span className="text-stone-500 block">الوزن الحالي:</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {latestLog ? `${latestLog.weight_kg} كغ` : `${animal.birth_weight} كغ`}
              </strong>
            </div>

            <div>
              <span className="text-stone-500 block">التصنيف الوراثي:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    animal.category === 'Elite'
                      ? 'bg-amber-500/20 text-amber-300'
                      : animal.category === 'Normal'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {animal.category}
                </span>
                <button
                  onClick={() => setEditingCategory(!editingCategory)}
                  className="text-stone-400 hover:text-emerald-400 p-0.5"
                  title="تعديل التصنيف الوراثي يدوياً"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Override Box */}
          {editingCategory && (
            <div className="bg-stone-950/90 border border-amber-600/50 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-amber-300 block">
                تعديل التصنيف الوراثي للحيوان (Manual Selection Override):
              </span>
              <div className="flex items-center gap-2">
                {(['Elite', 'Normal', 'Reject'] as GeneticCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-900 text-stone-400 border-stone-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="سبب ترقية أو تعديل التصنيف (مثال: أداء متميز في التكاثر)..."
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
              />
              <button
                onClick={handleSaveCategoryOverride}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                حفظ التعديل الوراثي
              </button>
            </div>
          )}

          {/* Pedigree Summary Box */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>بيانات النسب والتوثيق الوراثي (Pedigree Origin):</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[11px] block">الأب (Sire ♂):</span>
                {sire ? (
                  <div className="font-mono text-stone-200 font-bold mt-0.5">
                    {sire.tag_number} - {sire.name || sire.breed} ({sire.category})
                  </div>
                ) : (
                  <span className="text-stone-500">غير مسجل / شراء خارجي</span>
                )}
              </div>

              <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[11px] block">الأم (Dam ♀):</span>
                {dam ? (
                  <div className="font-mono text-stone-200 font-bold mt-0.5">
                    {dam.tag_number} - {dam.name || dam.breed} ({dam.category})
                  </div>
                ) : (
                  <span className="text-stone-500">غير مسجلة / شراء خارجي</span>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Weights vs Health vs Breeding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
              <button
                onClick={() => setActiveTab('weights')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'weights'
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                سجل الأوزان والنمو ({animalLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'health'
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                السجل الصحي والطبي ({animalHealth.length})
              </button>
              <button
                onClick={() => setActiveTab('breeding')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'breeding'
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                سجل التكاثر ({animalBreeding.length})
              </button>
            </div>

            {/* Weights Content */}
            {activeTab === 'weights' && (
              <div className="space-y-2">
                {animalLogs.length > 0 ? (
                  <div className="divide-y divide-stone-800 bg-stone-950 rounded-xl p-3 border border-stone-800 font-mono text-xs">
                    {animalLogs.map((log) => (
                      <div key={log.log_id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-stone-200 font-bold">
                            {log.weight_kg} كغ
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {new Date(log.recorded_at).toLocaleDateString('ar-DZ')} ·{' '}
                            {log.notes || 'قياس دوري'}
                          </div>
                        </div>

                        {log.adg_since_last > 0 && (
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold">
                              +{log.adg_since_last} غ/يوم
                            </span>
                            <span className="text-[10px] text-stone-500 block">ADG</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-stone-500">
                    لا توجد تسجيلات أوزان بعد
                  </div>
                )}
              </div>
            )}

            {/* Health Content */}
            {activeTab === 'health' && (
              <div className="space-y-2">
                {animalHealth.length > 0 ? (
                  <div className="divide-y divide-stone-800 bg-stone-950 rounded-xl p-3 border border-stone-800 text-xs">
                    {animalHealth.map((h) => (
                      <div key={h.record_id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-stone-200 font-semibold">{h.title}</div>
                          <div className="text-[11px] text-stone-500">
                            {h.description} · {new Date(h.recorded_at).toLocaleDateString('ar-DZ')}
                          </div>
                        </div>
                        {h.cost_dzd && (
                          <span className="font-mono text-stone-400">{h.cost_dzd} دج</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-stone-500">
                    سجل صحي نظيف (لا توجد إصابات أو علاجات مسجلة)
                  </div>
                )}
              </div>
            )}

            {/* Breeding Content */}
            {activeTab === 'breeding' && (
              <div className="space-y-2">
                {animalBreeding.length > 0 ? (
                  <div className="divide-y divide-stone-800 bg-stone-950 rounded-xl p-3 border border-stone-800 text-xs">
                    {animalBreeding.map((b) => (
                      <div key={b.mating_id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-stone-200 font-semibold">
                            تزاوج: {b.mating_date} ⬅️ ولادة متوقعة: {b.expected_litter_date}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            الحالة: {b.pregnancy_status} {b.litter_size ? `· مواليد: ${b.litter_size}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-stone-500">
                    لا توجد عمليات تزاوج مسجلة لهذا الحيوان
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
