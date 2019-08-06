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
//const MAR_RESET = 1 << 5   // Program RAM out
const IR = 1 << 6   // Instruction Register in
const RAIN = 1 << 7  //Register A IN
const RAOUT = 1 << 8  //Register A out
const RBIN = 1 << 9  //Register B IN
const ALU = 1 << 10  //ALU OUT
//const PMAR_IN = 1 << 11   //Program ram address in
const HALT = 1 << 12   // Halt
const RL = 1 << 13   // RAM load
const S = 1 << 14   // SUBTRACT
//const FLI = 1 << 15   // FLAGS IN //REPLACED by hardware

const ASCII_OUT = 1 << 15  


//Instructions, 4 bits
const NOP =     0b0000;
const JMPI =    0b0001;
const JMP =     0b0010;
const JMPC =    0b0011;
const JMPZ =    0b0100;
const LDA =     0b0101;
const LDAI =    0b0110;
const LDB =     0b0111;
const LDBI =    0b1000;
const OUT =     0b1001;
const ADDI =    0b1010;
const ADD =     0b1011;
const SUBI =    0b1100;
const SUB =     0b1101;
const STO =     0b1110;
const HLT =     0b1111;
const JMPCNC =  555;
const JMPZNZ =  777;

const loadInstruction = [(MAR_IN | PI), (MO | IR)];
const loadRamAdress = [MAR_IN, (MO | RAIN | PI), MAR_IN];
const loadRamAdressValue = [MAR_IN, (MO | RAIN | PI), MAR_IN];

//5 bit instructions

instructions = {
    [NOP]: [...loadInstruction, 0],                                                               // NOP - move Reg A to Reg A
    [JMPI]: [...loadInstruction, ...loadRamAdress, (MO | PL)],                                 // JMPI - Load next ram value into program counter
    [JMP]: [...loadInstruction, ...loadRamAdress, (MO | MAR_IN), (MO | PL)],  // JMP - Load value at next ram address into program counter
    [JMPC]: [...loadInstruction, (MAR_IN), (MO | PL)],                                // JMPC - Jump on carry. Load value at next ram address into program counter if the carry bit is set = MOV from B to B
    [JMPZ]: [...loadInstruction, (MAR_IN), (MO | PL)],                                 // JMPZ - Jump to address in next adress if zero flag is set
    [JMPCNC]: [...loadInstruction, (MAR_IN | PI)],                                // JMPCNC - What to do when there is no carry
    [JMPZNZ]: [...loadInstruction, (MAR_IN | PI)],                                 // JMPZNZ - What to do when there is not zero
    [LDAI]: [...loadInstruction, (MAR_IN), (MO | RAIN), (PI)],                          // LDAI - Load next ram location into reg A
    [LDA]: [...loadInstruction, (MAR_IN), (MO | MAR_IN), (MO | RAIN), (PI)],              // LDA -  Load next ram address value into reg A

    [LDBI]: [...loadInstruction, (MAR_IN), (MO | RBIN), (PI)],                          // LDBI - Load next ram location into reg B
    [LDB]: [...loadInstruction, (MAR_IN), (MO | MAR_IN), (MO | RBIN), (PI)],              // LDA -  Load value at next ram address value into reg B
    [OUT]: [...loadInstruction, (MAR_IN), (MO | MAR_IN), (MO | O), (PI)],               // OUT - Load value at next ram address into output
    [ADDI]: [...loadInstruction, (MAR_IN), (MO | RBIN | PI), (ALU | RAIN)],            // ADDI - Add next ram location to reg A
    [ADD]: [...loadInstruction, (MAR_IN), (MO | MAR_IN), (MO | RBIN), (ALU | RAIN), (PI)],// ADD -  Add next ram address value to reg A
    [SUBI]: [...loadInstruction, (MAR_IN), (MO | RBIN | PI | S), (ALU | RAIN| S)],            // SUBI - Subtract next ram location from reg A
    [SUB]: [...loadInstruction, (MAR_IN | PI), (MO | MAR_IN), (MO | RBIN | S), (ALU | RAIN| S | PI)],// SUB -  Subtract next ram address value from reg A
    [STO]: [...loadInstruction, (MAR_IN), (MO | MAR_IN), (MO | MAR_IN), (RAOUT | RL | PI)],             // STO - store value of register A to RAM address defined in next ram value as address

    [HLT]: [...loadInstruction, HALT]   // HLT - Halt execution
};





const res = [];
for (let i = 0; i < 1024; i++) {
    // INSTRUCTION MICROCOUNTER CARRY ZERO
    //     4bits      4bits      1bit 1bit
    let mc = (i >> 2) & 0b111;
    //mc is the microcounter;

    let inst = i >> 6;
    
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