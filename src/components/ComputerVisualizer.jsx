import React, { useState, useRef } from 'react';
import {
    Cpu, HardDrive, CircuitBoard, MonitorSpeaker,
    Fan, Zap, MemoryStick, Box, Disc, Wifi,
    Monitor, Keyboard, Mouse, Speaker, RotateCcw, Move3D
} from 'lucide-react';

// Map categories to computer part slots
const PART_SLOTS = {
    'Processors': { icon: Cpu, label: 'CPU', position: 'cpu', color: '#3b82f6' },
    'CPU': { icon: Cpu, label: 'CPU', position: 'cpu', color: '#3b82f6' },
    'Motherboards': { icon: CircuitBoard, label: 'Motherboard', position: 'motherboard', color: '#10b981' },
    'Motherboard': { icon: CircuitBoard, label: 'Motherboard', position: 'motherboard', color: '#10b981' },
    'Memory': { icon: MemoryStick, label: 'RAM', position: 'ram', color: '#8b5cf6' },
    'RAM': { icon: MemoryStick, label: 'RAM', position: 'ram', color: '#8b5cf6' },
    'Graphics Cards': { icon: MonitorSpeaker, label: 'GPU', position: 'gpu', color: '#ef4444' },
    'GPU': { icon: MonitorSpeaker, label: 'GPU', position: 'gpu', color: '#ef4444' },
    'Storage': { icon: HardDrive, label: 'Storage', position: 'storage', color: '#f59e0b' },
    'SSD': { icon: HardDrive, label: 'SSD', position: 'storage', color: '#f59e0b' },
    'HDD': { icon: HardDrive, label: 'HDD', position: 'storage', color: '#f59e0b' },
    'Power Supply': { icon: Zap, label: 'PSU', position: 'psu', color: '#6366f1' },
    'PSU': { icon: Zap, label: 'PSU', position: 'psu', color: '#6366f1' },
    'Cooling': { icon: Fan, label: 'Cooling', position: 'cooling', color: '#06b6d4' },
    'Fans': { icon: Fan, label: 'Fans', position: 'cooling', color: '#06b6d4' },
    'Cases': { icon: Box, label: 'Case', position: 'case', color: '#64748b' },
    'Cabinet': { icon: Box, label: 'Cabinet', position: 'case', color: '#64748b' },
    'Network': { icon: Wifi, label: 'Network', position: 'network', color: '#14b8a6' },
    'Monitors': { icon: Monitor, label: 'Monitor', position: 'monitor', color: '#0ea5e9' },
    'Keyboards': { icon: Keyboard, label: 'Keyboard', position: 'keyboard', color: '#84cc16' },
    'Mouse': { icon: Mouse, label: 'Mouse', position: 'mouse', color: '#22c55e' },
    'Accessories': { icon: Speaker, label: 'Accessory', position: 'accessory', color: '#f97316' },
    'Laptops': { icon: Monitor, label: 'Laptop', position: 'laptop', color: '#6366f1' },
    'Desktop PCs': { icon: Box, label: 'PC', position: 'case', color: '#64748b' }
};

const getSlotInfo = (category) => {
    return PART_SLOTS[category] || { icon: Box, label: 'Part', position: 'other', color: '#94a3b8' };
};

