import { add } from "@ednotest/multiple-exports/add";
import { subtract } from "@ednotest/multiple-exports/subtract";
import data from "@ednotest/multiple-exports/data-json" with { type: "json" };

console.log(add(1, 2));
console.log(subtract(1, 2));
console.log(data);
