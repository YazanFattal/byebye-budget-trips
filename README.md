# ByeBye

A travel planner that helps people discover destinations and estimate a trip within their budget.

- Browse 250 countries and territories, with destination photos and popular choices first.
- Choose a departure country and search worldwide passenger airports.
- Compare trip options, save favourites on your device, and calculate your own costs.
- Choose from 160 currencies.
- Open Google Flights and Booking.com to check current prices and availability.

Flight and hotel links open external providers. Any sample costs are illustrative estimates, not live fares or confirmed availability. For routes without an estimate, travellers can enter their own costs in the calculator. No maximum return-flight price filter is applied.

## Run locally

Install Node.js 22 or newer, then run:

```sh
npm start
```

Open http://127.0.0.1:4173. No dependency installation or build step is needed. The complete website is in `dist/`.

## Check the app

```sh
npm test
```

## Publish

In the repository's **Settings → Pages**, select **GitHub Actions** as the source. The included workflow checks the planner and calculator, then publishes `dist/` on every push to `main`. You can also run **Publish ByeBye** manually from the Actions tab.

## Data and image credits

Image credits and individual license links are preserved in the website and `dist/photo-credits.json`. Country data licensing is recorded in `dist/COUNTRY-DATA-LICENSE.txt`.

Airport data comes from [OurAirports](https://ourairports.com/data/) (public domain). Exchange-rate data comes from [Exchange API](https://github.com/fawazahmed0/exchange-api) (CC0); the website displays the rate date and can use a saved snapshot if updates are unavailable.

This repository does not grant additional rights to third-party images or datasets; their respective licenses apply.
