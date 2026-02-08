import { rmSync, existsSync } from 'fs'
import { join } from 'path'

const cacheDir = join(process.cwd(), '.next')
if (existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true })
  console.log('Deleted .next cache directory')
} else {
  console.log('.next directory not found at', cacheDir)
}

// Also check parent dirs
const dirs = ['/vercel/share/v0-project/.next', '/vercel/share/.next']
for (const d of dirs) {
  if (existsSync(d)) {
    rmSync(d, { recursive: true, force: true })
    console.log('Deleted', d)
  } else {
    console.log('Not found:', d)
  }
}
console.log('Cache clear complete')
