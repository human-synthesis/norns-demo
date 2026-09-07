import type { NotesRepo } from './repo'

export type Note =
  id: number
  title: string
  body: string
  created_at: number
  updated_at: number

export type NoteInput =
  title: string
  body: string

export class NotesService
  repo: NotesRepo
  constructor(@repo: NotesRepo)

  list(): Promise<Note[]>
    @repo.list()

  get(id: number): Promise<Note | null>
    @repo.get id

  create(input: NoteInput): Promise<number>
    @repo.create input.title, input.body

  update(id: number, input: NoteInput): Promise<void>
    @repo.update id, input.title, input.body

  remove(id: number): Promise<void>
    @repo.remove id
