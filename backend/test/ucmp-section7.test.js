import test from 'node:test';
import assert from 'node:assert/strict';
import { Campaign } from '../src/modules/campaigns/campaign.model.js';
import { UCI } from '../src/modules/users/uci.model.js';
import { UCMP } from '../src/modules/ucmp/ucmp.model.js';
import { saveUCMPDraft } from '../src/modules/ucmp/ucmp.service.js';

function setup(t) {
  t.mock.method(Campaign, 'findOne', async () => ({ status: 'Planning' }));
  t.mock.method(UCMP, 'findOne', async () => ({ _id: 'existing', status: 'Draft' }));
  t.mock.method(UCI, 'findById', async () => ({}));
  return t.mock.method(UCMP, 'findByIdAndUpdate', async (_id, data) => data);
}

test('section 7 counts are saved as numbers and omitted fields stay unchanged', async t => {
  const update = setup(t);
  const result = await saveUCMPDraft('campaign', 'uci', { teamsRequiringSpecialAttention: '2', vaccineCarrierRequired: '0', vaccineCarrierAvailable: '' });
  assert.equal(result.teamsRequiringSpecialAttention, 2);
  assert.equal(result.vaccineCarrierRequired, 0);
  assert.equal(result.vaccineCarrierAvailable, null);
  await saveUCMPDraft('campaign', 'uci', {});
  assert.equal(Object.hasOwn(update.mock.calls[1].arguments[1], 'vaccineCarrierRequired'), false);
  const doc = new UCMP({ vaccineCarrierRequired: 4, vaccineCarrierAvailable: 3 });
  assert.equal(doc.vaccineCarrierRequired, 4);
  assert.equal(doc.vaccineCarrierAvailable, 3);
});

test('section 7 rejects invalid counts before saving', async t => {
  const update = setup(t);
  for (const value of [-1, 1.5, '1e2', true, {}, ' ']) {
    await assert.rejects(saveUCMPDraft('campaign', 'uci', { vaccineCarrierRequired: value }), error => error.statusCode === 400);
  }
  assert.equal(update.mock.callCount(), 0);
});
