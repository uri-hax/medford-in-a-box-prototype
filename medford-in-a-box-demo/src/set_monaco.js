import * as monaco from 'monaco-editor';

export function setupMonaco(){ 
    monaco.languages.register({id: 'medford'});

    let keywords = ['class', 'new', 'string', 'string', 'number', 'boolean', 'private', 'public'];

    monaco.languages.setMonarchTokensProvider('medford' {
        keywords,
        tokenizer: { 
            root: [
                [/@?[a-zA-Z][\w$]*/, {
                    cases: {
                        '@keywords': 'keyword',
                        '@default' : 'variable',
                    }
                }],
                [/".*?"/, 'string'],
                [/\/\//, 'comment'], 
            ]
        }
    });

    monaco.editor.defineTheme('medford-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
        { token: 'keyword', foreground: 'ff00ff' },
        { token: 'string', foreground: '00ff00' },
        ],
        colors: {}

    });
     
}

