import { rm } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const cacheDir = join(process.cwd(), '.next')

if (existsSync(cacheDir)) {
  await rm(cacheDir, { recursive: true, force: true })
  console.log('Deleted .next cache directory')
} else {
  console.log('.next directory does not exist')
}

// Also check for any turbopack specific cache
const turboDir = join(process.cwd(), '.turbo')
if (existsSync(turboDir)) {
  await rm(turboDir, { recursive: true, force: true })
  console.log('Deleted .turbo cache directory')
} else {
  console.log('.turbo directory does not exist')
}

console.log('Cache cleared successfully - Turbopack will recompile from scratch')
