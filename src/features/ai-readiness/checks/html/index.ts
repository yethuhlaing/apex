export { headingStructureCheck } from "./heading-structure";
export { readabilityCheck } from "./readability";
export { metadataCheck } from "./metadata";
export { semanticHtmlCheck } from "./semantic-html";
export { accessibilityCheck } from "./accessibility";
export { antiBotCheck } from "./anti-bot";
export { structuredDataCheck } from "./structured-data";

import { Check } from "../../types";
import { headingStructureCheck } from "./heading-structure";
import { readabilityCheck } from "./readability";
import { metadataCheck } from "./metadata";
import { semanticHtmlCheck } from "./semantic-html";
import { accessibilityCheck } from "./accessibility";
import { antiBotCheck } from "./anti-bot";
import { structuredDataCheck } from "./structured-data";

// All HTML checks in order
export const htmlChecks: Check[] = [
    headingStructureCheck,
    readabilityCheck,
    metadataCheck,
    semanticHtmlCheck,
    accessibilityCheck,
    structuredDataCheck,
    antiBotCheck,
];
