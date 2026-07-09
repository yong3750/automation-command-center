# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-07-09
- Primary product surfaces: single-page portfolio demo for an internal lead-operations automation console.
- Evidence reviewed: `index.html`, `styles.css`, `app.js`, `README.md`, `REGISTRATION_PACKET.md`, generated Playwright screenshots.

## Brand
- Personality: credible, operational, quietly technical, business-outcome focused.
- Trust signals: explicit client scenario, automation scope, measurable before/after metrics, run log, CRM handoff detail.
- Avoid: fake SaaS marketing excess, decorative gradients, tiny text badges, busy graph backgrounds, over-polished Dribbble-only visuals that do not explain implementation.

## Product goals
- Goals: show that the builder can create workflow automation tools for lead intake, scoring, routing, CRM sync, and monitoring.
- Non-goals: claim paid client work, represent a production deployment, or sell a fictional product brand.
- Success signals: the screenshot communicates problem, automation flow, implementation scope, and business value within the first viewport.

## Personas and jobs
- Primary personas: Upwork clients, small-business operators, RevOps/SalesOps managers, founders with messy inbound lead workflows.
- User jobs: evaluate whether the freelancer can build a practical automation tool; understand what would be automated; see proof of interaction and business impact.
- Key contexts of use: Upwork portfolio gallery, proposal attachments, GitHub Pages demo, mobile profile review.

## Information architecture
- Primary navigation: compact command bar with brand, search, export, and webhook simulation.
- Core routes/screens: single interactive dashboard.
- Content hierarchy: case brief -> workflow map and inspector -> lead queue, run log, business impact -> implementation proof.

## Design principles
- Principle 1: Lead with the business problem before decorative UI.
- Principle 2: Every visual module should imply implementation ability or client value.
- Tradeoffs: preserve a real app surface while adding enough case-study framing for portfolio review.

## Visual language
- Color: light case-study workspace with paper, ivory, and muted grid surfaces; teal/green for automation success, amber for review warnings, red for risk.
- Typography: system sans, compact dashboard scale, strong numeric hierarchy.
- Spacing/layout rhythm: dense but breathable 8px radius operational panels.
- Shape/radius/elevation: restrained panels, no nested decorative cards beyond repeated data items.
- Motion: none required beyond interactive state changes.
- Imagery/iconography: CSS-native workflow marks and status symbols only.

## Components
- Existing components to reuse: command bar, mission panel, workflow map, node inspector, lead queue, event stream, impact cards.
- New/changed components: case brief chips, before/after proof strip, implementation evidence section.
- Variants and states: healthy/warning/danger pills, active workflow node, queue filter states, simulated webhook run.
- Token/component ownership: `styles.css` custom properties and component classes.

## Accessibility
- Target standard: practical WCAG AA contrast and semantic labels for dashboard sections.
- Keyboard/focus behavior: buttons and select are native controls.
- Contrast/readability: keep dark surfaces high-contrast, avoid text over noisy backgrounds.
- Screen-reader semantics: section labels, table role, aria-live workflow canvas.
- Reduced motion and sensory considerations: no continuous animation.

## Responsive behavior
- Supported breakpoints/devices: desktop portfolio screenshot, tablet/narrow layouts, mobile Upwork preview.
- Layout adaptations: stack major panels, hide flow connector SVG on small screens, keep workflow nodes full-width.
- Touch/hover differences: active state must remain visible without hover.

## Interaction states
- Loading: static demo, no remote loading.
- Empty: not applicable.
- Error: warnings shown through node health and run log.
- Success: simulated webhook updates metrics and prepends a run event.
- Disabled: not applicable.
- Offline/slow network, if applicable: demo runs locally without external dependencies.

## Content voice
- Tone: precise, client-safe, practical.
- Terminology: lead routing, webhook, CRM sync, SLA, confidence, run log, manual steps removed.
- Microcopy rules: avoid vague AI claims; name concrete workflow actions and outputs.

## Implementation constraints
- Framework/styling system: static HTML, CSS, and vanilla JavaScript.
- Design-token constraints: no new dependencies; use current CSS variables.
- Performance constraints: screenshots must render quickly in Playwright and GitHub Pages.
- Compatibility constraints: modern browser support for CSS gradients and ResizeObserver.
- Test/screenshot expectations: `node --check`, Playwright screenshot capture, desktop/mobile visual inspection.

## Open questions
- [ ] If this becomes a public GitHub Pages portfolio item, should the fictional brand name be replaced with the freelancer name or a neutral project title?
