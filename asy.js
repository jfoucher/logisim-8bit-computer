// asy.js

// Assembler for logisim computer
const fs = require('fs');

const instructions = {
    NOP:  0b00000,
    JMPI: 0b00001,
    JMP:  0b00010,
    JMPC: 0b00011,
    JMPZ: 0b01111,
    LDAI: 0b00100,
    LDA:  0b00101,
    OUTA: 0b00110,
    LDBI: 0b00111,
    OUTI: 0b01000,
    OUT:  0b01001,
    ADDI: 0b01010,
    ADD:  0b01011,
    SUBI: 0b01100,
    SUB:  0b01101,
    STOI:  0b01110,
    AOUT: 0b10011,
    STO: 0b10100,
    HLT:  0b11111,
}

// var keys = Object.keys(instructions);
// var values = Object.values(instructions).map(n => n.toString(16))

// var b16inst = {};
// keys.forEach((key, i) => b16inst[key] = values[i]);
//console.log(b16inst);

    // NOP: '0',
    // JMPI: '1',
    // JMP: '2',
    // JMPC: '3',
    // JMPZ: 'f',
    // LDAI: '4',
    // LDA: '5',
    // OUTA: '6',
    // LDBI: '7',
    // OUTI: '8',
    // OUT: '9',
    // ADDI: 'a',
    // ADD: 'b',
    // SUBI: 'c',
    // SUB: 'd',
    // STOI: 'e',
    // HLT: '1f'

let codes = '';
for(let i = 0; i<= 127; i++) {
    codes += (i + 127) + ' ' + i + "\n";
}
console.log(codes);

const str = "HELLO WORLD!!\n"
let out = '';
for (let i = 0; i < str.length;i++) {
    out += 'AOUT ' + (str.charCodeAt(i) + 127) + "\n";
}

const ascii = `
125 4
`+ codes + `
AOUT ${127+12}
LDAI 4
STOI 125
:start
LDA 125
SUBI 1
STOI 125
JMPZ end
` + out + `
JMPI start
:end
HLT
`

const power = `
# mantissa
255 3
# exponent
254 5
LDA 255
STOI 253
OUTA
LDA 254
SUBI 1
STOI 250
LDA 255
SUBI 1
STOI 252
:start
LDA 252
STOI 251
:inner
LDA 253
ADD 255
STOI 253
LDA 251
SUBI 1
STOI 251
LDA 253
JMPZ next
JMPI inner
:next
OUTA
STOI 255
LDA 250
SUBI 1
STOI 250
JMPZ end
JMPI start
:end
HLT
`

const divide = `
253 112
254 27
255 0
:start
LDA 253
SUB 254
JMPZ end
JMPC carryend
STOI 253
LDA 255
ADDI 1
STOI 255
OUTA
JMPI start
:end
LDA 255
ADDI 1
OUTA
HLT
:carryend
LDA 255
OUTA
HLT
`;

const fibo = `
255 0
254 1
LDA 254
:start
ADD 255
JMPC end
OUTA
STOI 255
ADD 254
JMPC end
OUTA
STOI 254
JMPI start
:end
HLT
`;

const subtract = `
LDAI 10
OUTA
:start
SUBI 1
OUTA
JMPZ end
JMPI start
:end
HLT
`

const subtract2 = `
LDAI 0
SUBI 1
OUTA
HLT
`
const add = `
LDAI 5
ADDI 10
OUTA
HLT
`

const divisor = `
253 15
254 5
LDA 254
SUBI 1
STOI 255
:start
LDA 254
OUTA
SUB 255
STOI 254
JMPC retry
JMPZ end
JMPI start
:end
LDA 255
OUTA
HLT
:retry
LDA 253
STOI 254
LDA 255
SUBI 1
OUTA
STOI 255
JMPI start
`;

const prime = `
253 11
254 11
LDA 254
SUBI 1
STOI 255
:start
LDA 254
OUTA
JMPZ end
SUB 255
STOI 254
JMPC retry
JMPI start
:end
LDA 255
OUTA
HLT
:retry
LDA 253
STOI 254
LDA 255
SUBI 1
OUTA
STOI 255
JMPI start
`;


const assemble = (program) => {
    const lines = program.split("\n").filter(l => l.length > 0);

    const mem = new Array(256).fill(0);
    let address = 0;
    let labels= {}
    let add = 0;
    try {
        // Labels pass
        lines.map((l, i) => {
            if (l.indexOf('#') === 0) {
                return null;
            }
            if (l.indexOf(':') === 0) {
                const lab = l.replace(':', '');
                labels[lab] = address;
                return null;
            }
            if (l.indexOf(' ') > 0) {
                //has an argument
                const sp = l.split(' ');
                if (typeof instructions[sp[0]] !== 'undefined') {
                    address += sp.length;
                }
            } else {
                address += 1;
            }
            return l;
        })
        // Syntax pass
        .filter(n => n !== null).forEach((l, i) => {
            
            if (l.indexOf(':') === 0) {
                return;
            }
            if (l.indexOf(' ') > 0) {
                //has an argument
                const sp = l.split(' ');
                if (typeof instructions[sp[0]] === 'undefined') {
                    //This is an adress value, create it there
                    
                    const val = parseInt(sp[1], 10);
                    if (isNaN(val)) {
                        throw new Error('Instruction ' + l + ' is undefined at line ' + i);
                    }
                    
                    console.log('creating address value for ', sp);
    
                    mem[parseInt(sp[0], 10)] = val.toString(16);
                    add--;
                } else {
                    console.log('creating instruction for ', sp[0]);
                    mem[i + add] = instructions[sp[0]].toString(16);
                    add++;
                    // Is it a label ?
                    if (typeof labels[sp[1]] !== 'undefined') {
                        console.log('is a label ', sp[1]);
                        mem[i + add] = labels[sp[1]].toString(16);
                    } else {
                        console.log('not a label', sp[1], parseInt(sp[1], 10).toString(16));
    
                        mem[i + add] = parseInt(sp[1], 10).toString(16);
                        if (typeof sp[2] !== 'undefined'){
                            add++;
                            mem[i + add] = parseInt(sp[2], 10).toString(16);
                        }
                    }
                    
                }
            } else {
                
                if (typeof instructions[l] === 'undefined') {
                    throw new Error('Instruction ' + l + ' is undefined at line ' + i);
                }
                console.log('single elementt ', l);
                address += 1;
                mem[i + add] = instructions[l].toString(16);
            }
        });
        console.log(labels);
    } catch (er) {
        return console.error(er);
    }
    return mem;
}

mem = assemble(ascii);

const string = "v2.0 raw\n" + mem.join(' ') + "\n";

fs.writeFile("./ram", string, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("RAM file was saved!");
});

programs = [power, divide, fibo, subtract, divisor, prime].map(p => assemble(p).join(' ')); 
const pgstring = "v2.0 raw\n" + programs.join(' ') + "\n";

fs.writeFile("./ramROM", pgstring, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("RAMROM file was saved!");
});

console.log(mem.map((n, i) => {
    return {i, value: n}
}).filter(n => n.value != 0));

