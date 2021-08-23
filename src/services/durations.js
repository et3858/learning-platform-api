/**
 * Fill the number with a zero prefix if number is less than "9"
 * @param   int    num 
 * @returns string
 */
const addZero = num => (num <= 9 ? "0" : "") + num;

/**
 * Calculate time duration based on interval
 * @param   int    time
 * @param   string interval
 * @returns string
 */
module.exports = (time = 0, interval = "millisecond") => {

    if (isNaN(time)) throw "not a number";

    let startDate = new Date(0, 0, 0, 0, 0, 0);
    let endDate = new Date(0, 0, 0, 0, 0, 0);

    switch(interval) {
        case "hour":
        case "hours":
            endDate.setHours(endDate.getHours() + time);
            break;
        case "minute":
        case "minutes":
            endDate.setMinutes(endDate.getMinutes() + time);
            break;
        case "second":
        case "seconds":
            endDate.setSeconds(endDate.getSeconds() + time);
            break;
        case "millisecond":
        case "milliseconds":
            endDate.setMilliseconds(endDate.getMilliseconds() + time);
            break;
    }

    let diff = endDate.getTime() - startDate.getTime();

    let hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * (1000 * 60 * 60);
    let minutes = Math.floor(diff / 1000 / 60);
    diff -= minutes * (1000 * 60);
    let seconds = Math.floor(diff / 1000);

    // If using time pickers with 24 hours format, add the below line get exact hours
    if (hours < 0) hours += 24;

    return addZero(hours) + ":" + addZero(minutes) + ":" + addZero(seconds);
};
