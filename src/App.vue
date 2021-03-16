<template>
  <div class="h-full p-4 flex flex-col">
    <header class="flex">
      <h1 class="text-2xl leading-10 mr-4">JSON Schema to JSDoc Converter</h1>
      <p class="leading-10">
        Online version of the npm package
        <a href="https://www.npmjs.com/package/json-schema-to-jsdoc"
          ><img
            class="inline"
            alt="npm version"
            src="https://img.shields.io/npm/v/json-schema-to-jsdoc.svg"
        /></a>
      </p>
    </header>
    <p class="mb-2">
      Examples:
      <select v-model="example" @change="loadExample">
        <option value="">(choose)</option>
        <option value="basic">Basic</option>
        <option value="geo">Geo coordinates</option>
        <option value="array">Array</option>
      </select>
    </p>
    <main class="flex flex-1 flex-col md:flex-row">
      <div class="flex-1">
        <textarea
          v-model="input"
          class="font-mono text-sm border-2 h-full w-full whitespace-pre"
          spellcheck="false"
        ></textarea>
      </div>
      <div class="self-center">
        <button @click="convert" class="text-white bg-green-700 py-2 px-4 m-4">
          Convert
        </button>
      </div>
      <div class="flex-1">
        <textarea
          v-model="output"
          class="font-mono text-sm border-2 h-full w-full whitespace-pre"
          spellcheck="false"
          wrap="soft"
        ></textarea>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from "vue";
import generate from "json-schema-to-jsdoc";
import examples from "./data/examples.json"

export default {
  setup() {
    const input = ref("");
    const output = ref("");
    const example = ref('')

    function convert() {
      if (!input.value) {
        output.value = ''
        return
      }

      try {
        const result = generate(JSON.parse(input.value));
        output.value = result;
      } catch (ex) {
        output.value = `/** ${ex.message} */`;
      }
    }

    function loadExample () {
      input.value = JSON.stringify(examples[example.value], null, '  ')
    }

    return {
      input,
      output,
      example,
      convert,
      loadExample
    };
  },
};
</script>