/**
 * cursorAtEnd
 * Positions the cursor at the end of a contenteditable
 * https://stackoverflow.com/a/3866442/494979
 * @param el contenteditable DOM element
 */
module.exports = function cursorAtEnd(el) {
  var range, selection;
  if (document.createRange) {
    range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
