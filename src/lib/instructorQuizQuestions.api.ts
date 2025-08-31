import { api } from '@/lib/api'

export type QuizQuestion =
  | { id: string; quizId: string; order: number; type: 'mcq'|'multi'; prompt: string; options: {id:string;text:string}[]; correctOptionIds: string[]; explanation?: string; points: number }
  | { id: string; quizId: string; order: number; type: 'boolean'; prompt: string; correctBoolean: boolean; explanation?: string; points: number }
  | { id: string; quizId: string; order: number; type: 'short'; prompt: string; correctText: string[]; explanation?: string; points: number }

type CreateBody =
  | { type:'mcq'|'multi'; prompt:string; options:{id:string;text:string}[]; correctOptionIds:string[]; points?:number; explanation?:string; order?:number }
  | { type:'boolean'; prompt:string; correctBoolean:boolean; points?:number; explanation?:string; order?:number }
  | { type:'short'; prompt:string; correctText:string[]; points?:number; explanation?:string; order?:number }

export async function listQuestions(quizId: string){
  const { data } = await api.get<{ items: any[] }>(`/instructor/mock/quizzes/${quizId}/questions`)
  return (data.items || []).map(x => ({ ...x, id: x._id ?? x.id }))
}

export async function createQuestion(quizId: string, body: CreateBody){
  const { data } = await api.post<{ question: any }>(`/instructor/mock/quizzes/${quizId}/questions`, body)
  return { ...data.question, id: data.question._id ?? data.question.id }
}

export async function updateQuestion(questionId: string, patch: Partial<CreateBody> & { prompt?: string; points?: number; explanation?: string }){
  const { data } = await api.patch<{ question: any; updated: boolean }>(`/instructor/mock/questions/${questionId}`, patch)
  return { ...data.question, id: data.question._id ?? data.question.id }
}

export async function reorderQuestion(questionId: string, toIndex: number){
  const { data } = await api.post<{ question: { id:string; order:number }; reordered:boolean }>(`/instructor/mock/questions/${questionId}/reorder`, { toIndex })
  return data
}

export async function deleteQuestion(questionId: string){
  const { data } = await api.delete<{ deleted: boolean; questionId: string }>(`/instructor/mock/questions/${questionId}`)
  return data.deleted
}
