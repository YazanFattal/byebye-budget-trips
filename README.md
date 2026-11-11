# ByeBye

A mobile-first travel discovery app that helps people find destinations and estimate their trip costs.

- Follow a guided journey from budget and departure airport through dates, travel group, interests, region, pace, food preferences, and accommodation style.
- Review and edit every answer before revealing a destination, with specific match reasons and three alternative choices.
- Browse 250 countries and territories, with destination photos and popular choices first, including Canada and the Middle East.
- Choose a departure country and search worldwide passenger airports.
- Compare trip options, save favourites on your device, and calculate flights, accommodation, food, transport, activities, extras, and an optional buffer.
- See the full budget assessment only when every cost category has a valid value. Missing costs remain visibly incomplete.
- Choose from 160 currencies.
- Open Google Flights and Booking.com to check current prices and availability.

Flight and hotel links open external providers. Any sample costs are illustrative estimates, not live fares or confirmed availability. For routes without an estimate, travellers can enter their own costs in the calculator. No maximum return-flight price filter is applied.

The total budget covers everyone travelling. Booking links carry dates, airports, rooms, and passenger details. Children's ages are entered for the return date; flight passenger categories and hotel ages are handled separately. Family flight costs require a user-entered price. Food choices express preferences, not verified restaurant availability.

Existing saved trips are read from the same device-storage key. New favourites can also retain entered calculator values. Display currencies share an underlying EUR amount, so changing currency preserves the budget's value.

## Run locally

Install Node.js 22 or newer, then run:

```sh
npm start
```

## Check the app

```sh
npm test
```

The checks cover catalog and photo integrity, calculator arithmetic and incomplete totals, recommendation filters, alternative matches, passenger encoding, provider links, and compatibility with saved trips. The responsive preview at `/__responsive?width=390` is a local development aid; it is not included in the published website.

## Publish

In the repository's **Settings → Pages**, select **GitHub Actions** as the source. The included workflow checks the planner and calculator, then publishes `dist/` on every push to `main`. You can also run **Publish ByeBye** manually from the Actions tab.

## Data and image credits

Image credits and individual license links are preserved in the website and `dist/photo-credits.json`. Country data licensing is recorded in `dist/COUNTRY-DATA-LICENSE.txt`.

Airport data comes from [OurAirports](https://ourairports.com/data/) (public domain). Exchange-rate data comes from [Exchange API](https://github.com/fawazahmed0/exchange-api) (CC0); the website displays the rate date and can use a saved snapshot if updates are unavailable.

This repository does not grant additional rights to third-party images or datasets; their respective licenses apply.
