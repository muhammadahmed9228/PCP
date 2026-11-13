import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { calculateTeamOmpTotals } from '../src/modules/omp/omp.totals.js';
import { getTeamOmpTotals } from '../src/modules/omp/omp.service.js';
import { Team } from '../src/modules/teams/team.model.js';
import { Area } from '../src/modules/areas/area.model.js';
import { OMP } from '../src/modules/omp/omp.model.js';

test('totals combine saved days and derive children from components, preserving missing values and zero', () => {
  const result = calculateTeamOmpTotals([
    { campaignDay: 1, status: 'Draft', totalUnder1Year: 2, total1to5Years: 3, grandTotalChildren: 999, marker: 0, totalHouseholds: 10 },
    { campaignDay: 3, status: 'Finalized', totalUnder1Year: 4, totalSchoolMadrasa: 6, totalHouseholds: 12, marker: 2 }
  ]);
  assert.equal(result.days[0].values.grandTotalChildren, 5);
  assert.equal(result.days[1].status, null);
  assert.equal(result.days[1].values.totalHouseholds, null);
  assert.equal(result.days[0].values.marker, 0);
  assert.equal(result.totals.grandTotalChildren, 15);
  assert.equal(result.totals.totalHouseholds, 22);
  assert.equal(result.totals.marker, 2);
  assert.equal(result.totals.chalk, null);
});

test('totals are scoped to the owning AIC, campaign, area and mobile team', async t => {
  const teamId = new mongoose.Types.ObjectId(), campaignId = new mongoose.Types.ObjectId(), aicId = new mongoose.Types.ObjectId(), areaId = new mongoose.Types.ObjectId();
  const teamQuery = t.mock.method(Team, 'findOne', () => ({ select: async () => ({ _id: teamId, teamNo: '1' }) }));
  const areaQuery = t.mock.method(Area, 'findOne', () => ({ select: async () => ({ _id: areaId }) }));
  const query = t.mock.method(OMP, 'find', () => ({ select: () => ({ lean: async () => [{ campaignDay: 2, status: 'Draft', chalk: 3 }] }) }));
  const result = await getTeamOmpTotals(String(teamId), String(campaignId), aicId);
  assert.equal(result.totals.chalk, 3);
  assert.equal(teamQuery.mock.calls[0].arguments[0].teamType, 'Mobile');
  assert.equal(teamQuery.mock.calls[0].arguments[0].registeredBy, aicId);
  assert.equal(areaQuery.mock.calls[0].arguments[0].campaign, String(campaignId));
  const scope = query.mock.calls[0].arguments[0];
  assert.equal(scope.area, areaId); assert.equal(scope.aic, aicId); assert.equal(scope.team, teamId);
});

test('invalid or unauthorized team/campaign cannot read totals', async t => {
  await assert.rejects(getTeamOmpTotals('bad','bad','bad'), e => e.statusCode === 400);
  const id = String(new mongoose.Types.ObjectId());
  t.mock.method(Team, 'findOne', () => ({ select: async () => null }));
  await assert.rejects(getTeamOmpTotals(id,id,id), e => e.statusCode === 404);
});
