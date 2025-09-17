// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import MarkdownEditor from "@/components/discussions/MarkdownEditor";
// import TagInput from "@/components/discussions/TagInput";
// import { useCreateQuestion } from "@/lib/discussions.api";

// export default function AskQuestionPage() {
//   const nav = useNavigate();
//   const [title, setTitle] = useState("");
//   const [body, setBody] = useState("");
//   const { mutateAsync, isPending } = useCreateQuestion();

//   async function submit() {
//     if (!title.trim() || !body.trim()) return;
//     const q = await mutateAsync({ title: title.trim(), body: body.trim()});
//     nav(`/discussions/${q._id}`);
//   }

//   return (
//     <div className="container-app py-8 space-y-6">
//       <h1 className="text-2xl font-semibold">Ask a question</h1>

//       <div className="space-y-4">
//         <div>
//           <label className="text-sm font-medium">Title</label>
//           <input className="mt-1 w-full h-11 rounded-md border px-3"
//                  maxLength={180}
//                  placeholder="Be specific and imagine you're asking another instructor/student"
//                  value={title} onChange={(e)=>setTitle(e.target.value)} />
//           <div className="mt-1 text-xs text-gray-500">{title.length}/180</div>
//         </div>

//         <div>
//           <label className="text-sm font-medium">Body</label>
//           <MarkdownEditor value={body} onChange={setBody} placeholder="Include what you tried, expected vs actual, etc." />
//         </div>


//         <div className="flex gap-2">
//           <button className="btn btn-primary" onClick={submit} disabled={isPending || !title || !body}>Post question</button>
//           <button className="btn" onClick={()=>history.back()}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MarkdownEditor from "@/components/discussions/MarkdownEditor";
import TagInput from "@/components/discussions/TagInput";
import { useCreateQuestion } from "@/lib/discussions.api";
import { MessageSquarePlus, Heading1, FileText, Loader2 } from "lucide-react";

export default function AskQuestionPage() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { mutateAsync, isPending } = useCreateQuestion();

  async function submit() {
    if (!title.trim() || !body.trim()) return;
    const q = await mutateAsync({ title: title.trim(), body: body.trim() });
    nav(`/discussions/${q._id}`);
  }

  return (
    <div className="container-app py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <MessageSquarePlus className="h-6 w-6 text-primary" />
          Ask a question
        </h1>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Heading1 className="h-4 w-4 text-gray-500" />
            Title
          </label>
          <input
            className="mt-1 h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
            maxLength={180}
            placeholder="Be specific and imagine you're asking another instructor/student"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="mt-1 text-xs text-gray-500">{title.length}/180</div>
        </div>

        {/* Body */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            Body
          </label>
          <div className="mt-1 rounded-xl border bg-white shadow-sm">
            <MarkdownEditor
              value={body}
              onChange={setBody}
              placeholder="Include what you tried, expected vs actual, steps, screenshots, etc."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-primary inline-flex items-center gap-2 h-10 px-4 text-sm"
            onClick={submit}
            disabled={isPending || !title || !body}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Post question
          </button>
          <button className="btn h-10 px-4 text-sm" onClick={() => history.back()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
