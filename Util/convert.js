const pad = num => ('' + num).padStart(2, '0');
function seconds_to_time(seconds) {
    seconds = Math.trunc(seconds);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return (hours ? `${hours}:${pad(minutes)}` : minutes) + `:${pad(seconds)}`;
}

module.exports = { seconds_to_time };
