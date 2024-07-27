export enum NodeType {
  Frontmatter = "frontmatter",
  Tag = "tag",
  Code = "code",
  Paragraph = "paragraph",
  Header = "header",
}

export type BaseNode = {
  type: NodeType
}

export type FrontmatterNode = BaseNode & {
  type: NodeType.Frontmatter
  attributes: Record<string, unknown>
}

export type TagNode = BaseNode & {
  type: NodeType.Tag
  name: string
  attributes: Record<string, string>
  children: Node[]
}

export type CodeNode = BaseNode & {
  type: NodeType.Code
  metadataString: string
  content: string
}

export type ParagraphNode = BaseNode & {
  type: NodeType.Paragraph
  content: string
}

export type HeaderNode = BaseNode & {
  type: NodeType.Header
  level: number
  content: string
}

export type Node =
  | FrontmatterNode
  | TagNode
  | CodeNode
  | ParagraphNode
  | HeaderNode

export type AST = {
  nodes: Node[]
}
