import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateADG,
  evaluateAnimalCategory,
  calculateInbreedingCoefficient,
  calculateExpectedLambingDate,
  calculateAge,
} from './genetics';
import { Animal, HealthRecord, WeightLog } from '../types/schema';

test('calculateADG calculates accurate grams per day', () => {
  // 30 days, gain from 20kg to 29kg = 9kg / 30 = 300g/day
  const { adgGramsPerDay, daysElapsed } = calculateADG(
    20,
    29,
    '2026-01-01T00:00:00.000Z',
    '2026-01-31T00:00:00.000Z'
  );
  assert.equal(daysElapsed, 30);
  assert.equal(adgGramsPerDay, 300);
});

test('calculateADG handles short intervals without division by zero', () => {
  const { adgGramsPerDay, daysElapsed } = calculateADG(
    40,
    40.5,
    '2026-02-01T00:00:00.000Z',
    '2026-02-01T06:00:00.000Z'
  );
  assert.ok(daysElapsed >= 1);
  assert.ok(adgGramsPerDay > 0);
});

test('evaluateAnimalCategory classifies as ELITE when criteria met', () => {
  const eliteAnimal: Animal = {
    id: 'sol-001',
    tag_number: 'DZ-OJ-001',
    breed: 'Ouled_Djellal',
    gender: 'Male',
    birth_date: '2025-06-01',
    sire_id: 'sol-sire',
    dam_id: 'sol-dam',
    birth_weight: 4.5,
    acquisition_type: 'Bred_In_Farm',
    status: 'Active',
    category: 'Normal',
  };

  const logs: WeightLog[] = [
    {
      log_id: 'l1',
      animal_id: 'sol-001',
      recorded_at: '2025-06-01T00:00:00.000Z',
      weight_kg: 4.5,
      adg_since_last: 0,
    },
    {
      log_id: 'l2',
      animal_id: 'sol-001',
      recorded_at: '2025-07-01T00:00:00.000Z',
      weight_kg: 14.0,
      adg_since_last: 316, // > 260 breed average
    },
  ];

  const health: HealthRecord[] = [
    {
      record_id: 'h1',
      animal_id: 'sol-001',
      recorded_at: '2025-06-15T00:00:00.000Z',
      type: 'vaccine',
      title: 'تلقيح الجدري المعوي',
      description: 'جرعة وقائية روتينية',
      administered_by: 'طبيب بيطري',
    },
  ];

  const result = evaluateAnimalCategory(eliteAnimal, logs, health);
  assert.equal(result.category, 'Elite');
  assert.equal(result.healthIncidentsCount, 0);
  assert.equal(result.pedigreeKnown, true);
});

test('evaluateAnimalCategory classifies as NORMAL when ADG >= min and moderate health incidents', () => {
  const normalAnimal: Animal = {
    id: 'sol-002',
    tag_number: 'DZ-OJ-002',
    breed: 'Ouled_Djellal',
    gender: 'Female',
    birth_date: '2025-06-01',
    sire_id: null,
    dam_id: null,
    birth_weight: 4.0,
    acquisition_type: 'Purchased',
    status: 'Active',
    category: 'Normal',
  };

  const logs: WeightLog[] = [
    {
      log_id: 'l1',
      animal_id: 'sol-002',
      recorded_at: '2025-06-01T00:00:00.000Z',
      weight_kg: 4.0,
      adg_since_last: 0,
    },
    {
      log_id: 'l2',
      animal_id: 'sol-002',
      recorded_at: '2025-07-01T00:00:00.000Z',
      weight_kg: 10.0,
      adg_since_last: 200, // >= 180 min threshold, but < 260 breed avg
    },
  ];

  const health: HealthRecord[] = [
    {
      record_id: 'h1',
      animal_id: 'sol-002',
      recorded_at: '2025-06-20T00:00:00.000Z',
      type: 'treatment',
      title: 'علاج التهاب رئوي خفيف',
      description: 'مضاد حيوي',
      administered_by: 'د. كريم',
    },
  ];

  const result = evaluateAnimalCategory(normalAnimal, logs, health);
  assert.equal(result.category, 'Normal');
});

test('evaluateAnimalCategory classifies as REJECT when ADG is below minimum threshold', () => {
  const rejectAnimal: Animal = {
    id: 'sol-003',
    tag_number: 'DZ-OJ-003',
    breed: 'Ouled_Djellal',
    gender: 'Male',
    birth_date: '2025-06-01',
    sire_id: null,
    dam_id: null,
    birth_weight: 3.5,
    acquisition_type: 'Purchased',
    status: 'Active',
    category: 'Normal',
  };

  const logs: WeightLog[] = [
    {
      log_id: 'l1',
      animal_id: 'sol-003',
      recorded_at: '2025-06-01T00:00:00.000Z',
      weight_kg: 3.5,
      adg_since_last: 0,
    },
    {
      log_id: 'l2',
      animal_id: 'sol-003',
      recorded_at: '2025-07-01T00:00:00.000Z',
      weight_kg: 7.5,
      adg_since_last: 133, // < 180 min threshold
    },
  ];

  const result = evaluateAnimalCategory(rejectAnimal, logs, []);
  assert.equal(result.category, 'Reject');
});

test('calculateInbreedingCoefficient warns of prohibited parent-offspring or sibling mating', () => {
  const map = new Map<string, Animal>();
  const father: Animal = {
    id: 'sire-1',
    tag_number: 'TAG-FATHER',
    breed: 'Ouled_Djellal',
    gender: 'Male',
    birth_date: '2023-01-01',
    sire_id: null,
    dam_id: null,
    birth_weight: 4.5,
    acquisition_type: 'Bred_In_Farm',
    status: 'Active',
    category: 'Elite',
  };
  const daughter: Animal = {
    id: 'dam-1',
    tag_number: 'TAG-DAUGHTER',
    breed: 'Ouled_Djellal',
    gender: 'Female',
    birth_date: '2024-03-01',
    sire_id: 'sire-1', // Father is sire
    dam_id: null,
    birth_weight: 4.0,
    acquisition_type: 'Bred_In_Farm',
    status: 'Active',
    category: 'Normal',
  };

  map.set(father.id, father);
  map.set(daughter.id, daughter);

  const res = calculateInbreedingCoefficient('sire-1', 'dam-1', map);
  assert.equal(res.coefficientPercent, 25);
  assert.equal(res.riskLevel, 'Prohibited');
});

test('calculateExpectedLambingDate gives ~150 days gestation', () => {
  const mating = '2026-03-01';
  const expected = calculateExpectedLambingDate(mating);
  // March has 31, April 30, May 31, June 30, July 31 -> around late July
  assert.equal(expected, '2026-07-29');
});
