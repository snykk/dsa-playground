## Summary

<!-- What is true once this lands, and why. Link the issue it settles, if any (Closes #N). -->

## Checklist

<!-- Tick what applies; strike out or remove what does not. CONTRIBUTING.md ("Adding a Topic") has the full list and the check behind each item. -->

- [ ] Tests pass in every language this touches: `make test-python`, `make test-cpp`, `make test-go` (or `make test`)
- [ ] READMEs follow the templates: `python3 scripts/check_readme_style.py --all`
- [ ] Web checks pass when the site, an article or a README changed, in `web/`: `npx vitest run`, `npx astro check`, and `npm run build` with no `[broken-link]` line
- [ ] No character outside ASCII added
- [ ] A CHANGELOG entry under `## Unreleased`
- [ ] A new topic: every item of "Adding a Topic" in CONTRIBUTING.md
