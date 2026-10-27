import {
  Animal,
  Breed,
  BreedBenchmark,
  CircularEconomyMetrics,
  GeneticCategory,
  HealthRecord,
  WeightLog,
} from '../types/schema';

export const BREED_BENCHMARKS: Record<Breed, BreedBenchmark> = {
  Ouled_Djellal: {
    breed: 'Ouled_Djellal',
    name_ar: 'أولاد جلال',
    name_en: 'Ouled Djellal',
    origin_ar: 'السهوب والزيبان (الجزائر)',
    origin_en: 'Steppes & Ziban, Algeria',
    avg_birth_weight: 4.2,
    avg_adg_g_day: 260, // 260 grams/day
    min_adg_threshold: 180,
    target_adult_weight_male: 95,
    target_adult_weight_female: 65,
    fcr_benchmark: 5.1,
    characteristics_ar: 'العملاق الأبيض الجزائري، سلالة اللحم الأولى في شمال إفريقيا ذات نمو قياسي وهيكل عظمي عريض.',
    color_code: '#10b981', // emerald
  },
  Rembi: {
    breed: 'Rembi',
    name_ar: 'الرمبي',
    name_en: 'Rembi',
    origin_ar: 'الأطلس التلي والسهوب الوسطى',
    origin_en: 'Atlas Mountains & Central Steppe',
    avg_birth_weight: 3.8,
    avg_adg_g_day: 230,
    min_adg_threshold: 160,
    target_adult_weight_male: 85,
    target_adult_weight_female: 58,
    fcr_benchmark: 5.4,
    characteristics_ar: 'سلالة عريقة مقاومة للمناخ البارد والجبلي، صوف أصفر مميز، جودة ذبيحة ولحم استثنائية.',
    color_code: '#f59e0b', // amber
  },
  Hamra: {
    breed: 'Hamra',
    name_ar: 'الحمراء (بني غيل/النجد الغربي)',
    name_en: 'Hamra',
    origin_ar: 'الهضاب العليا الغربية (النعامة والبيض)',
    origin_en: 'Western High Plateaus',
    avg_birth_weight: 3.5,
    avg_adg_g_day: 205,
    min_adg_threshold: 145,
    target_adult_weight_male: 75,
    target_adult_weight_female: 52,
    fcr_benchmark: 5.8,
    characteristics_ar: 'سلالة متكيفة مع الجفاف الشديد والرعي الفقير، رأس بني أحمر داكن، مناعة طبيعية خارقة.',
    color_code: '#ef4444', // red
  },
  Dman: {
    breed: 'Dman',
    name_ar: 'الدمان (سلالة التوائم الواحاتية)',
    name_en: 'Dman',
    origin_ar: 'الواحات الجنوبية (بشار، الساورة، تافيلالت)',
    origin_en: 'Saharan Oases',
    avg_birth_weight: 2.7,
    avg_adg_g_day: 175,
    min_adg_threshold: 125,
    target_adult_weight_male: 65,
    target_adult_weight_female: 45,
    fcr_benchmark: 6.2,
    characteristics_ar: 'ملكة الخصوبة الفائقة: ولادات توأمية وثلاثية على مدار العام بدون موسمية، كنز وراثي في التحسين النسلي.',
    color_code: '#8b5cf6', // purple
  },
  Tazegzawt: {
    breed: 'Tazegzawt',
    name_ar: 'تازغزاووت (الكبش الأزرق)',
    name_en: 'Tazegzawt',
    origin_ar: 'منطقة القبائل وجبال جرجرة',
    origin_en: 'Kabylie Mountains',
    avg_birth_weight: 3.6,
    avg_adg_g_day: 215,
    min_adg_threshold: 150,
    target_adult_weight_male: 80,
    target_adult_weight_female: 56,
    fcr_benchmark: 5.6,
    characteristics_ar: 'سلالة نادرة مهددة ذات حلقة زرقاء حول العينين، تملك تكيفاً جبلياً فريداً ومقاومة للطفيليات.',
    color_code: '#06b6d4', // cyan
  },
};

/**
 * Calculate Average Daily Gain (ADG) between two weight recordings in grams per day
 */
