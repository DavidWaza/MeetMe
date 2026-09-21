import { expect, test, type Page } from '@playwright/test'

// Mobile-first: exercise the app at a phone viewport.
test.use({ viewport: { width: 390, height: 844 } })

const topCard = (page: Page) => page.locator('.dc-card--top')

const MEN = ['Tunde', 'Kofi', 'David', 'Emeka', 'Seun', 'Chinedu', 'Ibrahim']
const WOMEN = ['Amara', 'Zara', 'Ngozi', 'Lola', 'Ife', 'Chioma']

/** Every run starts signed out (fresh browser context); most flows start as Femi. */
async function logInAsDemo(page: Page, label = 'Femi (man)'): Promise<void> {
  await page.goto('/login')
  await page.getByRole('button', { name: label }).click()
  await expect(topCard(page)).toBeVisible()
}

/** Names on every card currently in the stack (top plus the ones beneath). */
async function namesInDeck(page: Page): Promise<string[]> {
  const names = await page.locator('.dc-card .dc-card__name').allInnerTexts()
  return names.map((text) => text.trim().split(/\s+/)[0]!)
}

/** Like cards until the match screen appears. Deterministic per seed profile. */
async function likeUntilMatch(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt++) {
    await page.getByRole('button', { name: 'Like', exact: true }).click()
    // `isVisible` doesn't wait; the curtain arrives after the fly-out and the round trip.
    const matched = await page
      .getByText("It's a match!")
      .waitFor({ timeout: 2000 })
      .then(
        () => true,
        () => false,
      )
    if (matched) return
  }
  throw new Error('No match after 10 likes')
}

test('the deck loads and a drag past the threshold swipes the card', async ({ page }) => {
  await logInAsDemo(page)
  const first = await topCard(page).getAttribute('aria-label')

  const box = (await topCard(page).boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 - 260, box.y + box.height / 2, { steps: 12 })
  await page.mouse.up()

  await expect(topCard(page)).not.toHaveAttribute('aria-label', first!)
})

test('a pass can be rewound', async ({ page }) => {
  await logInAsDemo(page)
  const first = await topCard(page).getAttribute('aria-label')

  await page.getByRole('button', { name: 'Pass', exact: true }).click()
  await expect(topCard(page)).not.toHaveAttribute('aria-label', first!)

  await page.getByRole('button', { name: 'Rewind last swipe' }).click()
  await expect(topCard(page)).toHaveAttribute('aria-label', first!)
})

test('match, chat, get coached, and receive a simulated reply', async ({ page }) => {
  await logInAsDemo(page)
  await likeUntilMatch(page)

  await page.getByRole('link', { name: /Send a message/ }).click()
  const composer = page.getByRole('textbox', { name: 'Message' })
  await expect(composer).toBeVisible()

  await composer.fill('Hey! What do you do for fun on weekends?')
  await composer.press('Enter')

  // The coach scores the message immediately…
  await expect(page.locator('.ch-coach__delta')).toHaveText(/^\+\d+/)
  // …and the other side reads it and replies after "typing".
  await expect(page.locator('.ch-msg--theirs .ch-msg__text').last()).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.locator('.ch-msg--mine .ch-msg__meta').last()).toContainText('Read')
})

test('a taught reply rule overrides the simulated personality', async ({ page }) => {
  await logInAsDemo(page)
  await likeUntilMatch(page)
  await page.getByRole('link', { name: /Send a message/ }).click()

  await page.getByRole('button', { name: 'Conversation options' }).click()
  await page.getByRole('button', { name: /Teach replies/ }).click()
  await page.getByPlaceholder('pizza, pineapple').fill('pineapple')
  await page.getByPlaceholder('Pineapple on pizza? We need to talk.').fill('Taught reply for {me}')
  await page.getByRole('button', { name: 'Save rule' }).click()
  await expect(page.locator('.ch-rule')).toHaveCount(1)
  await page.keyboard.press('Escape')

  const composer = page.getByRole('textbox', { name: 'Message' })
  await composer.fill('Pineapple on pizza: yes or no?')
  await composer.press('Enter')
  await expect(page.locator('.ch-msg--theirs .ch-msg__text').last()).toHaveText(
    'Taught reply for Femi',
    { timeout: 15_000 },
  )
})

test('discovery preferences filter the deck', async ({ page }) => {
  await logInAsDemo(page)
  await page.getByRole('link', { name: 'Profile' }).click()
  await page.getByLabel('Maximum distance').fill('5')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Unsaved changes' })).toBeHidden()

  await page.getByRole('link', { name: 'Discover' }).click()
  await expect(topCard(page)).toBeVisible()
  const distances = await page.locator('.dc-card .dc-card__line').allInnerTexts()
  const kms = distances.flatMap((text) => /(\d+) km/.exec(text)?.[1] ?? []).map(Number)
  expect(kms.length).toBeGreaterThan(0)
  for (const km of kms) expect(km).toBeLessThanOrEqual(5)
})

test('signed-out visitors are sent to log in, then returned to where they were going', async ({
  page,
}) => {
  await page.goto('/matches')
  await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)matches$/)

  await page.getByRole('button', { name: 'Femi (man)' }).click()
  await expect(page).toHaveURL(/\/matches$/)
})

test('a man is shown only women', async ({ page }) => {
  await logInAsDemo(page, 'Femi (man)')
  // Pass through most of the deck, checking every card in the stack each time.
  for (let swipe = 0; swipe < WOMEN.length - 2; swipe++) {
    for (const name of await namesInDeck(page)) expect(WOMEN).toContain(name)
    const current = await topCard(page).getAttribute('aria-label')
    await page.getByRole('button', { name: 'Pass', exact: true }).click()
    await expect(topCard(page)).not.toHaveAttribute('aria-label', current!)
  }
})

test('a woman who signs up is shown only men, and can log out', async ({ page }) => {
  await page.goto('/signup')
  await page.getByLabel('First name').fill('Kemi')
  await page.getByRole('radio', { name: /^Woman/ }).click()
  await page.getByLabel('Date of birth').fill('1996-02-02')
  await page.getByLabel('City').fill('Lagos')
  await page.getByLabel('Email').fill(`kemi-${Date.now()}@example.com`)
  await page.getByLabel('Password', { exact: true }).fill('correct horse')
  await page.getByRole('button', { name: 'Create account' }).click()

  // New accounts land on their profile, which states the rule.
  await expect(page.getByText(/You're shown\s+men/)).toBeVisible()

  await page.getByRole('link', { name: 'Discover' }).click()
  await expect(topCard(page)).toBeVisible()
  for (const name of await namesInDeck(page)) expect(MEN).toContain(name)

  await page.getByRole('link', { name: 'Profile' }).click()
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login/)
  await page.goto('/discover')
  await expect(page).toHaveURL(/\/login/)
})

test('sign-up explains what is missing before calling the backend', async ({ page }) => {
  await page.goto('/signup')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Choose one. It decides who you are shown.')).toBeVisible()
  await expect(page.getByText('Tell us your first name.')).toBeVisible()
})

test('a wrong password is refused with the backend reason', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('femi@meetme.demo')
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText(/do not match/)
})
