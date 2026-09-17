# Translation verification — 2026-09-17

## Observed failure and reproduction

The installed public plugin in Aller Aqua is version 1.15.2. The private
`Test translation` plugin points to `http://localhost:3000/`. Its development
server was not running; starting it restored the plugin connection.

The English Shrimp hero teaser (record `NAB27abQRASs-rEp2KP5nQ`) has five Slate
text leaves. The fifth starts with ` (black tiger shrimp).` and contains the
remaining three apparent paragraphs, separated by soft line breaks. This was
observed in the editor DOM, not inferred from a screenshot. The current Russian
version has already been corrected; it was not modified.

A regression fixture preserves that text and leaf/mark structure. Running the
new test against the translation function from commit `2d44f91` reproduced the
exact skipped final leaf. The existing local classifier was retained for this
comparison, isolating the structured-text translation function.

The same test passes against the existing fix in this branch: text leaves are
translated regardless of whether their contents look like Markdown or data.
The old function required `PathType.text`; the multiline leaf was classified
as Markdown and never reached the provider.

Permanent regression command:

```sh
npm test -- --runInBand --runTestsByPath src/lib/translation.test.ts -t 'complete Shrimp teaser'
```

Result: PASS. The temporary upstream comparison files were removed. The complete
suite passes: 112 tests in four suites.

## Live verification

The user identified `Aquaculture Europe 2026, Ljubljana, Slovenia` as the test
record (`R_M2jvhiStO0Aowk_4JPUg`). The private plugin's global provider is DeepL
API Pro. Its `[FORK] Replace and translate from English` button was invoked for
the Serbian `block_area` field.

The resulting first RTE block includes translated Serbian text for the full
invitation ending in Stand 172, and for the quoted conference theme. Both were
identified in the original report. The result was inspected in the editor.

The result was left as **unsaved changes** for review. No Save or Publish action
was performed. No other locale was selected as a translation destination.

## Scope

The translation fix and broad classification tests were already committed in
this checkout before this session. This session restored the local server,
verified the real Shrimp structure, added its regression fixture/test, removed
the temporary DEBUG error message, and performed the live Serbian test.

This verifies a concrete cause of the reported untranslated text. It does not
guarantee linguistic quality or rule out every independent provider failure.
## Hosted installation

The tested production build was deployed to Netlify on 2026-09-17:

- Site: https://aller-aqua-translate-fields.netlify.app/
- Netlify team: `lait-0h4z2ro` (the team hosting Aller Aqua's other sites)
- Site ID: `feddc108-845c-478d-9355-b6befd81f4e7`
- Deploy ID: `6aababb10d9382daacef7855`
- DatoCMS private plugin: `NkZTGOMOSvCVo9hFb1ZwaQ`, renamed `Aller Aqua Translate`

The existing private plugin's entry point now uses this HTTPS URL. Its existing
DeepL configuration was preserved. The hosted page returned HTTP 200 with the
tested JavaScript bundle, and its settings screen loaded successfully inside
DatoCMS. The local server is no longer needed for this plugin.

This is a manual deployment, with no automatic deployment from GitHub configured.
To deploy an updated build:

```sh
npm test -- --runInBand
npm run build
netlify deploy --site feddc108-845c-478d-9355-b6befd81f4e7 --dir build --no-build --prod
```

## Active replacement

At the user's request, the original `Translate` installation
(`VrHQ74rGRheJk0DdVUEOyw`) was switched to the hosted fork using DatoCMS's
`Point to local server` action with the Netlify HTTPS URL. It is now a private
plugin, retaining its original field assignments and provider settings.

The separate `Aller Aqua Translate` test installation (`NkZTGOMOSvCVo9hFb1ZwaQ`)
was disabled to eliminate duplicate buttons. Its settings are retained.

Verified on the article: the headline, nested hero headline/teaser, block area,
contact block, slug and SEO each load a single plugin iframe from Netlify.
No record content was changed during this configuration switch.

Rollback: use `Switch to Marketplace version` on the active `Translate`
installation to restore `datocms-plugin-translate-fields` version `1.15.2`.
Marketplace updates no longer apply automatically while it is private.
