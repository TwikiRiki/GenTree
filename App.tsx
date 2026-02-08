
import React, { useState, useEffect } from 'react';
import { ViewType, TreeData, Person, Family, StyleConfig, Language } from './types';
import { loadTreeData, saveTreeData } from './services/storage';
import { translations } from './translations';
import TreeView from './components/TreeView';
import EditPerson from './components/EditPerson';
import EditFamily from './components/EditFamily';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('genealogy_lang');
    return (saved as Language) || 'en';
  });
  const [data, setData] = useState<TreeData | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const t = translations[lang];

  const normalizeFamilies = (families: Family[]) => {
    let changed = false;
    const seenChildren = new Set<string>();
    const normalized = families.map(family => {
      const uniqueChildren = family.children.filter(childId => {
        if (seenChildren.has(childId)) {
          changed = true;
          return false;
        }
        seenChildren.add(childId);
        return true;
      });
      if (uniqueChildren.length !== family.children.length) {
        changed = true;
      }
      return uniqueChildren.length === family.children.length
        ? family
        : { ...family, children: uniqueChildren };
    });

    return { families: normalized, changed };
  };

  const normalizeTreeData = (tree: TreeData) => {
    const { families, changed } = normalizeFamilies(tree.families);
    return { tree: changed ? { ...tree, families } : tree, changed };
  };

  const applyUniqueChildren = (families: Family[], family: Family) => {
    const childSet = new Set(family.children);
    return families.map(existing => {
      if (existing.id === family.id) return family;
      const nextChildren = existing.children.filter(childId => !childSet.has(childId));
      return nextChildren.length === existing.children.length
        ? existing
        : { ...existing, children: nextChildren };
    });
  };

  useEffect(() => {
    const loaded = loadTreeData();
    const { tree, changed } = normalizeTreeData(loaded);
    setData(tree);
    if (changed) {
      saveTreeData(tree);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('genealogy_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!data) return null;

  const handleSave = (newData: TreeData) => {
    setData(newData);
    saveTreeData(newData);
    setStatus({ type: 'success', msg: t.saveSuccess });
  };

  const updatePerson = (p: Person) => {
    const nextPeople = data.people.map(x => x.id === p.id ? p : x);
    handleSave({ ...data, people: nextPeople });
  };

  const addPerson = (p: Person) => {
    handleSave({ ...data, people: [...data.people, p] });
  };

  const deletePerson = (id: string) => {
    const nextPeople = data.people.filter(p => p.id !== id);
    const nextFamilies = data.families.map(f => ({
      ...f,
      spouses: f.spouses.filter(s => s !== id),
      children: f.children.filter(c => c !== id)
    }));
    handleSave({ ...data, people: nextPeople, families: nextFamilies });
  };

  const updateFamily = (f: Family) => {
    const nextFamilies = applyUniqueChildren(data.families, f);
    handleSave({ ...data, families: nextFamilies });
  };

  const addFamily = (f: Family) => {
    const nextFamilies = applyUniqueChildren([...data.families, f], f);
    handleSave({ ...data, families: nextFamilies });
  };

  const deleteFamily = (id: string) => {
    handleSave({ ...data, families: data.families.filter(f => f.id !== id) });
  };

  const updateStyle = (style: StyleConfig) => {
    handleSave({ ...data, style });
  };

  const getPersonDetails = (id: string) => {
    const person = data.people.find(p => p.id === id);
    if (!person) return null;

    const parents = data.families
      .filter(f => f.children.includes(id))
      .flatMap(f => f.spouses)
      .map(pId => data.people.find(p => p.id === pId))
      .filter(Boolean) as Person[];

    const spouseUnits = data.families.filter(f => f.spouses.includes(id));
    const spouses = spouseUnits
      .flatMap(f => f.spouses.filter(sId => sId !== id))
      .map(pId => data.people.find(p => p.id === pId))
      .filter(Boolean) as Person[];

    const children = spouseUnits
      .flatMap(f => f.children)
      .map(pId => data.people.find(p => p.id === pId))
      .filter(Boolean) as Person[];

    return { person, parents, spouses, children };
  };

  const renderPersonModal = () => {
    if (!selectedPersonId) return null;
    const details = getPersonDetails(selectedPersonId);
    if (!details) return null;
    const { person, parents, spouses, children } = details;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedPersonId(null)}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="h-32 bg-slate-100 relative">
            <button 
              onClick={() => setSelectedPersonId(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm text-slate-500 transition-colors"
            >
              ✕
            </button>
            <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
                {person.photo ? (
                  <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl">👤</div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-14 px-8 pb-8 space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{person.name}</h2>
              <p className="text-sm text-slate-500 font-mono">ID: {person.id}</p>
              <p className="mt-1 text-slate-600 font-medium">
                {person.born || '?'} — {person.died || t.present}
              </p>
            </div>

            {person.notes && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">{t.bioNotes}</h4>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{person.notes}"</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{t.connections}</h4>
                
                <div className="space-y-2">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 w-16">{t.parents}:</span>
                    {parents.length > 0 ? parents.map(p => (
                      <button key={p.id} onClick={() => setSelectedPersonId(p.id)} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs hover:bg-blue-100 transition-colors border border-blue-100">{p.name}</button>
                    )) : <span className="text-xs text-slate-400 italic">{t.noneRecorded}</span>}
                  </div>
                  
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 w-16">{t.spouses}:</span>
                    {spouses.length > 0 ? spouses.map(p => (
                      <button key={p.id} onClick={() => setSelectedPersonId(p.id)} className="px-2 py-1 bg-rose-50 text-rose-700 rounded-md text-xs hover:bg-rose-100 transition-colors border border-rose-100">{p.name}</button>
                    )) : <span className="text-xs text-slate-400 italic">{t.noneRecorded}</span>}
                  </div>

                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 w-16">{t.children}:</span>
                    {children.length > 0 ? children.map(p => (
                      <button key={p.id} onClick={() => setSelectedPersonId(p.id)} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs hover:bg-emerald-100 transition-colors border border-emerald-100">{p.name}</button>
                    )) : <span className="text-xs text-slate-400 italic">{t.noneRecorded}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex justify-end gap-2 mb-8">
        <button 
          onClick={() => setLang('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'en' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-200'}`}
        >
          English
        </button>
        <button 
          onClick={() => setLang('it')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'it' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-200'}`}
        >
          Italiano
        </button>
      </div>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{t.title}</h1>
        <p className="text-slate-500">{t.subtitle}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setView('view')}
          className="group p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:scale-105 transition-all text-left"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🌳</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t.viewTree}</h2>
          <p className="text-slate-500 text-sm">{t.viewTreeDesc}</p>
        </button>
        <button 
          onClick={() => setView('edit')}
          className="group p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:scale-105 transition-all text-left"
        >
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">✏️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t.editData}</h2>
          <p className="text-slate-500 text-sm">{t.editDataDesc}</p>
        </button>
        <button 
          onClick={() => setView('settings')}
          className="group p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:scale-105 transition-all text-left"
        >
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">⚙️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t.settings}</h2>
          <p className="text-slate-500 text-sm">{t.settingsDesc}</p>
        </button>
      </div>
    </div>
  );

  const renderView = () => (
    <div className="h-screen flex flex-col overflow-hidden">
      <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">← {t.back}</button>
          <h2 className="text-lg font-bold text-slate-800">{t.viewTree}</h2>
        </div>
        <div className="text-xs text-slate-400">{t.viewing} {data.people.length} {t.people}, {data.families.length} {t.families}</div>
      </nav>
      <main className="flex-1 p-4 overflow-hidden bg-slate-100 relative">
        <TreeView data={data} onPersonClick={setSelectedPersonId} />
        {renderPersonModal()}
      </main>
    </div>
  );

  const renderEdit = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="h-16 border-b border-slate-200 bg-white px-6 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">← {t.back}</button>
        <h2 className="text-lg font-bold text-slate-800">{t.editData}</h2>
      </nav>
      <main className="max-w-4xl mx-auto w-full p-6 space-y-12">
        <EditPerson 
          people={data.people} 
          onUpdate={updatePerson} 
          onAdd={addPerson} 
          onDelete={deletePerson} 
          lang={lang}
        />
        <EditFamily 
          families={data.families} 
          people={data.people} 
          onUpdate={updateFamily} 
          onAdd={addFamily} 
          onDelete={deleteFamily} 
          lang={lang}
        />
      </main>
    </div>
  );

  const renderSettings = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <nav className="h-16 border-b border-slate-200 bg-white px-6 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">← {t.back}</button>
        <h2 className="text-lg font-bold text-slate-800">{t.settings}</h2>
      </nav>
      <main className="max-w-2xl mx-auto w-full p-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2">{t.layoutParams}</h3>
            <p className="text-xs text-slate-500">{t.layoutDesc}</p>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-semibold text-slate-500">{t.vertSpacing}</label>
                 <p className="text-[10px] text-slate-400 mb-1">{t.vertSpacingDesc}</p>
                 <input 
                  type="number" 
                  value={data.style.ranksep} 
                  onChange={e => updateStyle({...data.style, ranksep: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                 />
               </div>
               <div>
                 <label className="text-xs font-semibold text-slate-500">{t.horizSpacing}</label>
                 <p className="text-[10px] text-slate-400 mb-1">{t.horizSpacingDesc}</p>
                 <input 
                  type="number" 
                  value={data.style.nodesep} 
                  onChange={e => updateStyle({...data.style, nodesep: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                 />
               </div>
            </div>
            <h3 className="font-bold text-slate-700 border-b pb-2 pt-4">{t.visualAesthetics}</h3>
            <p className="text-xs text-slate-500">{t.visualDesc}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">{t.defaultFamilyLabel}</label>
                <p className="text-[10px] text-slate-400 mb-1">{t.defaultFamilyLabelDesc}</p>
                <input 
                  type="text" 
                  value={data.style.family_label_default} 
                  onChange={e => updateStyle({...data.style, family_label_default: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                 />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">{t.connThickness}</label>
                <p className="text-[10px] text-slate-400 mb-1">{t.connThicknessDesc}</p>
                <input 
                  type="number" 
                  step="0.5"
                  value={data.style.edge_width} 
                  onChange={e => updateStyle({...data.style, edge_width: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                 />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">{t.famNodeSize}</label>
                <p className="text-[10px] text-slate-400 mb-1">{t.famNodeSizeDesc}</p>
                <input 
                  type="number" 
                  value={data.style.node_size_family} 
                  onChange={e => updateStyle({...data.style, node_size_family: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                 />
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-6">
            <p className="text-xs text-blue-700">
              <strong className="block mb-1">💡 {t.tips}:</strong>
              • {t.tip1}<br/>
              • {t.tip2}<br/>
              • {t.tip3}
            </p>
          </div>
          <button 
            onClick={() => setView('home')}
            className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition mt-4 shadow-md active:scale-[0.98]"
          >
            {t.applyBack}
          </button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="font-sans antialiased text-slate-900">
      {status && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-full shadow-lg text-white font-medium z-50 animate-bounce ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {status.msg}
        </div>
      )}
      
      {view === 'home' && renderHome()}
      {view === 'view' && renderView()}
      {view === 'edit' && renderEdit()}
      {view === 'settings' && renderSettings()}
    </div>
  );
};

export default App;
