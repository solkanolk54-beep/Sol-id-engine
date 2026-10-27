import React from 'react';
import { Smartphone, LayoutDashboard, Dna, Recycle, Users, Plus, RefreshCw, Radio } from 'lucide-react';

interface NavbarProps {
  activeView: 'capture' | 'overview' | 'pedigree' | 'circular' | 'herd';
  setActiveView: (view: 'capture' | 'overview' | 'pedigree' | 'circular' | 'herd') => void;
  onOpenNewAnimal: () => void;
  onResetData: () => void;
  scaleConnected: boolean;
  onToggleScale: () => void;
  animalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenNewAnimal,
  onResetData,
  scaleConnected,
  onToggleScale,
  animalsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-stone-950 font-black text-lg tracking-tighter">
              SOL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-stone-100 tracking-tight">SOL-ID</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-mono font-medium hidden sm:inline">
                  v1.2 MVP
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden md:block">
                هندسة البيانات الوراثية وتتبع الأنساب والنمو الحيوي
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none flex-1 justify-center sm:justify-start" aria-label="أقسام المنظومة">
            <button
              onClick={() => setActiveView('capture')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeView === 'capture'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
              title="شاشة الميدان السريعة للهاتف واللوحة"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>الميدان السريع</span>
            </button>

            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'overview'
                  ? 'bg-stone-800 text-emerald-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">التحليلات والمؤشرات</span>
              <span className="md:hidden">المؤشرات</span>
            </button>

            <button
              onClick={() => setActiveView('pedigree')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'pedigree'
                  ? 'bg-stone-800 text-emerald-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Dna className="w-4 h-4" />
              <span className="hidden md:inline">الأنساب والتزاوج الموجه</span>
              <span className="md:hidden">الأنساب</span>
            </button>

            <button
              onClick={() => setActiveView('circular')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'circular'
                  ? 'bg-stone-800 text-emerald-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Recycle className="w-4 h-4" />
              <span className="hidden md:inline">الاقتصاد الدائري والتصفية</span>
              <span className="md:hidden">الاقتصاد</span>
            </button>

            <button
              onClick={() => setActiveView('herd')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'herd'
                  ? 'bg-stone-800 text-emerald-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>سجل القطيع</span>
              <span className="text-xs bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded-full font-mono">
                {animalsCount}
              </span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Bluetooth Scale Status */}
            <button
              onClick={onToggleScale}
              title={scaleConnected ? 'الميزان الذكي BLE متصل' : 'انقر لمحاكاة ربط الميزان الذكي'}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                scaleConnected
                  ? 'bg-teal-950/60 text-teal-300 border-teal-700/50'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${scaleConnected ? 'animate-pulse text-teal-400' : 'text-stone-500'}`} />
              <span>{scaleConnected ? 'BLE Scale: Online' : 'BLE Scale: Emulate'}</span>
            </button>

            {/* Add Animal Button */}
            <button
              onClick={onOpenNewAnimal}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-3 py-2 rounded-lg text-sm shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة رأس</span>
            </button>

            {/* Reset data */}
            <button
              onClick={onResetData}
              title="إعادة ضبط البيانات الأولية"
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
