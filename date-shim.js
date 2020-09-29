/*jslint vars: true, indent: 2 */

if (Number.parseInt == undefined) {
  Number.parseInt = parseInt;
}

this.Date = (function (NativeDate) {
  "use strict";

  function now() {
    return new NativeDate().getTime();
  }

  function localTime(tv) {
    return tv - new NativeDate(tv).getTimezoneOffset() * 60000;
  }

  function UTC(localtime) {
    //return new NativeDate(1970, 0, 1, 0, 0, 0, tv).getTime();
    function offset(timestamp) {
      return 0 - new Date(timestamp).getTimezoneOffset() * 60000;
    }
    // assume the timezone offset is between -24 hours and +24 hours
    // assume the timezone has not more than one transition within 48 hours
    var beforeTransitionDate = localtime - 24 * 60 * 60 * 1000;
    var afterTransitionDate = localtime + 24 * 60 * 60 * 1000;
    var oldOffset = offset(beforeTransitionDate);
    var newOffset = offset(afterTransitionDate);
    if (offset(localtime - Math.max(oldOffset, newOffset)) === oldOffset) { // localtime < transitionDate + Math.max(offset(transitionDate - 1), offset(transitionDate))
      return new Date(localtime - oldOffset);
    }
    return new Date(localtime - newOffset);
  }

  function pad(n, digits) {
    return digits.slice(0, digits.length - 1 - Math.floor(Math.log(Math.max(n, 1) + 0.5) / Math.log(10))) + n.toString();
  }

  function dayFromYear(y) {
    return Math.floor((y - 1969) / 4) - Math.floor((y - 1901) / 100) + Math.floor((y - 1601) / 400) + 365 * (y - 1970);
  }

  var monthes = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

  function dayFromMonth(year, month) {
    var t = month > 1 ? 1 : 0;
    return monthes[month] - 365 * t + dayFromYear(year + t);
  }

  function getComponents(tv) {
    var months = Math.floor((tv + 30.436875 * 86400000 / 2) / (30.436875 * 86400000));
    var year = Math.floor(months / 12) + 1970;
    var month = months - (year - 1970) * 12;
    if (dayFromMonth(year, month) * 86400000 > tv) {
      month -= 1;
      if (month === -1) {
        month = 11;
        year -= 1;
      }
    }
    var days = Math.floor(tv / 86400000);
    var date = 1 + days - dayFromMonth(year, month);
    var day = (days + 4) - Math.floor((days + 4) / 7) * 7;

    var subdays = tv - 86400000 * days;
    var time0 = subdays;
    var hour = Math.floor(time0 / 3600000);
    var time1 = time0 - 3600000 * hour;
    var minute = Math.floor(time1 / 60000);
    var time2 = time1 - 60000 * minute;
    var second = Math.floor(time2 / 1000);
    var time3 = time2 - 1000 * second;
    var millisecond = Math.floor(time3 / 1);
    return {
      year: year,
      month: month,
      date: date,
      day: day,
      hour: hour,
      minute: minute,
      second: second,
      millisecond: millisecond
    };
  }

  var isoDateExpression = /^(\d\d\d\d|[\-\+]\d\d\d\d\d\d)(?:\-(\d\d)(?:\-(\d\d)(?:T(\d\d):(\d\d)(?::(\d\d(?:\.(\d+))?))?(Z|(?:([\-\+])(\d\d):(\d\d)))?)?)?)?$/;
  var utcDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d\d)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d\d\d\d)\s+(\d\d)\:(\d\d)\:(\d\d)\s+(?:GMT|UTC)$/i;
  var stringDateExpression = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d\d)\s+(\d\d\d\d)\s+(\d\d)\:(\d\d)\:(\d\d)\s+(?:GMT|UTC)([\-\+])(\d\d)(\d\d)$/i;
  var weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function makeDateTime(year, month, date, hour, minute, second, millisecond) {
    year = year <= 0 ? 0 - Math.floor(0 - year) : Math.floor(year);
    month = month <= 0 ? 0 - Math.floor(0 - month) : Math.floor(month);
    date = date <= 0 ? 0 - Math.floor(0 - date) : Math.floor(date);
    hour = hour <= 0 ? 0 - Math.floor(0 - hour) : Math.floor(hour);
    minute = minute <= 0 ? 0 - Math.floor(0 - minute) : Math.floor(minute);
    second = second <= 0 ? 0 - Math.floor(0 - second) : Math.floor(second);
    millisecond = millisecond <= 0 ? 0 - Math.floor(0 - millisecond) : Math.floor(millisecond);
    year += Math.floor(month / 12);
    month = (month % 12 + 12) % 12;
    return ((((dayFromMonth(year, month) + date) * 24 + hour) * 60 + minute) * 60 + second) * 1000 + millisecond;
  }

  function setComponents(tv, year, month, date, hour, minute, second, millisecond) {
    var c = getComponents(tv);
    var y = year == undefined ? c.year : Number(year);
    var m = month == undefined ? c.month : Number(month);
    var d = date == undefined ? c.date : Number(date);
    var h = hour == undefined ? c.hour : Number(hour);
    var min = minute == undefined ? c.minute : Number(minute);
    var s = second == undefined ? c.second : Number(second);
    var ms = millisecond == undefined ? c.millisecond : Number(millisecond);
    return makeDateTime(y, m, d - 1, h, min, s, ms);
  }

  function fromISOString(string) {
    var match = isoDateExpression.exec(string);
    if (match != undefined) {
      var year = Number.parseInt(match[1], 10);
      var month = Number.parseInt(match[2] || "1", 10) - 1;
      var date = Number.parseInt(match[3] || "1", 10) - 1;
      var hour = Number.parseInt(match[4] || "0", 10);
      var minute = Number.parseInt(match[5] || "0", 10);
      var second = Number.parseInt(match[6] || "0", 10);
      var millisecond = Number.parseInt(match[7] || "0", 10);
      var localOffset = match[4] != undefined && match[8] == undefined;
      var signOffset = match[9] === "-" ? 1 : -1;
      var hourOffset = Number.parseInt(match[10] || "0", 10);
      var minuteOffset = Number.parseInt(match[11] || "0", 10);
      if (hour < (minute > 0 || second > 0 ? 24 : 25) &&
          minute < 60 &&
          second < 60 && 
          hourOffset < 24 &&
          minuteOffset < 60 &&
          month > -1 && month < 12 &&
          date > -1 && date < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        var t = makeDateTime(year, month, date, hour + hourOffset * signOffset, minute + minuteOffset * signOffset, second, millisecond * Math.pow(10, 2 - Math.floor(Math.log(Math.max(millisecond, 1) + 0.5) / Math.log(10))));
        return localOffset ? UTC(t) : t;
      }
      return 0 / 0;
    }
    return undefined;
  }

  function fromUTCString(string) {
    var match = utcDateExpression.exec(string);
    if (match != undefined) {
      var date = Number.parseInt(match[1], 10) - 1;
      var monthName = match[2].slice(0, 1).toUpperCase() + match[2].slice(1).toLowerCase();
      var year = Number.parseInt(match[3], 10);
      var hour = Number.parseInt(match[4], 10);
      var minute = Number.parseInt(match[5], 10);
      var second = Number.parseInt(match[6], 10);
      var i = monthNames.length - 1;
      while (i >= 0 && monthNames[i] !== monthName) {
        i -= 1;
      }
      var month = i;
      if (hour < (minute > 0 || second > 0 ? 24 : 25) &&
          minute < 60 &&
          second < 60 &&
          date > -1 && date < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        return makeDateTime(year, month, date, hour, minute, second, 0);
      }
      return 0 / 0;
    }
    return undefined;
  }

  function fromString(string) {
    var match = stringDateExpression.exec(string);
    if (match != undefined) {
      var date = Number.parseInt(match[2], 10) - 1;
      var monthName = match[1].slice(0, 1).toUpperCase() + match[1].slice(1).toLowerCase();
      var year = Number.parseInt(match[3], 10);
      var hour = Number.parseInt(match[4], 10);
      var minute = Number.parseInt(match[5], 10);
      var second = Number.parseInt(match[6], 10);
      var signOffset = match[7] === "-" ? 1 : -1;
      var hourOffset = Number.parseInt(match[8], 10);
      var minuteOffset = Number.parseInt(match[9], 10);
      var i = monthNames.length - 1;
      while (i >= 0 && monthNames[i] !== monthName) {
        i -= 1;
      }
      var month = i;
      if (hour < (minute > 0 || second > 0 ? 24 : 25) &&
          minute < 60 &&
          second < 60 &&
          hourOffset < 24 &&
          minuteOffset < 60 &&
          date > -1 && date < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
        return makeDateTime(year, month, date, hour + hourOffset * signOffset, minute + minuteOffset * signOffset, second, 0);
      }
      return 0 / 0;
    }
    return undefined;
  }

  function JSDate(year, month, date, hours, minutes, seconds, milliseconds) {
    var tv = 0;
    if (arguments.length === 0) {
      tv = now();
    } else if (arguments.length === 1) {
      tv = Number(year);
    } else {
      year = Number(year);
      month = Number(month);
      date = arguments.length < 3 ? 1 : Number(date);
      hours = arguments.length < 4 ? 0 : Number(hours);
      minutes = arguments.length < 5 ? 0 : Number(minutes);
      seconds = arguments.length < 6 ? 0 : Number(seconds);
      milliseconds = arguments.length < 7 ? 0 : Number(milliseconds);
      if (year > -1 && year < 100) {
        year += 1900;
      }
      tv = UTC(makeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds));
    }
    this.tv = tv;
  }
  JSDate.now = function () {
    return now();
  };
  JSDate.parse = function (s) {
    var x = 0;
    x = fromISOString(s);
    if (x != undefined) {
      return x;
    }
    x = fromUTCString(s);
    if (x != undefined) {
      return x;
    }
    x = fromString(s);
    if (x != undefined) {
      return x;
    }
    return 0 / 0;
  };
  JSDate.UTC = function (year, month, date, hours, minutes, seconds, milliseconds) {
    year = Number(year);
    month = arguments.length < 2 ? 0 : Number(month);
    date = arguments.length < 3 ? 1 : Number(date);
    hours = arguments.length < 4 ? 0 : Number(hours);
    minutes = arguments.length < 5 ? 0 : Number(minutes);
    seconds = arguments.length < 6 ? 0 : Number(seconds);
    milliseconds = arguments.length < 7 ? 0 : Number(milliseconds);
    if (-1 < year && year < 100) {
      year += 1900;
    }
    return makeDateTime(year, month, date - 1, hours, minutes, seconds, milliseconds);
  };

  JSDate.prototype.constructor = JSDate;
  JSDate.prototype.getTime = function () {
    return this.tv;
  };
  JSDate.prototype.getTimezoneOffset = function () {
    return (this.tv - localTime(this.tv)) / 60000;
  };
  JSDate.prototype.toISOString = function () {
    var c = getComponents(this.tv);
    return (c.year < 0 || c.year > 10000 - 1 ? (c.year < 0 ? "-" : "+") + pad(c.year < 0 ? 0 - c.year : c.year, "000000") : pad(c.year, "0000")) + "-" +
           pad(c.month + 1, "00") + "-" +
           pad(c.date, "00") + "T" +
           pad(c.hour, "00") + ":" +
           pad(c.minute, "00") + ":" +
           pad(c.second, "00") + "." +
           pad(c.millisecond, "000") +
           "Z";
  };
  JSDate.prototype.toUTCString = function () {
    var c = getComponents(this.tv);
    if (c.year < 0 || c.year > 10000 - 1) {
      throw new RangeError();
    }
    return weekDayNames[c.day] + ", " +
           pad(c.date, "00") + " " +
           monthNames[c.month] + " " +
           pad(c.year, "0000") + " " +
           pad(c.hour, "00") + ":" +
           pad(c.minute, "00") + ":" +
           pad(c.second, "00") + " " +
           "GMT";
  };
  JSDate.prototype.toJSON = function (key) {
    return this.toISOString();
  };
  JSDate.prototype.toDateString = function () {
    var c = getComponents(localTime(this.tv));
    if (c.year < 0 || c.year > 10000 - 1) {
      throw new RangeError();
    }
    return weekDayNames[c.day] + " " +
           monthNames[c.month] + " " +
           pad(c.date, "00") + " " +
           pad(c.year, "0000");
  };
  JSDate.prototype.toTimeString = function () {
    var c = getComponents(localTime(this.tv));
    var offset = localTime(this.tv) - this.tv;
    var a = (offset < 0 ? 0 - offset : offset);
    var offsetHour = Math.floor(a / 3600000);
    var offsetMinute = Math.floor((a - 3600000 * offsetHour) / 60000);
    return pad(c.hour, "00") + ":" +
           pad(c.minute, "00") + ":" +
           pad(c.second, "00") + " " +
           "GMT" +
           (offset < 0 ? "-" : "+") +
           pad(offsetHour, "00") +
           pad(offsetMinute, "00");
  };
  JSDate.prototype.toString = function () {
    return this.toDateString() + " " + this.toTimeString();
  };

  JSDate.prototype.valueOf = function () {
    return this.getTime();
  };
  JSDate.prototype.toGMTString = function () {
    return this.toUTCString();
  };
  JSDate.prototype.getYear = function () {
    return this.getFullYear() - 1900;
  };
  JSDate.prototype.setYear = function (year) {
    return this.setFullYear(year + 1900);
  };

  JSDate.prototype.getFullYear = function () {
    return getComponents(localTime(this.tv)).year;
  };
  JSDate.prototype.getMonth = function () {
    return getComponents(localTime(this.tv)).month;
  };
  JSDate.prototype.getDate = function () {
    return getComponents(localTime(this.tv)).date;
  };
  JSDate.prototype.getDay = function () {
    return getComponents(localTime(this.tv)).day;
  };
  JSDate.prototype.getHours = function () {
    return getComponents(localTime(this.tv)).hour;
  };
  JSDate.prototype.getMinutes = function () {
    return getComponents(localTime(this.tv)).minute;
  };
  JSDate.prototype.getSeconds = function () {
    return getComponents(localTime(this.tv)).second;
  };
  JSDate.prototype.getMilliseconds = function () {
    return getComponents(localTime(this.tv)).millisecond;
  };

  JSDate.prototype.getUTCFullYear = function () {
    return getComponents(this.tv).year;
  };
  JSDate.prototype.getUTCMonth = function () {
    return getComponents(this.tv).month;
  };
  JSDate.prototype.getUTCDate = function () {
    return getComponents(this.tv).date;
  };
  JSDate.prototype.getUTCDay = function () {
    return getComponents(this.tv).day;
  };
  JSDate.prototype.getUTCHours = function () {
    return getComponents(this.tv).hour;
  };
  JSDate.prototype.getUTCMinutes = function () {
    return getComponents(this.tv).minute;
  };
  JSDate.prototype.getUTCSeconds = function () {
    return getComponents(this.tv).second;
  };
  JSDate.prototype.getUTCMilliseconds = function () {
    return getComponents(this.tv).millisecond;
  };

  JSDate.prototype.setFullYear = function (year, month, date) {
    return UTC(setComponents(localTime(this.tv), year, month, date, undefined, undefined, undefined, undefined));
  };
  JSDate.prototype.setMonth = function (month, date) {
    return UTC(setComponents(localTime(this.tv), undefined, month, date, undefined, undefined, undefined, undefined));
  };
  JSDate.prototype.setDate = function (date) {
    return UTC(setComponents(localTime(this.tv), undefined, undefined, date, undefined, undefined, undefined, undefined));
  };
  JSDate.prototype.setHours = function (hour, minute, second, millisecond) {
    return UTC(setComponents(localTime(this.tv), undefined, undefined, undefined, hour, minute, second, millisecond));
  };
  JSDate.prototype.setMinutes = function (minute, second, millisecond) {
    return UTC(setComponents(localTime(this.tv), undefined, undefined, undefined, undefined, minute, second, millisecond));
  };
  JSDate.prototype.setSeconds = function (second, millisecond) {
    return UTC(setComponents(localTime(this.tv), undefined, undefined, undefined, undefined, undefined, second, millisecond));
  };
  JSDate.prototype.setMillisecond = function (millisecond) {
    return UTC(setComponents(localTime(this.tv), undefined, undefined, undefined, undefined, undefined, undefined, millisecond));
  };

  JSDate.prototype.setUTCFullYear = function (year, month, date) {
    return setComponents(this.tv, year, month, date, undefined, undefined, undefined, undefined);
  };
  JSDate.prototype.setUTCMonth = function (month, date) {
    return setComponents(this.tv, undefined, month, date, undefined, undefined, undefined, undefined);
  };
  JSDate.prototype.setUTCDate = function (date) {
    return setComponents(this.tv, undefined, undefined, date, undefined, undefined, undefined, undefined);
  };
  JSDate.prototype.setUTCHours = function (hour, minute, second, millisecond) {
    return setComponents(this.tv, undefined, undefined, undefined, hour, minute, second, millisecond);
  };
  JSDate.prototype.setUTCMinutes = function (minute, second, millisecond) {
    return setComponents(this.tv, undefined, undefined, undefined, undefined, minute, second, millisecond);
  };
  JSDate.prototype.setUTCSeconds = function (second, millisecond) {
    return setComponents(this.tv, undefined, undefined, undefined, undefined, undefined, second, millisecond);
  };
  JSDate.prototype.setUTCMillisecond = function (millisecond) {
    return setComponents(this.tv, undefined, undefined, undefined, undefined, undefined, undefined, millisecond);
  };

  return JSDate;
}(Date));
