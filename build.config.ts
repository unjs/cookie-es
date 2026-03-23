import { defineBuildConfig } from "obuild/config";
import type { Plugin } from "rolldown";
import { parseSync } from "rolldown/utils"
import MagicString from "magic-string";

export default defineBuildConfig({
  entries: ["./src/index.ts"],
    hooks: {
  rolldownConfig(config) {
      config.experimental ??= {};
      config.experimental.attachDebugInfo = "none";

        config.plugins ??= [];
      (config.plugins as Plugin[]).push({
        name: "remove-comments",
        renderChunk(code) {
          const parsed = parseSync("index.js", code);
          if (parsed.comments.length === 0) {
            return;
          }
          const ms = new MagicString(code);
          for (const comment of parsed.comments) {
            if (/^\s*[#@]/.test(comment.value)) {
              continue;
            }
            ms.remove(comment.start, comment.end);
          }
          return ms.toString();
        },
      });
  }
  }
});
