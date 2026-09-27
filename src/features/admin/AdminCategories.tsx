import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { DeviceCategory } from '../../types';
import { Layers, Plus, Edit2, CheckCircle2 } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const sync = () => setCategories(cyberStore.getCategories());
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    cyberStore.addCategory({
      name: name.trim(),
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      icon: 'Gamepad2',
      image: image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      displayOrder: categories.length + 1,
      active: true
    });

    setName('');
    setDescription('');
    setImage('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Taxonomy & Custom Categories
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            DEVICE CATEGORIES
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Admin can add, edit, or delete categories. Newly created categories reflect automatically across the public site.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 font-orbitron font-bold text-xs rounded shadow-neon-cyan flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ADD CATEGORY</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron font-bold text-base text-white">{c.name}</span>
                <span className="text-[10px] font-chakra uppercase text-emerald-400 font-bold">Active</span>
              </div>
              <p className="text-xs text-slate-400 font-chakra leading-relaxed line-clamp-2 mb-3">
                {c.description}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-chakra pt-2 border-t border-slate-800">
              Slug: {c.slug}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl p-6 max-w-md w-full shadow-neon-cyan space-y-4">
            <h3 className="font-orbitron font-extrabold text-lg text-white">ADD GAMING CATEGORY</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs font-chakra">
              <div>
                <label className="block text-slate-400 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Flight Simulator or Nintendo Switch"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this gaming zone..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-900 text-slate-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-500 text-slate-950 font-orbitron font-bold rounded shadow-neon-cyan"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
