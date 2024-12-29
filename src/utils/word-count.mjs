export function wordCount(value) {
  return one(value);
}

function countWords(value) {
  return (value || "").match(/\s+/g)?.length || 0;
}

/**
 * One node or several nodes.
 *
 * @param {unknown} value
 *   Thing to serialize.
 * @returns {Number}
 *   Number of words.
 */
function one(value) {
  if (isNode(value)) {
    if ("value" in value) {
      return countWords(value.value);
    }
    if ("children" in value) {
      return all(value.children);
    }
  }

  if (Array.isArray(value)) {
    return all(value);
  }

  return 0;
}

/**
 * Serialize a list of nodes.
 *
 * @param {Array<unknown>} values
 *   Thing to serialize.
 * @returns {Number}
 *   Number of words
 */
function all(values) {
  /** @type {Array<string>} */
  let result = 0;

  for (const value of values) {
    result += one(value);
  }

  return result;
}

function isNode(value) {
  return Boolean(value && typeof value === "object");
}
