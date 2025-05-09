import * as monaco from 'monaco-editor';
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { loadWASM } from 'onigasm';

export async function setupTextMate(monaco: any, editor: any, languageId: string, scopeName: string, grammarPath: string) {
    await loadWASM('/onigasm.wasm');
}

const registry = new Registry({
  getGrammarDefinition: async (scopeName) => ({
    format: 'json',
    content: await fetch('../mfd.tmLanguage.json').then(r => r.text())
  })
});

await wireTmGrammars(monaco, registry, editor, {
  'mfd': 'scope.mfd'
});


