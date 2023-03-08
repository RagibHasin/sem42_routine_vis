import postgres from 'https://deno.land/x/postgresjs/mod.js'
const sql = postgres(Deno.args[0])
console.log(await sql`select * from students`)
Deno.exit()
