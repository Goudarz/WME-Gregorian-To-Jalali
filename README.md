# WME Gregorian To Jalali

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE)
[![GreasyFork](https://img.shields.io/badge/install-GreasyFork-orange.svg)](https://greasyfork.org/scripts/YOUR-SCRIPT-ID)

[فارسی](#فارسی) · [English](#english)

![Settings tab and converted dates](assets/screenshot.png)

---

<div dir="rtl" align="right">

## <a name="فارسی"></a>فارسی

ویرایش نقشه در ویز برای ما ایرانی‌ها همیشه یک دردسر کوچک داشت. همه‌ی تاریخ‌ها میلادی بودند و ساعت‌ها هم به وقت ما نبودند. برای فهمیدن اینکه یک مسدودی کِی شروع می‌شود یا آخرین ویرایش یک خیابان مال چه روزی بوده، باید هر بار یک تبدیل تاریخ ذهنی انجام می‌دادیم.

این اسکریپت همین کار را خودش انجام می‌دهد. هر تاریخ میلادی‌ای که در ویرایشگر ببیند به تاریخ شمسی برمی‌گرداند و ساعت را هم به وقت تهران تبدیل می‌کند.

### چه کارهایی می‌کند

- تاریخ‌ها را همان لحظه که در صفحه ظاهر می‌شوند تبدیل می‌کند. لازم نیست صفحه را دوباره بارگذاری کنید.
- ساعت‌ها را به وقت تهران می‌برد و ساعت تابستانی آمریکا را هم در نظر می‌گیرد.
- انواع قالب‌های تاریخ ویز را می‌شناسد: `Oct 27, 2026, 2:30 PM`، `27 Oct 2026`، `۲ ژوئیه ۲۰۲۶`، `10/27/2026`، `2026-10-27` و چند قالب دیگر.
- متن فارسی را طوری در صفحه می‌گذارد که در پنل‌های انگلیسی به‌هم نریزد و جای پرانتزها و اعداد جابه‌جا نشود.
- می‌توانید تاریخ اصلی را هم کنار تاریخ شمسی ببینید، یا فقط تاریخ شمسی را. در حالت دوم، تاریخ اصلی با نگه داشتن ماوس روی آن دیده می‌شود.
- پنج قالب برای نمایش تاریخ دارد، مثل `۱۴۰۵/۰۸/۰۵` یا `۵ آبان ۱۴۰۵`، و روز هفته را هم اگر بخواهید نشان می‌دهد.
- هر تنظیمی را که عوض کنید همان لحظه روی کل صفحه اعمال می‌شود. با خاموش کردن اسکریپت هم همه چیز به حالت اول برمی‌گردد.

### نصب

۱. اگر هنوز ندارید، افزونه‌ی [Tampermonkey](https://www.tampermonkey.net/) یا [Violentmonkey](https://violentmonkey.github.io/) را روی مرورگرتان نصب کنید.<br>
۲. اسکریپت را [از GreasyFork نصب کنید](https://greasyfork.org/scripts/YOUR-SCRIPT-ID). از این راه، نسخه‌های بعدی خودکار به‌روز می‌شوند.<br>
۳. ویرایشگر ویز را باز کنید و در نوار کناری به زبانه‌ی **Scripts** بروید. زبانه‌ی **تاریخ شمسی** همان‌جاست.

### تنظیمات

| تنظیم | کارش چیست |
|---|---|
| فعال بودن افزونه | روشن و خاموش کردن تبدیل. در حالت خاموش، متن‌ها میلادی می‌مانند. |
| نمایش همزمان | نمایش تاریخ اصلی و شمسی کنار هم، مثل `Oct 27, 2026 (۱۴۰۵/۰۸/۰۵)` |
| قالب تاریخ | یکی از پنج قالب نمایش |
| روز هفته | فارسی، انگلیسی، فینگلیش یا مخفی |
| منطقه زمانی ساعت‌های ویز | اگر ساعت‌های تبدیل‌شده چند ساعت جلو یا عقب بودند، این را عوض کنید. |
| ترتیب تاریخ‌های اسلش‌دار | اینکه `03/04/2026` سوم آوریل خوانده شود یا چهارم مارس |

پایین همین زبانه یک پیش‌نمایش هم هست. با هر تغییری که بدهید، نتیجه را همان‌جا می‌بینید.

### مشکل یا پیشنهاد

اگر جایی تاریخی تبدیل نشد یا اشتباه تبدیل شد، خوشحال می‌شوم خبرم کنید. لطفاً متن دقیقی را که ویز نشان داده بود، زبان ویرایشگر و مرورگرتان را هم بنویسید.

- [گزارش در گیت‌هاب](https://github.com/Goudarz/wme-gregorian-to-jalali/issues)
- ایمیل: [hi@goudarzjafari.com](mailto:hi@goudarzjafari.com)

</div>

---

## <a name="english"></a>English

WME shows every date in the Gregorian calendar, and most times aren't in Iran's time zone. For editors in Iran that means doing calendar math in your head every time you check a closure or look at an edit history. This script takes care of it: it converts the dates it finds in the editor to the Jalali (Persian) calendar and shifts times to Tehran time.

### What it does

- Converts dates as soon as they appear, with no reload needed. It also works inside WME's Shadow DOM components.
- Converts times to Tehran time and handles US daylight saving time.
- Understands the date formats WME uses, such as `Oct 27, 2026, 2:30 PM`, `27 Oct 2026`, `10/27/2026 14:30` and `2026-10-27`, plus Persian month names.
- Inserts Persian text with Unicode bidi isolation, so it doesn't scramble English panels.
- Can show the original date next to the Jalali one, or replace it. In replace mode, hover over the date to see the original.
- Offers five output formats and an optional weekday.
- Applies settings changes to the whole page immediately. Turning the script off restores the original text.

### Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Install the script [from GreasyFork](https://greasyfork.org/scripts/YOUR-SCRIPT-ID). You'll get updates automatically.
3. Open WME and look for the **Jalali Date** tab under **Scripts** in the sidebar.

### Settings

| Setting | What it does |
|---|---|
| Enable plugin | Turns conversion on or off |
| Show original + Jalali | `Oct 27, 2026 (۱۴۰۵/۰۸/۰۵)` instead of the Jalali date alone |
| Date format | One of five display formats |
| Weekday | Persian, English, Pinglish, or hidden |
| Time zone of WME times | Change it if converted times look a few hours off |
| Slash date order | Whether `03/04/2026` means March 4 or April 3 |

There's a live preview at the bottom of the tab, so you can see what each option does before you look at the map.

### Feedback

If a date isn't converted, or comes out wrong, please let me know. It helps to include the exact text WME showed, your WME language, and your browser.

- [Open an issue on GitHub](https://github.com/Goudarz/wme-gregorian-to-jalali/issues)
- Email: [hi@goudarzjafari.com](mailto:hi@goudarzjafari.com)

---

## License

[AGPL-3.0-or-later](LICENSE). Copyright © 2026 [Goudarz Jafari](https://goudarzjafari.com) · [hi@goudarzjafari.com](mailto:hi@goudarzjafari.com)

Release notes are in [CHANGELOG.md](CHANGELOG.md).
