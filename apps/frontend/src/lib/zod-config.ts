import { z } from 'zod'

// Zod probes for eval with Function('') when a z.object() schema is created,
// to JIT-compile its parser. The CSP (script-src 'self', no 'unsafe-eval')
// blocks that probe and logs a violation; jitless skips it instead of
// loosening the CSP. Must be imported before any module that defines schemas.
z.config({ jitless: true })
