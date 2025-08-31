import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MarkdownEditor from "@/components/discussions/MarkdownEditor";
import TagInput from "@/components/discussions/TagInput";
import { useCreateQuestion } from "@/lib/discussions.api";

export default function AskQuestionPage() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { mutateAsync, isPending } = useCreateQuestion();

  async function submit() {
    if (!title.trim() || !body.trim()) return;
    const q = await mutateAsync({ title: title.trim(), body: body.trim()});
    nav(`/discussions/${q._id}`);
  }

  return (
    <div className="container-app py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Ask a question</h1>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input className="mt-1 w-full h-11 rounded-md border px-3"
                 maxLength={180}
                 placeholder="Be specific and imagine you're asking another instructor/student"
                 value={title} onChange={(e)=>setTitle(e.target.value)} />
          <div className="mt-1 text-xs text-gray-500">{title.length}/180</div>
        </div>

        <div>
          <label className="text-sm font-medium">Body</label>
          <MarkdownEditor value={body} onChange={setBody} placeholder="Include what you tried, expected vs actual, etc." />
        </div>


        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={submit} disabled={isPending || !title || !body}>Post question</button>
          <button className="btn" onClick={()=>history.back()}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
