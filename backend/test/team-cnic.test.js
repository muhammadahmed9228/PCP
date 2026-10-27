import assert from "node:assert/strict";
import { test } from "node:test";
import { Team } from "../src/modules/teams/team.model.js";
import { createTeam, updateAicTeam } from "../src/modules/teams/team.service.js";

test("registration rejects a different leader CNIC before querying or creating", async t => {
    const find = t.mock.method(Team, "findOne", async () => null);
    const create = t.mock.method(Team, "create", async () => ({}));
    await assert.rejects(createTeam({ username: "1234567890123", leader: { cnic: "1234567890124" } }, "aic"), error => error.statusCode === 400);
    assert.equal(find.mock.callCount(), 0);
    assert.equal(create.mock.callCount(), 0);
});

test("registration accepts a matching CNIC and trims both stored values", async t => {
    const find = t.mock.method(Team, "findOne", async () => null);
    const create = t.mock.method(Team, "create", async data => data);
    const result = await createTeam({ username: " 1234567890123 ", leader: { cnic: "1234567890123 " } }, "aic");
    assert.equal(find.mock.calls[0].arguments[0].username, "1234567890123");
    assert.equal(result.username, result.leader.cnic);
    assert.equal(create.mock.callCount(), 1);
});

test("editing either CNIC cannot make an existing team inconsistent", async t => {
    let saves = 0;
    const team = {
        username: "1234567890123", leader: { cnic: "1234567890123" },
        async save() { saves += 1; },
        toObject() { return { username: this.username, leader: this.leader }; }
    };
    t.mock.method(Team, "findOne", async () => team);
    await assert.rejects(updateAicTeam("team", { username: "1234567890124" }, "aic"), error => error.statusCode === 400);
    await assert.rejects(updateAicTeam("team", { leader: { cnic: "1234567890124" } }, "aic"), error => error.statusCode === 400);
    assert.equal(saves, 0);
    assert.equal(team.username, "1234567890123");
    assert.equal(team.leader.cnic, "1234567890123");
    await updateAicTeam("team", { username: "1234567890123" }, "aic");
    assert.equal(saves, 1);
});
