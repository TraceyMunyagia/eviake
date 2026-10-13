import assert from 'node:assert/strict'
import { carryFlags, defaultFlags, resolveSections, toggleSection } from './sectionModel'

// Legacy Signature Romance invite: no message/location/closing/gift keys.
const legacy = { countdown: true, schedule: true, gallery: false, rsvp: true, guestbook: true, story: true, dress_code: true }
const r = resolveSections(legacy, 'romance', 'signature')
assert.equal(r.message, true); assert.equal(r.location, true); assert.equal(r.closing, true)
assert.equal(r.gift, true)       // old Romance invites showed the registry when it had content
assert.equal(r.gallery, false)   // explicit false is respected
assert.equal(r.hero && r.details, true)

// New Essential invite: locked sections off, and cannot be switched on.
const e = defaultFlags('editorial', 'essential')
assert.equal(e.gallery, false)
assert.equal(toggleSection(e, 'editorial', 'essential', 'gallery', true).gallery, false)
assert.equal(toggleSection(e, 'editorial', 'essential', 'hero', false).hero, true)

// Romance -> Celebration: story/guestbook have no home, others carry over.
const s = defaultFlags('romance', 'signature')
const c = carryFlags({ ...s, countdown: false }, 'celebration', 'signature')
assert.equal(c.countdown, false)
console.log('sectionModel OK')