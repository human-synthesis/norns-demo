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

  list(): Note[]
    @repo.list()

  get(id: number): Note | undefined
    @repo.get id

  create(input: NoteInput): number | bigint
    @repo.create input.title, input.body

  update(id: number, input: NoteInput): void
    @repo.update id, input.title, input.body

  remove(id: number): void
    @repo.remove id
