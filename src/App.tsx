import React, { useState, useEffect } from 'react';
import {
  Animal,
  WeightLog,
  HealthRecord,
  BreedingRecord,
  GeneticCategory,
} from './types/schema';
import {
  INITIAL_ANIMALS,
  INITIAL_WEIGHT_LOGS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_BREEDING_RECORDS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { FieldCapture } from './components/FieldCapture';
import { OverviewAnalytics } from './components/OverviewAnalytics';
import { PedigreeHub } from './components/PedigreeHub';
import { CircularEconomy } from './components/CircularEconomy';
import { HerdTable } from './components/HerdTable';
import { AnimalDetailModal } from './components/AnimalDetailModal';
import { NewAnimalModal } from './components/NewAnimalModal';

export default function App() {
  // Navigation active view: default to 'capture' for field mobile readiness
  const [activeView, setActiveView] = useState<'capture' | 'overview' | 'pedigree' | 'circular' | 'herd'>('capture');

  // Simulated IoT / BLE smart scale state
  const [scaleConnected, setScaleConnected] = useState<boolean>(true);

  // Modals state
  const [selectedAnimalForDetails, setSelectedAnimalForDetails] = useState<Animal | null>(null);
  const [isNewAnimalOpen, setIsNewAnimalOpen] = useState<boolean>(false);

  // Persistent States
  const [animals, setAnimals] = useState<Animal[]>(() => {
    try {
      const saved = localStorage.getItem('solid_animals');
      return saved ? JSON.parse(saved) : INITIAL_ANIMALS;
    } catch {
      return INITIAL_ANIMALS;
    }
  });

  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    try {
      const saved = localStorage.getItem('solid_weight_logs');
      return saved ? JSON.parse(saved) : INITIAL_WEIGHT_LOGS;
    } catch {
      return INITIAL_WEIGHT_LOGS;
    }
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    try {
      const saved = localStorage.getItem('solid_health_records');
      return saved ? JSON.parse(saved) : INITIAL_HEALTH_RECORDS;
    } catch {
      return INITIAL_HEALTH_RECORDS;
    }
  });

  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('solid_breeding_records');
      return saved ? JSON.parse(saved) : INITIAL_BREEDING_RECORDS;
    } catch {
      return INITIAL_BREEDING_RECORDS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('solid_animals', JSON.stringify(animals));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [animals]);

  useEffect(() => {
    try {
      localStorage.setItem('solid_weight_logs', JSON.stringify(weightLogs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [weightLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('solid_health_records', JSON.stringify(healthRecords));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [healthRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('solid_breeding_records', JSON.stringify(breedingRecords));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [breedingRecords]);

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('هل تريد استعادة البيانات التجريبية الأولية لمنظومة SOL-ID؟')) {
      localStorage.removeItem('solid_animals');
      localStorage.removeItem('solid_weight_logs');
      localStorage.removeItem('solid_health_records');
      localStorage.removeItem('solid_breeding_records');
      setAnimals(INITIAL_ANIMALS);
      setWeightLogs(INITIAL_WEIGHT_LOGS);
      setHealthRecords(INITIAL_HEALTH_RECORDS);
      setBreedingRecords(INITIAL_BREEDING_RECORDS);
    }
  };

  // Add weight log
  const handleAddWeightLog = (log: Omit<WeightLog, 'log_id'>) => {
    const newEntry: WeightLog = {
      ...log,
      log_id: `wl-${Date.now().toString(36)}`,
    };
    setWeightLogs((prev) => [...prev, newEntry]);
  };

  // Add health record
  const handleAddHealthRecord = (record: Omit<HealthRecord, 'record_id'>) => {
    const newEntry: HealthRecord = {
      ...record,
      record_id: `hr-${Date.now().toString(36)}`,
    };
    setHealthRecords((prev) => [newEntry, ...prev]);
  };

  // Add breeding record
  const handleAddBreedingRecord = (record: Omit<BreedingRecord, 'mating_id'>) => {
    const newEntry: BreedingRecord = {
      ...record,
      mating_id: `br-${Date.now().toString(36)}`,
    };
    setBreedingRecords((prev) => [newEntry, ...prev]);
  };

  // Register Newborns from Dam
  const handleAddNewBorns = ({
    damId,
    sireId,
    birthDate,
    litterSize,
    breed,
  }: {
    damId: string;
    sireId: string | null;
    birthDate: string;
    litterSize: number;
    breed: Animal['breed'];
  }) => {
    const damObj = animals.find((a) => a.id === damId);
    const newAnimalsList: Animal[] = [];
    const newLogsList: WeightLog[] = [];

    for (let i = 1; i <= litterSize; i++) {
      const suffix = Math.floor(100 + Math.random() * 900);
      const newId = `sol-new-${Date.now()}-${i}`;
      const tag = `DZ-${breed.substring(0, 2).toUpperCase()}-${suffix}`;
      const birthWeight = Number((3.6 + Math.random() * 0.9).toFixed(1));

      const newborn: Animal = {
        id: newId,
        tag_number: tag,
        name: `مولود ${damObj?.name ? `ابن ${damObj.name}` : `النعجة ${damObj?.tag_number}`} (#${i})`,
        breed,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        birth_date: birthDate,
        birth_weight: birthWeight,
        acquisition_type: 'Bred_In_Farm',
        status: 'Active',
        category: 'Normal',
        sire_id: sireId,
        dam_id: damId,
        notes: `ولادة توأمية ميدانية تم تسجيلها فوراً عبر SOL Capture`,
      };

      const initLog: WeightLog = {
        log_id: `wl-birth-${newId}`,
        animal_id: newId,
        recorded_at: new Date(birthDate).toISOString(),
        weight_kg: birthWeight,
        adg_since_last: 0,
        source: 'manual',
        notes: 'وزن الولادة الأولي',
      };

      newAnimalsList.push(newborn);
      newLogsList.push(initLog);
    }

    setAnimals((prev) => [...newAnimalsList, ...prev]);
    setWeightLogs((prev) => [...prev, ...newLogsList]);
  };

  // Add single new animal
  const handleAddAnimal = (newAnimal: Animal) => {
    setAnimals((prev) => [newAnimal, ...prev]);
    // Add birth weight log if specified
    if (newAnimal.birth_weight > 0) {
      const initLog: WeightLog = {
        log_id: `wl-birth-${newAnimal.id}`,
        animal_id: newAnimal.id,
        recorded_at: new Date(newAnimal.birth_date).toISOString(),
        weight_kg: newAnimal.birth_weight,
        adg_since_last: 0,
        source: 'manual',
        notes: 'وزن الولادة الأولي',
      };
      setWeightLogs((prev) => [...prev, initLog]);
    }
  };

  // Batch update animals (from Selection Algorithm)
  const handleUpdateAnimalsBatch = (updated: Animal[]) => {
    setAnimals(updated);
  };

  // Manual category override
  const handleUpdateCategory = (animalId: string, newCategory: GeneticCategory, reason?: string) => {
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === animalId) {
          return {
            ...a,
            category: newCategory,
            category_override: true,
            override_reason: reason || 'تعديل يدوي من الإدارة الفلاحية',
          };
        }
        return a;
      })
    );
    if (selectedAnimalForDetails && selectedAnimalForDetails.id === animalId) {
      setSelectedAnimalForDetails((prev) =>
        prev ? { ...prev, category: newCategory, override_reason: reason } : null
      );
    }
  };

  // Sell animal for cash flow
  const handleSellAnimal = (animalId: string, salePriceDzd: number, notes?: string) => {
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === animalId) {
          return {
            ...a,
            status: 'Sold',
            notes: notes || `تم البيع بمبلغ ${salePriceDzd} دج لتأمين السيولة النقدية`,
          };
        }
        return a;
      })
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white" dir="rtl">
      {/* Global Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewAnimal={() => setIsNewAnimalOpen(true)}
        onResetData={handleResetData}
        scaleConnected={scaleConnected}
        onToggleScale={() => setScaleConnected(!scaleConnected)}
        animalsCount={animals.filter((a) => a.status === 'Active').length}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeView === 'capture' && (
          <FieldCapture
            animals={animals}
            weightLogs={weightLogs}
            healthRecords={healthRecords}
            breedingRecords={breedingRecords}
            onAddWeightLog={handleAddWeightLog}
            onAddHealthRecord={handleAddHealthRecord}
            onAddBreedingRecord={handleAddBreedingRecord}
            onAddNewBorns={handleAddNewBorns}
            scaleConnected={scaleConnected}
            onSelectAnimalForDetails={(a) => setSelectedAnimalForDetails(a)}
          />
        )}

        {activeView === 'overview' && (
          <OverviewAnalytics
            animals={animals}
            weightLogs={weightLogs}
            onSelectAnimal={(a) => setSelectedAnimalForDetails(a)}
          />
        )}

        {activeView === 'pedigree' && (
          <PedigreeHub
            animals={animals}
            weightLogs={weightLogs}
            breedingRecords={breedingRecords}
            onCommitMating={handleAddBreedingRecord}
            onSelectAnimalForDetails={(a) => setSelectedAnimalForDetails(a)}
          />
        )}

        {activeView === 'circular' && (
          <CircularEconomy
            animals={animals}
            weightLogs={weightLogs}
            onSellAnimal={handleSellAnimal}
            onSelectAnimalForDetails={(a) => setSelectedAnimalForDetails(a)}
          />
        )}

        {activeView === 'herd' && (
          <HerdTable
            animals={animals}
            weightLogs={weightLogs}
            healthRecords={healthRecords}
            onSelectAnimal={(a) => setSelectedAnimalForDetails(a)}
            onUpdateAnimalsBatch={handleUpdateAnimalsBatch}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-900/40 text-stone-400 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-stone-300">SOL-ID Engine</span>
            <span>· منصة التتبع الوراثي والانتخاب الحيوي للماشية (SOL Ecosystem)</span>
          </div>
          <div className="flex items-center gap-4 text-stone-500 text-[11px] font-mono">
            <span>سلالات السهوب الجزائرية</span>
            <span>·</span>
            <span>معيار ADG & FCR</span>
            <span>·</span>
            <span>معامل رايت لقرابة الدم</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedAnimalForDetails && (
        <AnimalDetailModal
          animal={selectedAnimalForDetails}
          allAnimals={animals}
          weightLogs={weightLogs}
          healthRecords={healthRecords}
          breedingRecords={breedingRecords}
          onClose={() => setSelectedAnimalForDetails(null)}
          onUpdateCategory={handleUpdateCategory}
        />
      )}

      {isNewAnimalOpen && (
        <NewAnimalModal
          existingAnimals={animals}
          onClose={() => setIsNewAnimalOpen(false)}
          onAddAnimal={handleAddAnimal}
        />
      )}
    </div>
  );
}
