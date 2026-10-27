/**
 * SOL-ID Engine: Core Data Architecture & Database Schema
 * Matching the architectural specification:
 * - Static Meta: Breed, Pedigree (Sire/Dam), Birth Date, Gender, Tag/RFID
 * - Dynamic Time-Series Data: Weight logs (ADG), Health & Veterinary logs, Breeding logs
 * - Calculated Metrics: ADG, FCR, Inbreeding Coefficient, Genetic Selection Category
 */

export type Breed = 'Ouled_Djellal' | 'Rembi' | 'Hamra' | 'Dman' | 'Tazegzawt';

export type Gender = 'Male' | 'Female';

export type AcquisitionType = 'Bred_In_Farm' | 'Purchased';

export type AnimalStatus = 'Active' | 'Sold' | 'Slaughtered' | 'Deceased';

export type GeneticCategory = 'Elite' | 'Normal' | 'Reject';

export interface Animal {
  id: string; // SOL-ID UUID
  tag_number: string; // Ear Tag / RFID (e.g. DZ-OJ-082)
  name?: string; // Field descriptor (e.g., الفحل الباشا)
  breed: Breed;
  gender: Gender;
  birth_date: string; // YYYY-MM-DD
  sire_id: string | null; // SOL-ID of Sire
  dam_id: string | null; // SOL-ID of Dam
  birth_weight: number; // kg
  acquisition_type: AcquisitionType;
  status: AnimalStatus;
  category: GeneticCategory; // Initial/Calculated selection category
  category_override?: boolean;
  override_reason?: string;
  photo_url?: string;
  notes?: string;
}

export interface WeightLog {
  log_id: string;
  animal_id: string;
  recorded_at: string; // ISO timestamp
  weight_kg: number;
  adg_since_last: number; // Daily gain in grams/day (e.g. 265 g/day)
  days_since_last?: number;
  source?: 'manual' | 'scale_bluetooth';
  notes?: string;
}

export type HealthRecordType = 'vaccine' | 'deworming' | 'treatment' | 'vet_check' | 'note';

export interface HealthRecord {
  record_id: string;
  animal_id: string;
  recorded_at: string; // ISO timestamp
  type: HealthRecordType;
  title: string;
  description: string;
  cost_dzd?: number;
  administered_by: string;
}

export type PregnancyStatus = 'suspected' | 'confirmed' | 'delivered' | 'failed';

export interface BreedingRecord {
  mating_id: string;
  dam_id: string; // SOL-ID of Dam
  sire_id: string; // SOL-ID of Sire
  mating_date: string; // YYYY-MM-DD
  expected_litter_date: string; // YYYY-MM-DD (~150 days gestation)
  actual_litter_date?: string | null;
  pregnancy_status: PregnancyStatus;
  litter_size?: number; // Single, Twin, Triple
  weaning_success_rate?: number; // % e.g. 100%
  offspring_ids?: string[];
  notes?: string;
}

export interface BreedBenchmark {
  breed: Breed;
  name_ar: string;
  name_en: string;
  origin_ar: string;
  origin_en: string;
  avg_birth_weight: number; // kg
  avg_adg_g_day: number; // grams/day benchmark
  min_adg_threshold: number; // minimum g/day for NORMAL
  target_adult_weight_male: number; // kg
  target_adult_weight_female: number; // kg
  fcr_benchmark: number; // Feed Conversion Ratio (kg feed per kg meat)
  characteristics_ar: string;
  color_code: string;
}

export interface CircularEconomyMetrics {
  totalFeedConsumedTons: number;
  totalLiveWeightProducedKg: number;
  overallFcr: number; // Feed Conversion Ratio (Feed / Gain)
  organicManureProducedM3: number; // Compost/Manure
  manureForFarmM3: number;
  manureSoldM3: number;
  fertilizerRevenueDzd: number;
  rejectAnimalsReadyCount: number;
  projectedMeatYieldKg: number;
  projectedLiquidityRevenueDzd: number;
}
