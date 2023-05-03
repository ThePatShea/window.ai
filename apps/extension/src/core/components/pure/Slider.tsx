import React from 'react'

export function Slider({
    min,
    max,
    value,
    onChange
  }: {
    min: number
    max: number
    value: number
    onChange: (value: number) => void
  }) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.target.value))
    }

    const displayValue = value === -1 ? max : value

    return (
      <div className="relative">
        <div>Set limit</div>
        <input
          type="range"
          min={min}
          max={max}
          value={displayValue}
          onChange={handleChange}
          className="w-full h-1.5 bg-slate-300 rounded-full appearance-none outline-none"
        />
        <div>{displayValue !== max ? `$${displayValue}` : "Always allow"}{displayValue === 0 && " (Ask every time)"}</div>
      </div>
    )
  }