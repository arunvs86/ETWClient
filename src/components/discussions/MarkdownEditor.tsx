export default function MarkdownEditor({
  value, onChange, placeholder, className=""
}: { value: string; onChange: (v: string)=>void; placeholder?: string; className?: string; }) {
  return (
    <textarea
      value={value}
      onChange={(e)=>onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full min-h-24 resize-y p-2 text-sm outline-none rounded-lg border bg-white ${className}`}
    />
  );
}
