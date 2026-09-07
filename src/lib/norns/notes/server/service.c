import type { NotesRepo } from './repo'
import type { NoteOption, NoteStatsRow } from '../shared/schema'

export type Note =
  id: number
  title: string
  body: string
  created_at: number
  updated_at: number

export type NoteInput =
  title: string
  body: string

// The parsed list query, as produced by listQuery() in the route.
export type NoteQuery =
  page: number
  pageSize: number
  offset: number
  sort: string | null
  dir: 'asc' | 'desc'
  q: string

export type NotePage =
  data: Note[]
  total: number

WORDS := ['edge', 'worker', 'sqlite', 'svelte', 'pug', 'civet', 'tron', 'cache', 'schema', 'table', 'column', 'token', 'agent', 'route', 'load', 'action', 'form', 'list', 'page', 'query']

export class NotesService
  repo: NotesRepo
  constructor(@repo: NotesRepo)

  list(): Promise<Note[]>
    @repo.list()

  page(query: NoteQuery): Promise<NotePage>
    @repo.page query

  search(q: string, limit?: number): Promise<NoteOption[]>
    @repo.search q, limit

  stats(): Promise<NoteStatsRow[]>
    @repo.stats()

  get(id: number): Promise<Note | null>
    @repo.get id

  create(input: NoteInput): Promise<number>
    @repo.create input.title, input.body

  // Demo data: `count` notes with deterministic-ish titles, spread over the
  // last 90 days so the stats endpoint has something to chart.
  seed(count: number): Promise<number>
    now := Date.now()
    day := 86400000
    rows := for i of [0...count]
      pick := (n: number) => WORDS[(i * 7 + n * 13) % WORDS.length]
      title := `${pick 1} ${pick 2} ${pick 3} #${i + 1}`
      sentences := 1 + ((i * 31) % 6)
      body := Array.from({ length: sentences }, (_, s) => `${pick s} ${pick s + 1} ${pick s + 2}.`).join ' '
      created_at := now - Math.floor(((i * 7919) % 90) * day + ((i * 104729) % day))
      { title, body, created_at }
    @repo.createMany rows

  update(id: number, input: NoteInput): Promise<void>
    @repo.update id, input.title, input.body

  remove(id: number): Promise<void>
    @repo.remove id
