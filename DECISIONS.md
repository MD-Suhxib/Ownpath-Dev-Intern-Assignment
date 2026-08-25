# Human Decision Notes

Complete this file yourself after you finish the code and tests.

Do not ask an AI agent to draft this file. Short, plain, imperfect writing is
preferred over polished generic text. We may ask you about any answer here
during review.

## 1. What I changed
Issue #1 — Gray tint not working

I found the issue in src/theme/ThemeProvider.tsx. The token layers were ordered as [semantic, globalTokens], which meant the global gray values were applied after the semantic ones and ended up overriding them.
I fixed this by changing the order to [globalTokens, semantic, ...extraLayers].
I also added a test in src/theme/ThemeProvider.test.tsx to make sure the issue doesnt occur again.

Issue #2 — Selected station card not showing properly

I found a small typo in src/components/molecules/molecules.css where the variable was named --ev-card-selected-boder instead of --ev-card-selected-border. Fixed the spelling so the selected card styling works correctly.
I also added transform: translateY(-2px) to give the selected card a subtle lift, which makes the selection feel a bit more noticeable and also added the test. 

Issue #3 — Exported JSX not compiling

The issue was in src/composer/codegen.ts. Fixture imports were always being generated from the first fixture’s source, even when the screen used fixtures from different modules.
I fixed this by grouping fixtures based on their actual source module, so each import now comes from the right place.

Issue #4 — Theme settings mixing up between UI libraries

ThemeProvider was keeping its previous state when switching between UI libraries because it didn’t have a library-specific key.

I fixed this by adding key={library.id} to ThemeProvider in both src/main.tsx and src/composer/main.tsx. This makes React create a fresh provider when switching libraries, so the correct saved or default theme is loaded each time.
I Also added a test covering switching between Volt and Atlas Web.

## 2. Evidence I used

List the files, tests or commands that convinced you what the correct behavior
should be.

| File or command                    | What I found                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/theme/ThemeProvider.tsx`            | Showed how the theme layers are built and saved.                                           |
| `src/tokens/brand.ts`                    | Confirmed that `grayTint` generates different gray scales.                                 |
| `src/tokens/emit.ts`                     | Confirmed that later layers override earlier ones.                                         |
| `src/components/molecules/molecules.css` | Helped identify the typo in the selected card CSS variable.                                |
| `src/tokens/component.ts`                | Confirmed the correct token name is `card.selected-border`.                                |
| `src/composer/codegen.ts`                | Showed that fixture imports were always using the first fixture’s source.                  |
| Station detail exported JSX              | Confirmed that `SAMPLE_PRICE_BANDS` and `SAMPLE_TARIFF_NOTES` come from different modules. |
| `src/main.tsx` / `src/composer/main.tsx` | Showed that `ThemeProvider` was missing a library-specific React key.                      |
| `npm test`                               | Confirmed that the full test suite passes after the fixes.                                 |
| `git diff`                               | Used to make sure the changes were limited to the bugs and their related tests.            |


## 3. A suggestion I rejected or narrowed

Record one suggestion or assumption you did not accept as written. Where did it
come from — an AI tool, a comment, a document, your own first instinct? What
evidence contradicted or limited it, and what did you do instead?

One of the first ideas for the gray tint issue was to change how the gray tokens were generated. I didn’t go with that approach because the token values were already changing correctly when the gray tint changed. After looking at ThemeProvider and how the layers were merged, it became clear that the values were just getting overwritten later by globalTokens. So the smaller and safer fix was to correct the layer order.

For the Station card issue, I kept the change limited to the existing CSS rule instead of touching the component structure. The component was already applying the selected class correctly, so there was no need to change that part.

## 4. Verification

Paste the exact commands you personally ran and their result.

npm test

Result :- 

Test Files  18 passed (18)
Tests       282 passed (282)
Start at    23:55:39
Duration    1.78s

## 5. Remaining risk

What is one case you would test next, and why?

I would next test switching between all three UI libraries after customizing each one differently, then switch back and confirm each library restores its own settings. This would give more confidence that the theme isolation works across repeated library switches, not just a single switch.

## 6. How I directed the investigation

Describe one moment when you redirected an AI tool, another tool, or your own
initial approach. State the instruction or question that changed the direction,
and the repository evidence you made it use. If you did not use AI, describe how
you stopped yourself implementing the first plausible fix.

During the investigation, I did not want to just change code because the UI symptom disappeared. I asked the AI to trace each issue from the reported behavior through the component, token/codegen logic, and existing tests to find the actual root cause. For example, for the Station detail export issue, I checked the generated JSX and compared the fixture sources in src/composer/codegen.ts, which showed that the two fixtures came from different modules. I then kept the fix focused on grouping the fixture imports by their actual source instead of changing the export system more broadly.

## 7. Test-suite audit

Answer the four questions in Part 2 of `TASK.md`.

**7a. How many of the 278 tests would fail if the thing they test were broken?**
Give a number and the method you used.

I counted the individual it()/test() cases in the test files and reviewed the existing tests related to the four issues. I found that the original 278 tests did not have regression coverage for these four specific failure cases. The four regression tests I added are what now directly cover them. I therefore would not claim that all 278 tests are effective at catching the behavior they are intended to cover.

**7b. Which tests would you not trust, and why?**

I’d be most careful with tests that only check whether tokens, structures, or strings exist without testing how they actually behave.
The CSS contract tests are still useful for catching missing CSS variables, but they won’t catch every visual or behavior issue. For example, the gray tint bug could have passed because the variables existed, even though globalTokens were overriding the correct values.

**7c. Would the suite have caught each of the four bugs?** For each: yes or no,
and what specifically let it through.

#1 Gray tint — No. The existing tests checked the token structure, but not whether changing grayTint actually changed the emitted gray values. I added a test for that.
#2 Station selected state — No. The existing tests didn’t catch the CSS variable typo or check the selected card styling. I added a test for the correct variable and the lift effect.
#3 JSX export — No. The existing codegen tests didn’t cover fixtures coming from different modules. I added a Station detail test to cover both fixture imports.
#4 Theme isolation — No. The existing tests didn’t catch the theme state being reused when switching libraries. I added a test to make sure switching libraries loads the correct theme.

**7d. One day to make this suite honest — what do you change first?**

I would add more tests that check the actual behavior, especially around theme switching, CSS output, and composer exports. I’d focus on tests that reproduce real user-facing issues instead of only checking that tokens, variables, or objects exist. This would help catch bugs like the ones found in this assignment.