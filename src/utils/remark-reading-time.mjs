import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

/**
 * Plugin remark que calcula o tempo de leitura de cada post
 * e injeta o resultado no frontmatter processado pelo Astro.
 * Acessível depois via `render(entry)` -> `remarkPluginFrontmatter.minutesRead`.
 */
export default function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutesRead = readingTime.text; // ex: "5 min de leitura"
  };
}
