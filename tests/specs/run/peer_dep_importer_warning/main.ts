// Importing a package with an unmet peer dependency together with an
// incompatible version of that peer should warn, and the warning should point
// at this module as the importer. See
// https://github.com/denoland/deno/issues/35196.
import "npm:@ednotest/peer-dep-specific-constraint@1";
import "npm:@ednotest/add@1";

console.log("done");
