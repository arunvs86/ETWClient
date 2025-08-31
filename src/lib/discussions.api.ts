import api, { ensureAuth } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type DiscussionQuestion = {
  _id: string;
  authorId: string;
  courseId?: string | null;
  title: string;
  body: string;
  status: "open" | "answered" | "closed" | "locked";
  acceptedAnswerId?: string | null;
  answersCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DiscussionAnswer = {
  _id: string;
  questionId: string;
  authorId: string;
  body: string;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DiscussionComment = {
  _id: string;
  questionId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export function listQuestions(params?: {
  page?: number; limit?: number; q?: string;
  courseId?: string; status?: string; sort?: "newest"|"unanswered"|"active"; mine?: "0"|"1";
}) {
  return api.get("/discussions/questions", { params }).then(r => r.data);
}

export function getQuestion(id: string) {
  return api.get(`/discussions/questions/${id}`).then(r => r.data as {
    question: DiscussionQuestion, answers: DiscussionAnswer[], comments: DiscussionComment[]
  });
}

export async function createQuestion(payload: { title: string; body: string; courseId?: string | null }) {
  await ensureAuth();
  const { data } = await api.post("/discussions/questions", payload);
  return data as DiscussionQuestion;
}

export async function createAnswer(qid: string, payload: { body: string }) {
  await ensureAuth();
  const { data } = await api.post(`/discussions/questions/${qid}/answers`, payload);
  return data as DiscussionAnswer;
}

export async function acceptAnswer(qid: string, aid: string) {
  await ensureAuth();
  const { data } = await api.post(`/discussions/questions/${qid}/accept/${aid}`);
  return data;
}

export async function addComment(qid: string, payload: { body: string }) {
  await ensureAuth();
  const { data } = await api.post(`/discussions/questions/${qid}/comments`, payload);
  return data as DiscussionComment;
}

export async function deleteComment(id: string) {
  await ensureAuth();
  const { data } = await api.delete(`/discussions/comments/${id}`);
  return data;
}

/* hooks */
export function useQuestions(params: Parameters<typeof listQuestions>[0]) {
  return useQuery({ queryKey: ["discussions","questions", params], queryFn: () => listQuestions(params) });
}
export function useQuestion(id: string) {
  return useQuery({ queryKey: ["discussions","question", id], queryFn: () => getQuestion(id), enabled: !!id });
}
export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (q) => {
      qc.invalidateQueries({ queryKey: ["discussions","questions"] });
      qc.setQueryData(["discussions","question", q._id], { question: q, answers: [], comments: [] });
    }
  });
}
export function useCreateAnswer(qid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string }) => createAnswer(qid, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discussions","question", qid] }),
  });
}
export function useAcceptAnswer(qid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (aid: string) => acceptAnswer(qid, aid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discussions","question", qid] }),
  });
}
export function useAddComment(qid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string }) => addComment(qid, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discussions","question", qid] }),
  });
}
export function useDeleteComment(qid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cid: string) => deleteComment(cid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discussions","question", qid] }),
  });
}
