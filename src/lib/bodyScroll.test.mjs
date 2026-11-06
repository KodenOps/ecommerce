import assert from 'node:assert/strict';

const globalObj = globalThis;

globalObj.document = {
  body: { style: { overflow: '' } },
};

try {
  const { lockBodyScroll, unlockBodyScroll } = await import('./bodyScroll.js');

  const cleanup1 = lockBodyScroll();
  const cleanup2 = lockBodyScroll();
  assert.equal(globalObj.document.body.style.overflow, 'hidden');

  cleanup1();
  assert.equal(globalObj.document.body.style.overflow, 'hidden');

  cleanup2();
  assert.equal(globalObj.document.body.style.overflow, '');

  console.log('bodyScroll lock/unlock test passed');
} catch (error) {
  console.error('bodyScroll lock/unlock test failed');
  console.error(error);
  process.exit(1);
}