export function ComputerVisualizer({ lineItems = [] }) {
    const [rotation, setRotation] = useState({ x: -15, y: -30 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPosition = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        lastPosition.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastPosition.current.x;
        const deltaY = e.clientY - lastPosition.current.y;
        setRotation(prev => ({
            x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.3)),
            y: prev.y + deltaX * 0.3
        }));
        lastPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);
    const resetRotation = () => setRotation({ x: -15, y: -30 });

    // Group parts by position
    const parts = {};
    lineItems.forEach(item => {
        const slot = getSlotInfo(item.category);
        if (!parts[slot.position]) parts[slot.position] = [];
        parts[slot.position].push({ ...item, slotInfo: slot });
    });

    const hasAnyParts = lineItems.length > 0;

    return (
        <div className="relative select-none">
            {/* Controls */}
            <div className="absolute top-0 left-0 z-10 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-lg text-xs text-slate-300">
                    <Move3D className="w-3 h-3" />
                    <span>Drag to rotate</span>
                </div>
                <button onClick={resetRotation} className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition-colors">
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </button>
            </div>

            <div className="flex gap-8 pt-8">
                {/* 3D Scene */}
                <div
                    className={`flex-1 flex justify-center items-center min-h-[450px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{ perspective: '1200px' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className="relative transition-transform duration-75"
                        style={{
                            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {/* PC CASE - 3D BOX */}
                        <div className="relative" style={{ transformStyle: 'preserve-3d', width: '200px', height: '280px' }}>

                            {/* FRONT FACE */}
                            <div
                                className="absolute w-full h-full rounded-lg overflow-hidden"
                                style={{
                                    transform: 'translateZ(50px)',
                                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                                    border: '2px solid #334155',
                                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
                                }}
                            >
                                {/* Power LED */}
                                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-slate-600" style={{ background: hasAnyParts ? '#22c55e' : '#475569', boxShadow: hasAnyParts ? '0 0 10px #22c55e' : 'none' }} />

                                {/* USB Ports */}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-2">
                                    <div className="w-5 h-2 bg-slate-700 rounded-sm border border-slate-600" />
                                    <div className="w-5 h-2 bg-slate-700 rounded-sm border border-slate-600" />
                                </div>

                                {/* Drive Bay */}
                                <div className="absolute top-20 left-6 right-6 h-8 rounded border border-slate-600 bg-slate-800/60" />

                                {/* Front Vents with RGB */}
                                <div className="absolute bottom-6 left-6 right-6 h-24 flex flex-col gap-1.5">
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <div
                                            key={i}
                                            className="h-3 rounded-full transition-all duration-500"
                                            style={{
                                                background: parts.cooling
                                                    ? `linear-gradient(90deg, #0891b2 0%, #06b6d4 ${30 + i * 10}%, transparent 80%)`
                                                    : '#1e293b',
                                                boxShadow: parts.cooling ? `0 0 8px rgba(6, 182, 212, ${0.3 + i * 0.1})` : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* BACK FACE */}
                            <div
                                className="absolute w-full h-full rounded-lg"
                                style={{
                                    transform: 'translateZ(-50px) rotateY(180deg)',
                                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                                    border: '2px solid #334155'
                                }}
                            />

                            {/* LEFT SIDE (Glass Panel) */}
                            <div
                                className="absolute h-full rounded-lg overflow-hidden"
                                style={{
                                    width: '100px',
                                    transform: 'translateX(-50px) rotateY(-90deg)',
                                    transformOrigin: 'right center',
                                    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.85) 100%)',
                                    border: '2px solid #475569',
                                    backdropFilter: 'blur(4px)'
                                }}
                            >
                                {/* Glass Window with Components Inside */}
                                <div className="absolute inset-3 rounded-lg border border-slate-600/50 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.8) 100%)' }}>

                                    {/* CPU with Cooler */}
                                    <div className="absolute top-[12%] left-1/2 -translate-x-1/2">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${parts.cpu ? 'shadow-lg' : 'border border-dashed border-slate-600/50'}`}
                                            style={{
                                                background: parts.cpu ? 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.1) 100%)' : 'transparent',
                                                boxShadow: parts.cpu ? '0 0 20px rgba(59,130,246,0.5), inset 0 0 15px rgba(59,130,246,0.3)' : 'none'
                                            }}
                                        >
                                            <Cpu className={`w-5 h-5 transition-all ${parts.cpu ? 'text-blue-400' : 'text-slate-600 opacity-40'}`} />
                                        </div>
                                        {parts.cooling && (
                                            <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border-2 border-cyan-500/50 animate-pulse" style={{ boxShadow: '0 0 15px rgba(6,182,212,0.4)' }} />
                                        )}
                                    </div>

                                    {/* RAM Sticks - Vertical */}
                                    <div className="absolute top-[35%] right-2 flex gap-1">
                                        {[0, 1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className="w-2 h-14 rounded-sm transition-all duration-500"
                                                style={{
                                                    background: parts.ram && i < (parts.ram.length || 1) * 2
                                                        ? 'linear-gradient(180deg, #8b5cf6 0%, #a855f7 50%, #8b5cf6 100%)'
                                                        : '#334155',
                                                    boxShadow: parts.ram && i < (parts.ram.length || 1) * 2
                                                        ? '0 0 12px rgba(139,92,246,0.6)'
                                                        : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* GPU - Large Horizontal Card */}
                                    <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-16 h-8">
                                        <div
                                            className={`w-full h-full rounded flex items-center justify-center transition-all duration-500 ${parts.gpu ? '' : 'border border-dashed border-slate-600/50'}`}
                                            style={{
                                                background: parts.gpu ? 'linear-gradient(180deg, rgba(239,68,68,0.3) 0%, rgba(239,68,68,0.15) 100%)' : 'transparent',
                                                boxShadow: parts.gpu ? '0 0 25px rgba(239,68,68,0.5), inset 0 0 20px rgba(239,68,68,0.2)' : 'none'
                                            }}
                                        >
                                            <MonitorSpeaker className={`w-6 h-4 transition-all ${parts.gpu ? 'text-red-400' : 'text-slate-600 opacity-40'}`} />
                                        </div>
                                        {parts.gpu && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-red-500/50 rounded-full blur-sm" />
                                        )}
                                    </div>

                                    {/* Storage - SSD/HDD */}
                                    <div className="absolute bottom-[22%] left-3">
                                        <div
                                            className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-500 ${parts.storage ? '' : 'border border-dashed border-slate-600/50'}`}
                                            style={{
                                                background: parts.storage ? 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.1) 100%)' : 'transparent',
                                                boxShadow: parts.storage ? '0 0 15px rgba(245,158,11,0.5)' : 'none'
                                            }}
                                        >
                                            <HardDrive className={`w-4 h-4 transition-all ${parts.storage ? 'text-amber-400' : 'text-slate-600 opacity-40'}`} />
                                        </div>
                                    </div>

                                    {/* PSU - Bottom Right */}
                                    <div className="absolute bottom-[8%] right-2">
                                        <div
                                            className={`w-8 h-6 rounded flex items-center justify-center transition-all duration-500 ${parts.psu ? '' : 'border border-dashed border-slate-600/50'}`}
                                            style={{
                                                background: parts.psu ? 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.1) 100%)' : 'transparent',
                                                boxShadow: parts.psu ? '0 0 12px rgba(99,102,241,0.5)' : 'none'
                                            }}
                                        >
                                            <Zap className={`w-4 h-4 transition-all ${parts.psu ? 'text-indigo-400' : 'text-slate-600 opacity-40'}`} />
                                        </div>
                                    </div>

                                    {/* RGB Ambient Glow */}
                                    {hasAnyParts && (
                                        <div className="absolute inset-0 pointer-events-none animate-pulse" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.1) 0%, transparent 60%)', mixBlendMode: 'screen' }} />
                                    )}
                                </div>
                            </div>

                            {/* RIGHT SIDE */}
                            <div
                                className="absolute h-full rounded-lg"
                                style={{
                                    width: '100px',
                                    transform: 'translateX(150px) rotateY(90deg)',
                                    transformOrigin: 'left center',
                                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                                    border: '2px solid #334155'
                                }}
                            />

                            {/* TOP FACE */}
                            <div
                                className="absolute w-full rounded-lg"
                                style={{
                                    height: '100px',
                                    transform: 'translateY(-50px) rotateX(90deg)',
                                    transformOrigin: 'bottom center',
                                    background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                                    border: '2px solid #475569'
                                }}
                            >
                                {/* Top Vents */}
                                <div className="absolute inset-4 grid grid-cols-6 gap-1">
                                    {[...Array(18)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-full"
                                            style={{
                                                background: parts.cooling ? `rgba(6, 182, 212, ${0.2 + (i % 3) * 0.1})` : '#1e293b'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* BOTTOM FACE */}
                            <div
                                className="absolute w-full rounded-lg"
                                style={{
                                    height: '100px',
                                    transform: 'translateY(230px) rotateX(-90deg)',
                                    transformOrigin: 'top center',
                                    background: '#0f172a',
                                    border: '2px solid #334155'
                                }}
                            />
                        </div>

                        {/* MONITOR - 3D */}
                        {parts.monitor && (
                            <div className="absolute -right-48 -top-16" style={{ transformStyle: 'preserve-3d' }}>
                                <div className="relative" style={{ transform: 'rotateY(15deg)' }}>
                                    <div className="w-36 h-24 rounded-lg border-4 border-slate-700 bg-gradient-to-br from-blue-950 to-slate-900 flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(59,130,246,0.2)' }}>
                                        <Monitor className="w-10 h-10 text-blue-400/40" />
                                    </div>
                                    <div className="w-6 h-6 mx-auto bg-slate-700" />
                                    <div className="w-16 h-2 mx-auto bg-slate-600 rounded" />
                                </div>
                            </div>
                        )}

                        {/* KEYBOARD */}
                        {parts.keyboard && (
                            <div className="absolute -bottom-12 -right-16" style={{ transform: 'rotateX(-20deg) rotateZ(-5deg)' }}>
                                <div className="w-28 h-10 rounded border border-slate-600 bg-slate-800 p-1">
                                    <div className="grid grid-cols-10 gap-0.5 h-full">
                                        {[...Array(30)].map((_, i) => (
                                            <div key={i} className="bg-slate-700 rounded-sm" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MOUSE */}
                        {parts.mouse && (
                            <div className="absolute -bottom-8 right-8">
                                <div className="w-6 h-10 rounded-full bg-slate-700 border border-slate-600 relative">
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-green-500/40 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="w-52 space-y-2">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Installed Components</h4>
                    {Object.entries(parts).map(([pos, items]) => (
                        <div key={pos} className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                            {React.createElement(items[0].slotInfo.icon, { className: "w-4 h-4", style: { color: items[0].slotInfo.color } })}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-200 truncate">{items[0].slotInfo.label}</p>
                                <p className="text-[10px] text-slate-400 truncate">{items.length > 1 ? `${items.length} items` : items[0].name}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: items[0].slotInfo.color }} />
                        </div>
                    ))}
                    {lineItems.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            Add parts to see<br />them in 3D
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ComputerVisualizer;
