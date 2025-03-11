

<header class="welcome"> Welcome to Medford!</header>
<header class="status"> JS input will be replaced soon!</header>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;
	let outputContainer: HTMLElement;
	let output = '';

	onMount(async () => {
		// Import our 'monaco.ts' file here
		// (onMount() will only be executed in the browser, which is what we want)
		//const monaco = (await import('$lib/monaco')).default;

		// Your monaco instance is ready, let's display some code!
		//const editor = monaco.editor.create(editorContainer);
		/*const model = monaco.editor.createModel(
			"console.log('Hello Medford Family!')",
			'javascript'
		);*/
		const monacoModule = await import('monaco-editor');
		monaco = monacoModule as unknown as typeof Monaco;
		
		// Correctly assigning to global editor variable
		editor = monaco.editor.create(editorContainer, {
			value: "console.log('Hello Medford Family!')",
			language: 'javascript',
			theme: 'vs-dark'
		});
		//editor.setModel(model);
		//console.log(editor.getValue())
	});

	/*function runCode() {
		if (editor) {
				try {
					eval(editor.getValue());
					let output = eval(editor.getValue());
					console.log(output + "1")
					outputContainer.textContent = output;
					//console.log(output)
					//console.log(outputContainer.textContent)
				} catch (e) {
					const errorMessage = e instanceof Error ? e.message : String(e);
					outputContainer.textContent = `Error: ${errorMessage}`;
					console.log("2")
				}
		}
		console.log("Code run")
	}*/


	function runCode() {
    if (!editor) {
        outputContainer.textContent = "Editor is not ready.";
        return;
    }

    try {
        let logOutput = "";
        const originalConsoleLog = console.log;

        console.log = (...args) => {
            logOutput += args.join(" ") + "\n";
        };
		//eval cannot store the output of code
        let result = eval(editor.getValue());
        console.log = originalConsoleLog;

        outputContainer.textContent = logOutput || (result !== undefined ? result.toString() : "");
    } catch (e) {
        outputContainer.textContent = `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
}



	onDestroy(() => {
    if (editor) {
      editor.dispose();
      editor = null; 
    }
  });



</script>

  
  
  <style>
	
	:global(body) {
		height: 100vh;
		background-color: rgb(50, 48, 48);
		color: white;
		margin: 0;
	}

	.container {
		display: flex;
		width: 100%;
		height: 400px;
	}
	.outputContainer {
		width: 100%;
		height: 400px;
		font-size: 20px;
		font: black;
		background-color: rgb(93, 92, 92);
		color: white;
	}
	.welcome {
		font-size: 35px;
		color: rgb(130, 161, 130);		
		height: 60px;
		background-color: rgb(50, 48, 48);
	}

	.status {
		font-size: 20px;
		color: rgb(130, 161, 130);		
		height: 60px;
		background-color: rgb(50, 48, 48);
	}
	.run-code {
		background-color: rgb(49, 225, 102);
		color: white;
		padding: 10px;
		width: 100%;
	}
		
  </style>
  



<div class="container" bind:this={editorContainer}> </div>
<button on:click={runCode} class="run-code">Run Code</button>
<div bind:this={outputContainer} class="outputContainer"></div> 

	  

