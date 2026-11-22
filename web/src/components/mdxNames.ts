/**
 * Names of the components an article (src/content/articles/*.mdx) may use without an
 * import. mdx.ts maps each name to its component; the article checker reads this list,
 * so it lives in a plain module that tests can import.
 */
export const MDX_COMPONENT_NAMES = [
  'ArrayDiagram',
  'ArticleViz',
  'BigO',
  'Callout',
  'ComplexityTable',
  'DataTable',
  'Equation',
  'Faq',
  'FaqItem',
  'GraphDiagram',
  'GridDiagram',
  'ListDiagram',
  'PracticeProblems',
  'ProsCons',
  'Step',
  'Steps',
  'TopicCode',
  'TopicList',
  'TreeDiagram',
] as const;

export type MdxComponentName = (typeof MDX_COMPONENT_NAMES)[number];
