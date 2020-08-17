//rom.js
// Create ROM for logisim

//Microcodes

// Microcode addresses are 11 bits.
// 5 bits from instruction + 3 bits from microcounter + 1 bit from carry + 1 bit from zero flag

// 11111 111 1 1

const fs = require('fs');

// Control signals

const PI = 1;      // program counter increment
const MO = 1 << 1  // Memory out
const O = 1 << 2  // OUTput
const PL = 1 << 3   // load PC from bus
const MIN = 1 << 4  // Memory Adress Register in
//const PO = 1 << 5   // Program Counter out // UNUSED NOW 
const LEDS_OUT = 1 << 5   // Program RAM out
const IR = 1 << 6   // Instruction Register in
const RAIN = 1 << 7  //Register A IN
const RAOUT = 1 << 8  //Register A out
const RBIN = 1 << 9  //Register B IN
const ALU = 1 << 10  //ALU OUT
const MCR = 1 << 11   //Micro counter reset
const HALT = 1 << 12   // Halt
const RL = 1 << 13   // RAM load
const S = 1 << 14   // SUBTRACT
//const FLI = 1 << 15   // FLAGS IN //REPLACED by hardware

const PRAMIN = 1 << 15  // LOAD PRAM FRom BUS


//Instructions, 5 bits
const NOP =     0b00000;
const JMPI =    0b00001;
const JMP =     0b00010;
const JMPC =    0b00011;
const LDAI =    0b00100;
const LDA =     0b00101;
const OUTA =    0b00110;
const LDBI =    0b00111;
const OUTI =    0b01000;
const OUT =     0b01001;
const ADDI =    0b01010;
const ADD =     0b01011;
const SUBI =    0b01100;
const SUB =     0b01101;
const STO =     0b01110;
const JMPZ =    0b01111;
const JMPCNC =  0b10000;
const JMPZNZ =  0b10001;
const LDB =     0b10010;
const LOUT =    0b10011;
const HLT =     0b11111;

const loadInstruction = [(MIN | PI), (MO | IR)];


//5 bit instructions

instructions = {
    [NOP]: [...loadInstruction, MCR],                                                               // NOP - move Reg A to Reg A
    [JMPI]: [...loadInstruction, (MIN), (MO | PL), (MCR)],                                 // JMPI - Load next ram value into program counter
    [JMP]: [...loadInstruction, (MIN), (MO | MIN), (MO | PL), (MCR)],                     // JMP - Load value at next ram address into program counter
    [JMPC]: [...loadInstruction, (MIN), (MO | PL), (MCR)],                                // JMPC - Jump on carry. Load value at next ram address into program counter if the carry bit is set = MOV from B to B
    [JMPZ]: [...loadInstruction, (MIN), (MO | PL), (MCR)],                                 // JMPZ - Jump to address in next adress if zero flag is set
    [JMPCNC]: [...loadInstruction, (MIN | PI), (MCR)],                                // JMPCNC - What to do when there is no carry
    [JMPZNZ]: [...loadInstruction, (MIN | PI), (MCR)],                                 // JMPZNZ - What to do when there is not zero
    [LDAI]: [...loadInstruction, (MIN), (MO | RAIN), (MCR | PI)],                          // LDAI - Load next ram location into reg A
    [LDA]: [...loadInstruction, (MIN), (MO | MIN), (MO | RAIN), (MCR | PI)],              // LDA -  Load next ram address value into reg A
    [OUTA]: [...loadInstruction, (RAOUT | O)],                                                // OUTA - Output register A
    [LDBI]: [...loadInstruction, (MIN), (MO | RBIN), (MCR | PI)],                          // LDBI - Load next ram location into reg B
    [LDB]: [...loadInstruction, (MIN), (MO | MIN), (MO | RBIN), (MCR | PI)],              // LDA -  Load value at next ram address value into reg B
    [OUTI]: [...loadInstruction, (MIN), (MO | O), (MCR | PI)],                           // OUTI - Load next ram location into output
    [OUT]: [...loadInstruction, (MIN), (MO | MIN), (MO | O), (MCR | PI)],               // OUT - Load value at next ram address into output
    [ADDI]: [...loadInstruction, (MIN), (MO | RBIN | PI), (ALU | RAIN), (MCR)],            // ADDI - Add next ram location to reg A
    [ADD]: [...loadInstruction, (MIN), (MO | MIN), (MO | RBIN), (ALU | RAIN), (MCR | PI)],// ADD -  Add next ram address value to reg A
    [SUBI]: [...loadInstruction, (MIN), (MO | RBIN | PI | S), (ALU | RAIN| S), (MCR)],            // SUBI - Subtract next ram location from reg A
    [SUB]: [...loadInstruction, (MIN), (MO | MIN), (MO | RBIN | S), (ALU | RAIN| S), (MCR | PI)],// SUB -  Subtract next ram address value from reg A
    [STO]: [...loadInstruction, (MIN), (MO | MIN), (RAOUT | RL), (MCR | PI)],             // STO - store value of register A to RAM address defined in next ram value
    [LOUT]: [...loadInstruction, (LEDS_OUT), (MCR)],
    [HLT]: [...loadInstruction, HALT]   // HLT - Halt execution
};





const res = [];
for (let i = 0; i < 1023; i++) {
    // INSTRUCTION MICROCOUNTER CARRY ZERO
    //     5bits      3bits      1bit 1bit
    let mc = (i >> 2) & 0b111;
    //mc is the microcounter;

    let inst = i >> 5;
    
    let carry = ((i >> 1) & 0b1);
    let zero = i & 0b1;

    if (inst == JMPC && carry == 0) {
        inst = JMPCNC;
    }
    if (inst == JMPZ && zero == 0) {
        inst = JMPZNZ;
    }

    if (inst === LOUT) {
        console.log('LOUT', inst);
    }
    let val = 0;
    res[i] = "0";
    if (typeof instructions[inst] !== 'undefined' && typeof instructions[inst][mc] !== 'undefined') {
        if ((carry && inst === JMPC) || (zero && inst === JMPZ) || (inst !== JMPC && inst !== JMPZ)) {
            //These operations should only do something when a carry or a zero is set.
            //console.log('operation ' + inst.toString(16) + ' at mc ' + mc.toString(10) + ' exists. carry is ' + carry + ' zero flag is '+zero);
            //val = instructions[inst][mc].toString(16);
            res[i] = instructions[inst][mc].toString(16);
        } else {
            if (typeof instructions[NOP][mc] !== 'undefined') {
                let ins = instructions[NOP][mc];

                res[i] = ins.toString(16);
            }
        }
    } else if (typeof instructions[inst] === 'undefined') {
        //console.log('this instruction does not exist')
        c = instructions[NOP];
        if (typeof c[mc] !== 'undefined') {
            res[i] = c[mc].toString(16);
        } else {
            res[i] = "0"
        }
    } else if (typeof instructions[inst][mc] === 'undefined') {
        res[i] = MCR.toString(16);
    }

    //console.log('control word is ' + ("0000000000000000" + parseInt(res[res.length - 1], 16).toString(2)).slice(-16))
}

const string = "v2.0 raw\n" + res.join(' ') + "\n";

fs.writeFile("./rom", string, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("ROM file was saved!");
}); 