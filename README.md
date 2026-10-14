# Kevin's Cookie Shop Tycoon

A small, browser-based shop management game. You start with **$100** and have 30 days to decide how many cookies to bake, what to charge, and how much to spend on advertising.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Make a plan and select **Open the shop** to play the day.

There are no dependencies, build steps, or server requirements. The game also works as a static site on GitHub Pages.

## How to play

For each day, choose:

- **Cookies to bake** — each cookie costs **$0.50** in ingredients. Unsold cookies are wasted at the end of the day.
- **Price per cookie** — prices range from **$0.25 to $20.00**. Higher prices reduce expected customer demand.
- **Advertising budget** — ads cost cash that day and increase expected customer demand.

Daily demand also changes with the market conditions shown beside the game plan, with a little random variation. The shop won't let you spend more than the cash you have. After the day closes, the report shows cookies sold, revenue, ingredient and advertising costs, profit, and cash remaining. The season ends after day 30.

When you open for the day, animated customer groups arrive and pick up cookies. The number of shoppers is based on the cookies sold, with each shopper buying one to three cookies. The animation is brief and respects the device's reduced-motion preference.

Your cash, season totals, and recent results are saved in your browser, so you can close the page and return later on the same browser. **Start over** resets the season.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Game page and interface structure |
| `styles.css` | Layout, colors, and responsive styling |
| `game.js` | Game rules, daily results, and browser save data |

## Customize

You can adjust the visual theme in `styles.css`. In `game.js`, look for `BAKE_COST`, `markets`, and `expectedDemand()` to tune the ingredient cost, market conditions, and customer demand.

