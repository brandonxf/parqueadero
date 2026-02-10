import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | undefined

export function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Please configure the Neon integration."
      )
    }
    _sql = neon(url)
  }
  return _sql
}

// For backward compatibility: export `sql` as a tagged template function
// that lazily initializes the connection on first use
export const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
  return getDb()(strings, ...values)
}
