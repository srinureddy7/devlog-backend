// Type declarations for third-party packages without TypeScript definitions

declare module "slugify" {
  interface SlugifyOptions {
    replacement?: string;
    remove?: RegExp;
    lower?: boolean;
    strict?: boolean;
    locale?: string;
    trim?: boolean;
  }

  function slugify(input: string, options?: SlugifyOptions | string): string;

  export default slugify;
  export { SlugifyOptions };
}

declare module "dompurify" {
  interface DOMPurifyConfig {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    FORBID_TAGS?: string[];
    FORBID_ATTR?: string[];
    USE_PROFILES?: {
      html?: boolean;
      svg?: boolean;
      svgFilters?: boolean;
      mathMl?: boolean;
    };
    RETURN_TRUSTED_TYPE?: boolean;
    SANITIZE_DOM?: boolean;
    KEEP_CONTENT?: boolean;
    IN_PLACE?: boolean;
    ALLOW_ARIA_ATTR?: boolean;
    ALLOW_DATA_ATTR?: boolean;
    ALLOW_UNKNOWN_PROTOCOLS?: boolean;
    SAFE_FOR_JQUERY?: boolean;
    SAFE_FOR_TEMPLATES?: boolean;
    WHOLE_DOCUMENT?: boolean;
    RETURN_DOM?: boolean;
    RETURN_DOM_FRAGMENT?: boolean;
    RETURN_DOM_IMPORT?: boolean;
    FORCE_BODY?: boolean;
    SANITIZE_NAMED_PROPS?: boolean;
    ALLOWED_URI_REGEXP?: RegExp;
    ADD_URI_SAFE_ATTR?: string[];
    ADD_TAGS?: string[];
    ADD_ATTR?: string[];
  }

  function sanitize(dirty: string | Node, config?: DOMPurifyConfig): string;

  function sanitizeWithTrustedTypes(
    dirty: string | Node,
    config?: DOMPurifyConfig
  ): TrustedHTML;

  function addHook(
    hook: string,
    cb: (currentNode: Element, hookEvent: any, config: DOMPurifyConfig) => void
  ): void;

  function removeHook(hook: string): void;
  function removeHooks(hook: string): void;
  function removeAllHooks(): void;

  function setConfig(cfg: DOMPurifyConfig): void;
  function clearConfig(): void;
  function isValidAttribute(tag: string, attr: string, value: string): boolean;

  const version: string;

  export default {
    sanitize,
    sanitizeWithTrustedTypes,
    addHook,
    removeHook,
    removeHooks,
    removeAllHooks,
    setConfig,
    clearConfig,
    isValidAttribute,
    version,
  };
}
