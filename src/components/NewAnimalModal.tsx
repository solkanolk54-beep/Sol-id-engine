import React, { useState } from 'react';
import { Animal, Breed, Gender, AcquisitionType } from '../types/schema';
import { BREED_BENCHMARKS } from '../engine/genetics';
import { X, Plus, Tag, Calendar, Dna } from 'lucide-react';

interface NewAnimalModalProps {
  existingAnimals: Animal[];
  onClose: () => void;
  onAddAnimal: (animal: Animal) => void;
}

export const NewAnimalModal: React.FC<NewAnimalModalProps> = ({
  existingAnimals,
  onClose,
  onAddAnimal,
}) => {
  const [tagNumber, setTagNumber] = useState('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState<Breed>('Ouled_Djellal');
  const [gender, setGender] = useState<Gender>('Male');
  const [birthDate, setBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [birthWeight, setBirthWeight] = useState('4.2');
  const [acquisitionType, setAcquisitionType] = useState<AcquisitionType>('Bred_In_Farm');
  const [sireId, setSireId] = useState<string>('');
  const [damId, setDamId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const eligibleSires = existingAnimals.filter((a) => a.gender === 'Male' && a.status === 'Active');
  const eligibleDams = existingAnimals.filter((a) => a.gender === 'Female' && a.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagNumber.trim()) {
      setErrorMsg('يرجى إدخال رقم القرط الميداني.');
      return;
    }

    // Check unique tag
    if (existingAnimals.some((a) => a.tag_number.toLowerCase() === tagNumber.trim().toLowerCase())) {
      setErrorMsg('رقم القرط هذا مستخدم مسبقاً في القطيع.');
      return;
    }

    const weightVal = parseFloat(birthWeight) || BREED_BENCHMARKS[breed].avg_birth_weight;

    const newAnimal: Animal = {
      id: `sol-${Date.now().toString(36)}`,
      tag_number: tagNumber.trim(),
      name: name.trim() || undefined,
      breed,
      gender,
      birth_date: birthDate,
      birth_weight: weightVal,
      acquisition_type: acquisitionType,
      sire_id: sireId || null,
      dam_id: damId || null,
      status: 'Active',
      category: 'Normal', // Initial default
      notes: notes.trim() || undefined,
    };

    onAddAnimal(newAnimal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">
                تسجيل رأس جديد في منظومة SOL-ID Engine
              </h2>
              <p className="text-xs text-stone-400">
                توليد المعرف الفريد وتوثيق النسب والبيانات الثابتة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-medium mb-1">
                رقم القرط الميداني (Tag / RFID) *:
              </label>
              <input
                type="text"
                required
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                placeholder="مثال: DZ-OJ-204"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1">
                اسم الشهرة أو الوصف الحركي:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: الباشا / الصاعقة"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-medium mb-1">السلالة الأصيلة:</label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value as Breed)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-emerald-500"
              >
                {Object.entries(BREED_BENCHMARKS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.name_ar} ({val.origin_ar})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1">الجنس:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-emerald-500"
              >
                <option value="Male">ذكر ♂ (كبش / فحل / خروف)</option>
                <option value="Female">أنثى ♀ (نعجة / خروفة)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-300 font-medium mb-1">تاريخ الولادة:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1">وزن الولادة (كغ):</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1">مصدر الحيوان:</label>
              <select
                value={acquisitionType}
                onChange={(e) => setAcquisitionType(e.target.value as AcquisitionType)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 outline-none"
              >
                <option value="Bred_In_Farm">مولود في المزرعة</option>
                <option value="Purchased">شراء خارجي (سوق/مزرعة شريكة)</option>
              </select>
            </div>
          </div>

          {/* Pedigree Sires and Dams */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
            <span className="font-bold text-stone-200 block">
              توثيق النسب الوراثي (Pedigree Linking):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">الأب (Sire ♂):</label>
                <select
                  value={sireId}
                  onChange={(e) => setSireId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 outline-none"
                >
                  <option value="">-- غير محدد / مجهول --</option>
                  {eligibleSires.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tag_number} - {s.name || s.breed} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">الأم (Dam ♀):</label>
                <select
                  value={damId}
                  onChange={(e) => setDamId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 outline-none"
                >
                  <option value="">-- غير محددة / مجهولة --</option>
                  {eligibleDams.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.tag_number} - {d.name || d.breed} ({d.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-stone-300 font-medium mb-1">ملاحظات إضافية:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="صفات مظهرية، قرون، لون الصوف، ظروف الولادة..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-100 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950 text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج في قاعدة البيانات وتوليد كود SOL-ID</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
