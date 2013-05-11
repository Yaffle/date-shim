/*jslint vars: true, indent: 2 */

this.Date = (function (NativeDate) {
  "use strict";

  var isoDateExpression = /^(\d{4}|[+\-]\d{6})(?:\-(\d{2})(?:\-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?(Z|(?:([\-\+])(\d{2}):(\d{2})))?)?)?)?$/;
  var utcDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d\d)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d\d\d\d)\s+(\d\d)\:(\d\d)\:(\d\d)\s+(?:GMT|UTC)$/i;
  var stringDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)\s+(\-?\d+)\s+(\d\d)\:(\d\d)\:(\d\d)\s+(?:GMT|UTC)([\+\-])(\d\d)(\d\d)$/i;
  var monthes = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  var weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var nativeParse = NativeDate.parse;

  function dayFromMonth(year, month) {
    var t = month > 1 ? 1 : 0;
    return monthes[month] + Math.floor((year - 1969 + t) / 4) - Math.floor((year - 1901 + t) / 100) + Math.floor((year - 1601 + t) / 400) + 365 * (year - 1970);
  }

  function toLocalTime(t) {
    return t - (new NativeDate(t).getTimezoneOffset() * 60000);
  }

  function toUTC(t) {
    return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
  }

  function clipMakeDateTime(year, month, date, hour, minute, second, millisecond, utc) {
    date -= date % 1;
    month -= month % 1;
    year -= year % 1;
    hour -= hour % 1;
    minute -= minute % 1;
    second -= second % 1;
    millisecond -= millisecond % 1;
    year += Math.floor(month / 12);
    month = (month % 12 + 12) % 12;
    var t = ((((dayFromMonth(year, month) + date) * 24 + hour) * 60 + minute) * 60 + second) * 1000 + millisecond;
    if (utc) {
      return toUTC(t);
    }
    return -8.64e15 <= t && t <= 8.64e15 ? t : NaN;
  }

  var GET_FULL_YEAR = 0;
  var GET_MONTH = 1;
  var GET_DATE = 2;
  var GET_HOURS = 3;
  var GET_MINUTES = 4;
  var GET_SECONDS = 5;
  var GET_MILLISECONDS = 6;
  var GET_DAY = 7;
  var TO_STRING = 8;
  var TO_TIME_STRING = 9;
  var TO_DATE_STRING = 10;
  var SET_FULL_YEAR = 11;
  var SET_MONTH = 12;
  var SET_DATE = 13;
  var SET_HOURS = 14;
  var SET_MINUTES = 15;
  var SET_SECONDS = 16;
  var SET_MILLISECONDS = 17;

  var GET_UTC_FULL_YEAR = 18;
  var GET_UTC_MONTH = 19;
  var GET_UTC_DATE = 20;
  var GET_UTC_HOURS = 21;
  var GET_UTC_MINUTES = 22;
  var GET_UTC_SECONDS = 23;
  var GET_UTC_MILLISECONDS = 24;
  var GET_UTC_DAY = 25;
  var SET_UTC_FULL_YEAR = 26;
  var SET_UTC_MONTH = 27;
  var SET_UTC_DATE = 28;
  var SET_UTC_HOURS = 29;
  var SET_UTC_MINUTES = 30;
  var SET_UTC_SECONDS = 31;
  var SET_UTC_MILLISECONDS = 32;

  var TO_ISO_STRING = 33;
  var TO_UTC_STRING = 34;
  var GET_YEAR = 35;
  var SET_YEAR = 36;

  function createMethod(w, length) {
    var local = false;
    switch (w) {
      case GET_YEAR:
      case GET_FULL_YEAR:
      case GET_MONTH:
      case GET_DATE:
      case GET_HOURS:
      case GET_MINUTES:
      case GET_SECONDS:
      case GET_MILLISECONDS:
      case GET_DAY:
      case TO_STRING:
      case TO_TIME_STRING:
      case TO_DATE_STRING:
      case SET_YEAR:
      case SET_FULL_YEAR:
      case SET_MONTH:
      case SET_DATE:
      case SET_HOURS:
      case SET_MINUTES:
      case SET_SECONDS:
      case SET_MILLISECONDS:
        local = true;
    }

    var result = function () {
      if (Object.prototype.toString.call(this) !== "[object Date]") {
        throw new TypeError();
      }
      var t = Number(this);
      t -= t % 1; // ToInteger
      if (!(-8.64e15 <= t && t <= 8.64e15)) { // isFinite(t) && |t| < 8.64e15
        if (w === TO_ISO_STRING || w === TO_UTC_STRING) {
          throw new RangeError();
        }
        if (w === TO_STRING) {
          return "Invalid Date";
        }
        return NaN;
      }

      var offset = 0;
      if (local) {
        offset = toLocalTime(t) - t;
        t += offset;
      }

      var timePart = (t % 86400000 + 86400000) % 86400000;
      var milliseconds = timePart % 1000;
      var seconds = Math.floor(timePart / 1000) % 60;
      var minutes = Math.floor(timePart / 60000) % 60;
      var hours = Math.floor(timePart / 3600000) % 24;

      t = Math.floor(t / 86400000);
      var year = Math.floor(t / 365.2425) + 1970 - 1;
      // this circle will iterate no more than 2 times
      while (dayFromMonth(year + 1, 0) <= t) {
        ++year;
      }

      var month = Math.floor((t - dayFromMonth(year, 0)) / 30.42);// 30.42 > 365 / 12 = max(day / month(day)) for any day
      // this circle will iterate no more than once
      while (dayFromMonth(year, month + 1) <= t) {
        ++month;
      }

      var date = 1 + t - dayFromMonth(year, month);
      var day = (t % 7 + 11) % 7;

      switch (w) {
        case GET_YEAR: return year - 1900;
        case GET_FULL_YEAR:
        case GET_UTC_FULL_YEAR: return year;
        case GET_MONTH:
        case GET_UTC_MONTH: return month;
        case GET_DATE:
        case GET_UTC_DATE: return date;
        case GET_HOURS:
        case GET_UTC_HOURS: return hours;
        case GET_MINUTES:
        case GET_UTC_MINUTES: return minutes;
        case GET_SECONDS:
        case GET_UTC_SECONDS: return seconds;
        case GET_MILLISECONDS:
        case GET_UTC_MILLISECONDS: return milliseconds;
        case GET_DAY:
        case GET_UTC_DAY: return day;
      }

      if (length > 0) {
        var argumentsLength = arguments.length;
        switch (w) {
          case SET_DATE:
          case SET_UTC_DATE:
            date = Number(arguments[0]);
            break;
          case SET_MONTH:
          case SET_UTC_MONTH:
            month = Number(arguments[0]);
            if (argumentsLength > 1) {
              date = Number(arguments[1]);
            }
            break;
          case SET_YEAR:
            year = Number(arguments[0]);
            year -= year % 1;
            if (0 <= year && year <= 99) {
              year += 1900
            }
          case SET_FULL_YEAR:
          case SET_UTC_FULL_YEAR:
            year = Number(arguments[0]);
            if (argumentsLength > 1) {
              month = Number(arguments[1]);
              if (argumentsLength > 2) {
                date = Number(arguments[2]);
              }
            }
            break;
          case SET_MILLISECONDS:
          case SET_UTC_MILLISECONDS:
            milliseconds = Number(arguments[0]);
            break;
          case SET_SECONDS:
          case SET_UTC_SECONDS:
            seconds = Number(arguments[0]);
            if (argumentsLength > 1) {
              milliseconds = Number(arguments[1]);
            }
            break;
          case SET_MINUTES:
          case SET_UTC_MINUTES:
            minutes = Number(arguments[0]);
            if (argumentsLength > 1) {
              seconds = Number(arguments[1]);
              if (argumentsLength > 2) {
                milliseconds = Number(arguments[2]);
              }
            }
            break;
          case SET_HOURS:
          case SET_UTC_HOURS:
            hours = Number(arguments[0]);
            if (argumentsLength > 1) {
              minutes = Number(arguments[1]);
              if (argumentsLength > 2) {
                seconds = Number(arguments[2]);
                if (argumentsLength > 3) {
                  milliseconds =  Number(arguments[3]);
                }
              }
            }
            break;
        }
        var time = clipMakeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds, local);
        this.setTime(time);
        return time;
      }

      var timeString = "";
      var dateString = "";
      var yearString = "";
      var tmp = 0;
      var hhmmss = (hours < 10 ? "0" : "") + hours + ":" +
                   (minutes < 10 ? "0" : "") + minutes + ":" +
                   (seconds < 10 ? "0" : "") + seconds;

      if (w === TO_TIME_STRING || w === TO_STRING || w === TO_DATE_STRING) {
        var offsetHours = Math.floor((offset < 0 ? -offset : offset) / 3600000);
        var offsetMinutes = Math.floor((offset < 0 ? -offset : offset) / 60000) % 60;

        timeString = hhmmss + " GMT" +
          (offset < 0 ? "-" : "+") +
          (offsetHours < 10 ? "0" : "") + offsetHours +
          (offsetMinutes < 10 ? "0" : "") + offsetMinutes;

        yearString = String(year < 0 ? -year : year);
        tmp = 4 - yearString.length;
        while (--tmp >= 0) {
          yearString = "0" + yearString;
        }

        dateString = weekDayNames[day] + " " +
          monthNames[month] + " " +
          (date < 10 ? "0" : "") + date + " " +
          (year < 0 ? "-" : "") + yearString;
      }

      if (w === TO_TIME_STRING) {
        return timeString;
      }

      if (w === TO_DATE_STRING) {
        return dateString;
      }

      if (w === TO_STRING) {
        // Sat Oct 16 -0249 01:33:20 GMT+0600
        return dateString + " " + timeString;
      }

      if (w === TO_UTC_STRING) {
        if (year < 0 || year > 9999) {
          // http://msdn.microsoft.com/en-us/library/ff960740(v=vs.85).aspx says 
          // If YearFromTime(t) is greater than 0, this item is three or more digits from the value of YearFromTime(t),
          // Otherwise, this item is the one or more numbers that correspond to the number that is 
          // 1-YearFromTime(t) followed by a single space character and then followed by B.C.
          // But this is not a valid RFC 1123 !?
          throw new RangeError();//!
        }

        return weekDayNames[day] + ", " +
          (date < 10 ? "0" : "") + date + " " +
          monthNames[month] + " " +
          (year < 10 ? "000" : (year < 100 ? "00" : (year < 1000 ? "0" : ""))) + year + " " +
          hhmmss + " GMT";// GMT or UTC ?
      }

      yearString = String(year < 0 ? -year : year);
      tmp = (year < 0 ? 6 : (year < 1e4 ? 4 : 6)) - yearString.length;
      while (--tmp >= 0) {
        yearString = "0" + yearString;
      }

      return (year < 0 ? "-" : (year < 1e4 ? "" : "+")) + yearString + "-" +
        (month + 1 < 10 ? "0" : "") + (month + 1) + "-" +
        (date < 10 ? "0" : "") + date + "T" +
        hhmmss + "." +
        (milliseconds < 100 ? (milliseconds < 10 ? "00" : "0") : "") + milliseconds + "Z";
    };
    //result.length = length || 0;
    return result;
  }

  function fromISOString(string) {
    var match = isoDateExpression.exec(string);
    if (match) {
      // parse months, days, hours, minutes, seconds, and milliseconds
      // provide default values if necessary
      // parse the UTC offset component
      var year = Number(match[1]);
      var month = Number(match[2] || 1) - 1;
      var day = Number(match[3] || 1) - 1;
      var hour = Number(match[4] || 0);
      var minute = Number(match[5] || 0);
      var second = Number(match[6] || 0); // 59.12456
      // When time zone is missed, local offset should be used (ES 5.1 bug)
      // see https://bugs.ecmascript.org/show_bug.cgi?id=112
      var localOffset = !match[4] || match[7] ? false : true;
      var signOffset = match[8] === "-" ? 1 : -1;
      var hourOffset = Number(match[9] || 0);
      var minuteOffset = Number(match[10] || 0);
      if (hour < (minute > 0 || second > 0 ? 24 : 25) && 
          minute < 60 && second < 60 && 
          month > -1 && month < 12 && hourOffset < 24 && minuteOffset < 60 && // detect invalid offsets
          day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        return clipMakeDateTime(year, month, day, hour + hourOffset * signOffset, minute + minuteOffset * signOffset, second, (second * 1000) % 1000, localOffset);
      }
      return NaN;
    }
    return Infinity;
  }

  function fromUTCString(string) {
    var match = utcDateExpression.exec(string);
    if (match) {
      var day = Number(match[1]) - 1;
      var month = match[2].slice(0, 1).toUpperCase() + match[2].slice(1).toLowerCase();//!
      var year = Number(match[3]);
      var hour = Number(match[4]);
      var minute = Number(match[5]);
      var second = Number(match[6]);
      var i = monthNames.length;
      while (--i >= 0) {
        if (monthNames[i] === month) {
          break;
        }
      }
      month = i;
      if (hour < 24 && minute < 60 && second < 60 && 
          day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        return clipMakeDateTime(year, month, day, hour, minute, second, 0);
      }
      return NaN;
    }
    return Infinity;
  }

  function fromString(string) {
    var match = stringDateExpression.exec(string);
    if (match) {
      var day = Number(match[2]) - 1;
      var month = match[1].slice(0, 1).toUpperCase() + match[1].slice(1).toLowerCase();//!
      var year = Number(match[3]);
      var hour = Number(match[4]);
      var minute = Number(match[5]);
      var second = Number(match[6]);
      var signOffset = match[7] === "-" ? 1 : -1;
      var hourOffset = Number(match[8]);
      var minuteOffset = Number(match[9]);
      var i = monthNames.length;
      while (--i >= 0) {
        if (monthNames[i] === month) {
          break;
        }
      }
      month = i;
      if (hour < 24 && minute < 60 && second < 60 && hourOffset < 24 && minuteOffset < 60 &&
          day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        return clipMakeDateTime(year, month, day, hour + hourOffset * signOffset, minute + minuteOffset * signOffset, second, 0);
      }
      return NaN;
    }
    return Infinity;
  }

  function isPrimitive(input) {
    return input === null || input === undefined || input !== Object(input);
  }

  function ToPrimitive(input) {
    var val;
    if (isPrimitive(input)) {
      return input;
    }
    var valueOf = input.valueOf;
    if (typeof valueOf === "function") {
      val = valueOf.call(input);
      if (isPrimitive(val)) {
        return val;
      }
    }
    var toString = input.toString;
    if (typeof toString === "function") {
      val = toString.call(input);
      if (isPrimitive(val)) {
        return val;
      }
    }
    throw new TypeError();
  }

  NativeDate.prototype.toJSON = function toJSON(key) {
    var o = Object(this);
    var tv = ToPrimitive(o);
    if (typeof tv === "number" && !isFinite(tv)) {
      return null;
    }
    var toISO = o.toISOString;
    if (typeof toISO !== "function") {
      throw new TypeError("toISOString property is not callable");
    }
    return toISO.call(o);
  };

  function parse(s) {
    var x = 0;
    x = fromISOString(s);
    if (x !== Infinity) {
      return x;
    }
    x = fromUTCString(s);
    if (x !== Infinity) {
      return x;
    }
    x = fromString(s);
    if (x !== Infinity) {
      return x;
    }
    return nativeParse.apply(this, arguments);
  }

  NativeDate.parse = parse;

  NativeDate.UTC = function UTC(year, month, date, hours, minutes, seconds, milliseconds) {
    // http://msdn.microsoft.com/en-us/library/ff960764(v=vs.85).aspx
    var argumentsLength = arguments.length;
    year = argumentsLength < 1 ? 0 : Number(year);
    month = argumentsLength < 2 ? 0 : Number(month);
    date = argumentsLength < 3 ? 1 : Number(date);
    hours = argumentsLength < 4 ? 0 : Number(hours);
    minutes = argumentsLength < 5 ? 0 : Number(minutes);
    seconds = argumentsLength < 6 ? 0 : Number(seconds);
    milliseconds = argumentsLength < 7 ? 0 : Number(milliseconds);
    year -= year % 1;
    if (0 <= year && year <= 99) {
      year += 1900;
    }
    return clipMakeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds);
  };

  NativeDate.now = function now() {
    return Number(new NativeDate());
  };

  NativeDate.prototype.constructor = NativeDate;

  //NativeDate.prototype.valueOf - native
  //NativeDate.prototype.getTime - native
  //NativeDate.prototype.setTime - native
  //NativeDate.prototype.getTimezoneOffset - native
  //NativeDate.prototype.toLocaleString - native
  //NativeDate.prototype.toLocaleDateString - native
  //NativeDate.prototype.toLocaleTimeString - native

  NativeDate.prototype.getUTCFullYear = createMethod(GET_UTC_FULL_YEAR);
  NativeDate.prototype.getUTCMonth = createMethod(GET_UTC_MONTH);
  NativeDate.prototype.getUTCDate = createMethod(GET_UTC_DATE);
  NativeDate.prototype.getUTCHours = createMethod(GET_UTC_HOURS);
  NativeDate.prototype.getUTCMinutes = createMethod(GET_UTC_MINUTES);
  NativeDate.prototype.getUTCSeconds = createMethod(GET_UTC_SECONDS);
  NativeDate.prototype.getUTCMilliseconds = createMethod(GET_UTC_MILLISECONDS);
  NativeDate.prototype.getUTCDay = createMethod(GET_UTC_DAY);

  NativeDate.prototype.getFullYear = createMethod(GET_FULL_YEAR);
  NativeDate.prototype.getMonth = createMethod(GET_MONTH);
  NativeDate.prototype.getDate = createMethod(GET_DATE);
  NativeDate.prototype.getHours = createMethod(GET_HOURS);
  NativeDate.prototype.getMinutes = createMethod(GET_MINUTES);
  NativeDate.prototype.getSeconds = createMethod(GET_SECONDS);
  NativeDate.prototype.getMilliseconds = createMethod(GET_MILLISECONDS);
  NativeDate.prototype.getDay = createMethod(GET_DAY);

  NativeDate.prototype.setUTCFullYear = createMethod(SET_UTC_FULL_YEAR, 3);
  NativeDate.prototype.setUTCMonth = createMethod(SET_UTC_MONTH, 2);
  NativeDate.prototype.setUTCDate = createMethod(SET_UTC_DATE, 1);
  NativeDate.prototype.setUTCHours = createMethod(SET_UTC_HOURS, 4);
  NativeDate.prototype.setUTCMinutes = createMethod(SET_UTC_MINUTES, 3);
  NativeDate.prototype.setUTCSeconds = createMethod(SET_UTC_SECONDS, 2);
  NativeDate.prototype.setUTCMilliseconds = createMethod(SET_UTC_MILLISECONDS, 1);

  NativeDate.prototype.setFullYear = createMethod(SET_FULL_YEAR, 3);
  NativeDate.prototype.setMonth = createMethod(SET_MONTH, 2);
  NativeDate.prototype.setDate = createMethod(SET_DATE, 1);
  NativeDate.prototype.setHours = createMethod(SET_HOURS, 4);
  NativeDate.prototype.setMinutes = createMethod(SET_MINUTES, 3);
  NativeDate.prototype.setSeconds = createMethod(SET_SECONDS, 2);
  NativeDate.prototype.setMilliseconds = createMethod(SET_MILLISECONDS, 1);

  NativeDate.prototype.toISOString = createMethod(TO_ISO_STRING);
  NativeDate.prototype.toUTCString = createMethod(TO_UTC_STRING);

  NativeDate.prototype.toString = createMethod(TO_STRING);
  NativeDate.prototype.toDateString = createMethod(TO_DATE_STRING);
  NativeDate.prototype.toTimeString = createMethod(TO_TIME_STRING);

  // Additional Properties:
  NativeDate.prototype.toGMTString = NativeDate.prototype.toUTCString;
  NativeDate.prototype.getYear = createMethod(GET_YEAR);
  NativeDate.prototype.setYear = createMethod(SET_YEAR);

  function D(year, month, date, hours, minutes, seconds, milliseconds) {
    var value = NaN;
    var argumentsLength = arguments.length;
    if (argumentsLength) {
      if (argumentsLength === 1) {
        if (Object.prototype.toString.call(year) === "[object String]") {
          value = parse(year);
        } else {
          value = Number(year);
        }
      } else {
        year = argumentsLength < 1 ? 0 : Number(year);
        month = argumentsLength < 2 ? 0 : Number(month);
        date = argumentsLength < 3 ? 1 : Number(date);
        hours = argumentsLength < 4 ? 0 : Number(hours);
        minutes = argumentsLength < 5 ? 0 : Number(minutes);
        seconds = argumentsLength < 6 ? 0 : Number(seconds);
        milliseconds = argumentsLength < 7 ? 0 : Number(milliseconds);
        value = clipMakeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds, true);
      }
    } else {
      value = Number(new NativeDate());
    }
    if (this instanceof NativeDate) {
      return new NativeDate(value);
    }
    return new NativeDate(value).toString();
  }
  D.parse = NativeDate.parse;
  D.UTC = NativeDate.UTC;
  D.now = NativeDate.now;

  NativeDate.prototype.constructor = D;
  D.prototype = NativeDate.prototype;

  return D;
}(Date));