export function calculateADG(
  previousWeightKg: number,
  newWeightKg: number,
  previousDateIso: string,
  newDateIso: string
): { adgGramsPerDay: number; daysElapsed: number } {
  const d1 = new Date(previousDateIso).getTime();
  const d2 = new Date(newDateIso).getTime();
  const diffMs = Math.abs(d2 - d1);
  const daysElapsed = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  const weightDiffKg = newWeightKg - previousWeightKg;
  const adgGramsPerDay = Math.round((weightDiffKg / daysElapsed) * 1000);

  return { adgGramsPerDay, daysElapsed };
}

/**
 * Calculates human-readable age from birth date
 */
export function calculateAge(birthDateIso: string, referenceDate: Date = new Date()): {
  months: number;
  days: number;
  formatted: string;
} {
  const birth = new Date(birthDateIso);
  const now = referenceDate;

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months = Math.max(0, months - 1);
  }

  const daysApprox = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)));

  let formatted = '';
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    formatted = remMonths > 0 ? `${years} سنة و ${remMonths} شهر` : `${years} سنة`;
  } else if (months > 0) {
    formatted = `${months} أشهر`;
  } else {
    formatted = `${daysApprox} يوم`;
  }

  return { months, days: daysApprox, formatted };
}

/**
 * Exact implementation of the Initial Selection Algorithm Logic (خوارزمية التصنيف الأولي):
 *
 * IF (ADG > Threshold_Breed_Average) AND (Health_Incidents == 0) AND (Pedigree_Known == True):
 *     Category = "ELITE" (مرشح للتكاثر والانتخاب)
 * ELSE IF (ADG >= Threshold_Min) AND (Health_Incidents <= 2):
 *     Category = "NORMAL" (مخصص للإنتاج التجاري / التسمين)
 * ELSE:
 *     Category = "REJECT" (تصفية / بيع لحوم لتأمين السيولة)
 */
export function evaluateAnimalCategory(
  animal: Animal,
  weightLogs: WeightLog[],
  healthRecords: HealthRecord[],
  customThresholds?: { breedAvgADG?: number; minADG?: number }
): {
  category: GeneticCategory;
  reason: string;
  evaluatedADG: number;
  healthIncidentsCount: number;
  pedigreeKnown: boolean;
} {
  const benchmark = BREED_BENCHMARKS[animal.breed] || BREED_BENCHMARKS.Ouled_Djellal;
  const targetBreedAvg = customThresholds?.breedAvgADG ?? benchmark.avg_adg_g_day;
  const targetMinADG = customThresholds?.minADG ?? benchmark.min_adg_threshold;

  // Filter logs for this animal
  const animalLogs = weightLogs
    .filter((l) => l.animal_id === animal.id)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  // Calculate most representative ADG
  let evaluatedADG = 0;
  if (animalLogs.length >= 2) {
    // Average of valid ADGs or latest
    const validLogs = animalLogs.slice(1);
    const sumADG = validLogs.reduce((acc, curr) => acc + curr.adg_since_last, 0);
    evaluatedADG = Math.round(sumADG / validLogs.length);
  } else if (animalLogs.length === 1 && animal.birth_weight > 0) {
    // calculate from birth to first log
    const { adgGramsPerDay } = calculateADG(
      animal.birth_weight,
      animalLogs[0].weight_kg,
      animal.birth_date,
      animalLogs[0].recorded_at
    );
    evaluatedADG = adgGramsPerDay;
  } else {
    // Default estimate based on birth weight & benchmark
    evaluatedADG = benchmark.avg_adg_g_day;
  }

  // Count adverse health incidents (treatments or illnesses, excluding routine deworming/preventive vaccines if clean)
  const animalHealth = healthRecords.filter((h) => h.animal_id === animal.id);
  const adverseIncidents = animalHealth.filter(
    (h) => h.type === 'treatment' || h.title.includes('التهاب') || h.title.includes('إصابة') || h.title.includes('مرض')
  ).length;

  const pedigreeKnown = Boolean(animal.sire_id && animal.dam_id);

  let category: GeneticCategory = 'Reject';
  let reason = '';

  if (evaluatedADG > targetBreedAvg && adverseIncidents === 0 && pedigreeKnown) {
    category = 'Elite';
    reason = `نمو متفوق (${evaluatedADG} غ/يوم > المعدل ${targetBreedAvg}) + سجل صحي نظيف + نسب موثق (الأب والأم)`;
  } else if (evaluatedADG >= targetMinADG && adverseIncidents <= 2) {
    category = 'Normal';
    reason = `نمو مقبول (${evaluatedADG} غ/يوم >= الحد الأدنى ${targetMinADG}) وسجل صحي ضمن الحدود المسموحة (إصابات: ${adverseIncidents})`;
  } else {
    category = 'Reject';
    if (evaluatedADG < targetMinADG) {
      reason = `معدل نمو ضعيف (${evaluatedADG} غ/يوم أقل من الحد الأدنى ${targetMinADG})`;
    } else if (adverseIncidents > 2) {
      reason = `تكرار الإصابات الصحية والحاجة لعلاجات (${adverseIncidents} حالات)`;
    } else {
      reason = `لا يحقق المعايير الوراثية للانتخاب`;
    }
  }

  return {
    category,
    reason,
    evaluatedADG,
    healthIncidentsCount: adverseIncidents,
    pedigreeKnown,
  };
}

