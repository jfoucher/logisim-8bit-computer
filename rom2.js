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
const MAR_IN = 1 << 4  // Memory Adress Register in
//const PO = 1 << 5   // Program Counter out // UNUSED NOW 
const PRAMOUT = 1 << 5   // Program RAM out
const IR = 1 << 6   // Instruction Register in
const RAIN = 1 << 7  //Register A IN
const RAOUT = 1 << 8  //Register A out
const RBIN = 1 << 9  //Register B IN
const ALU = 1 << 10  //ALU OUT
const PMAR_IN = 1 << 11   //Program ram address in
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
const STPI =    0b10011;
const STP  =    0b10100;
const HLT =     0b11111;

const loadInstruction = [(PMAR_IN | PI), (PRAMOUT | IR)];


//5 bit instructions

instructions = {
    [NOP]: [...loadInstruction, 0],                                                               // NOP - move Reg A to Reg A
    [JMPI]: [...loadInstruction, (PMAR_IN), (PRAMOUT | PL)],                                 // JMPI - Load next ram value into program counter
    [JMP]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN), (MO | PL)],                     // JMP - Load value at next ram address into program counter
    [JMPC]: [...loadInstruction, (PMAR_IN), (PRAMOUT | PL)],                                // JMPC - Jump on carry. Load value at next ram address into program counter if the carry bit is set = MOV from B to B
    [JMPZ]: [...loadInstruction, (PMAR_IN), (PRAMOUT | PL)],                                 // JMPZ - Jump to address in next adress if zero flag is set
    [JMPCNC]: [...loadInstruction, (PMAR_IN | PI)],                                // JMPCNC - What to do when there is no carry
    [JMPZNZ]: [...loadInstruction, (PMAR_IN | PI)],                                 // JMPZNZ - What to do when there is not zero
    [LDAI]: [...loadInstruction, (PMAR_IN), (PRAMOUT | RAIN), (PI)],                          // LDAI - Load next ram location into reg A
    [LDA]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN), (MO | RAIN), (PI)],              // LDA -  Load next ram address value into reg A
    [OUTA]: [...loadInstruction, (RAOUT | O)],                                                // OUTA - Output register A
    [LDBI]: [...loadInstruction, (PMAR_IN), (PRAMOUT | RBIN), (PI)],                          // LDBI - Load next ram location into reg B
    [LDB]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN), (MO | RBIN), (PI)],              // LDA -  Load value at next ram address value into reg B
    [OUTI]: [...loadInstruction, (PMAR_IN), (PRAMOUT | O), (PI)],                           // OUTI - Load next ram location into output
    [OUT]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN), (MO | O), (PI)],               // OUT - Load value at next ram address into output
    [ADDI]: [...loadInstruction, (PMAR_IN), (PRAMOUT | RBIN | PI), (ALU | RAIN)],            // ADDI - Add next ram location to reg A
    [ADD]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN), (MO | RBIN), (ALU | RAIN), (PI)],// ADD -  Add next ram address value to reg A
    [SUBI]: [...loadInstruction, (PMAR_IN), (PRAMOUT | RBIN | PI | S), (ALU | RAIN| S)],            // SUBI - Subtract next ram location from reg A
    [SUB]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN), (MO | RBIN | S), (ALU | RAIN| S), (PI)],// SUB -  Subtract next ram address value from reg A
    [STO]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN), (RAOUT | RL), (PI)],             // STO - store value of register A to RAM address defined in next ram value
    [STPI]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN | PI), (PMAR_IN), (PRAMOUT | RL), (PI)],                          // STPI - Load after next program ram address value into ram at next program adress
    // STP 255 05 will put 05 in RAM at adress 255
    [STP]: [...loadInstruction, (PMAR_IN), (PRAMOUT | MAR_IN | PI), (PMAR_IN), (PRAMOUT | PMAR_IN), (PRAMOUT | RL), (PI)],       // STP - Load value at after next program ram address into ram at address at next program ram address
    // STP 255 05 will put contents of address 05 in Program RAM into RAM at adress 255
    [HLT]: [...loadInstruction, HALT]   // HLT - Halt execution
};





const res = [];
for (let i = 0; i < 1024; i++) {
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
    let val = 0;
    res[i] = "0";
    if (typeof instructions[inst] !== 'undefined' && typeof instructions[inst][mc] !== 'undefined') {
        if ((carry && inst === JMPC) || (zero && inst === JMPZ) || (inst !== JMPC && inst !== JMPZ)) {
            //These operations should only do something when a carry or a zero is set.
            console.log('operation ' + inst.toString(16) + ' at mc ' + mc.toString(10) + ' exists. carry is ' + carry + ' zero flag is '+zero);
            //val = instructions[inst][mc].toString(16);
            res[i] = instructions[inst][mc].toString(16);
        } else {
            if (typeof instructions[NOP][mc] !== 'undefined') {
                let ins = instructions[NOP][mc];

                res[i] = ins.toString(16);
            }
        }
    } else if (typeof instructions[inst] === 'undefined') {
        console.log('this instruction does not exist')
        c = instructions[NOP];
        if (typeof c[mc] !== 'undefined') {
            res[i] = c[mc].toString(16);
        } else {
            res[i] = "0"
        }
    } else if (typeof instructions[inst][mc] === 'undefined') {
        const nop = 0;
        res[i] = nop.toString(16);
    }

    console.log('control word is ' + ("0000000000000000" + parseInt(res[res.length - 1], 16).toString(2)).slice(-16))
}

const string = "v2.0 raw\n" + res.join(' ') + "\n";

fs.writeFile("./rom", string, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("ROM file was saved!");
}); 