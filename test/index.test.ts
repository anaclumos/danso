import { describe, it, expect } from 'bun:test'
import { parse } from '../src'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

describe('correctly parse', async () => {
  const testFolder = join(__dirname, 'testcases')
  const folders = await readdir(testFolder)
  for (const folder of folders) {
    it(`${folder}`, async () => {
      const source = Bun.file(join(testFolder, folder, 'source.md'))
      const expected = Bun.file(join(testFolder, folder, 'expected.json'))
      const sourceText = await source.text()
      const expectedText = await expected.text()
      const parsed = parse(sourceText)
      const expectedParsed = JSON.parse(expectedText)
      try {
        expect(parsed).toEqual(expectedParsed)
      } catch (e) {
        await Bun.write(join(testFolder, folder, 'parsed.json'), JSON.stringify(parsed, null, 2))
        throw e
      }
    })
  }
})
