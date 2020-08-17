const fs = require('fs');


const    NOP=     0b00000;
const    LDAI=    0b00001;
const    LDBI=     0b00010;
const    LDA=    0b00011;
const    LDAA=    0b10011;
const    LDB=    0b00100;
const    ADDI=     0b00101;
const    SUBI=    0b00110;
const   ADD=    0b00111;
const    SUB=    0b01000;
const    OUT=     0b01001;
const    JMPI=    0b01010;
const    JMP=     0b01011;
const    JMPC=    0b01100;
const    STO=     0b01101;
const    INA=     0b01110;
const    HALT=    0b01111;

const PHA      //Push A on stack
const POPA     //Pop stack to a register



// Control bits

// Ops that are neither OUT nor load (they could occur at the same time as any of the other ones
const PINC  = 0B10000000  //Program counter increment, High order bit set
const SU  = 0B1000000  // Substract, second highest bit set

// Lowest 3 bits for LOAD operations
// None occur at the same time

const MAL  =   1     // Load into memory address register
const IRL   =  2     // Load into instruction register
const OUTL  =  3     // Load into output register
const PL    =  4     // Load into program counter
const MLOAD =  5     // Load into RAM
const RAIN  =  6     // Load into register A
const RBIN  =  7     // Load into register B



// 3 bits for the OUT operations
const ALUO = 0B001000      // ALU OUT
const PO   = 0B010000      // Program counter out
const MO   = 0B011000      // RAM out
const RAO  = 0B100000      // Register A out
const INO  = 0B101000      // Input register out
const HLT  = 0B110000      // Halt the clock
const MCR  = 0B111000      // Microcounter reset

const operations = {
    [NOP]: [(PO | MAL), (MO | IRL | PINC), MCR, 0, 0, 0, 0, 0],  // NOP
    [LDAI]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | RAIN | PINC), MCR, 0, 0, 0], // LDAI
    [LDBI]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | RBIN | PINC), MCR, 0, 0, 0], //LDBI
    [LDA]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | MAL), (MO | RAIN | PINC), MCR, 0, 0], //LDA
    [LDAA]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | MAL), (MO | MAL), (MO | RAIN | PINC), MCR, 0], //LDA
    [LDB]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | MAL), (MO | RBIN | PINC), MCR, 0, 0], //LDB
    [ADDI]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | RBIN), (ALUO | RAIN | PINC), MCR, 0, 0], //ADDI
    [SUBI]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | RBIN), (ALUO | RAIN | SU | PINC), MCR, 0, 0], //SUBI
    [ADD]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | MAL), (MO | RBIN), (ALUO | RAIN | PINC), MCR, 0], //ADD
    [SUB]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | MAL), (MO | RBIN), (ALUO | RAIN | SU | PINC), MCR, 0], //SUB
    [OUT]: [(PO | MAL), (MO | IRL | PINC), (RAO | OUTL), MCR, 0, 0, 0, 0],  //OUT
    [JMPI]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | PL), MCR, 0, 0, 0],  //JMPI
    [JMP]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | MAL), (MO | PL), MCR, 0, 0],  //JMP
    [JMPC]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | PL), MCR, 0, 0, 0],  //JMPC
    [STO]: [(PO | MAL), (MO | IRL | PINC), (PO | MAL), (MO | MAL), (RAO | MLOAD | PINC), MCR, 0, 0],  // STO
    [INA]: [(PO | MAL), (MO | IRL | PINC), (INO | RAIN), MCR, 0, 0],  // INA
    [HALT]: [(PO | MAL), (MO | IRL | PINC), (HLT), MCR, 0, 0],  // HALT
};

let buf = [];

for (let address = 0; address < 2048; address++) {
    
    let instruction = address & 0B11111; //instruction is the lowest 5 bits of the address
    let microcount = (address >> 5) & 0B111; // Micro counter is the next 3 bits of the address
    let carry = (address >> 8) & 1;

    // NOP instruction by default
    let data = operations[NOP][microcount];

    if (instruction <= 15) {  // Only 5 instructions for now
      data = operations[instruction][microcount];
      if (instruction == JMPC && carry == 0) {
        let inst = [(PO | MAL), (MO | IRL | PINC), (PINC), MCR, 0, 0, 0, 0 ];
        data = inst[microcount];
      }
    }
    
    buf.push(data);
  }


let path = 'microcode.bin';
let buffer = new Buffer(buf);

fs.writeFile(path, buffer, function(err) {
    // If an error occurred, show it and return
    if(err) return console.error(err);
    // Successfully wrote binary contents to the file!
  });