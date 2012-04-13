
this.Date = (function (NativeDate) {

  var isoDateExpression = /^(\d{4}|[+\-]\d{6})(?:\-(\d{2})(?:\-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(Z|(?:([\-\+])(\d{2}):(\d{2})))?)?)?)?$/,
      utcDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d\d)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d\d\d\d)\s+(\d\d)\:(\d\d)\:(\d\d)\s+GMT$/i,
      monthes = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
      weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      nativeToString = NativeDate.prototype.toString,
      nativeParse = NativeDate.parse;

  function dayFromMonth(year, month) {
    var t = month > 1 ? 1 : 0;
    return monthes[month] + Math.floor((year - 1969 + t) / 4) - Math.floor((year - 1901 + t) / 100) + Math.floor((year - 1601 + t) / 400) + 365 * (year - 1970);
  }

  function clipMakeDateTime(year, month, date, hour, minute, second, millisecond) {
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
    return -8.64e15 <= t && t <= 8.64e15 ? t : NaN;
  }

  function createMethod(w, length) {
    var result = function () {
      var t = this;

      if (Object.prototype.toString.call(t) !== '[object Date]') {
        throw new TypeError();
      }

      t = Number(t);
      t -= t % 1; // ToInteger
      if (!(-8.64e15 <= t && t <= 8.64e15)) { // isFinite(t) && |t| < 8.64e15
        if (w === 'toISOString') {
          throw new RangeError();
        }
        if (w === 'toString') {
          return 'Invalid Date';
        }
        return NaN;
      }

      if (w === 'toString') {
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
        case 'getUTCFullYear': return year;
        case 'getUTCMonth': return month;
        case 'getUTCDate': return date;
        case 'getUTCHours': return hours;
        case 'getUTCMinutes': return minutes;
        case 'getUTCSeconds': return seconds;
        case 'getUTCMilliseconds': return milliseconds;
        case 'getUTCDay': return day;
      }

      if (length) {
        switch (w) {
          case 'setUTCDate':
            date = Number(arguments[0]);
            break;
          case 'setUTCMonth':
            month = Number(arguments[0]);
            date = arguments.length < 2 ? date : Number(arguments[1]);
            break;
          case 'setUTCFullYear':
            year = Number(arguments[0]);
            month = arguments.length < 2 ? undefined : Number(arguments[1]);
            date = arguments.length < 3 ? undefined : Number(arguments[2]);
            break;
          case 'setUTCMilliseconds':
            milliseconds = Number(arguments[0]);
            break;
          case 'setUTCSeconds':
            seconds = Number(arguments[0]);
            milliseconds = arguments.length < 2 ? undefined : Number(arguments[1]);
            break;
          case 'setUTCMinutes':
            minutes = Number(arguments[0]);
            seconds = arguments.length < 2 ? undefined : Number(arguments[1]);
            milliseconds = arguments.length < 3 ? undefined : Number(arguments[2]);
            break;
          case 'setUTCHours':
            hours = Number(arguments[0]);
            minutes = arguments.length < 2 ? undefined : Number(arguments[1]);
            seconds = arguments.length < 3 ? undefined : Number(arguments[2]);
            milliseconds = arguments.length < 4 ? undefined : Number(arguments[3]);
            break;
        }
        tmp = clipMakeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds);
        this.setTime(tmp);
        return tmp;
      }

      if (w === 'toUTCString') {
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
    result.length = length || 0;
    return result;
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
      if (offset) {
        return null; //!local offset not supported
      }
      if (hour < (minute > 0 || second > 0 || millisecond > 0 ? 24 : 25) && 
          minute < 60 && second < 60 && millisecond < 1000 && 
          month > -1 && month < 12 && hourOffset < 24 && minuteOffset < 60 && // detect invalid offsets
          day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {        
        return clipMakeDateTime(year, month, day, hour + hourOffset * signOffset, minute + minuteOffset * signOffset, second, millisecond);
      }
      return NaN;
    }
    return null;
  }

  function fromUTCString(string) {
    var match = utcDateExpression.exec(string);
    if (match) {
      var day = Number(match[1]) - 1,
          month = match[2].toLowerCase(),//!
          year = Number(match[3]),
          hour = Number(match[4]),
          minute = Number(match[5]),
          second = Number(match[6]),
          result,
          i;
      for (i = monthNames.length - 1; i >= 0; i -= 1) {
        if (monthNames[i].toLowerCase() === month) {
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
    return null;
  }

  function isPrimitive(input) {
    return input == null || input !== Object(input);
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
    return clipMakeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds);
  };

  NativeDate.prototype.getUTCFullYear = createMethod('getUTCFullYear');
  NativeDate.prototype.getUTCMonth = createMethod('getUTCMonth');
  NativeDate.prototype.getUTCDate = createMethod('getUTCDate');
  NativeDate.prototype.getUTCHours = createMethod('getUTCHours');
  NativeDate.prototype.getUTCMinutes = createMethod('getUTCMinutes');
  NativeDate.prototype.getUTCSeconds = createMethod('getUTCSeconds');
  NativeDate.prototype.getUTCMilliseconds = createMethod('getUTCMilliseconds');
  NativeDate.prototype.getUTCDay = createMethod('getUTCDay');

  NativeDate.prototype.setUTCDate = createMethod('setUTCDate', 1);
  NativeDate.prototype.setUTCMonth = createMethod('setUTCMonth', 2);
  NativeDate.prototype.setUTCFullYear = createMethod('setUTCFullYear', 3);
  NativeDate.prototype.setUTCMilliseconds = createMethod('setUTCMilliseconds', 1);
  NativeDate.prototype.setUTCSeconds = createMethod('setUTCSeconds', 2);
  NativeDate.prototype.setUTCMinutes = createMethod('setUTCMinutes', 3);
  NativeDate.prototype.setUTCHours = createMethod('setUTCHours', 4);

  NativeDate.prototype.toISOString = createMethod('toISOString');
  NativeDate.prototype.toUTCString = createMethod('toUTCString');
  NativeDate.prototype.toString = createMethod('toString');

  // deprecated:
  NativeDate.prototype.toGMTString = createMethod('toUTCString');
  var getFullYear = NativeDate.prototype.getFullYear;
  NativeDate.prototype.getYear = function () {// IE 8
    return getFullYear.apply(this, arguments) - 1900;
  };
  //var setFullYear = NativeDate.prototype.setFullYear;
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
