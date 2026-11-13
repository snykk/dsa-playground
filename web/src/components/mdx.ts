/**
 * Components available inside the hand-written pages (src/content/articles, categories and
 * pages) without an import: the page passes this map to the rendered MDX content. The list of names lives
 * in mdxNames.ts so the article checker can read it too.
 */
import BigO from './atoms/BigO.astro';
import type { MdxComponentName } from './mdxNames';
import ArrayDiagram from './molecules/ArrayDiagram.astro';
import Callout from './molecules/Callout.astro';
import ComplexityTable from './molecules/ComplexityTable.astro';
import DataTable from './molecules/DataTable.astro';
import Equation from './molecules/Equation.astro';
import Faq from './molecules/Faq.astro';
import FaqItem from './molecules/FaqItem.astro';
import GraphDiagram from './molecules/GraphDiagram.astro';
import GridDiagram from './molecules/GridDiagram.astro';
import ListDiagram from './molecules/ListDiagram.astro';
import ProsCons from './molecules/ProsCons.astro';
import Step from './molecules/Step.astro';
import Steps from './molecules/Steps.astro';
import TreeDiagram from './molecules/TreeDiagram.astro';
import ArticleViz from './organisms/ArticleViz.astro';
import TopicCode from './organisms/TopicCode.astro';
import TopicList from './organisms/TopicList.astro';

export const MDX_COMPONENTS = {
  ArrayDiagram,
  ArticleViz,
  BigO,
  Callout,
  ComplexityTable,
  DataTable,
  Equation,
  Faq,
  FaqItem,
  GraphDiagram,
  GridDiagram,
  ListDiagram,
  ProsCons,
  Step,
  Steps,
  TopicCode,
  TopicList,
  TreeDiagram,
} satisfies Record<MdxComponentName, unknown>;
