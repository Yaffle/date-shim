
this.Date = (function (NativeDate) {

  var isoDateExpression = /^(\d{4}|[+\-]\d{6})(?:\-(\d{2})(?:\-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(Z|(?:([\-\+])(\d{2}):(\d{2})))?)?)?)?$/,
      utcDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d\d)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d\d\d\d)\s+(\d\d)\:(\d\d)\:(\d\d)\s+(?:GMT|UTC)$/i,
      stringDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)\s+(\-?\d+)\s+(\d\d)\:(\d\d)\:(\d\d)\s+(?:GMT|UTC)([\+\-])(\d\d)(\d\d)$/i,
      monthes = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
      weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      nativeParse = NativeDate.parse;

  function dayFromMonth(year, month) {
    var t = month > 1 ? 1 : 0;
    return monthes[month] + Math.floor((year - 1969 + t) / 4) - Math.floor((year - 1901 + t) / 100) + Math.floor((year - 1601 + t) / 400) + 365 * (year - 1970);
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
      return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
    }
    return -8.64e15 <= t && t <= 8.64e15 ? t : NaN;
  }

  function createMethod(w, length) {
    var local = false;
    switch (w) {
      case 'getFullYear':
      case 'getMonth':
      case 'getDate':
      case 'getHours':
      case 'getMinutes':
      case 'getSeconds':
      case 'getMilliseconds':
      case 'getDay':
      case 'toString':
      case 'toTimeString':
      case 'toDateString':
      case 'setFullYear':
      case 'setMonth':
      case 'setDate':
      case 'setHours':
      case 'setMinutes':
      case 'setSeconds':
      case 'setMilliseconds':
        local = true;
    }

    var result = function () {
      var t = this;

      if (Object.prototype.toString.call(t) !== '[object Date]') {
        throw new TypeError();
      }

      t = Number(t);
      t -= t % 1; // ToInteger
      if (!(-8.64e15 <= t && t <= 8.64e15)) { // isFinite(t) && |t| < 8.64e15
        if (w === 'toISOString' || w === 'toUTCString' || w === 'toGMTString') {
          throw new RangeError();
        }
        if (w === 'toString') {
          return 'Invalid Date';
        }
        return NaN;
      }

      var offset = 0;
      if (local) {
        offset = -new NativeDate(t).getTimezoneOffset() * 60000;//bugs?
        t += offset;
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
        case 'getFullYear':
        case 'getUTCFullYear': return year;
        case 'getMonth':
        case 'getUTCMonth': return month;
        case 'getDate':
        case 'getUTCDate': return date;
        case 'getHours':
        case 'getUTCHours': return hours;
        case 'getMinutes':
        case 'getUTCMinutes': return minutes;
        case 'getSeconds':
        case 'getUTCSeconds': return seconds;
        case 'getMilliseconds':
        case 'getUTCMilliseconds': return milliseconds;
        case 'getDay':
        case 'getUTCDay': return day;
      }

      if (length) {
        var argumentsLength = arguments.length;
        switch (w) {
          case 'setDate':
          case 'setUTCDate':
            date = Number(arguments[0]);
            break;
          case 'setMonth':
          case 'setUTCMonth':
            month = Number(arguments[0]);
            if (argumentsLength > 1) {
              date = Number(arguments[1]);
            }
            break;
          case 'setFullYear':
          case 'setUTCFullYear':
            year = Number(arguments[0]);
            if (argumentsLength > 1) {
              month = Number(arguments[1]);
              if (argumentsLength > 2) {
                date = Number(arguments[2]);
              }
            }
            break;
          case 'setMilliseconds':
          case 'setUTCMilliseconds':
            milliseconds = Number(arguments[0]);
            break;
          case 'setSeconds':
          case 'setUTCSeconds':
            seconds = Number(arguments[0]);
            if (argumentsLength > 1) {
              milliseconds = Number(arguments[1]);
            }
            break;
          case 'setMinutes':
          case 'setUTCMinutes':
            minutes = Number(arguments[0]);
            if (argumentsLength > 1) {
              seconds = Number(arguments[1]);
              if (argumentsLength > 2) {
                milliseconds = Number(arguments[2]);
              }
            }
            break;
          case 'setHours':
          case 'setUTCHours':
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
        tmp = clipMakeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds, local);
        this.setTime(tmp);
        return tmp;
      }

      var timeString;
      var dateString;

      if (w === 'toTimeString' || w === 'toString' || w === 'toDateString') {
        var offsetHours = Math.floor((offset < 0 ? -offset : offset) / 3600000);
        var offsetMinutes = Math.floor((offset < 0 ? -offset : offset) / 60000) % 60;

        timeString = (hours < 10 ? '0' : '') + hours + ':' +
          (minutes < 10 ? '0' : '') + minutes + ':' +
          (seconds < 10 ? '0' : '') + seconds + ' GMT' +
          (offset < 0 ? '-' : '+') +
          (offsetHours < 10 ? '0' : '') + offsetHours +
          (offsetMinutes < 10 ? '0' : '') + offsetMinutes;

        yearString = String(year < 0 ? -year : year);
        tmp = 4 - yearString.length;
        while (tmp > 0) {
          yearString = '0' + yearString;
          tmp -= 1;
        }

        dateString = weekDayNames[day] + ' ' +
          monthNames[month] + ' ' +
          (date < 10 ? '0' : '') + date + ' ' +
          (year < 0 ? '-' : '') + yearString;
      }

      if (w === 'toTimeString') {
        return timeString;
      }
      
      if (w === 'toDateString') {
        return dateString;
      }

      if (w === 'toString') {
        // Sat Oct 16 -0249 01:33:20 GMT+0600
        return dateString + ' ' + timeString;
      }

      if (w === 'toUTCString' || w === 'toGMTString') {
        if (year < 0 || year > 9999) {
          // http://msdn.microsoft.com/en-us/library/ff960740(v=vs.85).aspx says 
          // If YearFromTime(t) is greater than 0, this item is three or more digits from the value of YearFromTime(t),
          // Otherwise, this item is the one or more numbers that correspond to the number that is 
          // 1-YearFromTime(t) followed by a single space character and then followed by B.C.
          // But this is not a valid RFC 1123 !?
          throw new RangeError();//!
        }

        return weekDayNames[day] + ', ' +
          (date < 10 ? '0' : '') + date + ' ' +
          monthNames[month] + ' ' +
          (year < 10 ? '000' : (year < 100 ? '00' : (year < 1000 ? '0' : ''))) + year + ' ' +
          (hours < 10 ? '0' : '') + hours + ':' +
          (minutes < 10 ? '0' : '') + minutes + ':' +
          (seconds < 10 ? '0' : '') + seconds + ' GMT';// GMT or UTC ?
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
          localOffset = !match[4] || match[8] ? false : true,
          signOffset = match[9] === "-" ? 1 : -1,
          hourOffset = Number(match[10] || 0),
          minuteOffset = Number(match[11] || 0);
      if (hour < (minute > 0 || second > 0 || millisecond > 0 ? 24 : 25) && 
          minute < 60 && second < 60 && millisecond < 1000 && 
          month > -1 && month < 12 && hourOffset < 24 && minuteOffset < 60 && // detect invalid offsets
          day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        return clipMakeDateTime(year, month, day, hour + hourOffset * signOffset, minute + minuteOffset * signOffset, second, millisecond, localOffset);
      }
      return NaN;
    }
    return null;
  }

  function fromUTCString(string) {
    var match = utcDateExpression.exec(string);
    if (match) {
      var day = Number(match[1]) - 1,
          month = match[2].slice(0, 1).toUpperCase() + match[2].slice(1).toLowerCase(),//!
          year = Number(match[3]),
          hour = Number(match[4]),
          minute = Number(match[5]),
          second = Number(match[6]),
          i;
      for (i = monthNames.length - 1; i >= 0; i -= 1) {
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
    return null;
  }

  function fromString(string) {
    var match = stringDateExpression.exec(string);
    if (match) {
      var day = Number(match[2]) - 1,
          month = match[1].slice(0, 1).toUpperCase() + match[1].slice(1).toLowerCase(),//!
          year = Number(match[3]),
          hour = Number(match[4]),
          minute = Number(match[5]),
          second = Number(match[6]),
          signOffset = match[7] === "-" ? 1 : -1,
          hourOffset = Number(match[8]),
          minuteOffset = Number(match[9]),
          i;
      for (i = monthNames.length - 1; i >= 0; i -= 1) {
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
    x = fromISOString(s);
    if (x !== null) {
      return x;
    }
    x = fromUTCString(s);
    if (x !== null) {
      return x;
    }
    x = fromString(s);
    if (x !== null) {
      return x;
    }
    return nativeParse.apply(this, arguments);
  };

  NativeDate.now = function now() {
    return Number(new NativeDate());
  };

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

  //NativeDate.prototype.constructor - native
  //NativeDate.prototype.valueOf - native
  //NativeDate.prototype.getTime - native
  //NativeDate.prototype.setTime - native
  //NativeDate.prototype.getTimezoneOffset - native

  NativeDate.prototype.getUTCFullYear = createMethod('getUTCFullYear');
  NativeDate.prototype.getUTCMonth = createMethod('getUTCMonth');
  NativeDate.prototype.getUTCDate = createMethod('getUTCDate');
  NativeDate.prototype.getUTCHours = createMethod('getUTCHours');
  NativeDate.prototype.getUTCMinutes = createMethod('getUTCMinutes');
  NativeDate.prototype.getUTCSeconds = createMethod('getUTCSeconds');
  NativeDate.prototype.getUTCMilliseconds = createMethod('getUTCMilliseconds');
  NativeDate.prototype.getUTCDay = createMethod('getUTCDay');

  NativeDate.prototype.getFullYear = createMethod('getFullYear');
  NativeDate.prototype.getMonth = createMethod('getMonth');
  NativeDate.prototype.getDate = createMethod('getDate');
  NativeDate.prototype.getHours = createMethod('getHours');
  NativeDate.prototype.getMinutes = createMethod('getMinutes');
  NativeDate.prototype.getSeconds = createMethod('getSeconds');
  NativeDate.prototype.getMilliseconds = createMethod('getMilliseconds');
  NativeDate.prototype.getDay = createMethod('getDay');

  NativeDate.prototype.setUTCFullYear = createMethod('setUTCFullYear', 3);
  NativeDate.prototype.setUTCMonth = createMethod('setUTCMonth', 2);
  NativeDate.prototype.setUTCDate = createMethod('setUTCDate', 1);
  NativeDate.prototype.setUTCHours = createMethod('setUTCHours', 4);
  NativeDate.prototype.setUTCMinutes = createMethod('setUTCMinutes', 3);
  NativeDate.prototype.setUTCSeconds = createMethod('setUTCSeconds', 2);
  NativeDate.prototype.setUTCMilliseconds = createMethod('setUTCMilliseconds', 1);

  NativeDate.prototype.setFullYear = createMethod('setFullYear', 3);
  NativeDate.prototype.setMonth = createMethod('setMonth', 2);
  NativeDate.prototype.setDate = createMethod('setDate', 1);
  NativeDate.prototype.setHours = createMethod('setHours', 4);
  NativeDate.prototype.setMinutes = createMethod('setMinutes', 3);
  NativeDate.prototype.setSeconds = createMethod('setSeconds', 2);
  NativeDate.prototype.setMilliseconds = createMethod('setMilliseconds', 1);

  NativeDate.prototype.toISOString = createMethod('toISOString');
  NativeDate.prototype.toUTCString = createMethod('toUTCString');

  NativeDate.prototype.toString = createMethod('toString');
  NativeDate.prototype.toDateString = createMethod('toDateString');
  NativeDate.prototype.toTimeString = createMethod('toTimeString');

  // toLocaleString, toLocaleDateString, toLocaleTimeString

  // deprecated:
  NativeDate.prototype.toGMTString = createMethod('toGMTString');
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
        year = argumentsLength < 1 ? 0 : Number(year);
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
