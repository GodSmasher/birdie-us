// Prints all connector manifests as JSON — the frontend can consume this to render
// the connectors catalog (live + planned) without hardcoding.
import { allManifests } from './registry.js';

console.log(JSON.stringify(allManifests(), null, 2));
