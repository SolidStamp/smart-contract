module.exports = function randomArrayOfBytes(len) {
    return Array.from({length: len}, () => Math.floor(Math.random() * 256));
}
