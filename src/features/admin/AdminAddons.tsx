import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { Addon } from '../../types';
import { ShoppingBag, Plus, CheckCircle2 } from 'lucide-react';

export const AdminAddons: React.FC = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(50);
  const [category, setCategory] = useState<'CONTROLLER' | 'GEAR' | 'SNACK' | 'DRINK' | 'COMBO'>('SNACK');

  useEffect(() => {
    const sync = () => setAddons(cyberStore.getAddons());
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    cyberStore.getState().addons.push({
      id: `add-${Date.now()}`,
      name: name.trim(),
      description,
      price: Number(price),
      category,
      stock: 30,
      active: true
    });

    setName('');
    setDescription('');
    setPrice(50);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Peripheral Add-ons & Snack Bar
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            ADD-ONS & CAFE MENU
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Extra DualSense controllers, racing gloves, tournament headsets, energy drinks, and snacks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 font-orbitron font-bold text-xs rounded shadow-neon-cyan flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD MENU ITEM</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {addons.map((item) => (
          <div key={item.id} className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-chakra uppercase text-pink-400 font-bold">{item.category}</span>
                <span className="text-[10px] text-emerald-400 font-chakra">Stock: {item.stock}</span>
              </div>
              <h4 className="font-orbitron font-bold text-sm text-white">{item.name}</h4>
              <p className="text-xs text-slate-400 font-chakra mt-1 line-clamp-2">{item.description}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center mt-3">
              <span className="font-orbitron font-bold text-cyan-400 text-sm">৳{item.price}</span>
              <span className="text-[11px] text-slate-500 font-chakra">Active</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl p-6 max-w-md w-full shadow-neon-cyan space-y-4">
            <h3 className="font-orbitron font-extrabold text-lg text-white">ADD ITEM / GEAR</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs font-chakra">
              <div>
                <label className="block text-slate-400 uppercase mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nitro Cold Brew Coffee"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                >
                  <option value="CONTROLLER">Controller</option>
                  <option value="GEAR">Gear / Peripherals</option>
                  <option value="DRINK">Drink / Energy Drink</option>
                  <option value="SNACK">Snack / Fast Food</option>
                  <option value="COMBO">Gamer Combo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Price (৳ BDT) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description..."
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
