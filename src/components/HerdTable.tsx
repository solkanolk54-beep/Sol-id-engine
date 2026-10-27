import React, { useState, useMemo } from 'react';
import { Animal, WeightLog, HealthRecord, Breed, GeneticCategory, AnimalStatus } from '../types/schema';
import { calculateAge, BREED_BENCHMARKS, evaluateAnimalCategory } from '../engine/genetics';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Tag,
  Dna,
  ArrowUpDown,
  TrendingUp,
} from 'lucide-react';

interface HerdTableProps {
  animals: Animal[];
  weightLogs: WeightLog[];
  healthRecords: HealthRecord[];
  onSelectAnimal: (animal: Animal) => void;
  onUpdateAnimalsBatch: (updatedAnimals: Animal[]) => void;
}

export const HerdTable: React.FC<HerdTableProps> = ({
  animals,
  weightLogs,
  healthRecords,
  onSelectAnimal,
  onUpdateAnimalsBatch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<Breed | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<GeneticCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AnimalStatus | 'ALL'>('Active');
  const [algoSuccessMsg, setAlgoSuccessMsg] = useState('');

  // Filtering
  const filteredAnimals = useMemo(() => {
    return animals.filter((a) => {
      const matchSearch =
        !searchTerm.trim() ||
        a.tag_number.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchBreed = selectedBreed === 'ALL' || a.breed === selectedBreed;
      const matchCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || a.status === selectedStatus;

      return matchSearch && matchBreed && matchCategory && matchStatus;
    });
  }, [animals, searchTerm, selectedBreed, selectedCategory, selectedStatus]);

  // Execute Rule-Based Initial Selection Algorithm on all Active animals
  const handleRunSelectionAlgorithm = () => {
    let reclassifiedCount = 0;
    const updated = animals.map((animal) => {
      // If manual override is locked, skip unless user asks
      if (animal.status !== 'Active') return animal;

      const evalResult = evaluateAnimalCategory(animal, weightLogs, healthRecords);
      if (evalResult.category !== animal.category) {
        reclassifiedCount++;
        return {
          ...animal,
          category: evalResult.category,
          override_reason: evalResult.reason,
        };
      }
      return animal;
    });

    onUpdateAnimalsBatch(updated);
    setAlgoSuccessMsg(
      `تم تشغيل خوارزمية الانتخاب الوراثي بنجاح! تم تحديث تصنيف ${reclassifiedCount} حيوان وفق مؤشرات النمو والسجل الصحي.`
    );
    setTimeout(() => setAlgoSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Algorithm CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>سجل القطيع والمحددات الوراثية (Herd Registry & Genetic Matrix)</span>
          </h1>
          <p className="text-xs text-stone-400">
            تتبع هويات SOL-ID، الأنساب، الأوزان الحية وتطبيق خوارزمية التصنيف الأولي
          </p>
        </div>

        {/* Algorithm Trigger Button */}
        <button
          onClick={handleRunSelectionAlgorithm}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 text-stone-950" />
          <span>تشغيل خوارزمية الانتخاب الأولي الآلية</span>
        </button>
      </div>

      {algoSuccessMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{algoSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم القرط أو الاسم..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl pr-10 pl-3 py-2 text-xs text-stone-100 outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Breed Filter */}
          <div>
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value as Breed | 'ALL')}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none focus:border-emerald-500"
            >
              <option value="ALL">كافة السلالات</option>
              {Object.keys(BREED_BENCHMARKS).map((b) => (
                <option key={b} value={b}>
                  سلالة {BREED_BENCHMARKS[b as Breed].name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GeneticCategory | 'ALL')}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none focus:border-emerald-500"
            >
              <option value="ALL">كافة التصنيفات الوراثية</option>
              <option value="Elite">★ نخبة (Elite)</option>
              <option value="Normal">تجاري (Normal)</option>
              <option value="Reject">تصفية (Reject)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AnimalStatus | 'ALL')}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none focus:border-emerald-500"
            >
              <option value="ALL">كافة الحالات</option>
              <option value="Active">نشط بالقطيع (Active)</option>
              <option value="Sold">تم البيع (Sold)</option>
              <option value="Slaughtered">مذبوح (Slaughtered)</option>
              <option value="Deceased">نافق (Deceased)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Animals Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-stone-950/80 border-b border-stone-800 text-stone-400 font-medium">
                <th className="py-3 px-4">رقم القرط / SOL-ID</th>
                <th className="py-3 px-4">السلالة</th>
                <th className="py-3 px-4">الجنس / العمر</th>
                <th className="py-3 px-4">النسب (الأب / الأم)</th>
                <th className="py-3 px-4">الوزن الحالي</th>
                <th className="py-3 px-4">معدل النمو (ADG)</th>
                <th className="py-3 px-4">التصنيف الوراثي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {filteredAnimals.map((animal) => {
                const logs = weightLogs
                  .filter((l) => l.animal_id === animal.id)
                  .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
                const latestLog = logs[logs.length - 1];
                const currentWeight = latestLog ? latestLog.weight_kg : animal.birth_weight;
                const latestAdg = latestLog ? latestLog.adg_since_last : 0;
                const age = calculateAge(animal.birth_date);
                const benchmark = BREED_BENCHMARKS[animal.breed] || BREED_BENCHMARKS.Ouled_Djellal;

                return (
                  <tr
                    key={animal.id}
                    onClick={() => onSelectAnimal(animal)}
                    className="hover:bg-stone-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Tag Number & Name */}
                    <td className="py-3 px-4 font-bold text-stone-100">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-stone-500 group-hover:text-emerald-400" />
                        <span>{animal.tag_number}</span>
                      </div>
                      {animal.name && (
                        <div className="text-[11px] font-sans font-normal text-emerald-400 pr-5">
                          {animal.name}
                        </div>
                      )}
                    </td>

                    {/* Breed */}
                    <td className="py-3 px-4 font-sans text-stone-300">
                      {benchmark.name_ar}
                    </td>

                    {/* Gender & Age */}
                    <td className="py-3 px-4 font-sans text-stone-300">
                      <div>{animal.gender === 'Male' ? 'ذكر ♂' : 'أنثى ♀'}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{age.formatted}</div>
                    </td>

                    {/* Pedigree */}
                    <td className="py-3 px-4 font-sans text-[11px] text-stone-400">
                      {animal.sire_id || animal.dam_id ? (
                        <div className="space-y-0.5">
                          <div>
                            الأب:{' '}
                            <strong className="text-stone-300 font-mono">
                              {animal.sire_id
                                ? animals.find((a) => a.id === animal.sire_id)?.tag_number || 'مسجل'
                                : 'مجهول'}
                            </strong>
                          </div>
                          <div>
                            الأم:{' '}
                            <strong className="text-stone-300 font-mono">
                              {animal.dam_id
                                ? animals.find((a) => a.id === animal.dam_id)?.tag_number || 'مسجل'
                                : 'مجهول'}
                            </strong>
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-600">غير موثق</span>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="py-3 px-4 font-bold text-stone-100">
                      {currentWeight} كغ
                    </td>

                    {/* ADG */}
                    <td className="py-3 px-4">
                      {latestAdg > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            latestAdg >= benchmark.avg_adg_g_day
                              ? 'text-emerald-400'
                              : latestAdg >= benchmark.min_adg_threshold
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{latestAdg} غ/يوم
                        </span>
                      ) : (
                        <span className="text-stone-500">-</span>
                      )}
                    </td>

                    {/* Genetic Category */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          animal.category === 'Elite'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : animal.category === 'Normal'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {animal.category === 'Elite'
                          ? '★ Elite'
                          : animal.category === 'Normal'
                          ? 'Normal'
                          : 'Reject'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 font-sans text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          animal.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300'
                            : animal.status === 'Sold'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {animal.status === 'Active'
                          ? 'نشط'
                          : animal.status === 'Sold'
                          ? 'مباع'
                          : animal.status === 'Slaughtered'
                          ? 'مذبوح'
                          : 'نافق'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAnimal(animal);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 underline font-sans text-xs"
                      >
                        التفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAnimals.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-500">
            لا توجد رؤوس مطابقة لمعايير البحث والتصفية المحددة.
          </div>
        )}
      </div>
    </div>
  );
};
