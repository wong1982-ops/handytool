'use client'

import { useState } from 'react'
import { type ShapeType, type ShapeStyle, SHAPE_LABELS, DASH_PATTERNS } from './shape-tools'
import { GradientPicker } from './gradient-picker'

interface ShapeProperties {
  x: number
  y: number
  width: number
  height: number
  angle: number
  scaleX: number
  scaleY: number
  pointCount?: number
}

interface PropertiesBarProps {
  shapeType: ShapeType
  style: ShapeStyle
  properties: ShapeProperties | null
  onStyleChange: (updates: Partial<ShapeStyle>) => void
  onPropertiesChange: (updates: Partial<ShapeProperties>) => void
  onShapeTypeChange: (type: ShapeType) => void
}

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
]

export function PropertiesBar({
  shapeType,
  style,
  properties,
  onStyleChange,
  onPropertiesChange,
  onShapeTypeChange,
}: PropertiesBarProps) {
  const [showFillPopover, setShowFillPopover] = useState(false)
  const [showShadowPopover, setShowShadowPopover] = useState(false)

  const showCornerRadius = shapeType === 'rectangle' || shapeType === 'rounded-rectangle'
  const showPointCount = shapeType === 'star' || shapeType === 'polygon'

  return (
    <div className="h-10 border-b border-slate-700 bg-[#101622] flex items-center gap-3 px-3 overflow-x-auto text-xs shrink-0">
      {/* Shape type dropdown */}
      <select
        value={shapeType}
        onChange={(e) => onShapeTypeChange(e.target.value as ShapeType)}
        className="bg-slate-800 border border-slate-700 text-white rounded px-1.5 py-1 text-xs cursor-pointer"
      >
        {Object.entries(SHAPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <div className="w-px h-5 bg-slate-700" />

      {/* Dimensions */}
      {properties && (
        <>
          <label className="text-slate-500">W</label>
          <input
            type="number"
            value={Math.round(properties.width * properties.scaleX)}
            onChange={(e) => onPropertiesChange({ width: Number(e.target.value) / properties.scaleX })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
          <label className="text-slate-500">H</label>
          <input
            type="number"
            value={Math.round(properties.height * properties.scaleY)}
            onChange={(e) => onPropertiesChange({ height: Number(e.target.value) / properties.scaleY })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />

          <div className="w-px h-5 bg-slate-700" />

          {/* Position */}
          <label className="text-slate-500">X</label>
          <input
            type="number"
            value={Math.round(properties.x)}
            onChange={(e) => onPropertiesChange({ x: Number(e.target.value) })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
          <label className="text-slate-500">Y</label>
          <input
            type="number"
            value={Math.round(properties.y)}
            onChange={(e) => onPropertiesChange({ y: Number(e.target.value) })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />

          <div className="w-px h-5 bg-slate-700" />

          {/* Rotation */}
          <label className="text-slate-500">R</label>
          <input
            type="number"
            min={0}
            max={360}
            value={Math.round(properties.angle)}
            onChange={(e) => onPropertiesChange({ angle: Number(e.target.value) })}
            className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
          <span className="text-slate-500">°</span>
        </>
      )}

      <div className="w-px h-5 bg-slate-700" />

      {/* Fill */}
      <div className="relative flex items-center gap-1">
        <label className="text-slate-500">Fill</label>
        <button
          onClick={() => setShowFillPopover(!showFillPopover)}
          className="w-6 h-6 rounded border border-slate-600 cursor-pointer"
          style={{
            backgroundColor: style.fillType === 'none' ? 'transparent' : style.fill,
            backgroundImage: style.fillType === 'none'
              ? 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 1px, transparent 4px)'
              : style.fillType === 'gradient'
                ? style.gradientType === 'linear'
                  ? `linear-gradient(${style.gradientAngle}deg, ${style.gradientColorStart}, ${style.gradientColorEnd})`
                  : `radial-gradient(circle, ${style.gradientColorStart}, ${style.gradientColorEnd})`
                : undefined,
          }}
          title="Fill color"
        />
        {showFillPopover && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a2333] border border-slate-700 rounded-xl shadow-xl z-50 p-3 space-y-2">
            <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
              {(['solid', 'gradient', 'none'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => onStyleChange({ fillType: ft })}
                  className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
                    style.fillType === ft ? 'bg-[var(--tk-color-primary-500)] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
            {style.fillType === 'solid' && (
              <div className="flex items-center gap-2">
                <label className="w-full h-8 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: style.fill }}>
                  <input type="color" value={style.fill} onChange={(e) => onStyleChange({ fill: e.target.value })} className="sr-only" />
                </label>
              </div>
            )}
            {style.fillType === 'gradient' && (
              <GradientPicker
                type={style.gradientType}
                angle={style.gradientAngle}
                colorStart={style.gradientColorStart}
                colorEnd={style.gradientColorEnd}
                onTypeChange={(gradientType) => onStyleChange({ gradientType })}
                onAngleChange={(gradientAngle) => onStyleChange({ gradientAngle })}
                onColorStartChange={(gradientColorStart) => onStyleChange({ gradientColorStart })}
                onColorEndChange={(gradientColorEnd) => onStyleChange({ gradientColorEnd })}
              />
            )}
            <button onClick={() => setShowFillPopover(false)} className="w-full text-center text-xs text-slate-500 hover:text-white py-1 cursor-pointer">
              Close
            </button>
          </div>
        )}
      </div>

      {/* Stroke */}
      <div className="flex items-center gap-1">
        <label className="text-slate-500">Stroke</label>
        <label className="w-6 h-6 rounded border border-slate-600 cursor-pointer" style={{ backgroundColor: style.stroke }}>
          <input type="color" value={style.stroke} onChange={(e) => onStyleChange({ stroke: e.target.value })} className="sr-only" />
        </label>
        <input
          type="number"
          min={0}
          max={50}
          value={style.strokeWidth}
          onChange={(e) => onStyleChange({ strokeWidth: Number(e.target.value) })}
          className="w-10 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          title="Stroke width"
        />
        <select
          value={JSON.stringify(style.strokeDashArray)}
          onChange={(e) => onStyleChange({ strokeDashArray: JSON.parse(e.target.value) })}
          className="bg-slate-800 border border-slate-700 text-white rounded px-1 py-0.5 text-xs cursor-pointer"
        >
          {Object.entries(DASH_PATTERNS).map(([name, pattern]) => (
            <option key={name} value={JSON.stringify(pattern)}>{name}</option>
          ))}
        </select>
      </div>

      {/* Corner radius */}
      {showCornerRadius && (
        <div className="flex items-center gap-1">
          <label className="text-slate-500">Radius</label>
          <input
            type="number"
            min={0}
            max={200}
            value={style.cornerRadius}
            onChange={(e) => onStyleChange({ cornerRadius: Number(e.target.value) })}
            className="w-10 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
        </div>
      )}

      {/* Point count */}
      {showPointCount && properties && (
        <div className="flex items-center gap-1">
          <label className="text-slate-500">{shapeType === 'star' ? 'Points' : 'Sides'}</label>
          <input
            type="number"
            min={3}
            max={24}
            value={properties.pointCount ?? (shapeType === 'star' ? 5 : 6)}
            onChange={(e) => onPropertiesChange({ pointCount: Number(e.target.value) })}
            className="w-10 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
        </div>
      )}

      <div className="w-px h-5 bg-slate-700" />

      {/* Opacity */}
      <div className="flex items-center gap-1">
        <label className="text-slate-500">Opacity</label>
        <input
          type="range"
          min={0}
          max={100}
          value={style.opacity}
          onChange={(e) => onStyleChange({ opacity: Number(e.target.value) })}
          className="w-16 h-1 accent-[var(--tk-color-primary-500)]"
        />
        <span className="text-slate-400 w-7 text-right">{style.opacity}%</span>
      </div>

      {/* Blend mode */}
      <select
        value={style.blendMode}
        onChange={(e) => onStyleChange({ blendMode: e.target.value })}
        className="bg-slate-800 border border-slate-700 text-white rounded px-1 py-0.5 text-xs cursor-pointer"
      >
        {BLEND_MODES.map((bm) => (
          <option key={bm.value} value={bm.value}>{bm.label}</option>
        ))}
      </select>

      {/* Shadow */}
      <div className="relative flex items-center gap-1">
        <label className="flex items-center gap-1 cursor-pointer text-slate-500">
          <input
            type="checkbox"
            checked={style.shadowEnabled}
            onChange={(e) => onStyleChange({ shadowEnabled: e.target.checked })}
            className="rounded border-slate-600 w-3 h-3"
          />
          Shadow
        </label>
        {style.shadowEnabled && (
          <button
            onClick={() => setShowShadowPopover(!showShadowPopover)}
            className="text-xs text-slate-400 hover:text-white px-1 cursor-pointer"
          >
            ···
          </button>
        )}
        {showShadowPopover && style.shadowEnabled && (
          <div className="absolute top-full right-0 mt-1 bg-[#1a2333] border border-slate-700 rounded-xl shadow-xl z-50 p-3 space-y-2 w-48">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">Color</label>
              <label className="flex-1 h-6 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: style.shadowColor }}>
                <input type="color" value={style.shadowColor} onChange={(e) => onStyleChange({ shadowColor: e.target.value })} className="sr-only" />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">X</label>
              <input type="number" value={style.shadowOffsetX} onChange={(e) => onStyleChange({ shadowOffsetX: Number(e.target.value) })} className="flex-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">Y</label>
              <input type="number" value={style.shadowOffsetY} onChange={(e) => onStyleChange({ shadowOffsetY: Number(e.target.value) })} className="flex-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">Blur</label>
              <input type="number" min={0} value={style.shadowBlur} onChange={(e) => onStyleChange({ shadowBlur: Number(e.target.value) })} className="flex-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs" />
            </div>
            <button onClick={() => setShowShadowPopover(false)} className="w-full text-center text-xs text-slate-500 hover:text-white py-1 cursor-pointer">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
