import YAML from "js-yaml";
import {
	type AST,
	type CodeNode,
	type FrontmatterNode,
	type Node,
	NodeType,
	type ParagraphNode,
	type TagNode,
} from "./type";

export const parse = (input: string): AST => {
	const nodes: Node[] = [];

	input = input.trim();

	// Parse frontmatter
	if (input.startsWith("---")) {
		const frontmatterEnd = input.indexOf("\n---\n");
		if (frontmatterEnd !== -1) {
			const frontmatter = input.slice(3, frontmatterEnd);
			const frontmatterNode: FrontmatterNode = {
				type: NodeType.Frontmatter,
				attributes: YAML.load(frontmatter) || {},
			};
			nodes.push(frontmatterNode);
			input = input.slice(frontmatterEnd + 5);
		}
	}

	while (input.length > 0) {
		if (input.startsWith("<")) {
			// Parse tags
			const tagRegex =
				/<(\w+)([^>]*)>(?:([\s\S]*?)<\/\1>)?\s*|<(\w+)([^>]*)\/>\s*/;
			const match = tagRegex.exec(input);
			if (match) {
				const [
					fullMatch,
					tagName,
					attributesString,
					content,
					selfClosingTagName,
					selfClosingAttributesString,
				] = match;
				const attributes: Record<string, string> = {};

				// Parse attributes
				const attributeRegex = /(\w+)="([^"]*)"/g;
				const attributesStringToUse = selfClosingTagName
					? selfClosingAttributesString
					: attributesString;
				let attributeMatch: unknown;
				while (
					(attributeMatch = attributeRegex.exec(attributesStringToUse)) !== null
				) {
					const [, key, value] = attributeMatch;
					attributes[key] = value;
				}

				const tagNode: TagNode = {
					type: NodeType.Tag,
					name: selfClosingTagName || tagName,
					attributes,
					children: content ? parse(content).nodes : [],
				};
				nodes.push(tagNode);
				input = input.slice(fullMatch.length);
			} else {
				// Parse paragraph
				const paragraphEnd = input.indexOf("\n\n");
				const paragraphContent =
					paragraphEnd !== -1 ? input.slice(0, paragraphEnd) : input;
				const paragraphNode: ParagraphNode = {
					type: NodeType.Paragraph,
					content: paragraphContent.trim(),
				};
				nodes.push(paragraphNode);
				input = input.slice(paragraphContent.length);
			}
		} else if (input.startsWith("```")) {
			// Parse code blocks
			const codeBlockRegex = /```(.*)\n([\s\S]*?)\n```/;
			const match = codeBlockRegex.exec(input);
			if (match) {
				const [fullMatch, metadataString, content] = match;
				const codeNode: CodeNode = {
					type: NodeType.Code,
					metadataString: metadataString.trim(),
					content: content.trim(),
				};
				nodes.push(codeNode);
				input = input.slice(fullMatch.length);
			}
		} else {
			// Parse paragraph
			const paragraphEnd = input.indexOf("\n\n");
			const paragraphContent =
				paragraphEnd !== -1 ? input.slice(0, paragraphEnd) : input;
			const paragraphNode: ParagraphNode = {
				type: NodeType.Paragraph,
				content: paragraphContent.trim(),
			};
			nodes.push(paragraphNode);
			input = input.slice(paragraphContent.length);
		}

		input = input.trim();
	}

	return {
		nodes,
	};
};

export const compile = (ast: AST): string => {
	let output = "";

	for (const node of ast.nodes) {
		switch (node.type) {
			case NodeType.Frontmatter:
				output += "---\n";
				output += YAML.dump(node.attributes);
				output += "---\n";
				break;

			case NodeType.Tag:
				output += `<${node.name}`;
				for (const [key, value] of Object.entries(node.attributes)) {
					output += ` ${key}="${value}"`;
				}
				if (node.children.length > 0) {
					output += ">";
					output += compile({ nodes: node.children });
					output += `</${node.name}>`;
				} else {
					output += "/>";
				}
				output += "\n";
				break;

			case NodeType.Code:
				output += "```";
				output += node.metadataString;
				output += "\n";
				output += node.content;
				output += "\n```\n";
				break;

			case NodeType.Paragraph:
				output += node.content;
				output += "\n\n";
				break;

			default:
				throw new Error(`Unknown node type: ${node}`);
		}
	}

	return output.trim();
};
