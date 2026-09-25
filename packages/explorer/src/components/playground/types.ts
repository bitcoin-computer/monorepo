export type PlaygroundResult = {
  status: 'success' | 'error'
  title: string
  data: unknown
}

export type PlaygroundRevData = {
  _rev: string
  type: 'objects' | 'modules'
  res?: unknown
}
