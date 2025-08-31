import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuestion, useCreateAnswer, useAcceptAnswer, useAddComment, useDeleteComment } from "@/lib/discussions.api";
import { useAuth } from "@/context/AuthProvider";
import MarkdownEditor from "@/components/discussions/MarkdownEditor";

type ThreadItem =
  | { kind: "answer"; _id: string; body: string; isAccepted: boolean; createdAt: string; authorId: any }
  | { kind: "authorComment"; _id: string; body: string; createdAt: string; authorId: any };

function displayName(a: any, meId?: string) {
  if (meId && (String(a?._id) === String(meId) || String(a?.id) === String(meId))) return "You";
  return a?.name || a?.displayName || "User";
}

export default function QuestionDetailPage() {
  const { id = "" } = useParams();
  const { data, isLoading } = useQuestion(id);
  const { user } = useAuth(); // { id, role, name }
  const isInstructorOrAdmin = user?.role === "instructor" || user?.role === "admin";

  const isAuthor = useMemo(() => {
    const qAuthor = (data as any)?.question?.authorId?._id || (data as any)?.question?.authorId;
    return qAuthor && user?.id && String(qAuthor) === String(user.id);
  }, [data, user]);

  const addAnswer = useCreateAnswer(id);
  const acceptA = useAcceptAnswer(id);
  const addC = useAddComment(id);
  const delC = useDeleteComment(id);

  const [composer, setComposer] = useState("");

  if (isLoading) return <div className="container-app py-6 text-sm">Loading...</div>;
  if (!data?.question) return <div className="container-app py-6 text-sm">Not found.</div>;
  const { question, answers, comments } = data as any;

  // merge answers + author comments into one chronological thread
  const thread: ThreadItem[] = [
    ...answers.map((a: any) => ({ kind: "answer", ...a })),
    ...comments.map((c: any) => ({ kind: "authorComment", ...c })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const canPost =
    (isInstructorOrAdmin /* posts createAnswer() */) ||
    (isAuthor /* posts addComment() */);

  async function submit() {
    const body = composer.trim();
    if (!body) return;
    if (isInstructorOrAdmin) {
      await addAnswer.mutateAsync({ body });
    } else if (isAuthor) {
      await addC.mutateAsync({ body });
    }
    setComposer("");
  }

  return (
    <div className="container-app py-6 max-w-3xl">
      {/* Post card */}
      <div className="rounded-lg border bg-white p-4">
        <div className="text-xs text-gray-500">
          {displayName(question.authorId, user?.id)} · {new Date(question.createdAt).toLocaleString()}
        </div>
        <h1 className="mt-1 text-lg font-semibold">{question.title}</h1>
        <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{question.body}</div>
      </div>

      {/* Thread */}
      <div className="mt-4 rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">
          {thread.length} {thread.length === 1 ? "comment" : "comments"}
        </div>

        <div className="divide-y">
          {thread.map((item) => {
            const isAns = item.kind === "answer";
            const mine =
              (user?.id && (String(item.authorId?._id || item.authorId) === String(user.id))) || false;
            const canDelete = mine || user?.role === "admin";
            const name = displayName(item.authorId, user?.id);
            const role = item.authorId?.role || (isAns ? "instructor" : (isAuthor ? "author" : "user"));
            return (
              <div key={item._id} className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{name}</span>
                  <span>· {new Date(item.createdAt).toLocaleString()}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5">{role}</span>
                  {isAns && (item as any).isAccepted && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 ring-1 ring-blue-200">accepted</span>
                  )}
                  {isAuthor && isAns && !(item as any).isAccepted && (
                    <button
                      className="ml-auto text-xs text-blue-600 hover:underline"
                      onClick={() => acceptA.mutate((item as any)._id)}
                    >
                      Accept
                    </button>
                  )}
                  {canDelete && item.kind === "authorComment" && (
                    <button
                      className="ml-auto text-xs text-red-600 hover:underline"
                      onClick={() => delC.mutate((item as any)._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm">{(item as any).body}</div>
              </div>
            );
          })}
          {thread.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">No comments yet.</div>
          )}
        </div>

        {/* Composer (one box only) */}
        {canPost && (
          <div className="border-t p-3">
            <MarkdownEditor
              value={composer}
              onChange={setComposer}
              placeholder={
                isInstructorOrAdmin
                  ? "Write an answer..."
                  : "Add a follow-up or clarification..."
              }
              className="bg-gray-50"
            />
            <div className="mt-2 flex justify-end">
              <button
                className="btn btn-primary h-9 px-3 text-sm"
                disabled={!composer.trim() || addAnswer.isPending || addC.isPending}
                onClick={submit}
              >
                Post
              </button>
            </div>
          </div>
        )}
        {!canPost && (
          <div className="border-t px-4 py-3 text-xs text-gray-500">
            Only instructors/admins can answer. Only the author can comment.
          </div>
        )}
      </div>
    </div>
  );
}
