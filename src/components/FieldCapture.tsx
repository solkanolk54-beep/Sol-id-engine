import React, { useState, useMemo } from 'react';
import {
  Animal,
  WeightLog,
  HealthRecord,
  BreedingRecord,
  HealthRecordType,
  PregnancyStatus,
} from '../types/schema';
import {
  calculateADG,
  calculateAge,
  BREED_BENCHMARKS,
  calculateExpectedLambingDate,
} from '../engine/genetics';
import {
  Search,
  Scan,
  Radio,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Syringe,
  Pill,
  Bug,
  Stethoscope,
  Heart,
  Baby,
  Calendar,
  AlertCircle,
  Tag,
  Dna,
} from 'lucide-react';

interface FieldCaptureProps {
  animals: Animal[];
  weightLogs: WeightLog[];
  healthRecords: HealthRecord[];
  breedingRecords: BreedingRecord[];
  onAddWeightLog: (log: Omit<WeightLog, 'log_id'>) => void;
  onAddHealthRecord: (record: Omit<HealthRecord, 'record_id'>) => void;
  onAddBreedingRecord: (record: Omit<BreedingRecord, 'mating_id'>) => void;
  onAddNewBorns: (params: {
    damId: string;
    sireId: string | null;
    birthDate: string;
    litterSize: number;
    breed: Animal['breed'];
  }) => void;
  scaleConnected: boolean;
  onSelectAnimalForDetails: (animal: Animal) => void;
}

