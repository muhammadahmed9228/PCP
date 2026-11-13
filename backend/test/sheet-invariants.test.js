import assert from "node:assert/strict";
import { test } from "node:test";
import { validateLogisticsConservation } from "../src/modules/shared/sheetInvariants.js";

const validConsumables = {
    vaccines: {
        received: { sealPacked: 10, partiallyUsed: 0 },
        used: { sealPacked: 8, partiallyUsed: 0 },
        returned: { sealPacked: 2, partiallyUsed: 0 }
    },
    capsules: {
        received: { red: 5, blue: 5 },
        used: { red: 4, blue: 3 },
        returned: { red: 1, blue: 2 }
    }
};

test("allows reusable markers to be used and fully returned", () => {
    assert.doesNotThrow(() => validateLogisticsConservation({
        ...validConsumables,
        markers: { received: 2, used: 2, returned: 2 }
    }, "Tally Sheet"));
});

test("rejects marker use above the number received", () => {
    assert.throws(() => validateLogisticsConservation({
        ...validConsumables,
        markers: { received: 2, used: 3, returned: 2 }
    }, "Tally Sheet"), error => error.statusCode === 400 && error.message.includes("used cannot exceed"));
});

test("requires every received marker to be returned", () => {
    assert.throws(() => validateLogisticsConservation({
        ...validConsumables,
        markers: { received: 2, used: 2, returned: 1 }
    }, "Tally Sheet"), error => error.statusCode === 400 && error.message.includes("returned must equal"));
});

test("continues to enforce conservation for consumable logistics", () => {
    assert.throws(() => validateLogisticsConservation({
        ...validConsumables,
        vaccines: {
            received: { sealPacked: 10, partiallyUsed: 0 },
            used: { sealPacked: 9, partiallyUsed: 0 },
            returned: { sealPacked: 2, partiallyUsed: 0 }
        },
        markers: { received: 2, used: 2, returned: 2 }
    }, "Tally Sheet"), error => error.statusCode === 400 && error.message.includes("vaccine received"));
});
