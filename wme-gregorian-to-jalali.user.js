// ==UserScript==
// @name            WME Gregorian To Jalali
// @name:fa         تبدیل تاریخ میلادی به شمسی در ویرایشگر ویز
// @namespace       https://github.com/Goudarz/wme-gregorian-to-jalali
// @version         1.0.0
// @description     Converts Gregorian dates in Waze Map Editor to the Jalali (Persian) calendar in Tehran time, with RTL-safe display and a bilingual settings tab.
// @description:fa  تاریخ‌های میلادی ویرایشگر نقشه ویز را به تاریخ شمسی (به وقت تهران) تبدیل می‌کند؛ با نمایش درست راست‌به‌چپ و پنل تنظیمات دوزبانه.
// @author          Goudarz Jafari <hi@goudarzjafari.com>
// @copyright       2026, Goudarz Jafari (https://goudarzjafari.com)
// @license         AGPL-3.0-or-later
// @homepageURL     https://github.com/Goudarz/wme-gregorian-to-jalali
// @supportURL      https://github.com/Goudarz/wme-gregorian-to-jalali/issues
// @match           https://*.waze.com/editor*
// @match           https://*.waze.com/*/editor*
// @exclude         https://*.waze.com/user/editor*
// @exclude         https://*.waze.com/*/user/editor*
// @grant           none
// @run-at          document-idle
// ==/UserScript==

/* global W, GM_info */

