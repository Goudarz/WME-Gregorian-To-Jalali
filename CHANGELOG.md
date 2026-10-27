# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]. 2026-10-27

Public release.

### Added

- Live conversion of Gregorian dates in the WME interface into the Jalali calendar also inside Shadow DOM components.

- Time conversion to Asia/Tehran that handles daylight saving time. The source time zone can be set to Los Angeles, UTC or the browsers zone.

- Supported input formats:

English month names: Oct 27 2026 Tue, Oct 27 2026 2:30 PM 27 Oct 2026

Persian month names: ۲ ژوئیه ۲۰۲۶ سه‌شنبه ۲۷ اکتبر ۲۰۲۶ ۱۲:۳۰

Slash dates: 10/27/2026, 27/10/2026 with automatic or manual day/month order

ISO: 2026-10-27 2026-10-27T10:00:00Z

Dashes: 27-10-2026 08:15

- Panels that show the date and time in separate elements, such as closures are converted as a pair.

- Five output formats, a weekday in four styles and a mode that shows the original date next to the Jalali calendar.

- RTL‑safe display using Unicode bidi isolates so Persian text does not scramble English panels.

- Bilingual (Persian/English) settings tab in the Scripts sidebar, with a live preview. Every change applies to the page immediately so I can see the change instantly.

- Turning the script off restores all text.

- Settings are saved in the browser and validated when they are loaded.

[1.0.0]: https://github.com/Goudarz/wme-gregorian-to-jalali/releases/tag/v1.0.0