/**
 * Ancestor collector for pedigree trees and inbreeding analysis
 */
export function getAncestors(
  animalId: string,
  animalsMap: Map<string, Animal>,
  maxDepth = 4,
  currentDepth = 1
): { id: string; depth: number }[] {
  if (currentDepth > maxDepth) return [];
  const animal = animalsMap.get(animalId);
  if (!animal) return [];

  const list: { id: string; depth: number }[] = [];
  if (animal.sire_id) {
    list.push({ id: animal.sire_id, depth: currentDepth });
    list.push(...getAncestors(animal.sire_id, animalsMap, maxDepth, currentDepth + 1));
  }
  if (animal.dam_id) {
    list.push({ id: animal.dam_id, depth: currentDepth });
    list.push(...getAncestors(animal.dam_id, animalsMap, maxDepth, currentDepth + 1));
  }
  return list;
}

export interface InbreedingResult {
  coefficientPercent: number; // e.g. 12.5%
  riskLevel: 'Safe' | 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Prohibited';
  riskLabelAr: string;
  sharedAncestors: {
    animalId: string;
    tagNumber: string;
    name?: string;
    depthInSire: number;
    depthInDam: number;
    contributionPercent: number;
  }[];
  recommendationAr: string;
  projectedOffspringADG: number;
}

/**
 * Breeding Matchmaker: Inbreeding Coefficient Calculation (معامل قرابة الدم)
 * Uses Wright's relationship paths between Sire and Dam to prevent inbreeding depression
 */