export const FieldCapture: React.FC<FieldCaptureProps> = ({
  animals,
  weightLogs,
  healthRecords,
  breedingRecords,
  onAddWeightLog,
  onAddHealthRecord,
  onAddBreedingRecord,
  onAddNewBorns,
  scaleConnected,
  onSelectAnimalForDetails,
}) => {
  // Search or selected animal state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    animals.find((a) => a.tag_number === 'DZ-OJ-082')?.id || animals[0]?.id || ''
  );

  // Active sub-tab in field entry: 'weight' | 'health' | 'breeding'
  const [entryMode, setEntryMode] = useState<'weight' | 'health' | 'breeding'>('weight');

  // Weight form state
  const [inputWeight, setInputWeight] = useState<string>('');
  const [weightNotes, setWeightNotes] = useState<string>('');
  const [weightSuccessMsg, setWeightSuccessMsg] = useState<string>('');

  // Health modal/action state
  const [healthType, setHealthType] = useState<HealthRecordType>('vaccine');
  const [healthTitle, setHealthTitle] = useState('');
  const [healthDescription, setHealthDescription] = useState('');
  const [healthCost, setHealthCost] = useState('');
  const [healthSuccessMsg, setHealthSuccessMsg] = useState('');

  // Breeding state (for females)
  const [selectedSireId, setSelectedSireId] = useState<string>('');
  const [matingDate, setMatingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pregStatus, setPregStatus] = useState<PregnancyStatus>('confirmed');
  const [litterSize, setLitterSize] = useState<number>(2);
  const [breedingSuccessMsg, setBreedingSuccessMsg] = useState('');

  // Current animal & related data
  const currentAnimal = useMemo(() => {
    return animals.find((a) => a.id === selectedAnimalId) || animals[0];
  }, [animals, selectedAnimalId]);

  const animalLogs = useMemo(() => {
    if (!currentAnimal) return [];
    return weightLogs
      .filter((l) => l.animal_id === currentAnimal.id)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  }, [weightLogs, currentAnimal]);

  const latestLog = animalLogs[animalLogs.length - 1];

  const animalHealth = useMemo(() => {
    if (!currentAnimal) return [];
    return healthRecords
      .filter((h) => h.animal_id === currentAnimal.id)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  }, [healthRecords, currentAnimal]);

  // Filtered animals for quick selector
  const filteredQuickList = useMemo(() => {
    if (!searchQuery.trim()) return animals.slice(0, 10);
    const q = searchQuery.toLowerCase().trim();
    return animals.filter(
      (a) =>
        a.tag_number.toLowerCase().includes(q) ||
        (a.name && a.name.toLowerCase().includes(q)) ||
        a.id.toLowerCase().includes(q)
    );
  }, [animals, searchQuery]);

  // Live preview of ADG based on user's typed weight
  const adgPreview = useMemo(() => {
    const numWeight = parseFloat(inputWeight);
    if (isNaN(numWeight) || numWeight <= 0 || !latestLog) return null;

    const todayIso = new Date().toISOString();
    const result = calculateADG(latestLog.weight_kg, numWeight, latestLog.recorded_at, todayIso);
    const benchmark = BREED_BENCHMARKS[currentAnimal.breed] || BREED_BENCHMARKS.Ouled_Djellal;

    let growthStatus: 'excellent' | 'normal' | 'negative' = 'normal';
    if (result.adgGramsPerDay >= benchmark.avg_adg_g_day) {
      growthStatus = 'excellent';
    } else if (result.adgGramsPerDay < benchmark.min_adg_threshold) {
      growthStatus = 'negative';
    }

    return {
      ...result,
      status: growthStatus,
      diffKg: (numWeight - latestLog.weight_kg).toFixed(1),
    };
  }, [inputWeight, latestLog, currentAnimal]);

  // Handle simulation of reading from BLE scale
  const handleReadFromScale = () => {
    const baseWeight = latestLog ? latestLog.weight_kg : currentAnimal.birth_weight || 4.5;
    // Add realistic 1-3 kg gain based on time
    const simulatedWeight = (baseWeight + 1.4 + Math.random() * 0.8).toFixed(1);
    setInputWeight(simulatedWeight);
  };

  // Submit Weight Log
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = parseFloat(inputWeight);
    if (isNaN(weightVal) || weightVal <= 0) return;

    const todayIso = new Date().toISOString();
    let adgVal = 0;
    let daysDiff = 0;

    if (latestLog) {
      const calc = calculateADG(latestLog.weight_kg, weightVal, latestLog.recorded_at, todayIso);
      adgVal = calc.adgGramsPerDay;
      daysDiff = calc.daysElapsed;
    } else {
      const calc = calculateADG(currentAnimal.birth_weight, weightVal, currentAnimal.birth_date, todayIso);
      adgVal = calc.adgGramsPerDay;
      daysDiff = calc.daysElapsed;
    }

    onAddWeightLog({
      animal_id: currentAnimal.id,
      recorded_at: todayIso,
      weight_kg: weightVal,
      adg_since_last: adgVal,
      days_since_last: daysDiff,
      source: scaleConnected ? 'scale_bluetooth' : 'manual',
      notes: weightNotes || 'تسجيل ميداني عبر SOL Capture',
    });

    setWeightSuccessMsg(`تم حفظ الوزن ${weightVal} كغ ومعدل النمو ${adgVal} غ/يوم بنجاح!`);
    setInputWeight('');
    setWeightNotes('');
    setTimeout(() => setWeightSuccessMsg(''), 4000);
  };

  // Submit Health Log
  const handleSaveHealth = (presetTitle?: string, presetType?: HealthRecordType) => {
    const typeToUse = presetType || healthType;
    const titleToUse = presetTitle || healthTitle;

    if (!titleToUse.trim()) return;

    onAddHealthRecord({
      animal_id: currentAnimal.id,
      recorded_at: new Date().toISOString(),
      type: typeToUse,
      title: titleToUse,
      description: healthDescription || `إجراء صحي ميداني مسجل للحيوان ${currentAnimal.tag_number}`,
      cost_dzd: healthCost ? parseFloat(healthCost) : undefined,
      administered_by: 'فريق الحظيرة الميداني',
    });

    setHealthSuccessMsg(`تم تسجيل الإجراء الطبي (${titleToUse}) بنجاح`);
    setHealthTitle('');
    setHealthDescription('');
    setHealthCost('');
    setTimeout(() => setHealthSuccessMsg(''), 4000);
  };

  // Submit Mating / Ultrasound
  const handleSaveBreeding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSireId) return;

    const expectedDate = calculateExpectedLambingDate(matingDate);

    onAddBreedingRecord({
      dam_id: currentAnimal.id,
      sire_id: selectedSireId,
      mating_date: matingDate,
      expected_litter_date: expectedDate,
      pregnancy_status: pregStatus,
      notes: 'تسجيل تزاوج ميداني موجه',
    });

    setBreedingSuccessMsg(`تم تسجيل التزاوج! تاريخ الولادة المتوقع: ${expectedDate}`);
    setTimeout(() => setBreedingSuccessMsg(''), 4000);
  };

  // Submit Newborns
  const handleSaveNewborns = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNewBorns({
      damId: currentAnimal.id,
      sireId: selectedSireId || currentAnimal.sire_id || null,
      birthDate: new Date().toISOString().split('T')[0],
      litterSize,
      breed: currentAnimal.breed,
    });

    setBreedingSuccessMsg(`تم تسجيل ولادة ${litterSize} مواليد جدد وربطهم بالأم ${currentAnimal.tag_number} بنجاح!`);
    setTimeout(() => setBreedingSuccessMsg(''), 4000);
  };

  const ageInfo = currentAnimal ? calculateAge(currentAnimal.birth_date) : null;
  const benchmark = currentAnimal ? BREED_BENCHMARKS[currentAnimal.breed] : BREED_BENCHMARKS.Ouled_Djellal;
  const eligibleSires = animals.filter((a) => a.gender === 'Male' && a.status === 'Active' && a.id !== currentAnimal?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Mobile Fast Action Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scan className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              شاشة الميدان السريعة · SOL Capture
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                جاهز للمسح الميداني
              </span>
            </h1>
            <p className="text-xs text-stone-400">
              تسجيل الأوزان الفوري وحساب معدل النمو ADG وتوثيق السجل الصحي والتكاثر
            </p>
          </div>
        </div>

        {/* Search & RFID Input Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="امسح الباركود أو ابحث برقم القرط DZ-..."
            className="w-full bg-stone-950 border border-stone-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pr-10 pl-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 outline-none font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-xs text-stone-400 hover:text-stone-200"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Quick Carousel / Animal Selector Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400 px-1">
          <span>اختيار حيوان سريع في الحظيرة:</span>
          <span>{filteredQuickList.length} حيوان متطابق</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filteredQuickList.map((animal) => {
            const isSelected = animal.id === currentAnimal?.id;
            return (
              <button
                key={animal.id}
                onClick={() => {
                  setSelectedAnimalId(animal.id);
                  setInputWeight('');
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border transition-all text-right ${
                  isSelected
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                    : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                <div className="flex flex-col">
                  <span className="font-bold">{animal.tag_number}</span>
                  <span className="text-[10px] text-stone-400">{animal.name || animal.breed}</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    animal.category === 'Elite'
                      ? 'bg-amber-400'
                      : animal.category === 'Normal'
                      ? 'bg-emerald-400'
                      : 'bg-rose-500'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Animal Quick Identity Card */}
      {currentAnimal && (
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          {/* Header Row: Genetic Category & Detail Link */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${
                currentAnimal.category === 'Elite'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : currentAnimal.category === 'Normal'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              {currentAnimal.category === 'Elite'
                ? '★ نخبة (ELITE) - مرشح انتخاب'
                : currentAnimal.category === 'Normal'
                ? 'تجاري (NORMAL) - تسمين وإنتاج'
                : 'تصفية (REJECT) - بيع سيولة'}
            </span>
            <button
              onClick={() => onSelectAnimalForDetails(currentAnimal)}
              className="text-xs text-stone-400 hover:text-emerald-400 underline underline-offset-4"
            >
              السجل الكامل ↗
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* Animal Photo or Breed Glyph */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-800 border-2 border-stone-700 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-inner">
              {currentAnimal.photo_url ? (
                <img
                  src={currentAnimal.photo_url}
                  alt={currentAnimal.tag_number}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Dna className="w-8 h-8 sm:w-9 sm:h-9 text-stone-500" />
              )}
              <span className="absolute bottom-1 right-1 text-[9px] bg-stone-950/80 px-1 rounded text-stone-300">
                {currentAnimal.gender === 'Male' ? 'ذكر ♂' : 'أنثى ♀'}
              </span>
            </div>

            {/* Core Info */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-stone-100 font-mono tracking-tight">
                  {currentAnimal.tag_number}
                </h2>
                {currentAnimal.name && (
                  <span className="text-sm font-semibold text-emerald-400">
                    ({currentAnimal.name})
                  </span>
                )}
                <span className="text-xs bg-stone-800 text-stone-300 px-2.5 py-0.5 rounded-md border border-stone-700">
                  سلالة {benchmark.name_ar}
                </span>
              </div>

              {/* Specs & Pedigree Links */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                <span>العمر: <strong className="text-stone-200">{ageInfo?.formatted}</strong></span>
                <span>·</span>
                <span>الوزن الحالي: <strong className="text-stone-200">{latestLog ? `${latestLog.weight_kg} كغ` : 'غير مسجل'}</strong></span>
                <span>·</span>
                <span>
                  الأب: <strong className="text-stone-200">{currentAnimal.sire_id ? animals.find((a) => a.id === currentAnimal.sire_id)?.tag_number || 'مسجل' : 'غير مسجل'}</strong>
                </span>
                <span>·</span>
                <span>
                  الأم: <strong className="text-stone-200">{currentAnimal.dam_id ? animals.find((a) => a.id === currentAnimal.dam_id)?.tag_number || 'مسجل' : 'غير مسجل'}</strong>
                </span>
              </div>

              {/* Latest Performance ADG */}
              {latestLog && latestLog.adg_since_last > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-stone-400">آخر معدل نمو يومي:</span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      latestLog.adg_since_last >= benchmark.avg_adg_g_day
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : latestLog.adg_since_last >= benchmark.min_adg_threshold
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {latestLog.adg_since_last >= benchmark.avg_adg_g_day ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    +{latestLog.adg_since_last} غرام/يوم
                  </span>
                  <span className="text-[11px] text-stone-400">
                    (المعيار لسلالة {benchmark.name_ar}: {benchmark.avg_adg_g_day} غ/يوم)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs for Field Entry */}
      <div className="flex items-center p-1 bg-stone-900 border border-stone-800 rounded-xl">
        <button
          onClick={() => setEntryMode('weight')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            entryMode === 'weight'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>تسجيل الوزن والـ ADG</span>
        </button>

        <button
          onClick={() => setEntryMode('health')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            entryMode === 'health'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Syringe className="w-4 h-4" />
          <span>السجل الصحي السريع</span>
        </button>

        {currentAnimal?.gender === 'Female' && (
          <button
            onClick={() => setEntryMode('breeding')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              entryMode === 'breeding'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>التكاثر والمواليد (أنثى)</span>
          </button>
        )}
      </div>

      {/* 1. WEIGHT LOGGING PANEL */}
      {entryMode === 'weight' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>إدخال الوزن الميداني الفوري</span>
            </h3>

            {/* Bluetooth Scale Sync Button */}
            <button
              type="button"
              onClick={handleReadFromScale}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                scaleConnected
                  ? 'bg-teal-900/40 text-teal-300 border-teal-600/50 hover:bg-teal-900/60'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>قراءة فورية من الميزان الذكي (BLE)</span>
            </button>
          </div>

          <form onSubmit={handleSaveWeight} className="space-y-5">
            {/* Big Touch Weight Input */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
                الوزن بالكيلوغرام (kg):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="200"
                  required
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  placeholder={latestLog ? `${latestLog.weight_kg}` : 'مثال: 54.5'}
                  className="w-full bg-stone-950 border-2 border-stone-700 focus:border-emerald-500 rounded-2xl py-4 px-5 text-3xl font-black font-mono text-emerald-400 placeholder-stone-600 outline-none text-center"
                />
                <span className="absolute left-6 top-6 text-sm font-bold text-stone-400 font-mono">
                  KG
                </span>
              </div>
            </div>

            {/* Live ADG Calculation Feedback Card */}
            {adgPreview && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  adgPreview.status === 'excellent'
                    ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                    : adgPreview.status === 'normal'
                    ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                    : 'bg-rose-950/40 border-rose-600/50 text-rose-300'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">
                    معدل الزيادة اليومية المحسوب (ADG):
                  </div>
                  <div className="text-2xl font-black font-mono flex items-center gap-1.5">
                    {adgPreview.adgGramsPerDay > 0 ? `+${adgPreview.adgGramsPerDay}` : adgPreview.adgGramsPerDay}
                    <span className="text-xs font-normal">غرام / يوم</span>
                  </div>
                  <div className="text-[11px] opacity-80">
                    الزيادة الإجمالية: {adgPreview.diffKg} كغ خلال {adgPreview.daysElapsed} يوم
                  </div>
                </div>

                <div className="text-left font-mono text-xs">
                  <div className="font-bold">
                    {adgPreview.status === 'excellent'
                      ? '✓ نمو ممتاز (فوق المعيار)'
                      : adgPreview.status === 'normal'
                      ? '✓ نمو مستقر ومقبول'
                      : '⚠ انخفاض في النمو'}
                  </div>
                  <div className="text-[10px] opacity-75">
                    معيار السلالة: {benchmark.avg_adg_g_day} غ/يوم
                  </div>
                </div>
              </div>
            )}

            {/* Quick Notes Input */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                ملاحظة ميدانية (اختياري):
              </label>
              <input
                type="text"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="حالة التغذية، الفطام، نوع العلف المقدم..."
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none"
              />
            </div>

            {weightSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{weightSuccessMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputWeight}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 font-black text-base py-3.5 rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>تأكيد وحفظ القياس في قاعدة البيانات</span>
            </button>
          </form>

          {/* Recent Weight History Table */}
          {animalLogs.length > 0 && (
            <div className="pt-4 border-t border-stone-800 space-y-2">
              <h4 className="text-xs font-bold text-stone-300">سجل القياسات السابقة لهذا الحيوان:</h4>
              <div className="divide-y divide-stone-800 max-h-48 overflow-y-auto pr-1">
                {animalLogs.slice().reverse().map((log) => (
                  <div key={log.log_id} className="py-2 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      <span className="text-stone-300">
                        {new Date(log.recorded_at).toLocaleDateString('ar-DZ')}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        ({log.source === 'scale_bluetooth' ? 'BLE Scale' : 'يدوي'})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-100">{log.weight_kg} كغ</span>
                      {log.adg_since_last > 0 && (
                        <span className="text-emerald-400 text-[11px]">
                          +{log.adg_since_last} غ/يوم
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. HEALTH & VETERINARY FAST LOGGING */}
      {entryMode === 'health' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-400" />
              <span>السجل الصحي والبيطري السريع</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              إصابات سابقة: {animalHealth.length}
            </span>
          </div>

          {/* One-Tap Common Intervention Buttons */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-stone-300">
              إجراءات شائعة بضغطة زر واحدة (1-Tap Fast Actions):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveHealth('تلقيح التسمم المعوي (Clostridia)', 'vaccine')}
                className="p-3 bg-stone-950 border border-stone-800 hover:border-emerald-500 rounded-xl text-right transition-colors group"
              >
                <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-400 mb-1">
                  <Syringe className="w-4 h-4" />
                  <span className="text-[10px]">تلقيح</span>
                </div>
                <div className="font-bold text-xs text-stone-200">التسمم المعوي</div>
                <div className="text-[10px] text-stone-500">جرعة وقائية</div>
              </button>

              <button
                type="button"
                onClick={() => handleSaveHealth('تجريع مضاد الطفيليات (إيفرمكتين)', 'deworming')}
                className="p-3 bg-stone-950 border border-stone-800 hover:border-emerald-500 rounded-xl text-right transition-colors group"
              >
                <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-400 mb-1">
                  <Bug className="w-4 h-4" />
                  <span className="text-[10px]">طفيليات</span>
                </div>
                <div className="font-bold text-xs text-stone-200">إيفرمكتين فموي</div>
                <div className="text-[10px] text-stone-500">طفيليات داخلية/رئوية</div>
              </button>

              <button
                type="button"
                onClick={() => handleSaveHealth('تلقيح الجدري والبروسيلوز', 'vaccine')}
                className="p-3 bg-stone-950 border border-stone-800 hover:border-emerald-500 rounded-xl text-right transition-colors group"
              >
                <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-400 mb-1">
                  <Syringe className="w-4 h-4" />
                  <span className="text-[10px]">تطعيم</span>
                </div>
                <div className="font-bold text-xs text-stone-200">الجدري والبروسيلوز</div>
                <div className="text-[10px] text-stone-500">تحصين مناعي رسمي</div>
              </button>

              <button
                type="button"
                onClick={() => handleSaveHealth('فحص بيطري عام وسلامة الحوافر', 'vet_check')}
                className="p-3 bg-stone-950 border border-stone-800 hover:border-emerald-500 rounded-xl text-right transition-colors group"
              >
                <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-400 mb-1">
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-[10px]">فحص</span>
                </div>
                <div className="font-bold text-xs text-stone-200">فحص حوافر وأسنان</div>
                <div className="text-[10px] text-stone-500">فحص روتيني دوري</div>
              </button>
            </div>
          </div>

          {/* Custom Health Record Form */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-stone-300">
              تسجيل علاج أو دواء مخصص:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-stone-400 mb-1">نوع الإجراء:</label>
                <select
                  value={healthType}
                  onChange={(e) => setHealthType(e.target.value as HealthRecordType)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none"
                >
                  <option value="vaccine">تلقيح / تطعيم (Vaccine)</option>
                  <option value="deworming">طفيليات (Deworming)</option>
                  <option value="treatment">علاج / مضاد حيوي (Treatment)</option>
                  <option value="vet_check">فحص بيطري (Vet Check)</option>
                  <option value="note">ملاحظة سلوكية (Behavior Note)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-stone-400 mb-1">عنوان الإجراء / اسم الدواء:</label>
                <input
                  type="text"
                  value={healthTitle}
                  onChange={(e) => setHealthTitle(e.target.value)}
                  placeholder="مثال: حقن أوكسي تتراسيكلين 20% للالتهاب الرئوي"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-stone-400 mb-1">التفاصيل والجرعة:</label>
                <input
                  type="text"
                  value={healthDescription}
                  onChange={(e) => setHealthDescription(e.target.value)}
                  placeholder="الجرعة وطريقة الحقن والملاحظات البيطرية..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">التكلفة (دج DZD):</label>
                <input
                  type="number"
                  value={healthCost}
                  onChange={(e) => setHealthCost(e.target.value)}
                  placeholder="مثال: 1200"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSaveHealth()}
              disabled={!healthTitle.trim()}
              className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-100 font-bold text-xs py-2.5 rounded-lg border border-stone-700 transition-colors"
            >
              حفظ الإجراء الصحي في السجل الطبي
            </button>
          </div>

          {healthSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{healthSuccessMsg}</span>
            </div>
          )}

          {/* Recent Health Records */}
          {animalHealth.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-stone-300">السجل الصحي السابق للحيوان:</h4>
              <div className="divide-y divide-stone-800 max-h-44 overflow-y-auto">
                {animalHealth.map((h) => (
                  <div key={h.record_id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-200">{h.title}</div>
                      <div className="text-[11px] text-stone-500">
                        {h.description} · {new Date(h.recorded_at).toLocaleDateString('ar-DZ')}
                      </div>
                    </div>
                    {h.cost_dzd && (
                      <span className="font-mono text-stone-400 text-xs">
                        {h.cost_dzd.toLocaleString()} دج
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. BREEDING & REPRODUCTION PANEL (For Ewes) */}
      {entryMode === 'breeding' && currentAnimal?.gender === 'Female' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <span>إدارة التكاثر والتوليد للنعجة {currentAnimal.tag_number}</span>
            </h3>
            <span className="text-xs bg-rose-950/80 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full">
              أنثى مؤهلة للتوليد
            </span>
          </div>

          {/* Action 1: Record Mating Event */}
          <form onSubmit={handleSaveBreeding} className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>تسجيل تزاوج / تلقيح جديد:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-stone-400 mb-1">اختيار الفحل (Sire):</label>
                <select
                  required
                  value={selectedSireId}
                  onChange={(e) => setSelectedSireId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none"
                >
                  <option value="">-- اختر الفحل المعتمد --</option>
                  {eligibleSires.map((sire) => (
                    <option key={sire.id} value={sire.id}>
                      {sire.tag_number} - {sire.name || sire.breed} ({sire.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">تاريخ التزاوج:</label>
                <input
                  type="date"
                  value={matingDate}
                  onChange={(e) => setMatingDate(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">فحص الحمل (Ultrasound):</label>
                <select
                  value={pregStatus}
                  onChange={(e) => setPregStatus(e.target.value as PregnancyStatus)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none"
                >
                  <option value="confirmed">حامل مؤكد (إيكوغرافي إيجابي)</option>
                  <option value="suspected">اشتباه حمل</option>
                  <option value="failed">فارغة (لم يتم الإخصاب)</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
              تاريخ الولادة التقديري المحسوب تلقائياً (~150 يوم حمل):{' '}
              <strong className="text-emerald-400 font-mono">
                {calculateExpectedLambingDate(matingDate)}
              </strong>
            </div>

            <button
              type="submit"
              disabled={!selectedSireId}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg transition-colors"
            >
              حفظ سجل التزاوج وتحديد موعد الولادة
            </button>
          </form>

          {/* Action 2: Record Newborn Lambs with Instant Dam Linking */}
          <form onSubmit={handleSaveNewborns} className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-amber-400" />
              <span>تسجيل مواليد جدد (ربط فوري كأبناء لهذه النعجة):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-400 mb-1">عدد المواليد في البطن:</label>
                <select
                  value={litterSize}
                  onChange={(e) => setLitterSize(parseInt(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none font-mono"
                >
                  <option value={1}>مفرد (1 خروف)</option>
                  <option value={2}>توأم ثنائي (2 خرفان)</option>
                  <option value={3}>توأم ثلاثي (3 خرفان)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">السلالة المورثة للمواليد:</label>
                <input
                  type="text"
                  disabled
                  value={benchmark.name_ar}
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Baby className="w-4 h-4" />
              <span>توليد وتوليد أرقام SOL-ID للمواليد فوراً في قاعدة البيانات</span>
            </button>
          </form>

          {breedingSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{breedingSuccessMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
