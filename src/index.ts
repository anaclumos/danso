import YAML from "js-yaml"

import type {
  AST,
  DansoCodeNode,
  DansoFrontmatterNode,
  DansoNode,
  DansoParagraphNode,
  DansoTagNode,
  DansoHeaderNode,
} from "./type"

export const parse = (i: string): AST => {
  const nodes: DansoNode[] = []
  let input = i.trim()

  // Parse frontmatter
  if (input.startsWith("---")) {
    const frontmatterEnd = input.indexOf("\n---\n")
    if (frontmatterEnd !== -1) {
      const frontmatter = input.slice(3, frontmatterEnd)
      const DansofrontmatterNode: DansoFrontmatterNode = {
        type: "frontmatter",
        attributes: YAML.load(frontmatter) as Record<string, unknown>,
      }
      nodes.push(DansofrontmatterNode)
      input = input.slice(frontmatterEnd + 5)
    }
  }

  while (input.length > 0) {
    if (input.startsWith("#")) {
      // Parse headers with '#' prefix
      const headerRegex = /^(#{1,6})\s+(.*)/
      const match = headerRegex.exec(input)
      if (match) {
        const [fullMatch, hashPrefix, content] = match
        const level = hashPrefix.length
        const headerNode: DansoHeaderNode = {
          type: "header",
          level,
          content: content.trim(),
        }
        nodes.push(headerNode)
        input = input.slice(fullMatch.length)
      }
    } else if (/^[^\n]+\n(=|-)+\n/.test(input)) {
      // Parse headers with underline syntax
      const headerRegex = /^([^\n]+)\n(=|-)+\n/
      const match = headerRegex.exec(input)
      if (match) {
        const [fullMatch, content, underline] = match
        const level = underline[0] === "=" ? 1 : 2
        const headerNode: DansoHeaderNode = {
          type: "header",
          level,
          content: content.trim(),
        }
        nodes.push(headerNode)
        input = input.slice(fullMatch.length)
      }
    } else if (input.startsWith("<")) {
      // Parse tags
      const tagRegex =
        /<(\w+)([^>]*)>(?:([\s\S]*?)<\/\1>)?\s*|<(\w+)([^>]*)\/>\s*/
      const match = tagRegex.exec(input)
      if (match) {
        const [
          fullMatch,
          tagName,
          attributesString,
          content,
          selfClosingTagName,
          selfClosingAttributesString,
        ] = match
        const attributes: Record<string, string> = {}
        // Parse attributes
        const attributeRegex = /(\w+)="([^"]*)"/g
        const attributesStringToUse = selfClosingTagName
          ? selfClosingAttributesString
          : attributesString
        let attributeMatch: RegExpExecArray | null
        while (true) {
          attributeMatch = attributeRegex.exec(attributesStringToUse)
          if (attributeMatch === null) break
          const [, key, value] = attributeMatch
          attributes[key] = value
        }
        const tagNode: DansoTagNode = {
          type: "tag",
          name: selfClosingTagName || tagName,
          attributes,
          children: content ? parse(content).nodes : [],
        }
        nodes.push(tagNode)
        input = input.slice(fullMatch.length)
      } else {
        // Parse paragraph
        const paragraphEnd = input.indexOf("\n\n")
        const paragraphContent =
          paragraphEnd !== -1 ? input.slice(0, paragraphEnd) : input
        const paragraphNode: DansoParagraphNode = {
          type: "paragraph",
          content: paragraphContent.trim(),
        }
        nodes.push(paragraphNode)
        input = input.slice(paragraphContent.length)
      }
    } else if (input.startsWith("```")) {
      // Parse code blocks
      const codeBlockRegex = /```(.*)\n([\s\S]*?)\n```/
      const match = codeBlockRegex.exec(input)
      if (match) {
        const [fullMatch, metadataString, content] = match
        const DansocodeNode: DansoCodeNode = {
          type: "code",
          metadataString: metadataString.trim(),
          content: content.trim(),
        }
        nodes.push(DansocodeNode)
        input = input.slice(fullMatch.length)
      }
    } else {
      // Parse paragraph
      const paragraphEnd = input.indexOf("\n\n")
      const paragraphContent =
        paragraphEnd !== -1 ? input.slice(0, paragraphEnd) : input
      const paragraphNode: DansoParagraphNode = {
        type: "paragraph",
        content: paragraphContent.trim(),
      }
      nodes.push(paragraphNode)
      input = input.slice(paragraphContent.length)
    }
    input = input.trim()
  }

  return {
    nodes,
  }
}

export const compile = (ast: AST): string => {
  let output = ""

  for (const node of ast.nodes) {
    switch (node.type) {
      case "frontmatter":
        output += "---\n"
        output += YAML.dump(node.attributes)
        output += "---\n"
        break
      case "tag":
        output += `<${node.name}`
        for (const [key, value] of Object.entries(node.attributes)) {
          output += ` ${key}="${value}"`
        }
        if (node.children.length > 0) {
          output += ">"
          output += compile({ nodes: node.children })
          output += `</${node.name}>`
        } else {
          output += "/>"
        }
        output += "\n"
        break
      case "code":
        output += "```"
        output += node.metadataString
        output += "\n"
        output += node.content
        output += "\n```\n"
        break
      case "paragraph":
        output += node.content
        output += "\n\n"
        break
      case "header":
        if (node.level === 1) {
          output += node.content
          output += "\n"
          output += "=".repeat(node.content.length)
          output += "\n\n"
        } else if (node.level === 2) {
          output += node.content
          output += "\n"
          output += "-".repeat(node.content.length)
          output += "\n\n"
        } else {
          output += `${"#".repeat(node.level)} `
          output += node.content
          output += "\n\n"
        }
        break
      default:
        throw new Error(`Unknown node type: ${node}`)
    }
  }

  return output.trim()
}
