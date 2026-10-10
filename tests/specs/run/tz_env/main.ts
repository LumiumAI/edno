const date = new Date("2018-04-14T12:34:56.789Z");

Edno.env.delete("TZ");
const defaultTimezone = date.toString();

Edno.env.set("TZ", "Europe/Amsterdam");
if (!date.toString().match(/^Sat Apr 14 2018 14:34:56 GMT\+0200 \(.+\)$/)) {
  throw new Error(`date.toString() did not match the expected pattern`);
}

Edno.env.set("TZ", "Europe/London");
if (!date.toString().match(/^Sat Apr 14 2018 13:34:56 GMT\+0100 \(.+\)$/)) {
  throw new Error(`date.toString() did not match the expected pattern`);
}

Edno.env.delete("TZ");
if (date.toString() !== defaultTimezone) {
  throw new Error(`deleting TZ did not restore the default timezone`);
}

console.log("ok");
