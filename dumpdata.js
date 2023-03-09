import postgres from 'https://deno.land/x/postgresjs/mod.js'

const sql = postgres(Deno.args[0])
const results = await sql`select * from students`
results.sort((a,b) => {
  const c = a.roll < b.roll
  const d = a.roll > b.roll
  return c ? -1 : (d ? 1 : 0)
})
console.log(results)
console.log(`Total count: ${results.length}`)

Deno.exit()
