// digits.js
const fs = require('fs');

data = [];

const digits = [
    0b11101110,
    0b00101000,
    0b11001101,
    0b01101101,
    0b00101011,
    0b01100111,
    0b11100111,
    0b00101100,
    0b11101111,
    0b01101111,
];


for (let i = 0; i <= 0b1111111111; i++) {
    lastTwo = i >> 8
    num = i & 0b0011111111;
    console.log(num.toString(10));
    //console.log(lastTwo.toString(10));
    if (0 == lastTwo) {
        data[i] = digits[num % 10];
    } else if(1 == lastTwo) {
        data[i] = digits[Math.floor(num / 10) % 10];
    } else if(2 == lastTwo) {
        data[i] = digits[Math.floor(num / 100) % 10];
    } else {
        data[i] = 0b0;
    }
}

const string = "v2.0 raw\n" + data.map(n => n.toString(16)).join(' ') + "\n";

fs.writeFile("/Users/jonathan/digits", string, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("ROM file was saved!");
}); 