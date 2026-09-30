import { expect, test } from '@playwright/test'

test('rates a candidate and reports the average of the answers', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Candidate').fill('Ada Lovelace')
  await page.getByLabel('Role').fill('Backend developer')
  await page.getByLabel('Interviewer').fill('Grace Hopper')

  await page
    .getByRole('group', { name: 'Rate Go and Node.js' })
    .getByRole('radio', { name: 'Strong Knowledge' })
    .check()
  await page
    .getByRole('group', { name: 'Rate Microservice' })
    .getByRole('radio', { name: 'Good Understanding' })
    .check()
  await page
    .getByRole('group', { name: 'Rate Skills' })
    .getByRole('radio', { name: 'Familiar' })
    .check()

  await expect(page.getByTestId('running-average')).toHaveText('3.0')
  await page.getByRole('button', { name: 'View report' }).click()

  await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible()
  await expect(page.getByText('Report for Grace Hopper')).toBeVisible()
  await expect(page.getByTestId('answer-average')).toHaveText('3.0')

  await page.getByRole('link', { name: 'New interview' }).click()
  await page.getByLabel('Candidate').fill('Alan Turing')
  await page.getByLabel('Role').fill('Developer')
  await page.getByLabel('Interviewer').fill('Grace Hopper')

  for (const topic of ['Rate Go and Node.js', 'Rate Microservice', 'Rate Skills']) {
    await page.getByRole('group', { name: topic }).getByRole('radio', { name: 'Weak' }).check()
  }

  await page.getByRole('button', { name: 'View report' }).click()

  await expect(page.getByTestId('answer-average')).toHaveText('1.0')
  await expect(page.getByTestId('people-average')).toHaveText('2.0')

  await page.getByRole('link', { name: /Ada Lovelace/ }).click()
  await expect(page.getByTestId('answer-average')).toHaveText('3.0')
})

test('keeps an unfinished form after refresh', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Candidate').fill('Ada Lovelace')
  await page
    .getByRole('group', { name: 'Rate Skills' })
    .getByRole('radio', { name: 'Weak' })
    .check()

  await page.reload()

  await expect(page.getByLabel('Candidate')).toHaveValue('Ada Lovelace')
  await expect(
    page.getByRole('group', { name: 'Rate Skills' }).getByRole('radio', { name: 'Weak' }),
  ).toBeChecked()
})
