/**
 * Return the di object for a given element.
 *
 * @param {Element} element
 *
 * @return {ModdleElement}
 */
export function getDi(element) {
  return element && (element.di || (element.businessObject && element.businessObject.di));
}