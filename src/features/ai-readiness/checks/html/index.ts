export { headingStructureCheck } from "./heading-structure";
export { readabilityCheck } from "./readability";
export { metadataCheck } from "./metadata";
export { semanticHtmlCheck } from "./semantic-html";
export { accessibilityCheck } from "./accessibility";

import { Check } from "../../types";
import { headingStructureCheck } from "./heading-structure";
import { readabilityCheck } from "./readability";
import { metadataCheck } from "./metadata";
import { semanticHtmlCheck } from "./semantic-html";
import { accessibilityCheck } from "./accessibility";

// All HTML checks in order
export const htmlChecks: Check[] = [
    headingStructureCheck,
    readabilityCheck,
    metadataCheck,
    semanticHtmlCheck,
    accessibilityCheck,
];
