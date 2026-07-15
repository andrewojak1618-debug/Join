const assert = require("node:assert/strict");
const test = require("node:test");

const {
  loadBrowserScripts,
} = require("./helpers/scriptContext");

const CONTACT_TEMPLATES_SCRIPT = "components/js/contacts-templates.js";


/**
 * Loads the contact name helper in an isolated context.
 * @returns {Object} Context exposing the abbreviation function.
 */
function createContactNameContext() {
  return loadBrowserScripts([CONTACT_TEMPLATES_SCRIPT]);
}


test("abbreviates a two-part contact name", () => {
  const context = createContactNameContext();
  assert.equal(context.getAbbreviatedContactName("Andre Wojak"), "Andre W.");
});


test("keeps initials for every name part after the first", () => {
  const context = createContactNameContext();
  assert.equal(
    context.getAbbreviatedContactName("Valentina Rodriguez Pena"),
    "Valentina R. P.",
  );
});


test("supports names containing German characters", () => {
  const context = createContactNameContext();
  assert.equal(
    context.getAbbreviatedContactName("Anna Maria Müller"),
    "Anna M. M.",
  );
});


test("keeps a single name unchanged", () => {
  const context = createContactNameContext();
  assert.equal(context.getAbbreviatedContactName("Madonna"), "Madonna");
});


test("normalizes surrounding and repeated whitespace", () => {
  const context = createContactNameContext();
  assert.equal(
    context.getAbbreviatedContactName("  Camila   Fernandez Ruiz  "),
    "Camila F. R.",
  );
});