(function () {
    'use strict';

    const SCRIPT_ID = 'wme-gregorian-to-jalali';
    const SCRIPT_NAME = 'WME Gregorian To Jalali';
    // Read from the @version header; the fallback must match it.
    const SCRIPT_VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '1.0.0';
    const STORAGE_KEY = 'WME_GTJ_SETTINGS';
    const LOG_PREFIX = '[WME GTJ]';

    const AUTHOR_URL = 'https://goudarzjafari.com';
    const AUTHOR_EMAIL = 'hi@goudarzjafari.com';
    const REPO_URL = 'https://github.com/Goudarz/wme-gregorian-to-jalali';
    // TODO: replace with the real topic URL once the forum thread exists.
    const FORUM_URL = 'https://www.waze.com/discuss/';

    const TARGET_TZ = 'Asia/Tehran';

    // Unicode bidi isolates: keep inserted Persian/Latin runs from reordering
    // the surrounding text (e.g. a Persian date inside an English LTR panel).
    const LRI = '⁦';
    const RLI = '⁧';
    const PDI = '⁩';
    const RTL_CHAR = /[֐-ࣿ]/;

    // -----------------------------
    // I18N
    // -----------------------------
    const i18n = {
        fa: {
            tabLabel: 'تاریخ شمسی',
            tabTooltip: 'تبدیل تاریخ میلادی به شمسی',
            title: 'تبدیل تاریخ به شمسی',
            craftedBy: 'توسعه‌دهنده:',
            authorName: 'گودرز جعفری',
            enablePlugin: 'فعال بودن افزونه',
            appendMode: 'نمایش همزمان تاریخ اصلی و شمسی',
            dateFormat: 'قالب تاریخ',
            weekdayFormat: 'روز هفته',
            weekdays: { fa: 'فارسی (شنبه)', en: 'انگلیسی (Saturday)', 'en-short': 'انگلیسی کوتاه (Sat)', pinglish: 'فینگلیش (Shanbeh)', none: 'نمایش داده نشود' },
            sourceTz: 'منطقه زمانی ساعت‌های ویز',
            sourceTzHint: 'ساعت‌ها از این منطقه زمانی به وقت تهران تبدیل می‌شوند.',
            timezones: { 'America/Los_Angeles': 'لس‌آنجلس (America/Los_Angeles)', UTC: 'UTC', local: 'منطقه زمانی مرورگر' },
            slashOrder: 'ترتیب تاریخ‌های اسلش‌دار (۱۰/۲۷/۲۰۲۶)',
            slashOrders: { auto: 'خودکار', mdy: 'ماه/روز/سال', dmy: 'روز/ماه/سال' },
            langSelect: 'زبان افزونه (Language)',
            preview: 'اکنون به وقت تهران:',
            sample: 'نمونه ورودی:',
            result: 'نتیجه:',
            rescanBtn: 'اعمال و اسکن دوباره صفحه',
            saved: 'تنظیمات ذخیره شد ✔',
            rescanned: 'صفحه دوباره اسکن شد ✔',
            originalPrefix: 'تاریخ اصلی: ',
            discuss: 'انجمن ویز',
            github: 'گیت‌هاب',
            email: 'ایمیل'
        },
        en: {
            tabLabel: 'Jalali Date',
            tabTooltip: 'Gregorian To Jalali',
            title: 'Gregorian To Jalali',
            craftedBy: 'Crafted by',
            authorName: 'Goudarz Jafari',
            enablePlugin: 'Enable plugin',
            appendMode: 'Show original + Jalali date',
            dateFormat: 'Date format',
            weekdayFormat: 'Weekday',
            weekdays: { fa: 'Persian (شنبه)', en: 'English (Saturday)', 'en-short': 'English short (Sat)', pinglish: 'Pinglish (Shanbeh)', none: 'Hidden' },
            sourceTz: 'Time zone of WME times',
            sourceTzHint: 'Times are converted from this zone to Tehran time.',
            timezones: { 'America/Los_Angeles': 'Los Angeles (America/Los_Angeles)', UTC: 'UTC', local: 'Browser time zone' },
            slashOrder: 'Slash date order (10/27/2026)',
            slashOrders: { auto: 'Automatic', mdy: 'Month/Day/Year', dmy: 'Day/Month/Year' },
            langSelect: 'Plugin language',
            preview: 'Now in Tehran:',
            sample: 'Sample input:',
            result: 'Result:',
            rescanBtn: 'Apply & rescan page',
            saved: 'Settings saved ✔',
            rescanned: 'Page rescanned ✔',
            originalPrefix: 'Original: ',
            discuss: 'Discuss',
            github: 'GitHub',
            email: 'Email'
        }
    };

    // -----------------------------
    // Settings
    // -----------------------------
    const SETTING_CHOICES = {
        format: ['1', '2', '3', '4', '5'],
        weekdayFormat: ['fa', 'en', 'en-short', 'pinglish', 'none'],
        sourceTz: ['America/Los_Angeles', 'UTC', 'local'],
        slashOrder: ['auto', 'mdy', 'dmy'],
        lang: ['fa', 'en']
    };

    const defaultSettings = {
        enabled: true,
        appendMode: true,
        format: '1',
        weekdayFormat: 'fa',
        sourceTz: 'America/Los_Angeles',
        slashOrder: 'auto',
        lang: 'fa'
    };

    function readStoredSettings() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return raw && typeof raw === 'object' ? raw : {};
        } catch {
            return {};
        }
    }

    function sanitizeSettings(raw) {
        const s = { ...defaultSettings };
        for (const key of Object.keys(defaultSettings)) {
            if (!(key in raw)) continue;
            if (typeof defaultSettings[key] === 'boolean') s[key] = Boolean(raw[key]);
            else if (SETTING_CHOICES[key].includes(String(raw[key]))) s[key] = String(raw[key]);
        }
        return s;
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn(LOG_PREFIX, 'Could not save settings', e);
        }
    }

    const storedSettings = readStoredSettings();
    const settings = sanitizeSettings(storedSettings);
    let wmeLocale = 'en';

    const T = () => i18n[settings.lang] || i18n.en;

    // -----------------------------
    // Calendar data
    // -----------------------------
    const MONTHS_FA = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const MONTHS_PINGLISH = ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'];

    // Indexed like Date#getDay(): 0 = Sunday.
    const WEEKDAYS = {
        fa: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'en-short': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        pinglish: ['YekShanbeh', 'DoShanbeh', 'SeShanbeh', 'ChaharShanbeh', 'PanjShanbeh', 'Jomeh', 'Shanbeh']
    };
    const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    const EN_MONTH_INDEX = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
    const FA_MONTH_INDEX = {
        'ژانویه': 1, 'فوریه': 2, 'مارس': 3, 'آوریل': 4, 'مه': 5, 'ژوئن': 6,
        'ژوئیه': 7, 'جولای': 7, 'اوت': 8, 'آگوست': 8, 'سپتامبر': 9, 'اکتبر': 10, 'نوامبر': 11, 'دسامبر': 12
    };

    // -----------------------------
    // Digits & small helpers
    // -----------------------------
    const pad = n => String(n).padStart(2, '0');

    function toLatinDigits(str) {
        return String(str)
            .replace(/[۰-۹]/g, c => c.charCodeAt(0) - 0x06F0)
            .replace(/[٠-٩]/g, c => c.charCodeAt(0) - 0x0660);
    }

    const toPersianDigits = str => String(str).replace(/\d/g, d => String.fromCharCode(0x06F0 + Number(d)));
    const num = str => parseInt(toLatinDigits(str), 10);
    const isolate = str => (RTL_CHAR.test(str) ? RLI : LRI) + str + PDI;
    const usesPersianDigits = (format = settings.format) => format === '1' || format === '4';

    function isValidDate(y, m, d) {
        if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1) return false;
        const dt = new Date(Date.UTC(y, m - 1, d));
        return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
    }

    // -----------------------------
    // Intl-based conversion (cached formatters)
    // -----------------------------
    const formatterCache = new Map();

    function getFormatter(locale, options) {
        const key = locale + JSON.stringify(options);
        let f = formatterCache.get(key);
        if (!f) {
            f = new Intl.DateTimeFormat(locale, options);
            formatterCache.set(key, f);
        }
        return f;
    }

    function partsOf(formatter, date) {
        const p = {};
        for (const { type, value } of formatter.formatToParts(date)) p[type] = value;
        return p;
    }

    // Wall-clock time in `timeZone` -> absolute instant. Two correction passes
    // keep the result exact across DST transitions.
    function zonedTimeToDate(y, m, d, h, min, timeZone) {
        if (timeZone === 'local') return new Date(y, m - 1, d, h, min);
        const formatter = getFormatter('en-US', {
            timeZone, hourCycle: 'h23',
            year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
        });
        const wanted = Date.UTC(y, m - 1, d, h, min);
        let ts = wanted;
        for (let i = 0; i < 2; i++) {
            const p = partsOf(formatter, new Date(ts));
            const seen = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
            ts += wanted - seen;
        }
        return new Date(ts);
    }

    function jalaliParts(date, timeZone) {
        const p = partsOf(getFormatter('en-US-u-ca-persian-nu-latn', {
            timeZone, hourCycle: 'h23', weekday: 'short',
            year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
        }), date);
        return {
            y: parseInt(p.year, 10),
            m: parseInt(p.month, 10),
            d: parseInt(p.day, 10),
            h: parseInt(p.hour, 10) % 24,
            min: parseInt(p.minute, 10),
            wd: WEEKDAY_INDEX[p.weekday]
        };
    }

    // -----------------------------
    // Output formatting
    // -----------------------------
    function formatDate(j, format = settings.format) {
        const ymd = `${j.y}/${pad(j.m)}/${pad(j.d)}`;
        switch (format) {
            case '2': return ymd;
            case '3': return `${j.d} ${MONTHS_FA[j.m - 1]} ${j.y}`;
            case '4': return toPersianDigits(`${j.d} ${MONTHS_FA[j.m - 1]} ${j.y}`);
            case '5': return `${j.d} ${MONTHS_PINGLISH[j.m - 1]} ${j.y}`;
            default: return toPersianDigits(ymd);
        }
    }

    function formatTime(j) {
        const t = `${pad(j.h)}:${pad(j.min)}`;
        return usesPersianDigits() ? toPersianDigits(t) : t;
    }

    function buildOutput(j, withTime, withWeekday) {
        let out = formatDate(j);
        const names = WEEKDAYS[settings.weekdayFormat];
        if (withWeekday && names) out = `${names[j.wd]} ${out}`;
        if (withTime) out += (RTL_CHAR.test(out) ? '، ' : ', ') + formatTime(j);
        return out;
    }

    // Rendered segment -> the original text it replaced. WME sometimes copies
    // converted text into new nodes; this lets those copies be traced back to
    // their original and re-rendered when settings change.
    const segmentOrigins = new Map();
    const OUR_SEGMENT = /[⁦⁧][^⁩]*⁩(?: \([⁦⁧][^⁩]*⁩\))?/g;
    const SINGLE_SEGMENT = /[⁦⁧][^⁩]*⁩/g;

    function remember(segment, original) {
        if (segmentOrigins.size > 5000) segmentOrigins.clear();
        segmentOrigins.set(segment, original);
        return segment;
    }

    // Original text behind a string containing our output, or null if unknown.
    function recoverOriginal(text) {
        let known = true;
        const lookup = s => {
            if (segmentOrigins.has(s)) return segmentOrigins.get(s);
            known = false;
            return s;
        };
        const result = text.replace(OUR_SEGMENT, s => (segmentOrigins.has(s) ? segmentOrigins.get(s) : s.replace(SINGLE_SEGMENT, lookup)));
        return known ? result : null;
    }

    function render(match, converted) {
        return remember(settings.appendMode
            ? `${isolate(match)} (${isolate(converted)})`
            : isolate(converted), match);
    }

    // -----------------------------
    // Date patterns
    // -----------------------------
    const DIGITS = '0-9۰-۹٠-٩';
    const D = `[${DIGITS}]`;
    const LETTERS = 'A-Za-z؀-ۿ‌';
    const SEP = '[\\s,،]+';
    const AT = `[\\s,،]+(?:(?:at|ساعت)\\s+)?`;
    const EN_MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December|Sept|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
    const FA_MONTHS = Object.keys(FA_MONTH_INDEX).join('|');
    const FA_WEEKDAYS = 'یکشنبه|یک‌شنبه|دوشنبه|سه‌شنبه|سه شنبه|چهارشنبه|پنجشنبه|پنج‌شنبه|جمعه|شنبه';

    const MONTH = `(?<![${LETTERS}])(?<mon>${EN_MONTHS}|${FA_MONTHS})\\.?(?![${LETTERS}])`;
    const WEEKDAY = `(?<wd>(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)[a-z]*\\.?|${FA_WEEKDAYS})`;
    const time = p => `(?<${p}h>${D}{1,2}):(?<${p}mi>${D}{2})(?::${D}{2})?(?!${D})(?:\\s?(?<${p}ap>[AP]\\.?M\\.?)(?![A-Za-z]))?`;

    function parseTime(g, p = '') {
        if (g[p + 'h'] == null) return null;
        let h = num(g[p + 'h']);
        const min = num(g[p + 'mi']);
        const ap = g[p + 'ap'] && g[p + 'ap'][0].toUpperCase();
        if (ap) {
            if (h < 1 || h > 12) return null;
            h = (h % 12) + (ap === 'P' ? 12 : 0);
        }
        return h < 24 && min < 60 ? { h, min } : null;
    }

    function monthFromName(name) {
        return FA_MONTH_INDEX[name] || EN_MONTH_INDEX[name.slice(0, 3).toLowerCase()];
    }

    function resolveSlashOrder(a, b) {
        let order = settings.slashOrder;
        if (order === 'auto') {
            if (a > 12 && b <= 12) order = 'dmy';
            else if (b > 12 && a <= 12) order = 'mdy';
            else order = /^en(-US)?$/i.test(wmeLocale) ? 'mdy' : 'dmy';
        }
        return order === 'mdy' ? { m: a, d: b } : { m: b, d: a };
    }

    // Each rule turns regex groups into { y, m, d, time, tz?, hasWeekday, named } or null.
    // Order matters: date+time rules run first and their results are protected
    // by placeholders so later, shorter rules cannot match inside them.
    const RULES = [
        { // Oct 27, 2026, 14:30 · Tue, Oct 27 2026 · ژوئیه ۲ ۲۰۲۶
            re: new RegExp(`(?:${WEEKDAY}${SEP})?${MONTH}\\s+(?<d>${D}{1,2})(?!${D})(?:st|nd|rd|th)?(?:${SEP}(?<y>${D}{4})(?!${D}))?(?:${AT}${time('')})?`, 'gi'),
            parse: g => ({
                y: g.y ? num(g.y) : new Date().getFullYear(),
                m: monthFromName(g.mon), d: num(g.d),
                time: parseTime(g), hasWeekday: !!g.wd, named: true
            })
        },
        { // 27 Oct 2026 · سه‌شنبه ۲ ژوئیه ۲۰۲۶ ساعت ۱۲:۳۰
            re: new RegExp(`(?:${WEEKDAY}${SEP})?(?<!${D})(?<d>${D}{1,2})\\s+${MONTH}${SEP}(?<y>${D}{4})(?!${D})(?:${AT}${time('')})?`, 'gi'),
            parse: g => ({
                y: num(g.y), m: monthFromName(g.mon), d: num(g.d),
                time: parseTime(g), hasWeekday: !!g.wd, named: true
            })
        },
        { // 10/27/2026 14:30 · 14:30, 27/10/2026 · 10/27/26
            re: new RegExp(`(?<![${DIGITS}/])(?:${time('p')}${SEP})?(?<a>${D}{1,2})/(?<b>${D}{1,2})/(?<y>${D}{4}|${D}{2})(?![${DIGITS}/])(?:${AT}${time('')})?`, 'gi'),
            parse: g => {
                let y = num(g.y);
                if (y < 100) y += 2000;
                return { y, ...resolveSlashOrder(num(g.a), num(g.b)), time: parseTime(g, 'p') || parseTime(g), hasWeekday: false, named: false };
            }
        },
        { // 2026-10-27 · 2026-10-27T14:30:00Z
            re: new RegExp(`(?<![${DIGITS}/-])(?<y>${D}{4})-(?<m>${D}{1,2})-(?<d>${D}{1,2})(?![${DIGITS}-])(?:(?:T|${AT})${time('')}(?<z>Z)?)?`, 'gi'),
            parse: g => ({
                y: num(g.y), m: num(g.m), d: num(g.d),
                time: parseTime(g), tz: g.z ? 'UTC' : undefined, hasWeekday: false, named: false
            })
        },
        { // 27-10-2026 14:30
            re: new RegExp(`(?<![${DIGITS}/-])(?<d>${D}{1,2})-(?<m>${D}{1,2})-(?<y>${D}{4})(?![${DIGITS}-])(?:${AT}${time('')})?`, 'gi'),
            parse: g => ({
                y: num(g.y), m: num(g.m), d: num(g.d),
                time: parseTime(g), hasWeekday: false, named: false
            })
        }
    ];

    function toJalali(y, m, d, t, tz) {
        if (t) return jalaliParts(zonedTimeToDate(y, m, d, t.h, t.min, tz || settings.sourceTz), TARGET_TZ);
        // Date-only values are calendar dates, not instants: no time zone shift.
        return jalaliParts(new Date(Date.UTC(y, m - 1, d, 12)), 'UTC');
    }

    function convertMatch(info) {
        if (!info || !isValidDate(info.y, info.m, info.d)) return null;
        const j = toJalali(info.y, info.m, info.d, info.time, info.tz);
        const withWeekday = info.hasWeekday || (info.named && !!info.time);
        return buildOutput(j, !!info.time, withWeekday);
    }

    const HAS_DIGIT = new RegExp(D);
    const PLACEHOLDER = /([-])/g;

    function convertText(text) {
        if (!HAS_DIGIT.test(text)) return text;
        const held = [];
        let result = text;
        for (const rule of RULES) {
            result = result.replace(rule.re, (...args) => {
                const match = args[0];
                const converted = convertMatch(rule.parse(args[args.length - 1]));
                if (!converted || held.length > 0x17FF) return match;
                held.push(render(match, converted));
                return '' + String.fromCharCode(0xE100 + held.length - 1) + '';
            });
        }
        if (!held.length) return text;
        return result.replace(PLACEHOLDER, (_, c) => held[c.charCodeAt(0) - 0xE100]);
    }

    // -----------------------------
    // DOM state
    // -----------------------------
    // Text node -> { original, output }. Comparing the live value with `output`
    // tells our own writes apart from WME re-rendering the node with new data.
    const nodeState = new WeakMap();

    const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'textarea', 'input', 'select', 'option', 'canvas', 'svg', 'code', 'pre']);
    const SKIP_SELECTOR = [...SKIP_TAGS].join(',') + ',[contenteditable],[data-gtj-skip]';

    const shouldSkip = el => SKIP_TAGS.has(el.localName) || el.hasAttribute('contenteditable') || el.hasAttribute('data-gtj-skip');

    function isInsideSkipped(node) {
        const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        return !!(el && el.closest(SKIP_SELECTOR));
    }

    // Our output always carries an LRI/RLI isolate. Text containing one was
    // produced by this script (possibly copied by WME into a new node), so it
    // is never converted as-is, or the original date would turn Jalali too;
    // its original is recovered instead.
    const HAS_OUR_MARK = /[⁦⁧]/;

    // Returns the original text to convert, or null when there is nothing to do.
    function sourceOf(node, force) {
        const st = nodeState.get(node);
        const value = node.nodeValue;
        if (st && value === st.output) return force ? st.original : null;
        if (HAS_OUR_MARK.test(value)) return recoverOriginal(value);
        return value;
    }

    function updateTitle(el, original) {
        if (!el) return;
        const ours = el.hasAttribute('data-gtj-title');
        if (original && !settings.appendMode) {
            if (ours || !el.hasAttribute('title')) {
                el.setAttribute('title', T().originalPrefix + original.trim());
                el.setAttribute('data-gtj-title', '');
            }
        } else if (ours) {
            el.removeAttribute('title');
            el.removeAttribute('data-gtj-title');
        }
    }

    function writeNode(node, original, output) {
        if (output === original) nodeState.delete(node);
        else nodeState.set(node, { original, output });
        if (node.nodeValue !== output) node.nodeValue = output;
        updateTitle(node.parentElement, output === original ? null : original);
    }

    function processTextNode(node, force) {
        const source = sourceOf(node, force);
        if (source == null) return;
        try {
            const output = convertText(source);
            if (output === node.nodeValue) {
                // Already showing the right text (e.g. a copy made with current settings).
                if (output === source) nodeState.delete(node);
                else nodeState.set(node, { original: source, output });
                return;
            }
            writeNode(node, source, output);
        } catch (e) {
            console.warn(LOG_PREFIX, 'Conversion failed for', JSON.stringify(source), e);
        }
    }

    // Some WME panels (e.g. closures) render date and time in two sibling
    // <div>s inside a "startDate--…" / "endDate--…" container. The date can only
    // be shifted to Tehran correctly when both halves are read together.
    const SEPARATED_CLASS = /(?:^|\s)(?:start|end)Date--/;
    const isSeparatedContainer = el => SEPARATED_CLASS.test(el.getAttribute('class') || '');

    function findSeparatedContainer(node) {
        let el = node.parentElement;
        for (let i = 0; el && i < 3; i++, el = el.parentElement) {
            if (isSeparatedContainer(el)) return el;
        }
        return null;
    }

    const firstText = el => el && [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());

    function parseDateOnly(text) {
        let g;
        if ((g = text.match(new RegExp(`^(${D}{4})-(${D}{1,2})-(${D}{1,2})$`)))) return { y: num(g[1]), m: num(g[2]), d: num(g[3]) };
        if ((g = text.match(new RegExp(`^(${D}{1,2})-(${D}{1,2})-(${D}{4})$`)))) return { y: num(g[3]), m: num(g[2]), d: num(g[1]) };
        if ((g = text.match(new RegExp(`^(${D}{1,2})/(${D}{1,2})/(${D}{4})$`)))) return { y: num(g[3]), ...resolveSlashOrder(num(g[1]), num(g[2])) };
        return null;
    }

    function processSeparated(container, force) {
        const divs = [...container.children].filter(el => el.localName === 'div');
        if (divs.length < 2) return false;
        const dateNode = firstText(divs[0]);
        const timeNode = firstText(divs[1]);
        if (!dateNode || !timeNode) return false;

        const dateSrc = sourceOf(dateNode, force);
        const timeSrc = sourceOf(timeNode, force);
        if (dateSrc == null && timeSrc == null) return true; // already converted
        const dateText = (dateSrc ?? nodeState.get(dateNode).original).trim();
        const timeText = (timeSrc ?? nodeState.get(timeNode).original).trim();

        const date = parseDateOnly(dateText);
        const t = parseTime(timeText.match(new RegExp(`^${time('')}$`, 'i'))?.groups || {});
        if (!date || !t || !isValidDate(date.y, date.m, date.d)) return false;

        const j = toJalali(date.y, date.m, date.d, t);
        const jDate = formatDate(j);
        const jTime = formatTime(j);
        const wrap = (orig, conv) => remember(settings.appendMode ? `${isolate(orig)} (${isolate(conv)})` : isolate(conv), orig);
        writeNode(dateNode, dateText, wrap(dateText, jDate));
        writeNode(timeNode, timeText, wrap(timeText, jTime));
        return true;
    }

    function handleText(node, force) {
        if (!nodeState.has(node) && !HAS_DIGIT.test(node.nodeValue)) return;
        const container = findSeparatedContainer(node);
        if (container && processSeparated(container, force)) return;
        processTextNode(node, force);
    }

    // -----------------------------
    // Traversal (light DOM + shadow roots)
    // -----------------------------
    function forEachText(root, onText, onElement) {
        const enter = el => {
            if (!onElement(el)) return false;
            if (el.shadowRoot) forEachText(el.shadowRoot, onText, onElement);
            return true;
        };
        if (root.nodeType === Node.TEXT_NODE) return onText(root);
        if (root.nodeType === Node.ELEMENT_NODE && !enter(root)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: n => (n.nodeType === Node.TEXT_NODE || enter(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
        });
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (n.nodeType === Node.TEXT_NODE) onText(n);
        }
    }

    function scan(root = document.body, force = false) {
        if (!settings.enabled || !root) return;
        forEachText(root, node => handleText(node, force), el => {
            if (shouldSkip(el)) return false;
            if (el.shadowRoot) observeRoot(el.shadowRoot);
            // A converted date/time container has nothing more to visit inside.
            return !(isSeparatedContainer(el) && processSeparated(el, force));
        });
    }

    function restoreAll() {
        forEachText(document.body, node => {
            const st = nodeState.get(node);
            const value = node.nodeValue;
            const original = st && value === st.output ? st.original
                : HAS_OUR_MARK.test(value) ? recoverOriginal(value) : null;
            nodeState.delete(node);
            if (original != null) writeNode(node, original, original);
        }, el => !shouldSkip(el));
    }

    // -----------------------------
    // MutationObserver
    // -----------------------------
    const observedRoots = new WeakSet();
    const observer = new MutationObserver(mutations => {
        if (!settings.enabled) return;
        for (const m of mutations) {
            if (m.type === 'characterData') {
                const node = m.target;
                const st = nodeState.get(node);
                if (st && node.nodeValue === st.output) continue; // our own write
                if (!HAS_DIGIT.test(node.nodeValue) || isInsideSkipped(node)) continue;
                handleText(node, false);
            } else {
                for (const n of m.addedNodes) {
                    if (n.nodeType === Node.TEXT_NODE ? !HAS_DIGIT.test(n.nodeValue) : n.nodeType !== Node.ELEMENT_NODE) continue;
                    if (!isInsideSkipped(n)) scan(n);
                }
            }
        }
    });

    function observeRoot(root) {
        if (observedRoots.has(root)) return;
        observer.observe(root, { childList: true, subtree: true, characterData: true });
        observedRoots.add(root);
    }

    let rescanTimer = 0;
    function scheduleRescan() {
        clearTimeout(rescanTimer);
        rescanTimer = setTimeout(() => scan(), 300);
    }

    function applySettings() {
        if (settings.enabled) scan(document.body, true);
        else restoreAll();
    }

    // -----------------------------
    // Sidebar tab
    // -----------------------------
    const PANEL_CSS = `
        #gtj-panel { padding: 12px 14px; font-size: 13px; line-height: 1.7; font-family: Vazirmatn, "Segoe UI", Tahoma, sans-serif; }
        #gtj-panel[dir="rtl"] { text-align: right; }
        #gtj-panel .gtj-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin: 0 0 2px; padding-bottom: 6px; border-bottom: 1px solid #ccc; font-size: 15px; font-weight: bold; }
        #gtj-panel .gtj-ver { font-size: 11px; font-weight: normal; opacity: .6; direction: ltr; unicode-bidi: isolate; }
        #gtj-panel .gtj-author { font-size: 11px; opacity: .75; margin-bottom: 12px; }
        #gtj-panel .gtj-author a { color: inherit; }
        #gtj-panel .gtj-check { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; cursor: pointer; }
        #gtj-panel .gtj-check input { margin: 0; }
        #gtj-panel .gtj-field { margin-bottom: 12px; }
        #gtj-panel .gtj-field > label { display: block; margin-bottom: 4px; font-weight: bold; }
        #gtj-panel select { width: 100%; padding: 4px 6px; border: 1px solid #ccc; border-radius: 4px; font: inherit; }
        #gtj-panel .gtj-hint { margin-top: 2px; font-size: 11px; opacity: .7; }
        #gtj-panel .gtj-preview { margin-bottom: 12px; padding: 6px 8px; border-radius: 4px; background: rgba(0, 139, 139, .08); }
        #gtj-panel .gtj-preview bdi { font-weight: bold; }
        #gtj-panel .gtj-preview > div + div { margin-top: 2px; }
        #gtj-panel .gtj-rescan { width: 100%; padding: 6px 12px; border: 0; border-radius: 4px; background: #008b8b; color: #fff; font: inherit; font-weight: bold; cursor: pointer; }
        #gtj-panel .gtj-status { min-height: 18px; margin-top: 8px; text-align: center; font-size: 12px; font-weight: bold; color: #2e7d32; }
        #gtj-panel .gtj-links { margin-top: 12px; padding-top: 8px; border-top: 1px solid #ccc; text-align: center; font-size: 11px; }
        #gtj-panel .gtj-links a { margin: 0 6px; color: #008b8b; text-decoration: none; }
    `;

    const ui = { tabLabel: null, tabPane: null, statusTimer: 0 };

    function selectField(key, label, options, hint) {
        const opts = options.map(([value, text]) =>
            `<option value="${value}"${settings[key] === value ? ' selected' : ''}>${text}</option>`).join('');
        return `
            <div class="gtj-field">
                <label for="gtj-${key}">${label}</label>
                <select id="gtj-${key}" data-key="${key}">${opts}</select>
                ${hint ? `<div class="gtj-hint">${hint}</div>` : ''}
            </div>`;
    }

    function previewText() {
        const j = jalaliParts(new Date(), TARGET_TZ);
        return isolate(buildOutput(j, true, true));
    }

    // The current moment written the way WME shows it, in the selected source zone.
    function sampleText() {
        const timeZone = settings.sourceTz === 'local' ? undefined : settings.sourceTz;
        const p = partsOf(getFormatter('en-US', {
            timeZone, hourCycle: 'h23',
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }), new Date());
        return `${p.month} ${p.day}, ${p.year}, ${p.hour}:${p.minute}`;
    }

    function updatePreview() {
        const set = (sel, text) => {
            const el = ui.tabPane.querySelector(sel);
            if (el) el.textContent = text;
        };
        const sample = sampleText();
        set('.gtj-preview-now', previewText());
        set('.gtj-preview-sample', isolate(sample));
        set('.gtj-preview-result', convertText(sample));
    }

    function renderPanel() {
        const t = T();
        const dir = settings.lang === 'fa' ? 'rtl' : 'ltr';
        const today = jalaliParts(new Date(), TARGET_TZ);
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

        ui.tabLabel.textContent = t.tabLabel;
        ui.tabLabel.title = t.tabTooltip;
        ui.tabPane.innerHTML = `
            <div id="gtj-panel" dir="${dir}" lang="${settings.lang}" data-gtj-skip>
                <style>${PANEL_CSS}</style>
                <div class="gtj-head"><span>${t.title}</span><span class="gtj-ver">v${SCRIPT_VERSION}</span></div>
                <div class="gtj-author">${t.craftedBy} <a href="${AUTHOR_URL}" target="_blank" rel="noopener">${t.authorName}</a></div>

                <label class="gtj-check"><input type="checkbox" data-key="enabled"${settings.enabled ? ' checked' : ''}><b>${t.enablePlugin}</b></label>
                <label class="gtj-check"><input type="checkbox" data-key="appendMode"${settings.appendMode ? ' checked' : ''}>${t.appendMode}</label>

                ${selectField('format', t.dateFormat, SETTING_CHOICES.format.map(f => [f, isolate(formatDate(today, f))]))}
                ${selectField('weekdayFormat', t.weekdayFormat, SETTING_CHOICES.weekdayFormat.map(w => [w, t.weekdays[w]]))}
                ${selectField('sourceTz', t.sourceTz, SETTING_CHOICES.sourceTz.map(z => [z, z === 'local' ? `${t.timezones.local} (${browserTz})` : t.timezones[z]]), t.sourceTzHint)}
                ${selectField('slashOrder', t.slashOrder, SETTING_CHOICES.slashOrder.map(o => [o, t.slashOrders[o]]))}
                ${selectField('lang', t.langSelect, [['fa', 'فارسی'], ['en', 'English']])}

                <div class="gtj-preview">
                    <div>${t.preview} <bdi class="gtj-preview-now"></bdi></div>
                    <div>${t.sample} <bdi class="gtj-preview-sample"></bdi></div>
                    <div>${t.result} <bdi class="gtj-preview-result"></bdi></div>
                </div>

                <button type="button" class="gtj-rescan">${t.rescanBtn}</button>
                <div class="gtj-status" role="status" aria-live="polite"></div>

                <div class="gtj-links">
                    <a href="${FORUM_URL}" target="_blank" rel="noopener">💬 ${t.discuss}</a> ·
                    <a href="${REPO_URL}" target="_blank" rel="noopener">🔗 ${t.github}</a> ·
                    <a href="mailto:${AUTHOR_EMAIL}?subject=${encodeURIComponent(`${SCRIPT_NAME} v${SCRIPT_VERSION}`)}" title="${AUTHOR_EMAIL}">✉️ ${t.email}</a>
                </div>
            </div>`;
        bindPanelEvents();
        updatePreview();
    }

    function showStatus(msg) {
        const el = ui.tabPane.querySelector('.gtj-status');
        if (!el) return;
        el.textContent = msg;
        clearTimeout(ui.statusTimer);
        ui.statusTimer = setTimeout(() => { el.textContent = ''; }, 2000);
    }

    // Bound to each control after every render (the panel is rebuilt on language change).
    function bindPanelEvents() {
        for (const input of ui.tabPane.querySelectorAll('[data-key]')) {
            input.addEventListener('change', () => {
                const key = input.dataset.key;
                settings[key] = input.type === 'checkbox' ? input.checked : input.value;
                saveSettings();
                if (key === 'lang') {
                    renderPanel();
                } else {
                    applySettings();
                    updatePreview();
                }
                showStatus(T().saved);
            });
        }
        const rescan = ui.tabPane.querySelector('.gtj-rescan');
        if (rescan) rescan.addEventListener('click', () => {
            scan(document.body, true);
            updatePreview();
            showStatus(T().rescanned);
        });
    }

    // W.userscripts is the documented, proven path; the SDK is only a fallback.
    // The panel is rendered after the pane is connected to the DOM.
    async function registerTab(sdk) {
        if (window.W && W.userscripts && typeof W.userscripts.registerSidebarTab === 'function') {
            try { W.userscripts.removeSidebarTab(SCRIPT_ID); } catch { /* no previous tab */ }
            const tab = W.userscripts.registerSidebarTab(SCRIPT_ID);
            await W.userscripts.waitForElementConnected(tab.tabPane);
            return tab;
        }
        return sdk.Sidebar.registerScriptTab();
    }

    // -----------------------------
    // Bootstrap
    // -----------------------------
    function whenWmeReady() {
        return new Promise(resolve => {
            if (window.W && W.userscripts && W.userscripts.state && W.userscripts.state.isReady) resolve();
            else document.addEventListener('wme-ready', () => resolve(), { once: true });
        });
    }

    async function getSdk() {
        try {
            if (window.SDK_INITIALIZED) await window.SDK_INITIALIZED;
            if (typeof window.getWmeSdk === 'function') {
                return window.getWmeSdk({ scriptId: SCRIPT_ID, scriptName: SCRIPT_NAME });
            }
        } catch (e) {
            console.warn(LOG_PREFIX, 'WME SDK unavailable', e);
        }
        return null;
    }

    function detectLocale(sdk) {
        try {
            const sdkLocale = sdk && sdk.Settings && sdk.Settings.getLocale && sdk.Settings.getLocale();
            return (sdkLocale && (sdkLocale.localeCode || sdkLocale)) || (window.I18n && window.I18n.locale) || navigator.language || 'en';
        } catch {
            return 'en';
        }
    }

    function listenForSelection(sdk) {
        try {
            if (sdk && sdk.Events) {
                sdk.Events.on({ eventName: 'wme-selection-changed', eventHandler: scheduleRescan });
                return;
            }
            if (W.selectionManager && W.selectionManager.events) {
                W.selectionManager.events.register('selectionchanged', null, scheduleRescan);
            }
        } catch (e) {
            console.warn(LOG_PREFIX, 'Could not listen for selection changes', e);
        }
    }

    async function init() {
        await whenWmeReady();
        const sdk = await getSdk();

        wmeLocale = String(detectLocale(sdk));
        if (!('lang' in storedSettings)) settings.lang = /^fa/i.test(wmeLocale) ? 'fa' : 'en';

        try {
            const tab = await registerTab(sdk);
            ui.tabLabel = tab.tabLabel;
            ui.tabPane = tab.tabPane;
            renderPanel();
        } catch (e) {
            console.error(LOG_PREFIX, 'Tab registration error', e);
        }

        observeRoot(document.body);
        listenForSelection(sdk);
        scan();
        console.info(LOG_PREFIX, `v${SCRIPT_VERSION} ready`);
    }

    init().catch(e => console.error(LOG_PREFIX, 'Initialization failed', e));
})();
