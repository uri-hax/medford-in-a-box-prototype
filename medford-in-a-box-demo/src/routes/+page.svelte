<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { setupTextMate } from '../monaco-textmate';
	import { 'mfd' } from '../monaco-textmate';
	

	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco;
	let editorContainer: HTMLDivElement;
	let outputContainer: HTMLElement;
	let output = $state();

	onMount(async () => {
		// Import our 'monaco.ts' file here
		// (onMount() will only be executed in the browser, which is what we want)
		monaco.languages.register({ id: 'mfd' });
		const monacoModule = await import('monaco-editor');
		monaco = monacoModule as unknown as typeof Monaco;
		
		const initCode = "console.log('Hello MEDFORD Family!')\nconsole.log('pardon our dust')"

		// correctly assigning to global editor variable
		editor = monaco.editor.create(editorContainer, {
			value: initCode,
			language: 'mfd',
			theme: 'vs-dark',
			fontSize: 16
		});
		await setupTextMate(monaco, editor, 'mfd', 'source.mfd', '/syntax/mfd.tmLanguage.json');
	});

	onDestroy(() => {
		if (editor) {
			editor.dispose();
			editor = null; 
		}
	});

	function runCode() {
		if (!editor) {
			output = "Sorry, the editor is not ready.";
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

			output = logOutput || (result !== undefined ? result.toString() : "");
		} catch (e) {
			output = `Error: ${e instanceof Error ? e.message : String(e)}`;
		}

	}
</script>

<div id="header" class="header"> 
	<header class="welcome">
		@ MEDFORD-in-a-box
		<span class="status"> (JS input will be replaced soon!)</span>
	</header>
</div>

<div class="monaco-container" bind:this={editorContainer}> 
	<!-- Editor will be mounted here -->
</div>

<button onclick={runCode} class="run-code">Run Code</button>

<div bind:this={outputContainer} class="outputContainer">
	<!-- Output will be mounted here -->
	 {output}
</div> 

<style>
	:global(body) {
		height: 100vh;
		background-color: rgb(50, 48, 48);
		color: white;
		margin: 0;
	}

	.monaco-container {
		display: flex;
		width: 100% !important;
		height: 67%;
	}

	.header {
		font-family:'Courier New', Courier, monospace;
		color: #c895b8;
		background: linear-gradient(to bottom, #1f1f1f, #1e1e1e);
		padding: 1em 2em;
		margin-bottom: 0.15em;
	}

	.welcome {
		font-size: 24px;
		font-weight: 800;
	}

	.status {
		font-size: 18px;
	}
	.run-code {
		font-family:'Courier New', Courier, monospace;
		font-size: 18px;
		font-weight: 800;
		background-color: #c895b8;
		color: white;
		padding: 10px;
		width: 100%;
		cursor: pointer;
	}

	.outputContainer {
		height: 16.5%;
		font-family:'Courier New', Courier, monospace;
		font-size: 20px;
		font: black;
		background-color: rgb(46, 46, 46);
		color: white;
		padding: 1em;
	}
</style>