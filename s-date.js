describe('Date', function () {
    
    describe('now', function () {
        it('should be the current time', function () {
            expect(Date.now() === new Date().getTime()).toBe(true);
        });
    });

    describe("parse", function () {
        // TODO: Write the rest of the test.

        it('should support extended years', function () {

            expect(Date.parse('0001-01-01T00:00:00Z')).toBe(-62135596800000);
            expect(Date.parse('+275760-09-13T00:00:00.000Z')).toBe(8.64e15);
            expect(Date.parse('+033658-09-27T01:46:40.000Z')).toBe(1e15);
            expect(Date.parse('-000001-01-01T00:00:00Z')).toBe(-62198755200000);
            expect(Date.parse('+002009-12-15T00:00:00Z')).toBe(1260835200000);

        });

        it('should work', function () {
                                                                                  //Chrome 19     Opera 12      Firefox 11    IE 9          Safari 5.1.1
            expect(Date.parse("2012-11-31T23:59:59.000Z")).toBeFalsy();           //1354406399000 NaN           NaN           1354406399000 NaN
            expect(Date.parse("2012-12-31T23:59:59.000Z")).toBe(1356998399000);   //1356998399000 1356998399000 1356998399000 1356998399000 1356998399000
            expect(Date.parse("2012-12-31T23:59:60.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           1356998400000
            expect(Date.parse("2012-04-04T05:02:02.170Z")).toBe(1333515722170);   //1333515722170 1333515722170 1333515722170 1333515722170 1333515722170
            expect(Date.parse("2012-04-04T05:02:02.170999Z")).toBe(1333515722170);   //1333515722170 1333515722170 1333515722170 1333515722170 1333515722170
            expect(Date.parse("2012-04-04T05:02:02.17Z")).toBe(1333515722170);    //1333515722170 1333515722170 1333515722170 1333515722170 1333515722170
            expect(Date.parse("2012-04-04T05:02:02.1Z")).toBe(1333515722100);     //1333515722170 1333515722170 1333515722170 1333515722170 1333515722170
            expect(Date.parse("2012-04-04T24:00:00.000Z")).toBe(1333584000000);   //NaN           1333584000000 1333584000000 1333584000000 1333584000000
            expect(Date.parse("2012-04-04T24:00:00.500Z")).toBeFalsy();           //NaN           NaN           1333584000500 1333584000500 NaN
            expect(Date.parse("2012-12-31T10:08:60.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           1356948540000
            expect(Date.parse("2012-13-01T12:00:00.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           NaN
            expect(Date.parse("2012-12-32T12:00:00.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           NaN
            expect(Date.parse("2012-12-31T25:00:00.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           NaN
            expect(Date.parse("2012-12-31T24:01:00.000Z")).toBeFalsy();           //NaN           NaN           NaN           1356998460000 NaN
            expect(Date.parse("2012-12-31T12:60:00.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           NaN
            expect(Date.parse("2012-12-31T12:00:60.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           1356955260000
            expect(Date.parse("2012-00-31T23:59:59.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           NaN
            expect(Date.parse("2012-12-00T23:59:59.000Z")).toBeFalsy();           //NaN           NaN           NaN           NaN           NaN
            expect(Date.parse("2012-02-29T12:00:00.000Z")).toBe(1330516800000);   //1330516800000 1330516800000 1330516800000 1330516800000 1330516800000
            expect(Date.parse("2011-02-29T12:00:00.000Z")).toBeFalsy();           //1298980800000 NaN           NaN           1298980800000 NaN
            expect(Date.parse("2011-03-01T12:00:00.000Z")).toBe(1298980800000);   //1298980800000 1298980800000 1298980800000 1298980800000 1298980800000

            // extended years:
            expect(Date.parse("0000-01-01T00:00:00.000Z")).toBe(-621672192e5);    //-621672192e5  -621672192e5  -621672192e5  -621672192e5  -621672192e5
            expect(Date.parse("+275760-09-13T00:00:00.000Z")).toBe(8.64e15);      //8.64e15       NaN           8.64e15       8.64e15       8.64e15
            expect(Date.parse("-271821-04-20T00:00:00.000Z")).toBe(-8.64e15);     //-8.64e15      NaN           -8.64e15      -8.64e15      -8.6400000864e15
            expect(Date.parse("+275760-09-13T00:00:00.001Z")).toBeFalsy();        //NaN           NaN           NaN           8.64e15 + 1   8.64e15 + 1
            expect(Date.parse("-271821-04-19T23:59:59.999Z")).toBeFalsy();        //NaN           NaN           NaN           -8.64e15 - 1  -8.6400000864e15 - 1

            // https://github.com/kriskowal/es5-shim/issues/80 Safari bug with leap day
            expect(Date.parse("2034-03-01T00:00:00.000Z") -
                        Date.parse("2034-02-27T23:59:59.999Z")).toBe(86400001);   //86400001      86400001       86400001       86400001      1

            // Time Zone Offset
            expect(Date.parse("2012-01-29T12:00:00.000+01:00")).toBe(132783480e4);//132783480e4 132783480e4  132783480e4  132783480e4     132783480e4
            expect(Date.parse("2012-01-29T12:00:00.000-00:00")).toBe(132783840e4);//132783840e4 132783840e4  132783840e4  132783840e4     132783840e4
            expect(Date.parse("2012-01-29T12:00:00.000+00:00")).toBe(132783840e4);//132783840e4 132783840e4  132783840e4  132783840e4     132783840e4
            expect(Date.parse("2012-01-29T12:00:00.000+23:59")).toBe(132775206e4);//132775206e4 132775206e4  132775206e4  132775206e4     132775206e4
            expect(Date.parse("2012-01-29T12:00:00.000-23:59")).toBe(132792474e4);//132792474e4 132792474e4  132792474e4  132792474e4     132792474e4
            expect(Date.parse("2012-01-29T12:00:00.000+24:00")).toBeFalsy();      //NaN         1327752e6    NaN          1327752000000   1327752000000
            expect(Date.parse("2012-01-29T12:00:00.000+24:01")).toBeFalsy();      //NaN         NaN          NaN          1327751940000   1327751940000
            expect(Date.parse("2012-01-29T12:00:00.000+24:59")).toBeFalsy();      //NaN         NaN          NaN          1327748460000   1327748460000
            expect(Date.parse("2012-01-29T12:00:00.000+25:00")).toBeFalsy();      //NaN         NaN          NaN          NaN             NaN
            expect(Date.parse("2012-01-29T12:00:00.000+00:60")).toBeFalsy();      //NaN         NaN          NaN          NaN             NaN
            expect(Date.parse("-271821-04-20T00:00:00.000+00:01")).toBeFalsy();   //NaN         NaN          NaN          -864000000006e4 -864000008646e4
            expect(Date.parse("-271821-04-20T00:01:00.000+00:01")).toBe(-8.64e15);//-8.64e15    NaN          -8.64e15     -8.64e15        -864000008640e4

            // When time zone is missed, local offset should be used (ES 5.1 bug)
            // see https://bugs.ecmascript.org/show_bug.cgi?id=112
            var tzOffset = Number(new Date(1970, 0));
            expect(Date.parse('1970-01-01T00:00:00')).toBe(tzOffset);             //tzOffset    0            0            0               NaN
        });
        it("should be able to coerce to a number", function(){
            var actual = Number(new Date(1970, 0));
            var expected = parseInt(actual, 10);
            expect(actual).toBeDefined();
            expect(actual).toEqual(expected);
            expect(isNaN(actual)).toBeFalsy();
        });
    });

    describe("toString", function(){
        var actual = (new Date(1970, 0)).toString();
        beforeEach(function(){
            actual = (new Date(1970, 0)).toString();
        });
        it("should show correct date info for "+actual, function(){
            expect(actual).toMatch(/1970/);
            expect(actual).toMatch(/jan/i);
            expect(actual).toMatch(/thu/i);
            expect(actual).toMatch(/00:00:00/);
        });
    });

    describe("valueOf", function(){
        var actual = (new Date(1970, 0));
        beforeEach(function(){
            actual = (new Date(1970, 0)).valueOf();
        });
        it("should give an int value", function(){
            expect(parseInt(actual, 10)).toBeTruthy();
        });
    });

    describe("toISOString", function () {
        // TODO: write the rest of the test.

        it('should support extended years', function () {
            expect(new Date(-62198755200000).toISOString().indexOf('-000001-01-01')).toBe(0);
            expect(new Date(8.64e15).toISOString().indexOf('+275760-09-13')).toBe(0);
        });

        it('should return correct dates', function () {
            expect(new Date(-1).toISOString()).toBe('1969-12-31T23:59:59.999Z');// Safari 5.1.5 "1969-12-31T23:59:59.-01Z"
            expect(new Date(-3509827334573292).toISOString()).toBe('-109252-01-01T10:37:06.708Z'); // Opera 11.61/Opera 12 bug with Date#getUTCMonth
        });

    });

    describe("toJSON", function () {

        // Opera 11.6x/12 bug
        it('should call toISOString', function () {
          var date = new Date(0);
          date.toISOString = function () {
            return 1;
          };
          expect(date.toJSON()).toBe(1);
        });

        it('should return null for not finite dates', function () {
          var date = new Date(NaN),
              json;
          try {
            json = date.toJSON();
          } catch (e) {}
          expect(json).toBe(null);
        });

        it('should return the isoString when stringified', function () {
            var date = new Date();
            expect(JSON.stringify(date.toISOString())).toBe(JSON.stringify(date));
        }) 
    });

    describe("getUTCMonth", function () {
        expect(new Date(-3509827334573292).getUTCMonth()).toBe(0);
    });

    describe("getUTCFullYear", function () {
        expect(new Date(-3509827334573292).getUTCFullYear()).toBe(-109252);
    });

    describe("to(Locale|UTC|ISO)String(http://es5.github.com/#x15.9.4.2)", function () {
        function c(d) {
            var t = Number(d);
            expect(t % 1000).toBe(0);
            expect(Date.parse(d.toISOString())).toBe(t);
            var year = d.getFullYear();
            if (year >= 0 && year < 1e4) {
              it('parse(toString(' + d.toString() + '))', function () {
                expect(Date.parse(d.toString())).toBe(t);
              });
              it('parse(toUTCString(' + d.toUTCString() + '))', function () {
                expect(Date.parse(d.toUTCString())).toBe(t);
              });
              it('parse(toGMTString(' + d.toGMTString() + '))', function () {
                expect(Date.parse(d.toGMTString())).toBe(t);
              });
            }
        }
        var monthes = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
        function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return monthes[month] + Math.floor((year - 1969 + t) / 4) - Math.floor((year - 1901 + t) / 100) + Math.floor((year - 1601 + t) / 400) + 365 * (year - 1970);
        }
        c(new Date(1334311355000));
        c(new Date(-3509827334573000));// zero milliseconds
        c(new Date(dayFromMonth(1, 0) * 86400000));
        c(new Date(dayFromMonth(-1, 0) * 86400000));
    });

    describe('http://es5.github.com/#x15.9.5.1', function () {
      expect(Date.prototype.constructor === Date).toBe(true);
    });

    describe('new Date(-3509827334573000).setUTCMonth(100)', function () {
      expect(new Date(new Date(-3509827334573000).setUTCMonth(100)).getTime()).toBe(-3509564419373000);
    });

    describe('new Date(0).setFullYear(95).getYear()', function () {
      expect(new Date(new Date(0).setFullYear(95)).getYear()).toBe(-1805);
    });

    describe('new Date(0).setUTCDate(10.5)', function () {
      expect(new Date(0).setUTCDate(10.5)).toBe(777600000);
    });

    // IE, Safari not "clips" result of Date.UTC, Date.parse
    describe('Date.UTC(1e10)', function () {
      expect(isNaN(Date.UTC(1e10))).toBe(true);
    });

    // http://msdn.microsoft.com/en-us/library/ff960764(v=vs.85).aspx
    // follow IE & FF behavior
    describe('Date.UTC()', function () {
      expect(Date.UTC()).toBe(-2208988800000); // "1900-01-01T00:00:00.000Z"
    });
    describe('Date.UTC(1900)', function () {
      expect(Date.UTC(1900)).toBe(-2208988800000); // "1900-01-01T00:00:00.000Z"
    });

    // http://msdn.microsoft.com/en-us/library/ff960740(v=vs.85).aspx
    describe('new Date(NaN).toUTCString()', function () {
      var x = null;
      try {
        x = new Date(NaN).toUTCString();
      } catch (e) {}
      expect(x).toBe(null);// similar to toISOString ?
    });
    describe('new Date(0).toUTCString()', function () {
      expect(new Date(0).toUTCString()).toBe("Thu, 01 Jan 1970 00:00:00 GMT");
    });
    describe('new Date(-1, 0).toUTCString()', function () {
      var x = null;
      try {
        x = new Date(-62198776800000).toUTCString();
      } catch (e) {}
      expect(x).toBe(null);
    });
    describe('new Date(0).toUTCString()', function () {
      expect(new Date(-62135618400000).toUTCString()).toBe("Sun, 31 Dec 0000 18:00:00 GMT");
    });
    describe('new Date(0).toUTCString()', function () {
      expect(new Date(253373335200000).toUTCString()).toBe("Sat, 30 Jan 9999 18:00:00 GMT");
    });

    describe('new Date(253373335200000).setUTCSeconds(3)', function () {
      expect(new Date(253373335200123).setUTCSeconds(3)).toBe(253373335203123);
    });
    describe('new Date(253373335200000).setUTCSeconds()', function () {
      var x;
      try {
        x = isNaN(new Date(253373335200123).setUTCSeconds());
      } catch (e) {
        x = String(e);
      }
      expect(x).toBe(true);
    });

    var x48 = new Date(-694245600001); // "1948-01-01T17:59:59.999Z"
    // Opera 10/11/12 bug
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getFullYear()', function () {
      // -109252-01-01T17:59:59.999Z
      // eq  1948-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getFullYear()).toBe(-x48.getFullYear() + 1948 - 109252);
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getYear()', function () {
      // -109252-01-01T17:59:59.999Z
      // eq  1948-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getYear()).toBe(-x48.getFullYear() + 1948 - 109252 - 1900);
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getMonth()', function () {
      // -109252-01-01T17:59:59.999Z
      // eq  1948-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getMonth()).toBe(x48.getMonth());
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getDate()', function () {
      // -109252-01-01T17:59:59.999Z
      // eq  1948-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getDate()).toBe(x48.getDate());
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getDay()', function () {
      // -109252-01-01T17:59:59.999Z
      // eq  1948-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getDay()).toBe(x48.getDay());
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getHours()', function () {
      // -109252-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getHours()).toBe(x48.getHours());
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getMinutes()', function () {
      // -109252-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getMinutes()).toBe(x48.getMinutes());
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getSeconds()', function () {
      // -109252-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getSeconds()).toBe(x48.getSeconds());
    });
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).getMilliseconds()', function () {
      // -109252-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).getMilliseconds()).toBe(x48.getMilliseconds());
    });

    // Opera 11.61
    describe('new Date(Date.parse("-109252-01-01T17:59:59.999Z")).setFullYear(0)', function () {
      // -109252-01-01T17:59:59.999Z
      expect(new Date(-3509827308000001).setFullYear(0)).toBe(x48.setFullYear(0));
    });

    describe("Date.parse('2070-01-01T00:00:00Z') - Date.parse('0070-01-01T00:00:00Z')", function () {
      expect(Date.parse('2070-01-01T00:00:00Z') - Date.parse('0070-01-01T00:00:00Z')).toBe(12622780800000 * 5);
    });

    // Safari
    describe("new Date(Date.parse('2070-01-01T00:00:00.000Z')).toISOString()", function () {
      expect(new Date(Date.parse('2070-01-01T00:00:00.000Z')).toISOString()).toBe('2070-01-01T00:00:00.000Z');
    });

});
