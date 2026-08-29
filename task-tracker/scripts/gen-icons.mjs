import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public', { recursive: true })

const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="22" fill="#E8672E"/>
  <path d="M28 52 L43 67 L74 33" stroke="#FAF6EF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`

const favicon = svg(64)

await sharp(Buffer.from(svg(192))).png().toFile('public/icon-192.png')
await sharp(Buffer.from(svg(512))).png().toFile('public/icon-512.png')
await sharp(Buffer.from(svg(180))).png().toFile('public/apple-touch-icon.png')
await sharp(Buffer.from(favicon)).resize(64, 64).png().toFile('public/favicon.png')

console.log('icons written')
