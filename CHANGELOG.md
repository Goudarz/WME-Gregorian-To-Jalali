# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [ Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]. 2026-10-27

Public release.

### Added

- I added conversion of Gregorian dates in the WME interface into the Jalali calendar also inside Shadow DOM components.

- I added time conversion to `Asia/Tehran` that handles daylight saving time. The source time zone can be set to Los Angeles, UTC or the browsers zone.

- I added support for input formats:

English month names: `Oct 27 2026` `Tue Oct 27 2026 2:30 PM` `27 Oct 2026`

Persian month names: `۲ ژوئیه ۲۰۲۶` `سه‌شنبه ۲۷ اکتبر ۲۰۲۶ ساعت ۱۲:۳۰`

Slash dates: `10/27/2026` `27/10/2026` with automatic or manual day/month order

ISO: `2026-10-27` `2026-10-27T10:00:00Z`

Dashes: `27-10-2026 08:15`

- I added panels that show the date and time in elements, such as closures and convert them as a pair.

- I added five output formats, a weekday in four styles and a mode that shows the date next to the Jalali one.

- I added display using Unicode bidi isolates so Persian text does not scramble English panels.

- I added a Persian/English) settings tab, in the Scripts sidebar with a live preview. Every change applies to the page immediately.

- I added the ability to turn the script off so that all original text is restored.

- I added settings that are saved in the browser and validated when they are loaded.

[1.0.0]: https://github.com/Goudarz/wme-gregorian-to-jalali/releases/tag/v1.0.0