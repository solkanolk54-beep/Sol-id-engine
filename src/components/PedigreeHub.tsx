import React, { useState, useMemo } from 'react';
import { Animal, BreedingRecord, WeightLog } from '../types/schema';
import {
  calculateInbreedingCoefficient,
  InbreedingResult,
  calculateExpectedLambingDate,
  BREED_BENCHMARKS,
} from '../engine/genetics';
import {
  Dna,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  Heart,
  ChevronDown,
} from 'lucide-react';

interface PedigreeHubProps {
  animals: Animal[];
  weightLogs: WeightLog[];
  breedingRecords: BreedingRecord[];
  onCommitMating: (record: Omit<BreedingRecord, 'mating_id'>) => void;
  onSelectAnimalForDetails: (animal: Animal) => void;
}

export const PedigreeHub: React.FC<PedigreeHubProps> = ({
  animals,
  weightLogs,
  breedingRecords,
  onCommitMating,
  onSelectAnimalForDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'matchmaker'>('tree');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('sol-oj-082'); // Al-Raad has known pedigree!

  // Matchmaker state
  const [selectedSireId, setSelectedSireId] = useState<string>('sol-oj-001'); // Al-Baroud (Elite)
  const [selectedDamId, setSelectedDamId] = useState<string>('sol-oj-f01'); // Al-Yaqouta (Half-sister: triggers 12.5% warning!)
  const [matchmakerCommitted, setMatchmakerCommitted] = useState<string>('');

  const animalsMap = useMemo(() => {
    const map = new Map<string, Animal>();
    animals.forEach((a) => map.set(a.id, a));
    return map;
  }, [animals]);

  const selectedAnimal = useMemo(() => {
    return animalsMap.get(selectedAnimalId) || animals[0];
  }, [animalsMap, selectedAnimalId]);

  // Genealogical nodes for the tree
  const pedigreeNodes = useMemo(() => {
    if (!selectedAnimal) return null;

    const sire = selectedAnimal.sire_id ? animalsMap.get(selectedAnimal.sire_id) : null;
    const dam = selectedAnimal.dam_id ? animalsMap.get(selectedAnimal.dam_id) : null;

    const patGrandSire = sire?.sire_id ? animalsMap.get(sire.sire_id) : null;
    const patGrandDam = sire?.dam_id ? animalsMap.get(sire.dam_id) : null;

    const matGrandSire = dam?.sire_id ? animalsMap.get(dam.sire_id) : null;
    const matGrandDam = dam?.dam_id ? animalsMap.get(dam.dam_id) : null;

    return {
      animal: selectedAnimal,
      sire,
      dam,
      patGrandSire,
      patGrandDam,
      matGrandSire,
      matGrandDam,
    };
  }, [selectedAnimal, animalsMap]);

  // Offspring of selected animal
  const offspringList = useMemo(() => {
    if (!selectedAnimal) return [];
    return animals.filter(
      (a) => a.sire_id === selectedAnimal.id || a.dam_id === selectedAnimal.id
    );
  }, [animals, selectedAnimal]);

  // Matchmaker computation
  const matchResult: InbreedingResult | null = useMemo(() => {
    if (!selectedSireId || !selectedDamId) return null;
    return calculateInbreedingCoefficient(selectedSireId, selectedDamId, animalsMap);
  }, [selectedSireId, selectedDamId, animalsMap]);

  const sireAnimal = animalsMap.get(selectedSireId);
  const damAnimal = animalsMap.get(selectedDamId);

  const handleExecuteMating = () => {
    if (!selectedSireId || !selectedDamId) return;
    const today = new Date().toISOString().split('T')[0];
    const expected = calculateExpectedLambingDate(today);

    onCommitMating({
      sire_id: selectedSireId,
      dam_id: selectedDamId,
      mating_date: today,
      expected_litter_date: expected,
      pregnancy_status: 'suspected',
      notes: `تزاوج موجه عبر SOL Matchmaker (معامل قرابة: ${matchResult?.coefficientPercent}%)`,
    });

    setMatchmakerCommitted(
      `تم جدولة التزاوج الموجه بنجاح! موعد الولادة المتوقع: ${expected}`
    );
    setTimeout(() => setMatchmakerCommitted(''), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <Dna className="w-5 h-5 text-emerald-400" />
            <span>مركز إدارة السلالة والأنساب (SOL Pedigree & Breeding Hub)</span>
          </h1>
          <p className="text-xs text-stone-400">
            تتبع شجرة النسب الوراثية وخوارزمية التزاوج الموجه لحماية السلالة من الانحدار الوراثي
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-xl">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tree'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>شجرة النسب (Pedigree Tree)</span>
          </button>

          <button
            onClick={() => setActiveTab('matchmaker')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'matchmaker'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>أداة التزاوج الموجه (Matchmaker)</span>
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE PEDIGREE TREE TAB */}
      {activeTab === 'tree' && (
        <div className="space-y-6">
          {/* Animal Selector Toolbar */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-300">عرض شجرة الأنساب للحيوان:</span>
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none font-mono"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag_number} - {a.name || a.breed} ({a.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span>السلالة: <strong className="text-stone-200">{selectedAnimal?.breed}</strong></span>
              <span>·</span>
              <span>عدد الأبناء المسجلين: <strong className="text-emerald-400 font-mono">{offspringList.length}</strong></span>
            </div>
          </div>

          {/* Visual Pedigree Tree Canvas */}
          {pedigreeNodes && (
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
              <div className="min-w-[700px] flex items-center justify-between gap-6 py-4">
                {/* Generation 1: Selected Animal */}
                <div className="w-1/3 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    الحيوان المختار (SOL-ID)
                  </span>
                  <div
                    onClick={() => onSelectAnimalForDetails(pedigreeNodes.animal)}
                    className="w-full bg-stone-950 border-2 border-emerald-500 rounded-2xl p-4 shadow-xl text-center cursor-pointer hover:border-emerald-400 transition-colors relative group"
                  >
                    <span className="text-xs text-stone-400 font-mono block">
                      {pedigreeNodes.animal.tag_number}
                    </span>
                    <h3 className="text-base font-bold text-stone-100 mt-1">
                      {pedigreeNodes.animal.name || pedigreeNodes.animal.breed}
                    </h3>
                    <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                      <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                        {pedigreeNodes.animal.category}
                      </span>
                      <span className="text-stone-400 font-mono">
                        {pedigreeNodes.animal.gender === 'Male' ? 'ذكر ♂' : 'أنثى ♀'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connecting lines */}
                <div className="text-stone-600 font-mono text-xl select-none">
                  ◄
                </div>

                {/* Generation 2: Parents (Sire & Dam) */}
                <div className="w-1/3 flex flex-col gap-6">
                  {/* Sire Box */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold block text-center">
                      الأب (Sire) ♂
                    </span>
                    {pedigreeNodes.sire ? (
                      <div
                        onClick={() => onSelectAnimalForDetails(pedigreeNodes.sire!)}
                        className="bg-stone-950 border border-stone-700 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-emerald-400 font-mono font-bold block">
                          {pedigreeNodes.sire.tag_number}
                        </span>
                        <span className="text-xs font-semibold text-stone-200">
                          {pedigreeNodes.sire.name || pedigreeNodes.sire.breed}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {pedigreeNodes.sire.category}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-stone-950/40 border border-dashed border-stone-800 rounded-xl p-3 text-center text-xs text-stone-600">
                        غير مسجل في النظام
                      </div>
                    )}
                  </div>

                  {/* Dam Box */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold block text-center">
                      الأم (Dam) ♀
                    </span>
                    {pedigreeNodes.dam ? (
                      <div
                        onClick={() => onSelectAnimalForDetails(pedigreeNodes.dam!)}
                        className="bg-stone-950 border border-stone-700 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-emerald-400 font-mono font-bold block">
                          {pedigreeNodes.dam.tag_number}
                        </span>
                        <span className="text-xs font-semibold text-stone-200">
                          {pedigreeNodes.dam.name || pedigreeNodes.dam.breed}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {pedigreeNodes.dam.category}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-stone-950/40 border border-dashed border-stone-800 rounded-xl p-3 text-center text-xs text-stone-600">
                        غير مسجلة في النظام
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-stone-600 font-mono text-xl select-none">
                  ◄
                </div>

                {/* Generation 3: Grandparents (4 ancestors) */}
                <div className="w-1/3 flex flex-col gap-3">
                  <span className="text-[10px] text-stone-400 font-bold block text-center">
                    الأجداد (Grandparents)
                  </span>

                  {/* Paternal Grandparents */}
                  <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2 text-center text-[11px] space-y-0.5">
                    <span className="text-stone-500 block text-[9px]">جد من الأب:</span>
                    <span className="font-mono font-semibold text-stone-200">
                      {pedigreeNodes.patGrandSire?.tag_number || 'غير مسجل'}
                    </span>
                  </div>

                  <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2 text-center text-[11px] space-y-0.5">
                    <span className="text-stone-500 block text-[9px]">جدة من الأب:</span>
                    <span className="font-mono font-semibold text-stone-200">
                      {pedigreeNodes.patGrandDam?.tag_number || 'غير مسجل'}
                    </span>
                  </div>

                  {/* Maternal Grandparents */}
                  <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2 text-center text-[11px] space-y-0.5">
                    <span className="text-stone-500 block text-[9px]">جد من الأم:</span>
                    <span className="font-mono font-semibold text-stone-200">
                      {pedigreeNodes.matGrandSire?.tag_number || 'غير مسجل'}
                    </span>
                  </div>

                  <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2 text-center text-[11px] space-y-0.5">
                    <span className="text-stone-500 block text-[9px]">جدة من الأم:</span>
                    <span className="font-mono font-semibold text-stone-200">
                      {pedigreeNodes.matGrandDam?.tag_number || 'غير مسجل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offspring Performance Section */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>أداء النسل والذرية (Offspring Performance)</span>
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                {offspringList.length} أبناء مسجلين
              </span>
            </div>

            {offspringList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {offspringList.map((child) => {
                  const childLogs = weightLogs.filter((l) => l.animal_id === child.id);
                  const latestWeight = childLogs.length > 0 ? childLogs[childLogs.length - 1].weight_kg : child.birth_weight;
                  const latestAdg = childLogs.length > 0 ? childLogs[childLogs.length - 1].adg_since_last : 0;
                  return (
                    <div
                      key={child.id}
                      onClick={() => onSelectAnimalForDetails(child)}
                      className="bg-stone-950 border border-stone-800 hover:border-emerald-500/60 rounded-xl p-3 cursor-pointer transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-stone-200">
                          {child.tag_number}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            child.category === 'Elite'
                              ? 'bg-amber-500/20 text-amber-300'
                              : child.category === 'Normal'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {child.category}
                        </span>
                      </div>
                      <div className="text-xs text-stone-300 font-medium">
                        {child.name || child.breed} ({child.gender === 'Male' ? 'ذكر' : 'أنثى'})
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800 font-mono">
                        <span>الوزن: <strong className="text-stone-200">{latestWeight} كغ</strong></span>
                        {latestAdg > 0 && (
                          <span className="text-emerald-400">+{latestAdg} غ/يوم</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500">
                لا توجد ذرية مسجلة بعد لهذا الحيوان في قاعدة البيانات
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. BREEDING MATCHMAKER TOOL TAB */}
      {activeTab === 'matchmaker' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>أداة التزاوج الموجه وحساب قرابة الدم (Inbreeding Matchmaker Tool)</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                اختر الفحل النخبوي والنعجة المستهدفة لحساب معامل رايت لقرابة الدم (Wright's Coefficient) فوراً وتوقع أداء النسل
              </p>
            </div>

            {/* Selector Grid: Sire & Dam */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sire Selection */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold text-stone-200 flex items-center justify-between">
                  <span>اختيار الفحل (Sire ♂):</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    ذكور نشطة
                  </span>
                </label>
                <select
                  value={selectedSireId}
                  onChange={(e) => setSelectedSireId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
                >
                  {animals
                    .filter((a) => a.gender === 'Male' && a.status === 'Active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.tag_number} - {s.name || s.breed} ({s.category})
                      </option>
                    ))}
                </select>

                {sireAnimal && (
                  <div className="p-3 bg-stone-900/60 rounded-lg text-xs space-y-1 text-stone-300">
                    <div className="font-bold text-stone-100">{sireAnimal.name || sireAnimal.tag_number}</div>
                    <div className="text-[11px] text-stone-400">
                      السلالة: {sireAnimal.breed} · التصنيف: {sireAnimal.category}
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      الأب: {sireAnimal.sire_id ? animalsMap.get(sireAnimal.sire_id)?.tag_number || 'مسجل' : 'غير مسجل'} · 
                      الأم: {sireAnimal.dam_id ? animalsMap.get(sireAnimal.dam_id)?.tag_number || 'مسجل' : 'غير مسجل'}
                    </div>
                  </div>
                )}
              </div>

              {/* Dam Selection */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold text-stone-200 flex items-center justify-between">
                  <span>اختيار النعجة (Dam ♀):</span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                    إناث نشطة
                  </span>
                </label>
                <select
                  value={selectedDamId}
                  onChange={(e) => setSelectedDamId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
                >
                  {animals
                    .filter((a) => a.gender === 'Female' && a.status === 'Active')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.tag_number} - {d.name || d.breed} ({d.category})
                      </option>
                    ))}
                </select>

                {damAnimal && (
                  <div className="p-3 bg-stone-900/60 rounded-lg text-xs space-y-1 text-stone-300">
                    <div className="font-bold text-stone-100">{damAnimal.name || damAnimal.tag_number}</div>
                    <div className="text-[11px] text-stone-400">
                      السلالة: {damAnimal.breed} · التصنيف: {damAnimal.category}
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      الأب: {damAnimal.sire_id ? animalsMap.get(damAnimal.sire_id)?.tag_number || 'مسجل' : 'غير مسجل'} · 
                      الأم: {damAnimal.dam_id ? animalsMap.get(damAnimal.dam_id)?.tag_number || 'مسجل' : 'غير مسجل'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Matchmaker Genetic Analysis Result Banner */}
            {matchResult && (
              <div
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  matchResult.riskLevel === 'Prohibited'
                    ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                    : matchResult.riskLevel === 'High Risk'
                    ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                    : matchResult.riskLevel === 'Moderate Risk'
                    ? 'bg-yellow-950/40 border-yellow-600 text-yellow-200'
                    : 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {matchResult.riskLevel === 'Safe' || matchResult.riskLevel === 'Low Risk' ? (
                      <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-8 h-8 text-rose-400 flex-shrink-0 animate-bounce" />
                    )}
                    <div>
                      <div className="text-xs font-semibold opacity-80">
                        معامل قرابة الدم الوراثي (Inbreeding Coefficient F):
                      </div>
                      <div className="text-2xl font-black font-mono">
                        {matchResult.coefficientPercent}% · {matchResult.riskLabelAr}
                      </div>
                    </div>
                  </div>

                  {/* Projected ADG Badge */}
                  <div className="bg-stone-950/80 px-4 py-2.5 rounded-xl border border-stone-800 text-left">
                    <span className="text-[11px] text-stone-400 block">معدل النمو المتوقع للمواليد:</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      ~{matchResult.projectedOffspringADG} غ/يوم
                    </span>
                  </div>
                </div>

                {/* Algorithmic recommendation */}
                <div className="text-xs bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 leading-relaxed">
                  <strong>توصية النظام الوراثية:</strong> {matchResult.recommendationAr}
                </div>

                {/* Shared Ancestors Warning List */}
                {matchResult.sharedAncestors.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-stone-800/60">
                    <span className="text-xs font-bold block">
                      الأسلاف المشتركة المكتشفة في شجرة النسب:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.sharedAncestors.map((anc) => (
                        <span
                          key={anc.animalId}
                          className="bg-stone-900 border border-stone-700 px-2.5 py-1 rounded-md text-[11px] font-mono text-stone-200"
                        >
                          {anc.tagNumber} {anc.name ? `(${anc.name})` : ''} — نسبة التأثير:{' '}
                          <strong className="text-amber-400">{anc.contributionPercent}%</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button: Commit Mating */}
                <div className="pt-2">
                  <button
                    onClick={handleExecuteMating}
                    disabled={matchResult.riskLevel === 'Prohibited'}
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                      matchResult.riskLevel === 'Prohibited'
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>
                      {matchResult.riskLevel === 'Prohibited'
                        ? 'التزاوج محظور برمجياً لتجنب التشوهات الوراثية'
                        : 'اعتماد هذا التزاوج الموجه وجدولة تاريخ الولادة'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {matchmakerCommitted && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{matchmakerCommitted}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