export function calculateInbreedingCoefficient(
  sireId: string,
  damId: string,
  animalsMap: Map<string, Animal>
): InbreedingResult {
  if (sireId === damId) {
    return {
      coefficientPercent: 100,
      riskLevel: 'Prohibited',
      riskLabelAr: 'غير ممكن (نفس الحيوان)',
      sharedAncestors: [],
      recommendationAr: 'لا يمكن تزاوج الحيوان مع نفسه.',
      projectedOffspringADG: 0,
    };
  }

  const sire = animalsMap.get(sireId);
  const dam = animalsMap.get(damId);

  if (!sire || !dam) {
    return {
      coefficientPercent: 0,
      riskLevel: 'Safe',
      riskLabelAr: 'آمن (بيانات غير مكتملة)',
      sharedAncestors: [],
      recommendationAr: 'أحد الأبوين غير موجود في قاعدة البيانات.',
      projectedOffspringADG: 220,
    };
  }

  // Check parent-child direct match
  if (sire.sire_id === dam.id || sire.dam_id === dam.id || dam.sire_id === sire.id || dam.dam_id === sire.id) {
    return {
      coefficientPercent: 25,
      riskLevel: 'Prohibited',
      riskLabelAr: 'خطر شديد جداً (قرابة مباشرة - أب/ابنة أو أم/ابن)',
      sharedAncestors: [
        {
          animalId: sire.id,
          tagNumber: sire.tag_number,
          name: sire.name,
          depthInSire: 0,
          depthInDam: 1,
          contributionPercent: 25,
        },
      ],
      recommendationAr: 'يُمنع منعاً باتاً إجراء هذا التزاوج لتفادي تشوهات خلقية وفقدان المناعة الوراثية.',
      projectedOffspringADG: 140,
    };
  }

  // Check full/half siblings
  const sameSire = sire.sire_id && dam.sire_id && sire.sire_id === dam.sire_id;
  const sameDam = sire.dam_id && dam.dam_id && sire.dam_id === dam.dam_id;

  if (sameSire && sameDam) {
    return {
      coefficientPercent: 25,
      riskLevel: 'Prohibited',
      riskLabelAr: 'خطر مرتفع جداً (أشقاء من نفس الأب والأم 25%)',
      sharedAncestors: [
        {
          animalId: sire.sire_id!,
          tagNumber: animalsMap.get(sire.sire_id!)?.tag_number || sire.sire_id!,
          depthInSire: 1,
          depthInDam: 1,
          contributionPercent: 12.5,
        },
        {
          animalId: sire.dam_id!,
          tagNumber: animalsMap.get(sire.dam_id!)?.tag_number || sire.dam_id!,
          depthInSire: 1,
          depthInDam: 1,
          contributionPercent: 12.5,
        },
      ],
      recommendationAr: 'تزاوج مرفوض: أشقاء كاملون يؤدي إلى انحدار وراثي كبير ونقص الخصوبة.',
      projectedOffspringADG: 160,
    };
  }

  if (sameSire || sameDam) {
    const commonId = sameSire ? sire.sire_id! : sire.dam_id!;
    const commonAnimal = animalsMap.get(commonId);
    return {
      coefficientPercent: 12.5,
      riskLevel: 'High Risk',
      riskLabelAr: 'خطر مرتفع (نصف أشقاء من نفس الأب أو الأم 12.5%)',
      sharedAncestors: [
        {
          animalId: commonId,
          tagNumber: commonAnimal?.tag_number || commonId,
          name: commonAnimal?.name,
          depthInSire: 1,
          depthInDam: 1,
          contributionPercent: 12.5,
        },
      ],
      recommendationAr: 'تحذير: نسبة القرابة مرتفعة (12.5%). لا يُنصح بالتزاوج إلا لغرض التثبيت الوراثي الحذر جداً بمراقبة بيطرية.',
      projectedOffspringADG: 195,
    };
  }

  // Traversal for deeper ancestors
  const sireAncestors = getAncestors(sireId, animalsMap);
  const damAncestors = getAncestors(damId, animalsMap);

  const shared: InbreedingResult['sharedAncestors'] = [];
  let totalCoeff = 0;

  for (const sAnc of sireAncestors) {
    const match = damAncestors.find((dAnc) => dAnc.id === sAnc.id);
    if (match) {
      const contribution = Math.pow(0.5, sAnc.depth + match.depth + 1) * 100;
      totalCoeff += contribution;
      const ancObj = animalsMap.get(sAnc.id);
      shared.push({
        animalId: sAnc.id,
        tagNumber: ancObj?.tag_number || sAnc.id,
        name: ancObj?.name,
        depthInSire: sAnc.depth,
        depthInDam: match.depth,
        contributionPercent: Number(contribution.toFixed(2)),
      });
    }
  }

  const roundedCoeff = Number(totalCoeff.toFixed(2));

  let riskLevel: InbreedingResult['riskLevel'] = 'Safe';
  let riskLabelAr = 'آمن تماماً (0% قرابة مسجلة)';
  let recommendationAr = 'تزاوج مثالي: لا توجد أسلاف مشتركة قريبة، مما يضمن قوة الهجين والنمو الأمثل.';

  if (roundedCoeff >= 12.5) {
    riskLevel = 'High Risk';
    riskLabelAr = `خطر وراثي (${roundedCoeff}%)`;
    recommendationAr = 'قرابة دموية مرتفعة تفوق الحدود الآمنة للقطيع التجاري.';
  } else if (roundedCoeff >= 6.25) {
    riskLevel = 'Moderate Risk';
    riskLabelAr = `قرابة متوسطة (${roundedCoeff}%) - أبناء عمومة`;
    recommendationAr = 'مستوى قرابة ملحوظ. مسموح بحذر مع متابعة صحة ومناعة الحملان.';
  } else if (roundedCoeff > 0) {
    riskLevel = 'Low Risk';
    riskLabelAr = `قرابة خفيفة ومقبولة (${roundedCoeff}%)`;
    recommendationAr = 'توافق وراثي آمن، تباعد نسبي ممتاز.';
  }

  // Projected ADG based on breed standard + hybrid vigor bonus or inbreeding penalty
  const sireBenchmark = BREED_BENCHMARKS[sire.breed] || BREED_BENCHMARKS.Ouled_Djellal;
  const damBenchmark = BREED_BENCHMARKS[dam.breed] || BREED_BENCHMARKS.Ouled_Djellal;
  const baseAvg = (sireBenchmark.avg_adg_g_day + damBenchmark.avg_adg_g_day) / 2;

  // Inbreeding depression penalty
  const inbreedingPenalty = roundedCoeff > 0 ? (roundedCoeff / 100) * 120 : 0;
  // Crossbreed vigor bonus if different breeds
  const hybridBonus = sire.breed !== dam.breed ? 25 : 10;

  const projectedOffspringADG = Math.max(120, Math.round(baseAvg + hybridBonus - inbreedingPenalty));

  return {
    coefficientPercent: roundedCoeff,
    riskLevel,
    riskLabelAr,
    sharedAncestors: shared,
    recommendationAr,
    projectedOffspringADG,
  };
}

