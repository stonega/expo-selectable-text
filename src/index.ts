// Reexport the native module. On web, it will be resolved to ExpoSelectableTextModule.web.ts
// and on native platforms to ExpoSelectableTextModule.ts
export { default } from "./ExpoSelectableTextModule";
export { default as ExpoSelectableText } from "./ExpoSelectableTextView";
export * from "./ExpoSelectableText.types";
