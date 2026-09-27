import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { Device, DeviceCategory, EquipmentCondition, DeviceStatus } from '../../types';
import { Plus, Edit2, Trash2, Gamepad2, CheckCircle2, Wrench, AlertCircle, AlertTriangle, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const AdminDevices: React.FC<Props> = ({ isAddModalOpen, onCloseAddModal }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Delete Confirmation Modal State
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyPrice, setHourlyPrice] = useState(100);
  const [peakHourPrice, setPeakHourPrice] = useState(120);
  const [weekendPrice, setWeekendPrice] = useState(120);
  const [memberPrice, setMemberPrice] = useState(85);
  const [minCapacity, setMinCapacity] = useState(1);
  const [maxCapacity, setMaxCapacity] = useState(1);
  const [status, setStatus] = useState<DeviceStatus>('AVAILABLE');
  const [condition, setCondition] = useState<EquipmentCondition>('Working');
  const [zone, setZone] = useState('Alpha Battle Arena');
  const [display, setDisplay] = useState('27" OLED 240Hz');
  const [image, setImage] = useState('');
  const [controllers, setControllers] = useState(0);
  const [specsInput, setSpecsInput] = useState('GPU: RTX 4080\nCPU: Intel i9-14900K\nRAM: 32GB DDR5\nDisplay: 240Hz OLED');
  const [accessoriesInput, setAccessoriesInput] = useState('Esports Mousepad, Headset Stand');
  const [isActive, setIsActive] = useState(true);

  const [notification, setNotification] = useState('');

  useEffect(() => {
    const sync = () => {
      setDevices(cyberStore.getDevices());
      setCategories(cyberStore.getCategories());
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  useEffect(() => {
    if (isAddModalOpen) {
      handleOpenCreate();
    }
  }, [isAddModalOpen]);

  const handleOpenCreate = () => {
    setEditingDevice(null);
    setName('');
    setCode(`DEV-0${devices.length + 1}`);
    setCategoryId(categories[0]?.id || 'cat-pc');
    setDescription('');
    setHourlyPrice(120);
    setPeakHourPrice(150);
    setWeekendPrice(150);
    setMemberPrice(100);
    setMinCapacity(1);
    setMaxCapacity(2);
    setStatus('AVAILABLE');
    setCondition('Working');
    setZone('Gaming Zone A');
    setDisplay('27" 240Hz Fast IPS');
    setImage('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80');
    setControllers(0);
    setSpecsInput('Display: 240Hz\nAudio: Surround Headset');
    setAccessoriesInput('Deskpad, Headphone stand');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dev: Device) => {
    setEditingDevice(dev);
    setName(dev.name);
    setCode(dev.code);
    setCategoryId(dev.categoryId);
    setDescription(dev.description);
    setHourlyPrice(dev.hourlyPrice);
    setPeakHourPrice(dev.peakHourPrice || dev.hourlyPrice);
    setWeekendPrice(dev.weekendPrice || dev.hourlyPrice);
    setMemberPrice(dev.memberPrice || dev.hourlyPrice);
    setMinCapacity(dev.minCapacity);
    setMaxCapacity(dev.maxCapacity);
    setStatus(dev.status);
    setCondition(dev.condition);
    setZone(dev.zone);
    setDisplay(dev.display);
    setImage(dev.image);
    setControllers(dev.controllers);
    setSpecsInput(Object.entries(dev.specifications).map(([k, v]) => `${k}: ${v}`).join('\n'));
    setAccessoriesInput(dev.accessories.join(', '));
    setIsActive(dev.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse specifications
    const specsMap: Record<string, string> = {};
    specsInput.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        specsMap[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });

    const accArray = accessoriesInput.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name,
      code: code.toUpperCase().trim(),
      categoryId,
      description,
      hourlyPrice: Number(hourlyPrice),
      peakHourPrice: Number(peakHourPrice),
      weekendPrice: Number(weekendPrice),
      memberPrice: Number(memberPrice),
      minCapacity: Number(minCapacity),
      maxCapacity: Number(maxCapacity),
      status,
      condition,
      zone,
      display,
      image: image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      controllers: Number(controllers),
      specifications: specsMap,
      accessories: accArray,
      active: isActive
    };

    if (editingDevice) {
      cyberStore.updateDevice(editingDevice.id, payload);
      setNotification(`Updated device ${payload.code}`);
    } else {
      cyberStore.addDevice(payload);
      setNotification(`Created new device ${payload.code}`);
    }

    setIsModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDeletePrompt = (device: Device) => {
    setDeviceToDelete(device);
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Delete from Cloud SQL backend
      await fetch(`/api/devices/${deviceToDelete.id}`, { method: 'DELETE' }).catch(console.error);

      // 2. Delete from reactive store & audit log
      cyberStore.deleteDevice(deviceToDelete.id);
      setNotification(`Station ${deviceToDelete.code} (${deviceToDelete.name}) permanently deleted.`);
      setDeviceToDelete(null);
      setTimeout(() => setNotification(''), 4000);
    } catch (err: any) {
      alert(`Failed to delete station: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Flexible Resource Architecture
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            DEVICE & RESOURCE FLEET
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Add PCs, PS5s, Racing Simulators, VR Arenas, Flight Sims, or VIP Suites without code changes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded shadow-neon-cyan flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ ADD CUSTOM GAMING DEVICE</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded text-emerald-300 text-xs font-chakra flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* DEVICES TABLE */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-chakra">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">Station Code</th>
                <th className="py-3 px-4">Name & Category</th>
                <th className="py-3 px-4">Zone & Capacity</th>
                <th className="py-3 px-4">Rates (Std / Peak)</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {devices.map((d) => {
                const cat = categories.find(c => c.id === d.categoryId);
                return (
                  <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-orbitron font-bold text-cyan-400 text-sm">
                      {d.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{d.name}</div>
                      <div className="text-[11px] text-slate-500">{cat?.name || 'Custom Category'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{d.zone}</div>
                      <div className="text-[11px] text-slate-500">1 – {d.maxCapacity} players</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-orbitron font-bold text-white">৳{d.hourlyPrice}/h</div>
                      <div className="text-[11px] text-pink-400 font-orbitron">Peak: ৳{d.peakHourPrice || d.hourlyPrice}/h</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] uppercase font-semibold ${
                        d.condition === 'Working' ? 'text-emerald-400' :
                        d.condition === 'Maintenance' ? 'text-amber-400' :
                        'text-rose-400'
                      }`}>
                        {d.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] uppercase font-bold ${
                        d.status === 'AVAILABLE' ? 'text-emerald-400' :
                        d.status === 'OCCUPIED' ? 'text-amber-400' :
                        d.status === 'BOOKED' ? 'text-sky-400' :
                        'text-rose-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded border border-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(d)}
                          title={`Delete station ${d.code}`}
                          className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 rounded border border-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT DEVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl p-6 max-w-2xl w-full shadow-neon-cyan max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-orbitron font-extrabold text-lg text-white">
                {editingDevice ? `EDIT STATION ${editingDevice.code}` : 'CREATE NEW GAMING DEVICE'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-chakra"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-chakra">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Device Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex Motion Sim 03"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase mb-1">Device Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RACE-03"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white uppercase font-orbitron"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this rig..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white"
                />
              </div>

              {/* Pricing Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950 rounded border border-slate-800">
                <div>
                  <label className="block text-slate-400 uppercase text-[11px] mb-1">Standard /h (৳)</label>
                  <input
                    type="number"
                    value={hourlyPrice}
                    onChange={(e) => setHourlyPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-orbitron font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[11px] mb-1">Peak Hour /h (৳)</label>
                  <input
                    type="number"
                    value={peakHourPrice}
                    onChange={(e) => setPeakHourPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-orbitron font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[11px] mb-1">Weekend /h (৳)</label>
                  <input
                    type="number"
                    value={weekendPrice}
                    onChange={(e) => setWeekendPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-orbitron font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[11px] mb-1">VIP Member /h (৳)</label>
                  <input
                    type="number"
                    value={memberPrice}
                    onChange={(e) => setMemberPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-orbitron font-bold"
                  />
                </div>
              </div>

              {/* Location, Display, Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Location / Zone</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="e.g. Apex Velocity Bay"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Display Info</label>
                  <input
                    type="text"
                    value={display}
                    onChange={(e) => setDisplay(e.target.value)}
                    placeholder="e.g. 49-inch Samsung Odyssey"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Max Capacity (Players)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-orbitron"
                  />
                </div>
              </div>

              {/* Status & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Real-time Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="DISABLED">DISABLED</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase mb-1">Hardware Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  >
                    <option value="Working">Working</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Broken">Broken</option>
                    <option value="Replacement Required">Replacement Required</option>
                  </select>
                </div>
              </div>

              {/* Specifications Multi-line */}
              <div>
                <label className="block text-slate-400 uppercase mb-1">
                  Specifications (Format: "Key: Value" on each line)
                </label>
                <textarea
                  rows={4}
                  value={specsInput}
                  onChange={(e) => setSpecsInput(e.target.value)}
                  placeholder="GPU: RTX 4080&#10;CPU: Core i9-14900K&#10;Wheel: Fanatec DD+"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                />
              </div>

              {/* Image URL */}
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

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-300 font-chakra text-xs rounded hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs rounded shadow-neon-cyan"
                >
                  {editingDevice ? 'Update Station' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION & PERMISSION MODAL */}
      {deviceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121624] border border-rose-500/50 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                  Confirm Device Deletion
                </h3>
              </div>
              <button
                onClick={() => setDeviceToDelete(null)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently remove this device from the lounge inventory?
              </p>

              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5 text-xs font-chakra">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Station Code:</span>
                  <span className="font-orbitron font-bold text-cyan-400 text-sm">{deviceToDelete.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Name:</span>
                  <span className="font-semibold text-white">{deviceToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Zone / Area:</span>
                  <span className="text-slate-300">{deviceToDelete.zone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Current Status:</span>
                  <span className="font-bold text-emerald-400 uppercase text-[11px]">{deviceToDelete.status}</span>
                </div>
              </div>

              <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-[11px] text-rose-300 leading-normal">
                ⚠️ <strong>Warning:</strong> This station will be deleted from active bookings, fleet management, and floor displays. This action cannot be undone.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeviceToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-orbitron rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Device Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