/**
 * Expected date of birth (Gestation ~ 150 days)
 */
export function calculateExpectedLambingDate(matingDateIso: string): string {
  const d = new Date(matingDateIso);
  d.setDate(d.getDate() + 150);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate circular economy and cash-flow culling metrics
 */
export function calculateCircularEconomy(
  animals: Animal[],
  weightLogs: WeightLog[]
): CircularEconomyMetrics {
  const activeAnimals = animals.filter((a) => a.status === 'Active');
  
  // Calculate total current live weight
  let totalLiveWeightKg = 0;
  for (const a of activeAnimals) {
    const logs = weightLogs.filter((l) => l.animal_id === a.id);
    if (logs.length > 0) {
      const latest = logs[logs.length - 1];
      totalLiveWeightKg += latest.weight_kg;
    } else {
      totalLiveWeightKg += a.birth_weight || 4.0;
    }
  }

  // Estimate feed intake: an active sheep consumes roughly 3-4% of body weight in dry matter daily
  // Over a 180-day operational cycle:
  const estimatedFeedTons = Number(((totalLiveWeightKg * 0.035 * 180) / 1000).toFixed(2));
  
  // Estimated weight gain produced
  const totalWeightGainKg = Math.max(100, Math.round(totalLiveWeightKg * 0.42));
  const overallFcr = totalWeightGainKg > 0 ? Number(((estimatedFeedTons * 1000) / totalWeightGainKg).toFixed(1)) : 5.4;

  // Organic Manure/Compost output: sheep produces ~1.2 kg manure per day (wet), dries/composts
  // 1 m³ sheep manure ~ 600 kg.
  const manureKg = activeAnimals.length * 1.1 * 180;
  const organicManureProducedM3 = Number((manureKg / 600).toFixed(1));
  const manureForFarmM3 = Number((organicManureProducedM3 * 0.65).toFixed(1)); // 65% for fodder fields
  const manureSoldM3 = Number((organicManureProducedM3 * 0.35).toFixed(1)); // 35% sold
  const fertilizerRevenueDzd = Math.round(manureSoldM3 * 4500); // 4500 DZD per m3 high quality compost

  // Culling / Cash flow candidates:
  // Animals with category "Reject" OR non-breeding males weighing >= 50kg
  const rejectAnimals = activeAnimals.filter((a) => a.category === 'Reject');
  const marketReadyMales = activeAnimals.filter(
    (a) => a.gender === 'Male' && a.category === 'Normal' && (a.birth_weight || 0) > 0
  );

  let cullingWeightKg = 0;
  for (const r of rejectAnimals) {
    const logs = weightLogs.filter((l) => l.animal_id === r.id);
    const weight = logs.length > 0 ? logs[logs.length - 1].weight_kg : 45;
    cullingWeightKg += weight;
  }

  // In Algerian livestock markets, live sheep sell for roughly 950 - 1,200 DZD per kg live weight
  // Carcass yield is ~50%
  const projectedMeatYieldKg = Math.round(cullingWeightKg * 0.5);
  const projectedLiquidityRevenueDzd = Math.round(cullingWeightKg * 1050);

  return {
    totalFeedConsumedTons: Math.max(1.5, estimatedFeedTons),
    totalLiveWeightProducedKg: Math.round(totalLiveWeightKg),
    overallFcr,
    organicManureProducedM3,
    manureForFarmM3,
    manureSoldM3,
    fertilizerRevenueDzd,
    rejectAnimalsReadyCount: rejectAnimals.length,
    projectedMeatYieldKg,
    projectedLiquidityRevenueDzd,
  };
}
