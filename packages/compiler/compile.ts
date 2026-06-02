const REONA_APIS = [
  'state', 'store', 'mounted', 'updated', 'watchProps',
  'ref', 'memo', 'context', 'createComponent', 'createStore',
  'createContext', 'createRouter', 'RouteProvider', 'Link',
  'useRouter', 'useParams', 'useQueryString',
] as const;

interface ParsedBlocks {
  script: string;
  template: string;
}

function parseBlocks(code: string): ParsedBlocks {
  const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/);
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);

  if (!scriptMatch) throw new Error('[reona] <script> 블록이 없습니다');
  if (!templateMatch) throw new Error('[reona] <template> 블록이 없습니다');

  return {
    script: scriptMatch[1].trim(),
    template: templateMatch[1].trim(),
  };
}

function detectImports(script: string): string[] {
  return REONA_APIS.filter((api) => new RegExp(`\\b${api}\\b`).test(script));
}

function toComponentName(filename: string): string {
  const base = filename.split('/').pop()!.replace(/\.reona$/, '');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function compile(code: string, filename: string): string {
  const name = toComponentName(filename);
  const { script, template } = parseBlocks(code);

  const usedApis = detectImports(script);
  const importList = ['html', ...usedApis].join(', ');

  return `import { ${importList} } from 'reona';
export default function ${name}() {
${script}
return html\`${template}\`;
}`;
}
