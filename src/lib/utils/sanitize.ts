import sanitizeHtml from "sanitize-html";

const STRIP_ALL: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

export function sanitizeText(input: string): string {
  return sanitizeHtml(input, STRIP_ALL);
}
