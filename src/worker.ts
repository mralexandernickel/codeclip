import hljs from 'highlight.js';

const ctx: Worker = self as any;

onmessage = function(event) {
  var result = hljs.highlightAuto(event.data);
  ctx.postMessage(result.value);
};
