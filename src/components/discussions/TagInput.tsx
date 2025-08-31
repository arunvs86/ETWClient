import { useState } from "react";

export default function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[])=>void }) {
  const [input, setInput] = useState("");
  function add(tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t].slice(0,8));
    setInput("");
  }
  function remove(tag: string) {
    onChange(value.filter(v => v !== tag));
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(t=>(
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
            #{t}
            <button onClick={()=>remove(t)} className="text-gray-500 hover:text-gray-700">×</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); add(input); } }}
        placeholder="Add tag and press Enter"
        className="w-full rounded-md border px-3 h-10"
      />
    </div>
  );
}
