import { describe, expect, it } from "bun:test"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { compile, parse } from "../src"

describe("correctly parse", async () => {
  const testFolder = join(__dirname, "testcases")
  const folders = await readdir(testFolder)
  for (const folder of folders) {
    it(`${folder}`, async () => {
      const source = Bun.file(join(testFolder, folder, "compiled.md"))
      const expected = Bun.file(join(testFolder, folder, "parsed.json"))
      const sourceText = await source.text()
      const expectedText = await expected.text()
      const parsed = parse(sourceText)
      const expectedParsed = JSON.parse(expectedText)
      try {
        expect(parsed).toEqual(expectedParsed)
      } catch (e) {
        await Bun.write(
          join(testFolder, folder, "actual.json"),
          JSON.stringify(parsed, null, 2),
        )
        throw e
      }
    })
  }
})

describe("correctly compile", async () => {
  const testFolder = join(__dirname, "testcases")
  const folders = await readdir(testFolder)
  for (const folder of folders) {
    it(`${folder}`, async () => {
      const source = Bun.file(join(testFolder, folder, "parsed.json"))
      const expected = Bun.file(join(testFolder, folder, "compiled.md"))
      const sourceText = await source.text()
      const expectedText = await expected.text()
      const compiled = compile(JSON.parse(sourceText))

      // Parse the compiled and expected Markdown using remark
      const compiledAST = parse(compiled)
      const expectedAST = parse(expectedText)

      try {
        expect(compiledAST).toEqual(expectedAST)
      } catch (e) {
        await Bun.write(join(testFolder, folder, "actual.md"), compiled)
        await Bun.write(
          join(testFolder, folder, "actual.json"),
          JSON.stringify(compiledAST, null, 2),
        )
        await Bun.write(
          join(testFolder, folder, "expected.json"),
          JSON.stringify(expectedAST, null, 2),
        )
        throw e
      }
    })
  }
})
