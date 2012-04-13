
this.Date = (function (NativeDate) {

  var isoDateExpression = /^(\d{4}|[+\-]\d{6})(?:\-(\d{2})(?:\-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(Z|(?:([\-\+])(\d{2}):(\d{2})))?)?)?)?$/,
      utcDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d\d)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d\d\d\d)\s+(\d\d)\:(\d\d)\:(\d\d)\s+GMT$/i,
      monthes = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
      weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var nativeToString = NativeDate.prototype.toString;
  var nativeParse = NativeDate.parse;

  function dayFromMonth(year, month) {
    var t = month > 1 ? 1 : 0;
    return monthes[month] + Math.floor((year - 1969 + t) / 4) - Math.floor((year - 1901 + t) / 100) + Math.floor((year - 1601 + t) / 400) + 365 * (year - 1970);
  }

  function createGetXXXFromTime(w) {
    return function () {
      var t = this;

      if (Object.prototype.toString.call(t) !== '[object Date]') {
        throw new TypeError();
      }

      t = Number(t);
      t -= t % 1; // ToInteger
      if (!(-8.64e15 <= t && t <= 8.64e15)) { // isFinite(t) && |t| < 8.64e15
        if (w === 'iso') {
          throw new RangeError();
        }
        if (w === 'string') {
          return "Invalid Date";
        }
        return NaN;
      }

      if (w === 'string') {
        return nativeToString.apply(this, arguments);
      }

      var timePart = (t % 86400000 + 86400000) % 86400000,
          milliseconds = timePart % 1000,
          seconds = Math.floor(timePart / 1000) % 60,
          minutes = Math.floor(timePart / 60000) % 60,
          hours = Math.floor(timePart / 3600000) % 24,
          year,
          month,
          date,
          day,
          yearString,
          tmp;

      t = Math.floor(t / 86400000);
      year = Math.floor(t / 365.2425) + 1970 - 1;
      // this circle will iterate no more than 2 times
      while (dayFromMonth(year + 1, 0) <= t) {
        year += 1;
      }

      month = Math.floor((t - dayFromMonth(year, 0)) / 30.42);// 30.42 > 365 / 12 = max(day / month(day)) for any day
      // this circle will iterate no more than once
      while (dayFromMonth(year, month + 1) <= t) {
        month += 1;
      }

      date = 1 + t - dayFromMonth(year, month);

      day = (t % 7 + 11) % 7;

      switch (w) {
        case 'year': return year;
        case 'month': return month;
        case 'date': return date;
        case 'hours': return hours;
        case 'minutes': return minutes;
        case 'seconds': return seconds;
        case 'milliseconds': return milliseconds;
        case 'day': return day;
        case 'set':
          var setYear = arguments[0];
          var setMonth = arguments[1];
          var setDate = arguments[2];
          var setHours = arguments[3];
          var setMinutes = arguments[4];
          var setSeconds = arguments[5];
          var setMilliseconds = arguments[6];
          setYear = setYear === undefined ? year : setYear;
          setMonth = setMonth === undefined ? month : setMonth;
          setDate = setDate === undefined ? date : setDate;
          setHours = setHours === undefined ? hours : setHours;
          setMinutes = setMinutes === undefined ? minutes : setMinutes;
          setSeconds = setSeconds === undefined ? seconds : setSeconds;
          setMilliseconds = setMilliseconds === undefined ? milliseconds : setMilliseconds;
          setYear += Math.floor(setMonth / 12);
          setMonth = (setMonth % 12 + 12) % 12;
          tmp = (((dayFromMonth(setYear, setMonth, setDate) * 24 + setHours) * 60 + setMinutes) * 60 + setSeconds) * 1000 + setMilliseconds;
          tmp = -8.64e15 <= tmp && tmp <= 8.64e15 ? tmp : NaN;
          this.setTime(tmp);
          return tmp;
      }

      if (w === 'rfc1123') {
        if (year < 0 || year > 9999) {
          throw new RangeError();//!
        }

        return weekDayNames[day] + ', ' +
          (date < 10 ? '0' : '') + date + ' ' +
          monthNames[month] + ' ' +
          (year < 10 ? '000' : (year < 100 ? '00' : (year < 1000 ? '0' : ''))) + year + ' ' +
          (hours < 10 ? '0' : '') + hours + ':' +
          (minutes < 10 ? '0' : '') + minutes + ':' +
          (seconds < 10 ? '0' : '') + seconds + ' GMT';
      }

      yearString = String(year < 0 ? -year : year);
      tmp = (year < 0 ? 6 : (year < 1e4 ? 4 : 6)) - yearString.length;
      while (tmp > 0) {
        yearString = '0' + yearString;
        tmp -= 1;
      }

      return (year < 0 ? '-' : (year < 1e4 ? '' : '+')) + yearString + '-' +
        (month + 1 < 10 ? '0' : '') + (month + 1) + '-' +
        (date < 10 ? '0' : '') + date + 'T' +
        (hours < 10 ? '0' : '') + hours + ':' +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds + '.' +
        (milliseconds < 100 ? (milliseconds < 10 ? '00' : '0') : '') + milliseconds + 'Z';
    };
  }

  function fromISOString(string) {
    var match = isoDateExpression.exec(string);
    if (match) {
      // parse months, days, hours, minutes, seconds, and milliseconds
      // provide default values if necessary
      // parse the UTC offset component
      var year = Number(match[1]),
          month = Number(match[2] || 1) - 1,
          day = Number(match[3] || 1) - 1,
          hour = Number(match[4] || 0),
          minute = Number(match[5] || 0),
          second = Number(match[6] || 0),
          millisecond = Number(match[7] || 0),
          // When time zone is missed, local offset should be used (ES 5.1 bug)
          // see https://bugs.ecmascript.org/show_bug.cgi?id=112
          offset = !match[4] || match[8] ? 0 : 1,
          signOffset = match[9] === "-" ? 1 : -1,
          hourOffset = Number(match[10] || 0),
          minuteOffset = Number(match[11] || 0),
          result;
      if (hour < (minute > 0 || second > 0 || millisecond > 0 ? 24 : 25) && 
          minute < 60 && second < 60 && millisecond < 1000 && 
          month > -1 && month < 12 && hourOffset < 24 && minuteOffset < 60 && // detect invalid offsets
          day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        result = ((dayFromMonth(year, month) + day) * 24 + hour + hourOffset * signOffset) * 60;
        result = ((result + minute + minuteOffset * signOffset) * 60 + second) * 1000 + millisecond;
        if (offset) {
          return null; //!local offset not supported
        }
        if (-8.64e15 <= result && result <= 8.64e15) {
          return result;
        }
      }
      return NaN;
    }
    return null;
  }

  function fromUTCString(string) {
    var match = utcDateExpression.exec(string);
    if (match) {
      var day = Number(match[1]) - 1,
          month = match[2],//!
          year = Number(match[3]),
          hour = Number(match[4]),
          minute = Number(match[5]),
          second = Number(match[6]),
          result,
          i;
      for (i = monthNames.length - 1; i >= 0; i -= 1) {
        if (monthNames[i].toLowerCase() === month.toLowerCase()) {
          break;
        }
      }
      month = i;
      if (hour < 24 && minute < 60 && second < 60 && 
          day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        result = ((dayFromMonth(year, month) + day) * 24 + hour) * 60;
        result = ((result + minute) * 60 + second) * 1000;
        if (-8.64e15 <= result && result <= 8.64e15) {
          return result;
        }
      }
      return NaN;
    }
    return null;
  }

  function isPrimitive(input) {
    var t = typeof input;
    return input === null || t === "undefined" || t === "boolean" || t === "number" || t === "string";
  }

  function ToPrimitive(input) {
    var val, valueOf, toString;
    if (isPrimitive(input)) {
      return input;
    }
    valueOf = input.valueOf;
    if (typeof valueOf === "function") {
      val = valueOf.call(input);
      if (isPrimitive(val)) {
        return val;
      }
    }
    toString = input.toString;
    if (typeof toString === "function") {
      val = toString.call(input);
      if (isPrimitive(val)) {
        return val;
      }
    }
    throw new TypeError();
  }

  NativeDate.prototype.toJSON = function toJSON(key) {
    var o = Object(this),
        tv = ToPrimitive(o),
        toISO;
    if (typeof tv === 'number' && !isFinite(tv)) {
      return null;
    }
    toISO = o.toISOString;
    if (typeof toISO !== "function") {
      throw new TypeError('toISOString property is not callable');
    }
    return toISO.call(o);
  };

  NativeDate.parse = function (s) {
    var x;
    if (isoDateExpression.test(s)) {
      x = fromISOString(s);
      if (x !== null) {
        return x;
      }
    }
    x = fromUTCString(s);
    if (x === null) {
      return nativeParse.apply(this, arguments);
    }
    return x;
  };

  NativeDate.now = function now() {
    return Number(new NativeDate());
  };

  NativeDate.UTC = function UTC(year, month, date, hours, minutes, seconds, milliseconds) {
    var argumentsLength = arguments.length;
    year = argumentsLength < 1 ? 1970 : Number(year);
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
    month -= month % 1;
    date -= date % 1;
    year += Math.floor(month / 12);
    month = (month % 12 + 12) % 12;
    var result = (dayFromMonth(year, month) + date - 1);
    hours -= hours % 1;
    minutes -= minutes % 1;
    seconds -= seconds % 1;
    milliseconds -= milliseconds % 1;
    result = (((result * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
    if (-8.64e15 <= result && result <= 8.64e15) {
      return result;
    }
    return NaN;
  };

  NativeDate.prototype.getUTCFullYear = createGetXXXFromTime('year');
  NativeDate.prototype.getUTCMonth = createGetXXXFromTime('month');
  NativeDate.prototype.getUTCDate = createGetXXXFromTime('date');
  NativeDate.prototype.getUTCHours = createGetXXXFromTime('hours');
  NativeDate.prototype.getUTCMinutes = createGetXXXFromTime('minutes');
  NativeDate.prototype.getUTCSeconds = createGetXXXFromTime('seconds');
  NativeDate.prototype.getUTCMilliseconds = createGetXXXFromTime('milliseconds');
  NativeDate.prototype.getUTCDay = createGetXXXFromTime('day');

  var set = createGetXXXFromTime('set');
  NativeDate.prototype.setUTCDate = function (date) {
    date = Number(date);
    return set.call(this, undefined, undefined, date, undefined, undefined, undefined, undefined);
  };
  NativeDate.prototype.setUTCMonth = function (month, date) {
    month = Number(month);
    date = arguments.length < 2 ? undefined : Number(date);
    return set.call(this, undefined, month, date, undefined, undefined, undefined, undefined);
  };
  NativeDate.prototype.setUTCFullYear = function (year, month, date) {
    year = Number(year);
    month = arguments.length < 2 ? undefined : Number(month);
    date = arguments.length < 3 ? undefined : Number(date);
    return set.call(this, year, month, date, undefined, undefined, undefined, undefined);
  };
  NativeDate.prototype.setUTCMilliseconds = function (ms) {
    ms = Number(ms);
    return set.call(this, undefined, undefined, undefined, undefined, undefined, undefined, ms);
  };
  NativeDate.prototype.setUTCSeconds = function (sec, ms) {
    sec = Number(sec);
    ms = arguments.length < 2 ? undefined : Number(ms);
    return set.call(this, undefined, undefined, undefined, undefined, undefined, sec, ms);
  };
  NativeDate.prototype.setUTCMinutes = function (min, sec, ms) {
    min = Number(min);
    sec = arguments.length < 2 ? undefined : Number(sec);
    ms = arguments.length < 3 ? undefined : Number(ms);
    return set.call(this, undefined, undefined, undefined, undefined, min, sec, ms);
  };
  NativeDate.prototype.setUTCHours = function (hour, min, sec, ms) {
    hour = Number(hour);
    min = arguments.length < 2 ? undefined : Number(min);
    sec = arguments.length < 3 ? undefined : Number(sec);
    ms = arguments.length < 3 ? undefined : Number(ms);
    return set.call(this, undefined, undefined, undefined, hour, min, sec, ms);
  };

  NativeDate.prototype.toISOString = createGetXXXFromTime('iso');
  NativeDate.prototype.toUTCString = createGetXXXFromTime('rfc1123');
  NativeDate.prototype.toString = createGetXXXFromTime('string');

  // deprecated:
  NativeDate.prototype.toGMTString = createGetXXXFromTime('rfc1123');
  var getFullYear = NativeDate.prototype.getFullYear;
  var setFullYear = NativeDate.prototype.setFullYear;
  NativeDate.prototype.getYear = function () {// IE 8
    return getFullYear.apply(this, arguments) - 1900;
  };
  //NativeDate.prototype.setYear - OK

  /*
  function D(year, month, date, hours, minutes, seconds, milliseconds) {
    var x = new NativeDate();
    var argumentsLength = arguments.length;
    if (argumentsLength) {
      var z;
      if (argumentsLength === 1) { 
        if (Object.prototype.toString.call(year) === '[object String]') {
          z = NativeDate.parse(year);
        } else {
          z = Number(year);
        }
      } else {
        // depends on local offset and dst, so can't replace
        year = argumentsLength < 1 ? 1970 : Number(year);
        month = argumentsLength < 2 ? 0 : Number(month);
        date = argumentsLength < 3 ? 1 : Number(date);
        hours = argumentsLength < 4 ? 0 : Number(hours);
        minutes = argumentsLength < 5 ? 0 : Number(minutes);
        seconds = argumentsLength < 6 ? 0 : Number(seconds);
        milliseconds = argumentsLength < 7 ? 0 : Number(milliseconds);
        z = new NativeDate(year, month, date, hours, minutes, seconds, milliseconds).getTime();
      }
      x.setTime(z);
    }
    if (this instanceof D) {
      return x;
    }
    return String(x);
  }
  NativeDate.prototype.constructor = D;
  D.prototype = NativeDate.prototype;
  D.UTC = NativeDate.UTC;
  D.now = NativeDate.now;
  D.parse = NativeDate.parse;

  return D;
  */
  return Date;
}(Date));
