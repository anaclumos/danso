type DansoNodeType = "frontmatter" | "tag" | "code" | "paragraph" | "header"

type DansoBaseNode = {
  type: DansoNodeType
}

type DansoFrontmatterNode = DansoBaseNode & {
  type: "frontmatter"
  attributes: Record<string, unknown>
}

type DansoTagNode = DansoBaseNode & {
  type: "tag"
  name: string
  attributes: Record<string, string>
  children: DansoNode[]
}

type DansoCodeNode = DansoBaseNode & {
  type: "code"
  metadataString: string
  content: string
}

type DansoParagraphNode = DansoBaseNode & {
  type: "paragraph"
  content: string
}

type DansoHeaderNode = DansoBaseNode & {
  type: "header"
  level: number
  content: string
}

type DansoNode =
  | DansoFrontmatterNode
  | DansoTagNode
  | DansoCodeNode
  | DansoParagraphNode
  | DansoHeaderNode

type AST = {
  nodes: DansoNode[]
}

export type {
  DansoNodeType,
  DansoBaseNode,
  DansoFrontmatterNode,
  DansoTagNode,
  DansoCodeNode,
  DansoParagraphNode,
  DansoHeaderNode,
  DansoNode,
  AST,
}
