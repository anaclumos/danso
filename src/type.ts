export enum DansoNodeType {
  Frontmatter = "frontmatter",
  Tag = "tag",
  Code = "code",
  Paragraph = "paragraph",
  Header = "header",
}

export type DansoBaseNode = {
  type: DansoNodeType
}

export type DansoFrontmatterNode = DansoBaseNode & {
  type: DansoNodeType.Frontmatter
  attributes: Record<string, unknown>
}

export type DansoTagNode = DansoBaseNode & {
  type: DansoNodeType.Tag
  name: string
  attributes: Record<string, string>
  children: DansoNode[]
}

export type DansoCodeNode = DansoBaseNode & {
  type: DansoNodeType.Code
  metadataString: string
  content: string
}

export type DansoParagraphNode = DansoBaseNode & {
  type: DansoNodeType.Paragraph
  content: string
}

export type DansoHeaderNode = DansoBaseNode & {
  type: DansoNodeType.Header
  level: number
  content: string
}

export type DansoNode =
  | DansoFrontmatterNode
  | DansoTagNode
  | DansoCodeNode
  | DansoParagraphNode
  | DansoHeaderNode

export type AST = {
  nodes: DansoNode[]
}
