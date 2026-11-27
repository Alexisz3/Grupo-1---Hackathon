import test from 'node:test';
import assert from 'node:assert/strict';
import {capsules} from '../src/capsules.mjs';
import {getActivity, getTransferEpisode, getTransferVariantCount, practiceBands} from '../src/learning-content.mjs';

function checkReason(reason) {
  assert(reason.question.length > 0);
  assert.equal(reason.options.length, 3);
  assert.equal(new Set(reason.options.map(option => option.label)).size, 3);
  assert(reason.options[reason.answer]);
  assert(reason.explanation.length > 0);
}

test('todas las actividades visibles tienen nivel y explicación por casilla', () => {
  for (const [area, capsule] of Object.entries(capsules)) {
    const bands = practiceBands(area);
    assert.deepEqual(bands.map(band => band.id), ['identify', 'connect', 'explain']);
    const visible = bands.flatMap(band => band.episodes).sort((a, b) => a - b);
    assert.deepEqual(visible, Array.from(capsule.cases.keys()));
    for (const episode of visible) {
      const activity = getActivity(area, episode);
      assert(!activity.reserved);
      assert(activity.steps[activity.keyStep]);
      for (const step of activity.steps) assert(step.explanation.length > 0);
      if (activity.band.id === 'explain') checkReason(activity.reason);
    }
  }
});

test('los retos de cada nivel usan casos reservados y piden explicar una idea', () => {
  for (const [area, capsule] of Object.entries(capsules)) {
    for (const band of practiceBands(area)) {
      const first = band.episodes[0];
      const count = getTransferVariantCount(area, first);
      assert.equal(count, 2);
      const setups = new Set();
      for (let attempt = 0; attempt < count; attempt++) {
        const activity = getActivity(area, getTransferEpisode(area, first, attempt));
        assert(activity.reserved);
        assert.equal(activity.band.id, band.id);
        assert(!capsule.cases.some(entry => entry.title === activity.title || entry.setup === activity.setup));
        setups.add(activity.setup);
        for (const step of activity.steps) {
          assert(step.explanation.length > 0);
          assert(activity.cards.some(card => card.id === step.answer));
        }
        checkReason(activity.reason);
      }
      assert.equal(setups.size, count);
      assert.equal(getTransferEpisode(area, first, count), getTransferEpisode(area, first));
    }
  }
});
