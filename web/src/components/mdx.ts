/**
 * Components available inside topic articles (src/content/articles/*.mdx) without an
 * import: the page passes this map to the rendered MDX content.
 */
import BigO from './atoms/BigO.astro';
import ArrayDiagram from './molecules/ArrayDiagram.astro';
import Callout from './molecules/Callout.astro';
import ComplexityTable from './molecules/ComplexityTable.astro';
import DataTable from './molecules/DataTable.astro';
import Equation from './molecules/Equation.astro';
import Faq from './molecules/Faq.astro';
import FaqItem from './molecules/FaqItem.astro';
import ProsCons from './molecules/ProsCons.astro';
import Step from './molecules/Step.astro';
import Steps from './molecules/Steps.astro';
import ArticleViz from './organisms/ArticleViz.astro';
import TopicCode from './organisms/TopicCode.astro';

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
  ProsCons,
  Step,
  Steps,
  TopicCode,
};
