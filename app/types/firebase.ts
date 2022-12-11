import { z } from 'zod'

export const TimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
})

export type Timestamp = z.infer<typeof TimestampSchema>

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
