import { z } from 'zod'

import { CREATED_AT, OWNER_ID } from '~/firebase'

export const TimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
})

export type Timestamp = z.infer<typeof TimestampSchema>

export const NotebookSchema = z.object({
  id: z.string(),
  name: z.string(),
  [OWNER_ID]: z.string(),
  [CREATED_AT]: TimestampSchema,
})

export type Notebook = z.infer<typeof NotebookSchema>

export const NoteSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  [OWNER_ID]: z.string(),
  [CREATED_AT]: TimestampSchema,
})

export type Note = z.infer<typeof NoteSchema>

export const FirebaseOptionsSchema = z.object({
  apiKey: z.string().optional(),
  authDomain: z.string().optional(),
  databaseURL: z.string().optional(),
  projectId: z.string().optional(),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().optional(),
  measurementId: z.string().optional(),
})

export type Status = 'idle' | 'loading' | 'success' | 'error'
